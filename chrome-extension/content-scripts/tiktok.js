// 苏绣出海发布助手 - TikTok Content Script

(function() {
  'use strict';

  const PLATFORM = 'tiktok';

  // TikTok 发布页面的选择器
  const SELECTORS = {
    // 视频描述/文案输入框
    captionInput: 'div[contenteditable="true"][data-text="true"], div.public-DraftEditor-content, div[aria-label*="caption"], div[contenteditable="true"][class*="caption"], textarea[placeholder*="描述"], div[data-contents="true"]',
    // 标签输入框
    hashtagInput: 'input[placeholder*="hashtag"], input[class*="hashtag"]'
  };

  // 填充内容到 TikTok
  async function fillContent() {
    try {
      const content = await fetchPlatformContent(PLATFORM);
      if (!content || !content.text) {
        return { success: false, error: '未获取到内容，请确保苏绣发布器已打开并生成了内容' };
      }

      // TikTok 限制 2200 字符
      const textToFill = content.text.substring(0, 2200);

      // 等待文案输入框出现
      let captionInput;
      try {
        captionInput = await waitForElement(SELECTORS.captionInput, 3000);
      } catch {
        return { success: false, error: '未找到文案输入框，请确保您在 TikTok 视频发布页面' };
      }

      // 聚焦
      captionInput.focus();
      await delay(100);

      // TikTok 使用 DraftJS 编辑器，需要特殊处理
      if (captionInput.classList.contains('public-DraftEditor-content') ||
          captionInput.querySelector('[data-contents="true"]')) {

        // 尝试找到实际的编辑区域
        const editorContent = captionInput.querySelector('[data-contents="true"]') || captionInput;

        // 选择所有内容
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorContent);
        selection.removeAllRanges();
        selection.addRange(range);

        // 使用 execCommand 插入文本
        document.execCommand('insertText', false, textToFill);

      } else {
        // 普通 contenteditable
        captionInput.innerHTML = '';
        captionInput.textContent = textToFill;

        captionInput.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: textToFill
        }));
      }

      // 触发必要的事件
      captionInput.dispatchEvent(new Event('change', { bubbles: true }));
      captionInput.dispatchEvent(new Event('blur', { bubbles: true }));

      await delay(100);

      showNotification('TikTok 文案填充成功！');
      return { success: true };

    } catch (error) {
      console.error('TikTok 填充失败:', error);
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

  console.log('苏绣出海发布助手: TikTok content script 已加载');
})();
