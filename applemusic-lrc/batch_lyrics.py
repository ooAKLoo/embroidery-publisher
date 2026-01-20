#!/usr/bin/env python3
"""
批量歌词下载器
从 Apple Music 播放列表获取歌词，并匹配到本地音乐文件
"""

import os
import sys
import re
import shutil
from pathlib import Path
from difflib import SequenceMatcher
from urllib.parse import unquote

# 添加 manzana 路径
MANZANA_DIR = Path(__file__).parent / "manzana"
sys.path.insert(0, str(MANZANA_DIR))

from api import AppleMusic
from utils import logger

# ============ 配置 ============
# 播放列表文件
PLAYLISTS_FILE = Path(__file__).parent.parent / "applemusic-downloader/playlists.txt"

# 本地音乐目录列表
MUSIC_DIRS = [
    "/Users/yangdongju/Downloads/李宗盛_jdh9y_songs_1_to_19",
    # 添加更多目录...
]

# 歌词输出目录（未匹配的歌词）
LRC_OUTPUT_DIR = Path(__file__).parent / "lyrics"
# ==============================


def get_local_music_files(music_dirs: list) -> list:
    """获取本地音乐文件列表"""
    music_files = []
    extensions = {'.m4a', '.mp3', '.flac', '.wav', '.aac'}
    
    for music_dir in music_dirs:
        path = Path(music_dir)
        if not path.exists():
            logger.warning(f"目录不存在: {music_dir}")
            continue
        
        for file in path.rglob("*"):
            if file.suffix.lower() in extensions:
                title, artist = parse_filename(file.stem)
                music_files.append({
                    "path": file,
                    "title": title,
                    "artist": artist,
                })
    
    return music_files


def parse_filename(filename: str) -> tuple:
    """从文件名解析歌曲信息"""
    # 常见格式: "序号 歌名 feat xxx - 歌手" 或 "歌名 - 歌手"
    patterns = [
        r'^\d+\s+(.+?)\s*[-–]\s*(.+)$',
        r'^(.+?)\s*[-–]\s*(.+)$',
    ]
    
    for pattern in patterns:
        match = re.match(pattern, filename)
        if match:
            title, artist = match.groups()
            # 清理 feat 信息
            title = re.sub(r'\s*feat\.?\s*.+$', '', title, flags=re.IGNORECASE).strip()
            return title, artist.strip()
    
    return filename, ""


def normalize(text: str) -> str:
    """标准化文本用于比较"""
    text = text.lower()
    text = re.sub(r'[^\w\u4e00-\u9fff]', '', text)
    return text


def match_lrc_to_music(lrc_files: list, music_files: list) -> int:
    """将 LRC 文件匹配到本地音乐"""
    matched = 0
    
    for lrc_path in lrc_files:
        lrc_name = lrc_path.stem
        
        # 解析 LRC 文件名 (格式: "序号 - 歌名")
        match = re.match(r'^\d+\s*-\s*(.+)$', lrc_name)
        lrc_title = match.group(1) if match else lrc_name
        
        best_match = None
        best_score = 0
        
        for mf in music_files:
            # 计算相似度
            title_sim = SequenceMatcher(None, normalize(lrc_title), normalize(mf["title"])).ratio()
            
            if title_sim > best_score:
                best_score = title_sim
                best_match = mf
        
        if best_score >= 0.7 and best_match:
            target_lrc = best_match["path"].with_suffix('.lrc')
            if not target_lrc.exists():
                shutil.copy2(lrc_path, target_lrc)
                logger.info(f"✅ 匹配: {lrc_title} -> {target_lrc.name}")
                matched += 1
            else:
                logger.info(f"⏭️ 已存在: {target_lrc.name}")
        else:
            logger.warning(f"❌ 未匹配: {lrc_title}")
    
    return matched


def process_playlist(am: AppleMusic, url: str, music_files: list):
    """处理单个播放列表"""
    try:
        data = am.getInfo(url)
        
        album_dir = Path(MANZANA_DIR) / data.get("dir", "")
        if not album_dir.exists():
            os.makedirs(album_dir, exist_ok=True)
        
        # 保存歌词
        for track in data["tracks"]:
            file_name = track.get("file", "")
            
            if "timeSyncedLyrics" in track and track.get("timeSyncedLyrics"):
                lrc_path = album_dir / f"{file_name}.lrc"
                if not lrc_path.exists():
                    with open(lrc_path, "w", encoding="utf-8") as f:
                        f.write('\n'.join(track.get("timeSyncedLyrics")))
                    logger.info(f'保存: "{file_name}.lrc"')
        
        # 查找所有 LRC 文件
        lrc_files = list(album_dir.glob("*.lrc"))
        
        # 匹配到本地音乐
        if lrc_files and music_files:
            matched = match_lrc_to_music(lrc_files, music_files)
            logger.info(f"匹配了 {matched} 个歌词文件")
        
        return len(data["tracks"])
    except Exception as e:
        logger.error(f"处理失败: {e}")
        return 0


def main():
    print("=" * 60)
    print("🎵 Apple Music 批量歌词下载器")
    print("=" * 60)
    
    # 初始化 Manzana
    cache_dir = str(MANZANA_DIR / "cache")
    config_dir = str(MANZANA_DIR / "config")
    
    os.makedirs(cache_dir, exist_ok=True)
    os.makedirs(config_dir, exist_ok=True)
    
    am = AppleMusic(cache_dir, config_dir, syncMsPointCount=3)
    
    # 获取本地音乐文件
    print("\n📂 扫描本地音乐文件...")
    music_files = get_local_music_files(MUSIC_DIRS)
    print(f"   找到 {len(music_files)} 个音乐文件")
    
    # 读取播放列表
    if not PLAYLISTS_FILE.exists():
        logger.error(f"播放列表文件不存在: {PLAYLISTS_FILE}")
        return
    
    with open(PLAYLISTS_FILE, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    
    print(f"\n📋 找到 {len(urls)} 个链接")
    
    # 处理每个链接
    total_songs = 0
    for i, url in enumerate(urls, 1):
        # 从 URL 提取名称
        parts = url.split('/')
        name = unquote(parts[-2]) if len(parts) > 2 else f"链接{i}"
        
        print(f"\n{'─' * 50}")
        print(f"[{i}/{len(urls)}] {name}")
        
        count = process_playlist(am, url, music_files)
        total_songs += count
    
    print(f"\n{'=' * 60}")
    print(f"📊 完成! 共处理 {total_songs} 首歌曲")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
