# -*- coding: utf-8 -*-
"""
Apple Music 下载自动化脚本
使用 Playwright 自动化从 aaplmusicdownloader.com 下载音乐

功能：
- 保存登录状态（cookies），只需登录一次
- 支持逐首下载
- 自动重命名下载文件为 .m4a
"""

import asyncio
import os
import time
import json
import re
from typing import List, Optional
from playwright.async_api import async_playwright, Page, Download, BrowserContext

import config


# 登录状态文件路径
COOKIES_FILE = "./cookies.json"


def load_playlists(file_path: str) -> List[str]:
    """从文件加载播放列表链接"""
    playlists = []
    
    if not os.path.exists(file_path):
        print(f"⚠️ 播放列表文件不存在: {file_path}")
        return playlists
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                if 'music.apple.com' in line:
                    playlists.append(line)
    
    return playlists


async def save_cookies(context: BrowserContext, path: str):
    """保存 cookies 到文件"""
    cookies = await context.cookies()
    with open(path, 'w') as f:
        json.dump(cookies, f, indent=2)
    print(f"✅ 登录状态已保存到: {path}")


async def load_cookies(context: BrowserContext, path: str) -> bool:
    """从文件加载 cookies"""
    if not os.path.exists(path):
        return False
    
    try:
        with open(path, 'r') as f:
            cookies = json.load(f)
        await context.add_cookies(cookies)
        print(f"✅ 已加载登录状态: {path}")
        return True
    except Exception as e:
        print(f"⚠️ 加载登录状态失败: {e}")
        return False


async def wait_for_login(page: Page, context: BrowserContext):
    """等待用户手动登录"""
    print("\n" + "="*60)
    print("🔐 需要登录!")
    print("="*60)
    print("检测到需要登录，请在浏览器中完成登录操作...")
    print("脚本将自动检测登录状态...")
    print("="*60 + "\n")
    
    # 循环检查登录状态
    while await check_login_required(page):
        await asyncio.sleep(2)
    
    print("✅ 检测到登录成功！")
    
    # 保存登录状态
    await save_cookies(context, COOKIES_FILE)


async def check_login_required(page: Page) -> bool:
    """检查是否需要登录"""
    # 检查页面是否有登录提示或者按钮消失
    login_selectors = [
        'text=login',
        'text=sign in',
        'text=登录',
        '.login-modal',
        '#login-form',
        'a[href*="login"]',
        'button:has-text("Login")',
        'button:has-text("Sign in")'
    ]
    
    for selector in login_selectors:
        try:
            if await page.locator(selector).count() > 0:
                # 再次确认是否可见
                if await page.locator(selector).first.is_visible():
                    return True
        except Exception:
            continue
    
    return False


def sanitize_filename(filename: str) -> str:
    """清理文件名，移除非法字符"""
    # 替换非法字符
    filename = re.sub(r'[\\/*?:"<>|]', "", filename)
    # 移除首尾空格
    filename = filename.strip()
    return filename


async def get_track_info(button_locator) -> str:
    """尝试从按钮提取歌曲信息"""
    try:
        # 策略0: 优先从按钮属性获取 (最准确)
        name = await button_locator.get_attribute("data-name")
        artist = await button_locator.get_attribute("data-artist")
        
        if name and artist:
            return f"{name} - {artist}"
        elif name:
            return name

        # 尝试获取父级容器 (假设是 tr 或者 div.card)
        # 策略1: 向上查找直到找到包含文本的行/卡片
        parent = button_locator.locator('..').locator('..')
        
        # 获取所有文本
        text_content = await parent.inner_text()
        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
        
        # 移除按钮本身的文字 (Download, Generate 等)
        clean_lines = [l for l in lines if 'Download' not in l and 'Generate' not in l and 'MP3' not in l and 'M4A' not in l]
        
        if len(clean_lines) >= 2:
            # 假设第一行是歌名，第二行是歌手
            title = clean_lines[0]
            artist = clean_lines[1]
            return f"{title} - {artist}"
        elif len(clean_lines) == 1:
            return clean_lines[0]
            
    except Exception as e:
        print(f"    ⚠️ 提取歌曲信息失败: {e}")
    
    return ""


