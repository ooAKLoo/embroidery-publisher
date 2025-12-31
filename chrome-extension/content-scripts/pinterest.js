// 苏绣出海发布助手 - Pinterest Content Script

(function() {
  'use strict';

  const PLATFORM = 'pinterest';

  // Pinterest 发布页面的选择器
  const SELECTORS = {
    // 标题输入框
    titleInput: 'input[id="storyboard-selector-title"], input[name="title"], input[placeholder*="Add your title"], input[placeholder*="添加标题"]',
    // 描述输入框
    descriptionInput: 'textarea[id="TextArea"], textarea[name="description"], div[contenteditable="true"][data-test-id="TextArea"], textarea[placeholder*="Tell everyone"], textarea[placeholder*="描述"]',
    // 标签/关键词输入框
    tagsInput: 'input[placeholder*="Search for a tag"], input[placeholder*="搜索标签"], input[data-test-id="tag-input"]',
    // 链接输入框
    linkInput: 'input[id="WebsiteField"], input[name="link"], input[placeholder*="Add a destination link"]'
  };

  // 填充内容到 Pinterest
  async function fillContent() {
    try {
      const content = await fetchPlatformContent(PLATFORM);
      if (!content || !content.text) {
        return { success: false, error: '未获取到内容，请确保苏绣发布器已打开并生成了内容' };
      }

      let filledCount = 0;

      // 填充标题 (Pinterest 特有)
      if (content.title) {
        try {
          const titleInput = await waitForElement(SELECTORS.titleInput, 2000);
          simulateInput(titleInput, content.title);
          filledCount++;
        } catch {
          console.log('Pinterest: 未找到标题输入框');
        }
      }

      // 分离文案和标签
      const textParts = content.text.split('\n\n');
      const mainText = textParts[0] || '';
      const tags = textParts[1] || '';

      // 填充描述
      try {
        const descriptionInput = await waitForElement(SELECTORS.descriptionInput, 2000);

        if (descriptionInput.tagName === 'TEXTAREA') {
          simulateInput(descriptionInput, mainText);
        } else {
          // contenteditable div
          descriptionInput.focus();
          descriptionInput.innerHTML = '';
          descriptionInput.textContent = mainText;
          descriptionInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }
        filledCount++;
      } catch {
        console.log('Pinterest: 未找到描述输入框');
      }

      // 填充标签 (如果有标签输入框)
      if (tags) {
        try {
          const tagsInput = await waitForElement(SELECTORS.tagsInput, 1000);
          // Pinterest 标签可能需要逐个输入
          const tagList = tags.split(',').map(t => t.trim()).filter(t => t);

          for (const tag of tagList.slice(0, 10)) { // Pinterest 限制标签数量
            simulateInput(tagsInput, tag);
            await delay(100);
            // 模拟按 Enter 确认标签
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
          console.log('Pinterest: 未找到标签输入框');
        }
      }

      if (filledCount === 0) {
        return { success: false, error: '未找到任何可填充的输入框，请确保您在 Pin 创建页面' };
      }

      await delay(100);

      showNotification(`Pinterest 内容填充成功！已填充 ${filledCount} 个字段`);
      return { success: true };

    } catch (error) {
      console.error('Pinterest 填充失败:', error);
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

  console.log('苏绣出海发布助手: Pinterest content script 已加载');
})();
