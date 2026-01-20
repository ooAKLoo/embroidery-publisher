# -*- coding: utf-8 -*-
"""
Apple Music 歌词下载自动化脚本
使用 Playwright 获取歌曲 URL，然后使用 Manzana 获取 LRC 歌词
并将歌词直接保存到音乐文件同目录

与 applemusic-downloader 配合使用，歌词文件名与音乐文件名一致
"""

import asyncio
import os
import sys
import re
import shutil
from pathlib import Path
from playwright.async_api import async_playwright, Page, BrowserContext
import json

# 添加 manzana 路径
MANZANA_DIR = Path(__file__).parent / "manzana"
sys.path.insert(0, str(MANZANA_DIR))

from api import AppleMusic
from utils import logger

# ============ 配置 ============
# 登录状态文件 (复用 applemusic-downloader 的 cookies)
COOKIES_FILE = Path(__file__).parent.parent / "applemusic-downloader/cookies.json"

# 播放列表文件
PLAYLISTS_FILE = Path(__file__).parent.parent / "applemusic-downloader/playlists.txt"

# 本地音乐目录列表 (用于匹配歌词)
MUSIC_DIRS = [
    "/Users/yangdongju/Downloads/李宗盛_jdh9y_songs_1_to_19",
    # 添加更多目录...
]

# 歌词输出目录（未匹配的歌词）
LRC_OUTPUT_DIR = Path(__file__).parent / "lyrics"

# 浏览器配置
HEADLESS = False
# ==============================


async def load_cookies(context: BrowserContext, path: str) -> bool:
    """加载 cookies"""
    if not os.path.exists(path):
        return False
    try:
        with open(path, 'r') as f:
            cookies = json.load(f)
        await context.add_cookies(cookies)
        print(f"✅ 已加载登录状态")
        return True
    except Exception as e:
        print(f"⚠️ 加载登录状态失败: {e}")
        return False


async def save_cookies(context: BrowserContext, path: str):
    """保存 cookies"""
    cookies = await context.cookies()
    with open(path, 'w') as f:
        json.dump(cookies, f, indent=2)


def sanitize_filename(filename: str) -> str:
    """清理文件名"""
    filename = re.sub(r'[\\/*?:"<>|]', "", filename)
    return filename.strip()


async def get_songs_from_playlist(page: Page, playlist_url: str) -> list:
    """从 aaplmusicdownloader.com 获取播放列表中所有歌曲的信息"""
    songs = []
    
    print(f"\n{'─'*50}")
    print(f"📋 获取播放列表: {playlist_url}")
    
    try:
        # 1. 导航到首页
        await page.goto("https://aaplmusicdownloader.com/", wait_until='domcontentloaded')
        await asyncio.sleep(3)
        
        # 2. 输入链接
        input_element = page.locator('input#id_url')
        await input_element.wait_for(state='visible', timeout=10000)
        await input_element.fill(playlist_url)
        await asyncio.sleep(1)
        
        # 3. 提交
        await page.locator('button#search').click()
        
        # 4. 等待跳转到 album.php
        print("⏳ 等待页面加载...")
        max_wait = 60
        import time
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            if 'album.php' in page.url:
                break
            await asyncio.sleep(2)
        
        await asyncio.sleep(5)  # 等待列表完全加载
        
        # 5. 获取播放列表名称
        playlist_name = "Unknown"
        try:
            h1_elements = page.locator('h1')
            if await h1_elements.count() > 0:
                playlist_name = await h1_elements.first.inner_text()
                playlist_name = sanitize_filename(playlist_name.strip())
        except:
            pass
        
        print(f"📂 播放列表: {playlist_name}")
        
        # 6. 获取所有歌曲按钮
        # 网站结构: 每首歌有一个 button 元素，包含 data-url, data-name, data-artist 等属性
        buttons = page.locator('button[data-url]')
        count = await buttons.count()
        print(f"📊 找到 {count} 首歌曲")
        
        for i in range(count):
            try:
                btn = buttons.nth(i)
                
                # 直接从按钮获取所有数据属性
                url = await btn.get_attribute('data-url')
                title = await btn.get_attribute('data-name') or await btn.get_attribute('data-tname')
                artist = await btn.get_attribute('data-artist')
                
                # 构建歌曲名
                if title and artist:
                    name = f"{title} - {artist}"
                elif title:
                    name = title
                else:
                    name = f"track_{i+1}"
                
                if url:
                    songs.append({
                        "index": i + 1,
                        "name": sanitize_filename(name),
                        "url": url,
                        "playlist": playlist_name
                    })
                    print(f"  [{i+1}] {name}")
            except Exception as e:
                print(f"  [{i+1}] ⚠️ 获取失败: {e}")
        
        print(f"✅ 获取了 {len(songs)} 首歌曲的 URL")
        
    except Exception as e:
        print(f"❌ 获取播放列表失败: {e}")
    
    return songs


