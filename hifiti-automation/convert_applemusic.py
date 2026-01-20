#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Apple Music 歌曲列表转换脚本

将 Apple Music 导出的格式转换为论坛精准搜索格式 "歌手 歌名"
"""

import sys
from pathlib import Path


def convert_applemusic_to_search_format(input_file: str, output_file: str = None):
    """
    将 Apple Music 导出的歌曲列表转换为搜索格式。
    
    输入格式（Tab分隔）: 歌曲名\t\t时长\t艺术家\t专辑名\t流派\t评分\t播放次数
    输出格式: 歌手 歌名（符合论坛精准搜索格式）
    
    Args:
        input_file: 输入文件路径
        output_file: 输出文件路径（默认为 songs.txt）
    """
    if output_file is None:
        output_file = Path(input_file).parent / "songs.txt"
    
    # 用于去重和存储 (艺术家, 歌名, 搜索关键词)
    seen = set()
    songs = []  # [(artist, title, search_key), ...]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apple Music 导出使用 \r 作为行分隔符
    lines = content.replace('\r\n', '\n').replace('\r', '\n').split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 按 Tab 分隔
        parts = line.split('\t')
        
        # 过滤空字符串
        parts = [p.strip() for p in parts if p.strip()]
        
        if len(parts) < 2:
            continue
        
        # 提取歌曲名和艺术家
        title = parts[0]
        
        # 找艺术家（通常在时长之后）
        artist = None
        for i, part in enumerate(parts[1:], 1):
            # 时长格式通常是 "X:XX" 
            if ':' in part and len(part) <= 6 and part.replace(':', '').isdigit():
                if i + 1 < len(parts):
                    artist = parts[i + 1]
                break
        
        if not artist and len(parts) >= 2:
            artist = parts[1]
        
        if title and artist:
            # 论坛精准搜索格式: 歌手 歌名
            search_key = f"{artist} {title}"
            
            # 去重
            if search_key not in seen:
                seen.add(search_key)
                songs.append((artist, title, search_key))
    
    # 按艺术家名称排序
    songs.sort(key=lambda x: x[0])
    
    # 写入输出文件
    with open(output_file, 'w', encoding='utf-8') as f:
        for artist, title, search_key in songs:
            f.write(search_key + '\n')
    
    print(f"✅ 转换完成！")
    print(f"   输入文件: {input_file}")
    print(f"   输出文件: {output_file}")
    print(f"   原始条目: {len(lines)} 条")
    print(f"   去重后: {len(songs)} 首")
    print(f"   格式: 歌手 歌名（论坛精准搜索格式）")
    print(f"   已按艺术家名称排序")
    
    return songs


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python convert_applemusic.py <输入文件> [输出文件]")
        print("示例: python convert_applemusic.py 'applemusic all.txt' songs.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    convert_applemusic_to_search_format(input_file, output_file)
