# Apple Music LRC 歌词下载器

从 Apple Music 播放列表获取时间同步歌词 (LRC)，并与本地音乐文件匹配。

## 使用方法

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置 `config.py`：
   - `MEDIA_USER_TOKEN`: 你的 Apple Music token
   - `MUSIC_DIRS`: 本地音乐目录列表

3. 运行：
```bash
python lrc_downloader.py
```

## 功能

- ✅ 从播放列表批量获取歌词
- ✅ 自动匹配本地音乐文件
- ✅ 支持时间同步 LRC 格式
- ✅ 歌词直接保存到音乐文件同目录

## 配置说明

| 配置项 | 说明 |
|-------|------|
| `MEDIA_USER_TOKEN` | Apple Music 的 media-user-token |
| `PLAYLISTS_FILE` | 播放列表 URL 文件路径 |
| `LRC_OUTPUT_DIR` | 未匹配歌词的保存目录 |
| `MUSIC_DIRS` | 本地音乐目录列表 |
| `USE_MILLISECONDS` | 时间戳格式 (True: 00:00.000) |