# 稳定的选择器，匹配所有状态的下载按钮/链接，确保列表长度不变
# 排除 "Download All", "Download Playlist" 等全局按钮
STABLE_BUTTON_SELECTOR = 'button#dynamic_button, button:has-text("Download"):not(:has-text("All")):not(:has-text("Playlist")):not(:has-text("Zip")), button:has-text("download"):not(:has-text("all")), button:has-text("again"), a:has-text("again")'


async def download_single_track(page: Page, track_index: int, total_tracks: int, download_dir: str) -> bool:
    """下载单首歌曲"""
    global pending_download
    pending_download = None
    
    try:
        # 1. 找到所有相关元素 (包括已下载的)
        elements = page.locator(STABLE_BUTTON_SELECTOR)
        count = await elements.count()
        
        if count == 0:
            # 滚动并重试
            await page.evaluate("window.scrollBy(0, 300)")
            await asyncio.sleep(1)
            count = await elements.count()
            
            if count == 0:
                print("    ⚠️ 未找到任何按钮或链接")
                return False
        
        # 2. 定位到当前要下载的特定元素
        if track_index >= count:
             print(f"    ⚠️ 索引越界 (index: {track_index}, count: {count})")
             return False

        current_element = elements.nth(track_index)
        await current_element.scroll_into_view_if_needed()
        await asyncio.sleep(0.5)
        
        # 3. 检查当前状态
        text_content = await current_element.inner_text()
        text_content = text_content.lower()
        
        if "again" in text_content:
            print(f"    ⏭️ 跳过 (已下载): 索引 {track_index+1}")
            return True

        # 4. 提取歌曲信息
        track_name = await get_track_info(current_element)
        if not track_name:
            track_name = f"track_{track_index+1}"
        
        print(f"    🎯 目标: {track_name}")
        
        # DEBUG: 打印元素 HTML 以分析
        try:
            html = await current_element.evaluate("el => el.outerHTML")
            print(f"    🔍 元素 HTML: {html[:200]}...")
        except:
            pass

        # 5. 点击按钮
        await current_element.click()
        # print(f"    ✓ 点击下载按钮") 
        await asyncio.sleep(2)
        
        # ... (后续逻辑保持不变，但要注意缩进对齐)
        
        # 6. 尝试寻找音质选择框 (兼容旧版/非会员)
        visible_select_id = await page.evaluate("""
            () => {
                const selects = document.querySelectorAll('select[id^="qquality"]');
                for (const select of selects) {
                    if (select.offsetParent !== null && 
                        select.style.display !== 'none' &&
                        !select.classList.contains('used')) {
                        return select.id;
                    }
                }
                return null;
            }
        """)
        
        if visible_select_id:
            try:
                quality_select = page.locator(f'#{visible_select_id}')
                await quality_select.select_option(value="m4a")
                print(f"    ✓ 选择了 M4A 音质")
                await page.evaluate(f"document.getElementById('{visible_select_id}').classList.add('used')")
            except Exception:
                pass
        
        # 7. 等待下载
        print(f"    ⏳ 等待下载开始...")
        
        max_wait = 60
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            # 检查下载事件
            if pending_download:
                try:
                    # 使用提取到的文件名
                    filename = sanitize_filename(track_name)
                    if not filename.lower().endswith('.m4a'):
                        filename += '.m4a'
                        
                    save_path = os.path.join(download_dir, filename)
                    
                    # 确保文件名唯一 (如果重复则添加序号)
                    if os.path.exists(save_path):
                        base, ext = os.path.splitext(filename)
                        counter = 1
                        while os.path.exists(os.path.join(download_dir, f"{base}_{counter}{ext}")):
                            counter += 1
                        save_path = os.path.join(download_dir, f"{base}_{counter}{ext}")
                        filename = os.path.basename(save_path)

                    # 保存
                    await pending_download.save_as(save_path)
                    print(f"    ✅ 已保存: {filename}")
                    print(f"       📍 完整路径: {os.path.abspath(save_path)}")
                    return True
                except Exception as e:
                    print(f"    ⚠️ 保存失败: {e}")
            
            # 检查 "download again" (表示已完成)
            # 此时 current_element 的文本可能会变
            # 简单检查 current_element 是否包含 again
            try:
                txt = await current_element.inner_text()
                if "again" in txt.lower():
                     if pending_download: 
                         return True
            except:
                pass
            
            # 检查是否需要登录
            if await check_login_required(page):
                return False
            
            await asyncio.sleep(1)
        
        print(f"    ⚠️ 等待超时")
        return False
        
    except Exception as e:
        print(f"    ❌ 出错: {e}")
        return False


