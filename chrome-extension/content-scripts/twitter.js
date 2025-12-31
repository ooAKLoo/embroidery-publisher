// 苏绣出海发布助手 - Twitter/X Content Script

(function() {
  'use strict';

  const PLATFORM = 'twitter';

  // Twitter/X 发布页面的选择器
  const SELECTORS = {
    // 推文输入框
    tweetInput: '[data-testid="tweetTextarea_0"], div[aria-label*="Tweet text"], div[aria-label*="帖文文本"], div[contenteditable="true"][role="textbox"]',
    // 发布按钮
    tweetButton: '[data-testid="tweetButtonInline"], [data-testid="tweetButton"]'
  };

  // 填充内容到 Twitter/X
  async function fillContent() {
    try {
      const content = await fetchPlatformContent(PLATFORM);
      if (!content || !content.text) {
        return { success: false, error: '未获取到内容，请确保苏绣发布器已打开并生成了内容' };
      }

      // 检查内容长度 (Twitter 限制 280 字符)
      if (content.text.length > 280) {
        console.warn('Twitter 内容超过 280 字符限制，将被截断');
      }

      // 等待推文输入框出现
      let tweetInput;
      try {
        tweetInput = await waitForElement(SELECTORS.tweetInput, 3000);
      } catch {
        return { success: false, error: '未找到推文输入框，请确保您在发推页面' };
      }

      // 聚焦并填充内容
      tweetInput.focus();
      await delay(100);

      // Twitter 使用 contenteditable div
      const textToFill = content.text.substring(0, 280);

      // 清空
      tweetInput.innerHTML = '';

      // 创建文本内容
      const span = document.createElement('span');
      span.setAttribute('data-text', 'true');
      span.textContent = textToFill;
      tweetInput.appendChild(span);

      // 触发输入事件
      tweetInput.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: textToFill
      }));

      // Twitter 可能需要额外的事件
      tweetInput.dispatchEvent(new Event('change', { bubbles: true }));
      tweetInput.dispatchEvent(new Event('blur', { bubbles: true }));
      tweetInput.dispatchEvent(new Event('focus', { bubbles: true }));

      await delay(100);

      showNotification('Twitter/X 文案填充成功！');
      return { success: true };

    } catch (error) {
      console.error('Twitter 填充失败:', error);
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

  console.log('苏绣出海发布助手: Twitter/X content script 已加载');
})();
