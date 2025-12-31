// 苏绣出海发布助手 - Background Service Worker
const API_BASE = 'http://localhost:9527';

// 从桌面应用获取内容数据
async function fetchContentFromApp() {
  try {
    const response = await fetch(`${API_BASE}/api/content`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('无法连接到苏绣发布器:', error);
    return null;
  }
}

// 检查桌面应用是否在运行
async function checkAppStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    return response.ok;
  } catch {
    return false;
  }
}

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContent') {
    fetchContentFromApp().then(data => {
      sendResponse(data);
    });
    return true; // 保持消息通道开启以支持异步响应
  }

  if (request.action === 'checkStatus') {
    checkAppStatus().then(isRunning => {
      sendResponse({ isRunning });
    });
    return true;
  }

  if (request.action === 'getPlatformContent') {
    fetchContentFromApp().then(data => {
      if (data && data.platformTexts) {
        const platformContent = {
          text: data.platformTexts[request.platform] || '',
          title: data.generatedTitle || '',
          images: data.images || [],
          accountProfile: data.accountProfile || {}
        };
        sendResponse(platformContent);
      } else {
        sendResponse(null);
      }
    });
    return true;
  }
});
