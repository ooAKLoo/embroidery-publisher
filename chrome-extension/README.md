# 苏绣出海发布助手 Chrome 插件

这是苏绣发布器的配套 Chrome 浏览器插件，用于将桌面应用生成的内容自动填充到各社交平台的发布页面。

## 功能特点

- 自动检测桌面应用连接状态
- 一键填充内容到当前平台页面
- 支持 6 个主流平台：Instagram、Facebook、X/Twitter、Pinterest、TikTok、Etsy

## 安装步骤

### 1. 加载插件到 Chrome

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `chrome-extension` 文件夹

### 2. 生成自定义图标（可选）

默认已包含占位图标。如需更好看的图标：

**方法一：使用浏览器**
1. 双击打开 `icons/generate-icons.html`
2. 点击下载各尺寸图标
3. 将下载的图标放到 `icons` 文件夹替换现有文件

**方法二：使用 Node.js**
```bash
cd chrome-extension
npm install canvas
node generate-icons.cjs
```

## 使用方法

### 准备工作
1. 确保苏绣发布器桌面应用已启动
2. 在桌面应用中完成内容编辑和 AI 润色

### 填充内容
1. 打开目标平台的内容发布页面
   - Instagram: 点击 + 创建帖子
   - Facebook: 点击"在想些什么"
   - X/Twitter: 点击发推按钮
   - Pinterest: 点击 + 创建 Pin
   - TikTok: 进入上传页面
   - Etsy: 进入商品发布页面

2. 点击浏览器右上角的插件图标
3. 确认连接状态显示"已连接"
4. 点击"自动填充到当前页面"按钮

### 快速打开平台
插件弹窗中提供了各平台的快速链接，点击即可直接跳转。

## 技术架构

```
chrome-extension/
├── manifest.json          # 插件配置
├── background.js          # 后台服务
├── popup/
│   ├── popup.html        # 弹窗界面
│   └── popup.js          # 弹窗逻辑
├── content-scripts/
│   ├── common.js         # 通用工具函数
│   ├── instagram.js      # Instagram 自动填充
│   ├── facebook.js       # Facebook 自动填充
│   ├── twitter.js        # Twitter/X 自动填充
│   ├── pinterest.js      # Pinterest 自动填充
│   ├── tiktok.js         # TikTok 自动填充
│   └── etsy.js           # Etsy 自动填充
├── styles/
│   └── popup.css         # 弹窗样式
└── icons/                # 插件图标
```

## 通信机制

1. 桌面应用启动本地 HTTP 服务器 (端口 9527)
2. 插件通过 `http://localhost:9527/api/content` 获取内容
3. Content Script 将内容填充到页面输入框

## 注意事项

- 请确保桌面应用保持运行状态
- 如果填充失败，请刷新页面后重试
- 部分平台的页面结构可能会更新，如遇问题请提交 Issue

## 故障排除

**问题：显示"未连接"**
- 确保桌面应用已启动
- 检查防火墙是否阻止了 localhost:9527

**问题：填充内容为空**
- 确保在桌面应用中已生成内容（点击 AI 一键润色）

**问题：填充失败**
- 确保您在平台的内容发布页面
- 尝试刷新页面后重新填充
- 部分平台可能需要先点击输入框激活编辑状态

## 版本历史

### v1.0.0
- 初始版本
- 支持 6 个主流平台的内容自动填充