async def process_playlist(page: Page, context: BrowserContext, playlist_url: str, download_dir: str):
    """处理单个播放列表"""
    global pending_download
    
    print(f"\n{'='*60}")
    print(f"📋 处理播放列表: {playlist_url}")
    print('='*60)
    
    try:
        # 1. 导航到首页
        print("⏳ 正在加载网站...")
        await page.goto("https://aaplmusicdownloader.com/", wait_until='domcontentloaded')
        await asyncio.sleep(3)
        
        # 2. 输入链接
        print("📝 输入播放列表链接...")
        input_element = page.locator('input#id_url')
        await input_element.wait_for(state='visible', timeout=10000)
        await input_element.fill(playlist_url)
        await asyncio.sleep(1)
        
        # 3. 提交
        print("🔄 提交链接...")
        await page.locator('button#search').click()
        
        # 4. 等待跳转
        print("⏳ 等待页面跳转...")
        max_wait = 60
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            if 'album.php' in page.url:
                print("  ✓ 页面已跳转到 album.php")
                break
            await asyncio.sleep(2)
        
        # 等待列表加载
        print("⏳ 等待歌曲列表加载...")
        await asyncio.sleep(8)

        # 尝试获取播放列表名称以创建单独文件夹
        playlist_name = "Unknown Playlist"
        try:
            # 常见位置: h1 或者特定的 metadata div
            h1_elements = page.locator('h1')
            if await h1_elements.count() > 0:
                text = await h1_elements.first.inner_text()
                # 通常格式可能是 "Playlist Name - Apple Music" 或者是 "Album Name"
                playlist_name = text.strip()
            
            # 清理名称
            playlist_name = sanitize_filename(playlist_name)
            if not playlist_name:
                playlist_name = "Unknown Playlist"
                
            print(f"📂 播放列表名称: {playlist_name}")
            
        except Exception as e:
            print(f"⚠️ 获取播放列表名称失败: {e}")
            
        # 创建播放列表特定目录
        playlist_dir = os.path.join(download_dir, playlist_name)
        os.makedirs(playlist_dir, exist_ok=True)
        print(f"📂 保存目录: {playlist_dir}")
        
        # 5. 获取歌曲总数
        # 优先尝试 #dynamic_button
        generate_buttons = page.locator('button#dynamic_button')
        
        try:
            # 尝试等待任一类型的按钮
            try:
                await generate_buttons.first.wait_for(state='visible', timeout=10000)
            except:
                # 尝试由于可能的按钮ID变化查找 Download 按钮
                generate_buttons = page.locator('button:has-text("Download"), button:has-text("download")')
                await generate_buttons.first.wait_for(state='visible', timeout=20000)

        except Exception:
            # 可能需要登录
            if await check_login_required(page):
                await wait_for_login(page, context)
                # 刷新页面重试
                await page.reload()
                await asyncio.sleep(5)
                # 重新获取按钮定位器
                generate_buttons = page.locator('button#dynamic_button')
                if await generate_buttons.count() == 0:
                     generate_buttons = page.locator('button:has-text("Download"), button:has-text("download")')
        
        total_tracks = await generate_buttons.count()
        print(f"📊 找到 {total_tracks} 首歌曲")
        
        if total_tracks == 0:
            print("⚠️ 未找到歌曲")
            return
        
        # 6. 设置下载监听
        async def handle_download(download: Download):
            global pending_download
            pending_download = download
            # print(f"    📥 检测到下载: {download.suggested_filename}")
        
        page.on("download", handle_download)
        
        # 7. 逐首下载
        downloaded = 0
        failed = 0
        i = 0
        
        while i < total_tracks:
            print(f"\n🎵 下载第 {i+1}/{total_tracks} 首...")
            pending_download = None
            
            # 检查按钮数量 (用于确认页面是否正常)
            current_buttons = await page.locator('button#dynamic_button').count()
            if current_buttons == 0:
                current_buttons = await page.locator('button:has-text("Download"), button:has-text("download")').count()
            
            if current_buttons == 0:
                # 可能需要登录
                print("    ⚠️ 按钮消失，检查是否需要登录...")
                
                if await check_login_required(page):
                    await wait_for_login(page, context)
                    # 刷新页面继续
                    await page.reload()
                    await asyncio.sleep(5)
                    continue
                else:
                    print("    ⚠️ 没有更多按钮，可能所有歌曲都已处理")
                    break
            
            # 传入 playlist_dir 而不是 download_dir
            success = await download_single_track(page, i, total_tracks, playlist_dir)
            
            if success:
                downloaded += 1
            else:
                failed += 1
                # 检查是否需要登录
                if await check_login_required(page):
                    await wait_for_login(page, context)
                    await page.reload()
                    await asyncio.sleep(5)
                    continue
            
            i += 1
            await asyncio.sleep(1)
            
            # 每10首暂停
            if downloaded > 0 and downloaded % 10 == 0:
                print(f"\n⏸️ 已下载 {downloaded} 首，暂停 3 秒...")
                await asyncio.sleep(3)
        
        print(f"\n{'='*60}")
        print(f"✅ 播放列表处理完成!")
        print(f"📊 成功: {downloaded} / 失败: {failed} / 总计: {total_tracks}")
        print(f"📂 文件位置: {playlist_dir}")
        print('='*60)
        
    except Exception as e:
        print(f"❌ 处理出错: {e}")


