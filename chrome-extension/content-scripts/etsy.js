// 苏绣出海发布助手 - Etsy Content Script

(function() {
  'use strict';

  const PLATFORM = 'etsy';

  // Etsy 产品发布页面的选择器
  const SELECTORS = {
    // 产品标题
    titleInput: 'input[name="title"], input[id="listing-title"], input[placeholder*="title"]',
    // 产品描述
    descriptionInput: 'textarea[name="description"], textarea[id="description"], div[contenteditable="true"][data-field="description"]',
    // 标签/关键词
    tagsInput: 'input[name="tags"], input[id="tags"], input[placeholder*="tag"], input[data-test-id="tag-input"]',
    // 价格
    priceInput: 'input[name="price"], input[id="price"]'
  };

  // 填充内容到 Etsy
  async function fillContent() {
    try {
      const content = await fetchPlatformContent(PLATFORM);
      if (!content || !content.text) {
        return { success: false, error: '未获取到内容，请确保苏绣发布器已打开并生成了内容' };
      }

      let filledCount = 0;

      // 填充标题
      if (content.title) {
        try {
          const titleInput = await waitForElement(SELECTORS.titleInput, 2000);
          simulateInput(titleInput, content.title);
          filledCount++;
        } catch {
          console.log('Etsy: 未找到标题输入框');
        }
      }

      // 分离描述和标签
      const textParts = content.text.split('\n\n');
      const mainDescription = textParts[0] || '';
      const tags = textParts[1] || '';

      // 填充描述
      try {
        const descriptionInput = await waitForElement(SELECTORS.descriptionInput, 2000);

        if (descriptionInput.tagName === 'TEXTAREA') {
          simulateInput(descriptionInput, mainDescription);
        } else {
          // contenteditable div
          descriptionInput.focus();
          descriptionInput.innerHTML = '';
          descriptionInput.textContent = mainDescription;
          descriptionInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
        filledCount++;
      } catch {
        console.log('Etsy: 未找到描述输入框');
      }

      // 填充标签
      if (tags) {
        try {
          const tagsInput = await waitForElement(SELECTORS.tagsInput, 1000);
          // Etsy 标签通常用逗号分隔
          const tagList = tags.split(',').map(t => t.trim()).filter(t => t);

          // Etsy 限制 13 个标签
          for (const tag of tagList.slice(0, 13)) {
            simulateInput(tagsInput, tag);
            await delay(100);

            // 模拟按 Enter 或 Tab 确认标签
            tagsInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              bubbles: true
            }));
            await delay(200);
          }
          filledCount++;
        } catch {
          console.log('Etsy: 未找到标签输入框');
        }
      }

      if (filledCount === 0) {
        return { success: false, error: '未找到任何可填充的输入框，请确保您在 Etsy 产品发布页面' };
      }

      await delay(100);

      showNotification(`Etsy 内容填充成功！已填充 ${filledCount} 个字段`);
      return { success: true };

    } catch (error) {
      console.error('Etsy 填充失败:', error);
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

  console.log('苏绣出海发布助手: Etsy content script 已加载');
})();
