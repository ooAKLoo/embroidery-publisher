// 苏绣出海发布助手 - Facebook Content Script

(function() {
  'use strict';

  const PLATFORM = 'facebook';

  // Facebook 发布页面的选择器
  const SELECTORS = {
    // 发帖输入框
    postInput: '[aria-label*="What\'s on your mind"], [aria-label*="在想些什么"], div[contenteditable="true"][role="textbox"], div[data-contents="true"]',
    // 创建帖子
    createPost: '[aria-label="Create post"], [aria-label="创建帖子"]'
  };

  // 填充内容到 Facebook
  async function fillContent() {
    try {
      const content = await fetchPlatformContent(PLATFORM);
      if (!content || !content.text) {
        return { success: false, error: '未获取到内容，请确保苏绣发布器已打开并生成了内容' };
      }

      // 等待文案输入框出现
      let postInput;
      try {
        postInput = await waitForElement(SELECTORS.postInput, 3000);
      } catch {
        return { success: false, error: '未找到发帖输入框，请先点击"在想些什么"来打开发帖框' };
      }

      // 聚焦并填充内容
      postInput.focus();
      await delay(100);

      // Facebook 使用 contenteditable div
      if (postInput.getAttribute('contenteditable') === 'true') {
        // 清空并填充
        postInput.innerHTML = '';

        // 按段落分割并添加
        const paragraphs = content.text.split('\n');
        paragraphs.forEach((para, index) => {
          if (para.trim()) {
            const p = document.createElement('p');
            p.textContent = para;
            postInput.appendChild(p);
          } else if (index > 0) {
            postInput.appendChild(document.createElement('br'));
          }
        });

        // 触发输入事件
        postInput.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText'
        }));
      } else {
        simulateInput(postInput, content.text);
      }

      await delay(100);

      showNotification('Facebook 文案填充成功！');
      return { success: true };

    } catch (error) {
      console.error('Facebook 填充失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 监听来自 popup 的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillContent') {
      fillContent().then(result => {
        sendResponse(result);
      });
      return true;
    }
  });

  console.log('苏绣出海发布助手: Facebook content script 已加载');
})();
