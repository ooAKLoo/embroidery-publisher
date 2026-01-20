# -*- coding: utf-8 -*-
"""
浏览器管理模块 - 登录状态保存与加载
"""

import os
from playwright.sync_api import sync_playwright, Playwright, BrowserContext

import config


def save_login_state():
    """
    启动浏览器让用户手动登录，然后保存登录状态到文件。
    用户登录完成后按 Enter 键保存。
    """
    print("=" * 50)
    print("登录状态保存流程")
    print("=" * 50)
    print("1. 即将打开浏览器，请在浏览器中登录 Hifiti")
    print("2. 登录成功后，回到终端按 Enter 键保存状态")
    print("=" * 50)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            slow_mo=config.SLOW_MO
        )
        context = browser.new_context()
        page = context.new_page()
        
        # 访问登录页面
        page.goto(f"{config.BASE_URL}/login.htm", timeout=config.PAGE_LOAD_TIMEOUT)
        
        # 等待用户手动登录
        input("\n请在浏览器中完成登录，然后按 Enter 键保存状态...")
        
        # 保存登录状态
        context.storage_state(path=config.AUTH_STATE_FILE)
        print(f"\n✅ 登录状态已保存到 {config.AUTH_STATE_FILE}")
        
        browser.close()


def load_browser_context(playwright: Playwright) -> tuple:
    """
    加载已保存的登录状态，返回浏览器和上下文。
    
    Args:
        playwright: Playwright 实例
        
    Returns:
        tuple: (browser, context)
    """
    if not os.path.exists(config.AUTH_STATE_FILE):
        raise FileNotFoundError(
            f"登录状态文件 {config.AUTH_STATE_FILE} 不存在！\n"
            f"请先运行 'python main.py --login' 保存登录状态。"
        )
    
    browser = playwright.chromium.launch(
        headless=config.HEADLESS,
        slow_mo=config.SLOW_MO
    )
    
    context = browser.new_context(
        storage_state=config.AUTH_STATE_FILE
    )
    
    return browser, context


def check_login_status(page) -> bool:
    """
    检查当前页面是否处于登录状态。
    
    Args:
        page: Playwright 页面对象
        
    Returns:
        bool: 是否已登录
    """
    # 访问首页检查登录状态
    page.goto(config.BASE_URL, timeout=config.PAGE_LOAD_TIMEOUT)
    
    # 常见的登录态检测方式：
    # 1. 检查是否有用户中心链接
    # 2. 检查是否有退出按钮
    # 3. 检查是否没有登录按钮
    
    try:
        # 如果能找到"个人中心"或用户名相关元素，说明已登录
        if page.locator("a:has-text('个人中心')").count() > 0:
            return True
        if page.locator("a:has-text('退出')").count() > 0:
            return True
        if page.locator(".user-info").count() > 0:
            return True
    except Exception:
        pass
    
    return False