def get_local_music_files() -> dict:
    """获取本地音乐文件，返回 {标准化名称: 文件路径} 映射"""
    files = {}
    extensions = {'.m4a', '.mp3', '.flac', '.wav', '.aac'}
    
    for music_dir in MUSIC_DIRS:
        path = Path(music_dir)
        if not path.exists():
            continue
        
        for file in path.rglob("*"):
            if file.suffix.lower() in extensions:
                # 标准化文件名用于匹配
                name = file.stem.lower()
                name = re.sub(r'^\d+\s+', '', name)  # 移除开头的序号
                name = re.sub(r'[^\w\u4e00-\u9fff]', '', name)  # 只保留字母数字和中文
                files[name] = file
    
    return files


def match_song_to_file(song_name: str, local_files: dict) -> Path:
    """将歌曲名匹配到本地文件"""
    # 标准化歌曲名
    name = song_name.lower()
    name = re.sub(r'[^\w\u4e00-\u9fff]', '', name)
    
    # 精确匹配
    if name in local_files:
        return local_files[name]
    
    # 模糊匹配
    from difflib import SequenceMatcher
    best_match = None
    best_score = 0
    
    for key, path in local_files.items():
        score = SequenceMatcher(None, name, key).ratio()
        if score > best_score:
            best_score = score
            best_match = path
    
    if best_score >= 0.7:
        return best_match
    
    return None


def download_lyrics_for_song(am: AppleMusic, song: dict, local_files: dict) -> bool:
    """为单首歌曲下载歌词"""
    song_name = song["name"]
    song_url = song["url"]
    
    try:
        # 获取歌词
        data = am.getInfo(song_url)
        
        if not data or "tracks" not in data:
            print(f"      ⚠️ 无法获取歌曲信息")
            return False
        
        for track in data["tracks"]:
            if "timeSyncedLyrics" in track and track.get("timeSyncedLyrics"):
                lrc_content = '\n'.join(track.get("timeSyncedLyrics"))
                
                # 尝试匹配本地文件
                matched_file = match_song_to_file(song_name, local_files)
                
                if matched_file:
                    lrc_path = matched_file.with_suffix('.lrc')
                    if not lrc_path.exists():
                        with open(lrc_path, 'w', encoding='utf-8') as f:
                            f.write(lrc_content)
                        print(f"      ✅ 保存到: {lrc_path.name}")
                    else:
                        print(f"      ⏭️ 已存在: {lrc_path.name}")
                else:
                    # 保存到默认目录
                    LRC_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
                    lrc_path = LRC_OUTPUT_DIR / f"{song_name}.lrc"
                    with open(lrc_path, 'w', encoding='utf-8') as f:
                        f.write(lrc_content)
                    print(f"      📝 保存到 lyrics/: {song_name}.lrc (未找到匹配的音乐文件)")
                
                return True
            else:
                print(f"      ⚠️ 无时间同步歌词")
                return False
        
    except Exception as e:
        print(f"      ❌ 获取歌词失败: {e}")
        return False
    
    return False


async def main():
    """主函数"""
    print("=" * 60)
    print("🎵 Apple Music 歌词下载器")
    print("=" * 60)
    
    # 初始化 Manzana
    cache_dir = str(MANZANA_DIR / "cache")
    config_dir = str(MANZANA_DIR / "config")
    os.makedirs(cache_dir, exist_ok=True)
    os.makedirs(config_dir, exist_ok=True)
    
    am = AppleMusic(cache_dir, config_dir, sync=3)
    
    # 获取本地音乐文件
    print("\n📂 扫描本地音乐文件...")
    local_files = get_local_music_files()
    print(f"   找到 {len(local_files)} 个音乐文件")
    
    # 读取播放列表
    if not PLAYLISTS_FILE.exists():
        print(f"❌ 播放列表文件不存在: {PLAYLISTS_FILE}")
        return
    
    with open(PLAYLISTS_FILE, 'r', encoding='utf-8') as f:
        playlist_urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    
    print(f"\n📋 找到 {len(playlist_urls)} 个播放列表")
    
    # 启动浏览器获取歌曲 URL
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=HEADLESS)
        context = await browser.new_context()
        
        # 加载 cookies
        await load_cookies(context, str(COOKIES_FILE))
        
        page = await context.new_page()
        
        all_songs = []
        
        for url in playlist_urls:
            songs = await get_songs_from_playlist(page, url)
            all_songs.extend(songs)
        
        # 保存 cookies
        await save_cookies(context, str(COOKIES_FILE))
        await browser.close()
    
    print(f"\n{'='*60}")
    print(f"📊 共获取 {len(all_songs)} 首歌曲的 URL")
    print(f"{'='*60}")
    
    # 下载歌词
    success = 0
    failed = 0
    
    for i, song in enumerate(all_songs, 1):
        print(f"\n[{i}/{len(all_songs)}] {song['name']}")
        
        if download_lyrics_for_song(am, song, local_files):
            success += 1
        else:
            failed += 1
    
    # 统计
    print(f"\n{'='*60}")
    print(f"📊 完成!")
    print(f"   成功: {success}")
    print(f"   失败: {failed}")
    print(f"   总计: {len(all_songs)}")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
