# Apple Music 下载器

自动化从 [aaplmusicdownloader.com](https://aaplmusicdownloader.com/album.php) 下载 Apple Music 歌曲的脚本。

## 功能

- 读取播放列表链接文件
- 自动提交链接到网站
- 点击 "Generate Download Links" 按钮
- 选择 M4A 256K 音质下载

## 环境

复用 `hifiti-automation` 的 conda 环境：

```bash
conda activate policstudy
```

## 使用

1. 编辑 `playlists.txt`，添加 Apple Music 播放列表链接（每行一个）

2. 运行脚本：
```bash
python downloader.py
```

3. 脚本会自动打开浏览器，处理每个播放列表

## 配置

在 `config.py` 中可以修改：

- `DEFAULT_QUALITY`: 音频质量 (256K M4A 为默认)
- `HEADLESS`: 是否隐藏浏览器窗口
- `DOWNLOAD_DIR`: 下载目录
- `ACTION_DELAY`: 操作间隔时间

## 播放列表格式

```txt
# 这是注释
https://music.apple.com/cn/playlist/xxx/pl.xxxxx
https://music.apple.com/cn/album/xxx/123456789
```
