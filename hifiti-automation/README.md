# Hifiti 音乐论坛自动化脚本

基于 Python + Playwright 的 Hifiti (音乐磁场) 论坛自动化工具，用于批量搜索歌曲、自动回复、提取网盘链接。

## 功能特性

- ✅ 自动搜索歌曲
- ✅ 智能匹配最佳结果（优先 Hi-Res/无损/FLAC）
- ✅ 自动回复解锁隐藏内容
- ✅ 提取网盘链接和提取码（支持夸克、百度、阿里云盘等）
- ✅ 随机延迟防封机制
- ✅ 登录状态持久化

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
playwright install chromium
```

### 2. 保存登录状态

首次使用需要手动登录一次：

```bash
python main.py --login
```

- 在打开的浏览器中登录 Hifiti 账号
- 登录成功后回到终端按 Enter 键保存状态

### 3. 准备歌曲列表

创建 `songs.txt` 文件，每行一首歌：

```
# 推荐格式（搜索更精准）
陈粒 - 奇妙能力歌
周杰伦 - 青花瓷

# 也支持只写歌名
光年之外
```

### 4. 运行脚本

```bash
# 处理全部
python main.py --input songs.txt

# 只处理前 5 首（测试用）
python main.py --input songs.txt --max 5

# 测试搜索（不回复）
python main.py --test "陈粒 奇妙能力歌"
```

### 5. 查看结果

提取的链接保存在 `output/links.txt`

## 配置说明

编辑 `config.py` 自定义配置：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `MIN_DELAY` | 最小延迟（秒） | 20 |
| `MAX_DELAY` | 最大延迟（秒） | 60 |
| `REPLY_MESSAGES` | 回复内容列表 | 见文件 |
| `HEADLESS` | 无头模式 | False |

## 注意事项

⚠️ **账号安全**：
- 建议每次运行不超过 20 首歌
- 已设置 20-60 秒随机延迟
- 如遇验证码需手动处理

⚠️ **法律声明**：
- 本脚本仅供学习交流
- 请尊重版权，支持正版音乐

## 文件结构

```
hifiti-automation/
├── main.py              # 主程序入口
├── config.py            # 配置文件
├── browser_manager.py   # 浏览器管理
├── song_parser.py       # 歌曲解析
├── hifiti_crawler.py    # 核心爬虫
├── requirements.txt     # 依赖
├── songs.txt            # 歌曲列表示例
├── state.json           # 登录状态（运行后生成）
└── output/
    └── links.txt        # 提取的链接
```

## 后续优化建议

1. **批量转存**：配合 GitHub 上的网盘批量转存工具使用
2. **整张专辑**：搜索专辑名而非单曲，成功率更高
3. **其他平台**：考虑使用 MusicFree 等支持插件的播放器
