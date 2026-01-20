# -*- coding: utf-8 -*-
"""
Hifiti 自动化脚本配置文件
"""

# 论坛基础 URL
BASE_URL = "https://www.hifiti.com"
SEARCH_URL = f"{BASE_URL}/search.htm"

# 延迟设置（秒）- 防止被封
MIN_DELAY = 20  # 最小延迟
MAX_DELAY = 60  # 最大延迟
PAGE_LOAD_TIMEOUT = 30000  # 页面加载超时（毫秒）

# 回复内容（随机选择一个）
REPLY_MESSAGES = [
    "感谢楼主分享！",
    "谢谢分享好音乐！",
    "感谢分享，辛苦了！",
    "好资源，感谢楼主！",
    "谢谢楼主的无私分享！",
]

# 搜索结果匹配关键词（优先级从高到低）
QUALITY_KEYWORDS = [
    "Hi-Res",
    "无损",
    "FLAC",
    "DSD",
    "WAV",
    "24bit",
    "16bit",
]

# 网盘链接正则表达式
PAN_LINK_PATTERNS = [
    r'https?://pan\.quark\.cn/s/[a-zA-Z0-9]+',           # 夸克网盘
    r'https?://pan\.baidu\.com/s/[a-zA-Z0-9_-]+',        # 百度网盘
    r'https?://www\.aliyundrive\.com/s/[a-zA-Z0-9]+',    # 阿里云盘
    r'https?://cloud\.189\.cn/t/[a-zA-Z0-9]+',           # 天翼云盘
    r'https?://www\.123pan\.com/s/[a-zA-Z0-9]+',         # 123云盘
]

# 提取码正则（常见格式，增强版）
EXTRACT_CODE_PATTERNS = [
    # 标准格式
    r'提取码[：:\s]*([a-zA-Z0-9]{4})',
    r'密码[：:\s]*([a-zA-Z0-9]{4})',
    r'提取密码[：:\s]*([a-zA-Z0-9]{4})',
    r'访问码[：:\s]*([a-zA-Z0-9]{4})',
    r'code[：:\s]*([a-zA-Z0-9]{4})',
    # 百度网盘特殊格式
    r'(?:提取|密码|码)[：:\s]*</?\w+>?\s*([a-zA-Z0-9]{4})',
    # 链接后紧跟的提取码
    r'pan\.baidu\.com/s/\S+\s+([a-zA-Z0-9]{4})\b',
    r'pan\.quark\.cn/s/\S+\s+([a-zA-Z0-9]{4})\b',
    # 单独一行的 4 位码（常见格式）
    r'^\s*([a-zA-Z0-9]{4})\s*$',
]

# 登录状态保存路径
AUTH_STATE_FILE = "state.json"

# 输出目录
OUTPUT_DIR = "output"
LINKS_FILE = f"{OUTPUT_DIR}/links.txt"

# 浏览器设置
HEADLESS = False  # 是否无头模式（建议 False 以便观察）
SLOW_MO = 100     # 操作延迟（毫秒），方便观察
