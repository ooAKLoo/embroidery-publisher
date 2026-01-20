#!/usr/bin/env python3
"""
Apple Music LRC 歌词下载器
根据本地音乐文件搜索 Apple Music 并获取歌词
"""

import os
import re
import json
import requests
from pathlib import Path
from urllib.parse import quote
from difflib import SequenceMatcher

import config

class AppleMusicLyrics:
    def __init__(self, media_user_token: str):
        self.media_user_token = media_user_token
        self.session = requests.Session()
        self.developer_token = None
        self._init_session()
    
    def _init_session(self):
        """初始化会话，获取开发者令牌"""
        # 首先从 Apple Music 网站获取最新的开发者令牌
        try:
            resp = self.session.get(
                "https://music.apple.com/cn",
                headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
            )
            # 从页面中提取 token
            match = re.search(r'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', resp.text)
            if match:
                self.developer_token = match.group(0)
                print(f"✅ 获取开发者令牌成功")
            else:
                print("⚠️ 无法获取开发者令牌，尝试使用备用方案")
        except Exception as e:
            print(f"⚠️ 获取开发者令牌失败: {e}")
        
        # 设置请求头
        self.session.headers.update({
            "Origin": "https://music.apple.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        
        if self.developer_token:
            self.session.headers["Authorization"] = f"Bearer {self.developer_token}"
        if self.media_user_token:
            self.session.headers["Media-User-Token"] = self.media_user_token
    
    def search_song(self, title: str, artist: str, storefront: str = "cn") -> dict:
        """搜索歌曲"""
        query = f"{title} {artist}".strip()
        url = f"https://amp-api.music.apple.com/v1/catalog/{storefront}/search"
        params = {
            "term": query,
            "types": "songs",
            "limit": 5
        }
        
        try:
            resp = self.session.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            
            songs = data.get("results", {}).get("songs", {}).get("data", [])
            if songs:
                # 返回最匹配的歌曲
                for song in songs:
                    attrs = song.get("attributes", {})
                    song_title = attrs.get("name", "")
                    song_artist = attrs.get("artistName", "")
                    
                    # 检查匹配度
                    if self._is_match(title, artist, song_title, song_artist):
                        return {
                            "id": song.get("id"),
                            "name": song_title,
                            "artist": song_artist,
                            "album": attrs.get("albumName", "")
                        }
                
                # 如果没有精确匹配，返回第一个结果
                first = songs[0]
                attrs = first.get("attributes", {})
                return {
                    "id": first.get("id"),
                    "name": attrs.get("name", ""),
                    "artist": attrs.get("artistName", ""),
                    "album": attrs.get("albumName", "")
                }
        except Exception as e:
            print(f"      ⚠️ 搜索失败: {e}")
        
        return None
    
    def _is_match(self, title1: str, artist1: str, title2: str, artist2: str) -> bool:
        """检查歌曲是否匹配"""
        title1 = self._normalize(title1)
        title2 = self._normalize(title2)
        artist1 = self._normalize(artist1)
        artist2 = self._normalize(artist2)
        
        title_sim = SequenceMatcher(None, title1, title2).ratio()
        artist_sim = SequenceMatcher(None, artist1, artist2).ratio() if artist1 else 0.5
        
        return title_sim >= 0.7 and artist_sim >= 0.5
    
    def _normalize(self, text: str) -> str:
        """标准化文本用于比较"""
        text = text.lower()
        text = re.sub(r'[^\w\u4e00-\u9fff]', '', text)
        return text
    
    def get_lyrics(self, song_id: str, storefront: str = "cn") -> dict:
        """获取歌曲歌词"""
        if not song_id:
            return None
        
        url = f"https://amp-api.music.apple.com/v1/catalog/{storefront}/songs/{song_id}/syllable-lyrics"
        
        try:
            resp = self.session.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if "data" in data and len(data["data"]) > 0:
                    ttml = data["data"][0].get("attributes", {}).get("ttml", "")
                    return self._parse_ttml_to_lrc(ttml)
        except Exception:
            pass
        
        # 尝试普通歌词 API
        url = f"https://amp-api.music.apple.com/v1/catalog/{storefront}/songs/{song_id}/lyrics"
        
        try:
            resp = self.session.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if "data" in data and len(data["data"]) > 0:
                    ttml = data["data"][0].get("attributes", {}).get("ttml", "")
                    return self._parse_ttml_to_lrc(ttml)
        except Exception as e:
            print(f"      ⚠️ 获取歌词失败: {e}")
        
        return None
    
    def _parse_ttml_to_lrc(self, ttml: str) -> dict:
        """将 TTML 格式转换为 LRC 格式"""
        if not ttml:
            return None
        
        lrc_lines = []
        plain_lines = []
        
        # 解析 TTML 中的歌词行 - 支持多种格式
        patterns = [
            r'<p[^>]*begin="([^"]+)"[^>]*>([^<]+)</p>',
            r'<span[^>]*begin="([^"]+)"[^>]*>([^<]+)</span>',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, ttml, re.DOTALL)
            if matches:
                for begin, text in matches:
                    timestamp = self._convert_timestamp(begin)
                    text = re.sub(r'<[^>]+>', '', text).strip()
                    if text:
                        lrc_lines.append(f"[{timestamp}]{text}")
                        plain_lines.append(text)
                break
        
        if not lrc_lines:
            # 尝试更宽松的匹配
            lines = re.findall(r'begin="(\d+:\d+[\d.:]+)"[^>]*>([^<]+)', ttml)
            for begin, text in lines:
                timestamp = self._convert_timestamp(begin)
                text = text.strip()
                if text:
                    lrc_lines.append(f"[{timestamp}]{text}")
                    plain_lines.append(text)
        
        if lrc_lines:
            return {
                "lrc": "\n".join(lrc_lines),
                "plain": "\n".join(plain_lines)
            }
        
        return None
    
    def _convert_timestamp(self, ts: str) -> str:
        """转换时间戳格式"""
        try:
            # 处理各种时间格式
            ts = ts.replace(",", ".")
            
            # 格式: 00:01:23.456 或 01:23.456 或 01:23:456
            if ts.count(":") == 2:
                parts = ts.split(":")
                hours = int(parts[0])
                mins = int(parts[1])
                secs = parts[2]
                total_mins = hours * 60 + mins
            else:
                parts = ts.split(":")
                total_mins = int(parts[0])
                secs = parts[1] if len(parts) > 1 else "00"
            
            # 处理秒和毫秒
            if "." in secs:
                secs_parts = secs.split(".")
                seconds = int(secs_parts[0])
                ms = secs_parts[1]
            else:
                seconds = int(secs)
                ms = "00"
            
            if config.USE_MILLISECONDS:
                ms = ms[:3].ljust(3, "0")
                return f"{total_mins:02d}:{seconds:02d}.{ms}"
            else:
                ms = ms[:2].ljust(2, "0")
                return f"{total_mins:02d}:{seconds:02d}.{ms}"
        except Exception:
            return "00:00.00"


def parse_music_filename(filename: str) -> tuple:
    """从文件名解析歌曲信息"""
    name = Path(filename).stem
    
    # 常见格式: "序号 歌名 - 歌手" 或 "歌名 - 歌手" 或 "序号 歌名 feat xxx - 歌手"
    patterns = [
        r'^\d+\s+(.+?)\s*[-–]\s*(.+)$',  # 1 歌名 - 歌手
        r'^(.+?)\s*[-–]\s*(.+)$',          # 歌名 - 歌手
    ]
    
    for pattern in patterns:
        match = re.match(pattern, name)
        if match:
            title, artist = match.groups()
            # 清理 feat 信息
            title = re.sub(r'\s*feat\.?\s*.+$', '', title, flags=re.IGNORECASE).strip()
            return title, artist.strip()
    
    return name, ""


def get_local_music_files(music_dirs: list) -> list:
    """获取本地音乐文件列表"""
    music_files = []
    extensions = {'.m4a', '.mp3', '.flac', '.wav', '.aac'}
    
    for music_dir in music_dirs:
        path = Path(music_dir)
        if not path.exists():
            print(f"⚠️ 目录不存在: {music_dir}")
            continue
        
        for file in path.rglob("*"):
            if file.suffix.lower() in extensions:
                title, artist = parse_music_filename(file.name)
                music_files.append({
                    "path": file,
                    "title": title,
                    "artist": artist,
                    "filename": file.stem
                })
    
    return music_files


def save_lrc(lrc_content: str, output_path: Path):
    """保存 LRC 文件"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(lrc_content)


def main():
    print("=" * 60)
    print("🎵 Apple Music LRC 歌词下载器")
    print("=" * 60)
    
    # 初始化
    am = AppleMusicLyrics(config.MEDIA_USER_TOKEN)
    
    # 获取本地音乐文件
    print("\n📂 扫描本地音乐文件...")
    music_files = get_local_music_files(config.MUSIC_DIRS)
    print(f"   找到 {len(music_files)} 个音乐文件")
    
    if not music_files:
        print("❌ 没有找到音乐文件")
        return
    
    # 创建输出目录
    lrc_dir = Path(config.LRC_OUTPUT_DIR)
    lrc_dir.mkdir(parents=True, exist_ok=True)
    
    # 统计
    total = len(music_files)
    success = 0
    failed = 0
    skipped = 0
    
    print(f"\n🎵 开始处理 {total} 首歌曲...")
    print("-" * 60)
    
    for i, mf in enumerate(music_files, 1):
        title = mf["title"]
        artist = mf["artist"]
        file_path = mf["path"]
        lrc_path = file_path.with_suffix('.lrc')
        
        print(f"\n[{i}/{total}] {title} - {artist}")
        
        # 检查是否已有歌词
        if lrc_path.exists():
            print(f"   ⏭️ 已有歌词文件，跳过")
            skipped += 1
            continue
        
        # 搜索歌曲
        print(f"   🔍 搜索中...")
        song = am.search_song(title, artist)
        
        if not song:
            print(f"   ❌ 未找到歌曲")
            failed += 1
            continue
        
        print(f"   📀 匹配: {song['name']} - {song['artist']}")
        
        # 获取歌词
        lyrics = am.get_lyrics(song["id"])
        
        if lyrics and lyrics.get("lrc"):
            save_lrc(lyrics["lrc"], lrc_path)
            print(f"   ✅ 歌词已保存: {lrc_path.name}")
            success += 1
        else:
            print(f"   ⚠️ 无歌词")
            failed += 1
    
    # 打印统计
    print(f"\n{'=' * 60}")
    print(f"📊 统计结果:")
    print(f"   总文件数: {total}")
    print(f"   成功下载: {success}")
    print(f"   无歌词:   {failed}")
    print(f"   已跳过:   {skipped}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
