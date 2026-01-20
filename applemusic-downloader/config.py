# -*- coding: utf-8 -*-
"""
Apple Music 下载器配置文件
"""

# 网站 URL
BASE_URL = "https://aaplmusicdownloader.com/album.php"

# 默认音频质量 (可选: "64K AAC", "128K AAC", "256K M4A", "256K M4A ALAC")
DEFAULT_QUALITY = "256K M4A"

# 下载目录
DOWNLOAD_DIR = "./downloads"

# 播放列表文件路径
PLAYLISTS_FILE = "./playlists.txt"

# 浏览器设置
HEADLESS = False  # 设为 True 隐藏浏览器窗口
SLOW_MO = 100     # 操作延迟(毫秒)，便于观察

# 超时设置(秒)
PAGE_TIMEOUT = 60
DOWNLOAD_TIMEOUT = 300

# 每次操作后的等待时间(秒)
ACTION_DELAY = 2
