# -*- coding: utf-8 -*-
"""
歌曲列表解析模块 - 支持 TXT 和 CSV 格式
"""

import csv
import os
from typing import List, Tuple


def parse_songs_from_file(file_path: str) -> List[str]:
    """
    从文件解析歌曲列表。
    
    支持的格式：
    - TXT: 每行一首歌，格式为 "歌手 - 歌名" 或单独歌名
    - CSV: 包含 artist, song 或 name 列
    
    Args:
        file_path: 歌曲列表文件路径
        
    Returns:
        List[str]: 歌曲搜索词列表（格式：歌手 歌名 或 歌名）
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"文件不存在: {file_path}")
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.csv':
        return _parse_csv(file_path)
    else:
        return _parse_txt(file_path)


def _parse_txt(file_path: str) -> List[str]:
    """
    解析 TXT 格式的歌曲列表。
    
    支持格式：
    - "歌手 - 歌名"
    - "歌名"
    
    Args:
        file_path: TXT 文件路径
        
    Returns:
        List[str]: 歌曲搜索词列表
    """
    songs = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):  # 忽略空行和注释
                # 处理 "歌手 - 歌名" 格式
                if ' - ' in line:
                    artist, song = line.split(' - ', 1)
                    # 搜索时用空格连接，提高匹配率
                    songs.append(f"{artist.strip()} {song.strip()}")
                else:
                    songs.append(line)
    
    return songs


def _parse_csv(file_path: str) -> List[str]:
    """
    解析 CSV 格式的歌曲列表。
    
    支持的列名：
    - artist + name/song/title
    - name/song/title (仅歌名)
    
    Args:
        file_path: CSV 文件路径
        
    Returns:
        List[str]: 歌曲搜索词列表
    """
    songs = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # 标准化列名
        fieldnames = [name.lower().strip() for name in reader.fieldnames]
        
        # 查找歌手列
        artist_col = None
        for col in ['artist', '歌手', '艺人', 'singer']:
            if col in fieldnames:
                artist_col = reader.fieldnames[fieldnames.index(col)]
                break
        
        # 查找歌名列
        song_col = None
        for col in ['name', 'song', 'title', '歌名', '曲名', 'track']:
            if col in fieldnames:
                song_col = reader.fieldnames[fieldnames.index(col)]
                break
        
        if not song_col:
            raise ValueError("CSV 文件中未找到歌名列（name/song/title）")
        
        for row in reader:
            song = row.get(song_col, '').strip()
            if song:
                if artist_col and row.get(artist_col):
                    artist = row[artist_col].strip()
                    songs.append(f"{artist} {song}")
                else:
                    songs.append(song)
    
    return songs


def parse_album_from_file(file_path: str) -> List[Tuple[str, str]]:
    """
    解析专辑列表（可选功能）。
    返回 (歌手, 专辑名) 列表，适合搜索整张专辑。
    
    Args:
        file_path: 专辑列表文件路径
        
    Returns:
        List[Tuple[str, str]]: (歌手, 专辑名) 列表
    """
    albums = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                if ' - ' in line:
                    artist, album = line.split(' - ', 1)
                    albums.append((artist.strip(), album.strip()))
                else:
                    albums.append(('', line))
    
    return albums
