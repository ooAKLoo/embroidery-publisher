// 苏绣出海发布助手 - 通用工具函数

const PLATFORM_API = 'http://localhost:9527';

// 从桌面应用获取平台内容
async function fetchPlatformContent(platform) {
  try {
    const response = await fetch(`${PLATFORM_API}/api/content`);
    if (!response.ok) {
      throw new Error('无法连接到苏绣发布器');
    }
    const data = await response.json();
    return {
      text: data.platformTexts?.[platform] || '',
      title: data.generatedTitle || '',
      images: data.images || [],
      accountProfile: data.accountProfile || {}
    };
  } catch (error) {
    console.error('获取内容失败:', error);
    return null;
  }
}

// 等待元素出现
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`元素 ${selector} 未找到`));
    }, timeout);
  });
}

// 模拟用户输入
function simulateInput(element, text) {
  // 先聚焦元素
  element.focus();

  // 清空现有内容
  element.value = '';
  element.textContent = '';

  // 对于 contenteditable 元素
  if (element.getAttribute('contenteditable') === 'true') {
    element.innerHTML = '';
    element.textContent = text;

    // 触发输入事件
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    });
    element.dispatchEvent(inputEvent);
  } else {
    // 对于普通 input/textarea
    element.value = text;

    // 触发事件
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 触发 React 的 onChange
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement?.prototype || window.HTMLInputElement?.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT')) {
    nativeInputValueSetter.call(element, text);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 显示通知
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#4CAF50' : '#F44336'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
