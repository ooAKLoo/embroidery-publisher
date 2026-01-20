#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hifiti 音乐论坛自动化脚本 - 主程序入口

用法：
    python main.py --login              # 保存登录状态
    python main.py --input songs.txt    # 批量处理歌曲
    python main.py --test               # 测试搜索（不回复）
"""

import argparse
import os
import sys
from datetime import datetime

from playwright.sync_api import sync_playwright

import config
from browser_manager import save_login_state, load_browser_context, check_login_status
from song_parser import parse_songs_from_file
from hifiti_crawler import HifitiCrawler


def ensure_output_dir():
    """确保输出目录存在。"""
    if not os.path.exists(config.OUTPUT_DIR):
        os.makedirs(config.OUTPUT_DIR)


def save_results(results: list, output_file: str = None):
    """
    保存处理结果到文件。
    
    Args:
        results: 处理结果列表
        output_file: 输出文件路径
    """
    if not output_file:
        output_file = config.LINKS_FILE
    
    ensure_output_dir()
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open(output_file, 'a', encoding='utf-8') as f:
        f.write(f"\n{'=' * 60}\n")
        f.write(f"# 提取时间: {timestamp}\n")
        f.write(f"{'=' * 60}\n\n")
        
        success_count = 0
        fail_count = 0
        
        for result in results:
            keyword = result['keyword']
            
            if result['success']:
                success_count += 1
                f.write(f"## {keyword}\n")
                
                # 优先使用配对的链接和提取码
                if result.get('link_code_pairs'):
                    for link, code in result['link_code_pairs']:
                        f.write(f"链接: {link}\n")
                        if code:
                            f.write(f"提取码: {code}\n")
                else:
                    for link in result['links']:
                        f.write(f"链接: {link}\n")
                    if result['codes']:
                        f.write(f"提取码: {', '.join(result['codes'])}\n")
                
                # 保存歌词（如果有）
                if result.get('lyrics'):
                    f.write(f"\n【歌词】\n{result['lyrics']}\n")
                
                f.write("\n")
            else:
                fail_count += 1
                f.write(f"## {keyword}\n")
                f.write(f"失败: {result.get('error', '未知错误')}\n\n")
        
        f.write(f"\n{'=' * 60}\n")
        f.write(f"# 统计: 成功 {success_count}, 失败 {fail_count}, 总计 {len(results)}\n")
        f.write(f"{'=' * 60}\n")
    
    print(f"\n📁 结果已保存到: {output_file}")
    print(f"📊 统计: 成功 {success_count}, 失败 {fail_count}")


def run_batch(input_file: str, max_count: int = None):
    """
    批量处理歌曲列表。
    
    Args:
        input_file: 歌曲列表文件路径
        max_count: 最大处理数量（可选）
    """
    print("\n" + "=" * 60)
    print("Hifiti 音乐论坛自动化脚本")
    print("=" * 60)
    
    # 解析歌曲列表
    try:
        songs = parse_songs_from_file(input_file)
    except FileNotFoundError as e:
        print(f"❌ 错误: {e}")
        sys.exit(1)
    
    if max_count:
        songs = songs[:max_count]
    
    print(f"📋 待处理歌曲数量: {len(songs)}")
    print()
    
    if len(songs) > 20:
        print("⚠️  警告: 处理超过 20 首歌可能触发论坛防灌水机制！")
        confirm = input("是否继续？(y/N): ")
        if confirm.lower() != 'y':
            print("已取消")
            sys.exit(0)
    
    with sync_playwright() as p:
        # 加载登录状态
        try:
            browser, context = load_browser_context(p)
        except FileNotFoundError as e:
            print(f"❌ {e}")
            sys.exit(1)
        
        page = context.new_page()
        
        # 检查登录状态
        if not check_login_status(page):
            print("⚠️  登录状态可能已失效，建议重新登录")
            confirm = input("是否继续？(y/N): ")
            if confirm.lower() != 'y':
                browser.close()
                sys.exit(0)
        
        crawler = HifitiCrawler(page)
        results = []
        
        for i, song in enumerate(songs, 1):
            print(f"\n[{i}/{len(songs)}] 处理中...")
            print("-" * 40)
            
            result = crawler.process_song(song)
            results.append(result)
            
            # 随机延迟（最后一首除外）
            if i < len(songs):
                crawler.random_delay()
        
        browser.close()
    
    # 保存结果
    save_results(results)


def run_test(keyword: str):
    """
    测试搜索功能（不回复）。
    
    Args:
        keyword: 搜索关键词
    """
    print(f"\n🧪 测试搜索: {keyword}")
    
    with sync_playwright() as p:
        try:
            browser, context = load_browser_context(p)
        except FileNotFoundError as e:
            print(f"❌ {e}")
            sys.exit(1)
        
        page = context.new_page()
        crawler = HifitiCrawler(page)
        
        if crawler.search_song(keyword):
            print("✅ 搜索成功，请在浏览器中查看结果")
            input("按 Enter 关闭浏览器...")
        else:
            print("❌ 搜索失败")
        
        browser.close()


def main():
    parser = argparse.ArgumentParser(
        description='Hifiti 音乐论坛自动化脚本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python main.py --login                    # 保存登录状态
  python main.py --input songs.txt          # 处理歌曲列表
  python main.py --input songs.txt --max 5  # 只处理前5首
  python main.py --test "陈粒 奇妙能力歌"    # 测试搜索
        """
    )
    
    parser.add_argument(
        '--login', 
        action='store_true',
        help='启动浏览器保存登录状态'
    )
    
    parser.add_argument(
        '--input', '-i',
        type=str,
        metavar='FILE',
        help='歌曲列表文件路径 (txt/csv)'
    )
    
    parser.add_argument(
        '--max', '-m',
        type=int,
        metavar='N',
        help='最大处理数量'
    )
    
    parser.add_argument(
        '--test', '-t',
        type=str,
        metavar='KEYWORD',
        help='测试搜索关键词'
    )
    
    args = parser.parse_args()
    
    if args.login:
        save_login_state()
    elif args.input:
        run_batch(args.input, args.max)
    elif args.test:
        run_test(args.test)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
