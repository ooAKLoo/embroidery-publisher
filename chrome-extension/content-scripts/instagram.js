// 苏绣出海发布助手 - Instagram Content Script

(function() {
  'use strict';

  const PLATFORM = 'instagram';

  // Instagram 发布页面的文案输入框选择器
  const SELECTORS = {
    // 新版 Instagram 发布弹窗中的文案输入框
    captionInput: '[aria-label="Write a caption..."], [aria-label="写个说明..."], [data-lexical-editor="true"], textarea[placeholder*="caption"], div[contenteditable="true"][role="textbox"]',
    // 创建帖子按钮
    createButton: '[aria-label="New post"], [aria-label="新帖子"], svg[aria-label="New post"]',
  };

  // 填充内容到 Instagram
  async function fillContent() {
    try {
      const content = await fetchPlatformContent(PLATFORM);
      if (!content || !content.text) {
        return { success: false, error: '未获取到内容，请确保苏绣发布器已打开并生成了内容' };
      }

      // 等待文案输入框出现
      let captionInput;
      try {
        captionInput = await waitForElement(SELECTORS.captionInput, 3000);
      } catch {
        return { success: false, error: '未找到文案输入框，请确保您在发布页面' };
      }

      // 填充文案
      simulateInput(captionInput, content.text);

      // 额外处理 Instagram 的 contenteditable
      if (captionInput.getAttribute('contenteditable') === 'true') {
        // 创建文本节点
        captionInput.innerHTML = '';
        const textNode = document.createTextNode(content.text);
        captionInput.appendChild(textNode);

        // 触发必要的事件
        captionInput.dispatchEvent(new Event('input', { bubbles: true }));
        captionInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }

      await delay(100);

      showNotification('Instagram 文案填充成功！');
      return { success: true };

    } catch (error) {
      console.error('Instagram 填充失败:', error);
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

  console.log('苏绣出海发布助手: Instagram content script 已加载');
})();
