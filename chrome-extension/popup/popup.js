// 苏绣出海发布助手 - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const statusText = statusEl.querySelector('.status-text');
  const disconnectedView = document.getElementById('disconnected-view');
  const connectedView = document.getElementById('connected-view');
  const previewContent = document.getElementById('preview-content');
  const fillBtn = document.getElementById('fill-btn');

  // 检查应用状态
  async function checkStatus() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ action: 'checkStatus' }, response => {
        resolve(response?.isRunning || false);
      });
    });
  }

  // 获取内容
  async function getContent() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ action: 'getContent' }, response => {
        resolve(response);
      });
    });
  }

  // 更新UI状态
  function updateStatus(isConnected) {
    if (isConnected) {
      statusEl.className = 'status connected';
      statusText.textContent = '已连接';
      disconnectedView.classList.add('hidden');
      connectedView.classList.remove('hidden');
    } else {
      statusEl.className = 'status disconnected';
      statusText.textContent = '未连接';
      disconnectedView.classList.remove('hidden');
      connectedView.classList.add('hidden');
    }
  }

  // 显示内容预览
  function showPreview(data) {
    if (!data || !data.platformTexts) {
      previewContent.innerHTML = '<p class="placeholder">暂无内容</p>';
      return;
    }

    const title = data.generatedTitle || '';
    // 获取第一个有内容的平台文案作为预览
    const platforms = ['instagram', 'facebook', 'twitter', 'pinterest', 'tiktok', 'etsy'];
    let previewText = '';
    for (const platform of platforms) {
      if (data.platformTexts[platform]) {
        previewText = data.platformTexts[platform];
        break;
      }
    }

    const imageCount = data.images?.length || 0;

    previewContent.innerHTML = `
      ${title ? `<div class="preview-title"><strong>标题:</strong> ${escapeHtml(title)}</div>` : ''}
      <div class="preview-text">${escapeHtml(previewText.substring(0, 200))}${previewText.length > 200 ? '...' : ''}</div>
      <div class="preview-meta">
        <span>📷 ${imageCount} 张图片/视频</span>
      </div>
    `;
  }

  // HTML转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 检测当前标签页平台
  function detectPlatform(url) {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('pinterest.com')) return 'pinterest';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('etsy.com')) return 'etsy';
    return null;
  }

  // 填充按钮点击
  fillBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
      alert('无法获取当前页面信息');
      return;
    }

    const platform = detectPlatform(tab.url);
    if (!platform) {
      alert('当前页面不是支持的平台\n\n支持的平台: Instagram, Facebook, X/Twitter, Pinterest, TikTok, Etsy');
      return;
    }

    // 发送消息给content script
    try {
      chrome.tabs.sendMessage(tab.id, { action: 'fillContent' }, response => {
        if (chrome.runtime.lastError) {
          alert('填充失败: 请刷新页面后重试\n\n确保您在平台的内容发布页面上');
        } else if (response?.success) {
          // 填充成功
          fillBtn.textContent = '✓ 填充成功';
          fillBtn.classList.add('success');
          setTimeout(() => {
            fillBtn.innerHTML = '<span class="btn-icon">✨</span>自动填充到当前页面';
            fillBtn.classList.remove('success');
          }, 2000);
        } else {
          alert(response?.error || '填充失败: 未知错误');
        }
      });
    } catch (error) {
      alert('填充失败: ' + error.message);
    }
  });

  // 初始化
  const isConnected = await checkStatus();
  updateStatus(isConnected);

  if (isConnected) {
    const content = await getContent();
    showPreview(content);
  }

  // 定期检查状态
  setInterval(async () => {
    const connected = await checkStatus();
    updateStatus(connected);
    if (connected) {
      const content = await getContent();
      showPreview(content);
    }
  }, 3000);
});