async def main():
    """主函数"""
    print("🎵 Apple Music 下载器启动")
    
    download_dir = os.path.abspath(config.DOWNLOAD_DIR)
    os.makedirs(download_dir, exist_ok=True)
    print(f"📂 下载目录: {download_dir}")
    
    playlists = load_playlists(config.PLAYLISTS_FILE)
    
    if not playlists:
        print("❌ 没有找到播放列表链接")
        return
    
    print(f"\n📋 找到 {len(playlists)} 个播放列表:")
    for i, url in enumerate(playlists, 1):
        print(f"  {i}. {url}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=config.HEADLESS,
            slow_mo=config.SLOW_MO,
        )
        
        context = await browser.new_context(
            accept_downloads=True,
        )
        
        # 尝试加载已保存的登录状态
        cookies_loaded = await load_cookies(context, COOKIES_FILE)
        
        page = await context.new_page()
        
        # 如果没有 cookies，先让用户登录
        if not cookies_loaded:
            print("\n⚠️ 没有找到保存的登录状态")
            print("正在打开网站，请先登录...")
            
            await page.goto("https://aaplmusicdownloader.com/")
            await asyncio.sleep(2)
            
            await wait_for_login(page, context)
        
        # 处理每个播放列表
        for playlist_url in playlists:
            await process_playlist(page, context, playlist_url, download_dir)
            await asyncio.sleep(config.ACTION_DELAY)
        
        print("\n" + "="*60)
        print("✅ 所有播放列表处理完成!")
        print(f"📂 文件保存在: {download_dir}")
        print("="*60)
        
        # 重命名文件
        print("\n🔄 检查并修复文件扩展名...")
        for filename in os.listdir(download_dir):
            filepath = os.path.join(download_dir, filename)
            if os.path.isfile(filepath) and not filename.endswith('.m4a'):
                new_path = filepath + '.m4a'
                os.rename(filepath, new_path)
                print(f"  ✓ 重命名: {filename} -> {filename}.m4a")
        
        # 保存最新的 cookies
        await save_cookies(context, COOKIES_FILE)
        
        print("\n按 Enter 键关闭浏览器...")
        input()
        
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
