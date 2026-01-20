# -*- coding: utf-8 -*-
"""
Hifiti 论坛爬虫核心模块
"""

import random
import re
import time
from typing import List, Optional, Dict
from urllib.parse import quote

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError

import config


class HifitiCrawler:
    """Hifiti 论坛自动化爬虫"""
    
    def __init__(self, page: Page):
        """
        初始化爬虫。
        
        Args:
            page: Playwright 页面对象
        """
        self.page = page
        self.results: List[Dict] = []
    
    def search_song(self, keyword: str) -> bool:
        """
        在论坛搜索歌曲。
        
        Args:
            keyword: 搜索关键词（歌手 歌名）
            
        Returns:
            bool: 是否找到搜索结果
        """
        print(f"🔍 搜索: {keyword}")
        
        search_url = f"{config.SEARCH_URL}?keyword={quote(keyword)}"
        
        try:
            self.page.goto(search_url, timeout=config.PAGE_LOAD_TIMEOUT)
            self.page.wait_for_load_state('networkidle', timeout=10000)
        except PlaywrightTimeoutError:
            print("  ⚠️ 页面加载超时")
            return False
        
        # 等待搜索结果加载
        time.sleep(2)
        
        # 检查是否有搜索结果
        content = self.page.content()
        if '没有找到' in content or '无结果' in content or '暂无数据' in content:
            print("  ❌ 未找到相关结果")
            return False
        
        return True
    
    def click_best_match(self) -> bool:
        """
        点击搜索结果中最匹配的帖子。
        优先选择包含音质关键词的帖子。
        
        Returns:
            bool: 是否成功点击进入帖子
        """
        # 尝试多种可能的搜索结果选择器
        result_selectors = [
            ".search-result-list .item a.title",
            ".thread-list .item a",
            ".search-list li a",
            ".list-item a",
            "a[href*='thread']",
            ".result-item a",
        ]
        
        for selector in result_selectors:
            try:
                items = self.page.locator(selector).all()
                if items:
                    # 优先选择包含音质关键词的结果
                    best_item = None
                    best_score = -1
                    
                    for item in items[:10]:  # 只检查前10个结果
                        try:
                            text = item.text_content() or ""
                            score = self._calculate_match_score(text)
                            if score > best_score:
                                best_score = score
                                best_item = item
                        except Exception:
                            continue
                    
                    if best_item:
                        print(f"  📌 找到匹配帖子，分数: {best_score}")
                        best_item.click()
                        self.page.wait_for_load_state('networkidle', timeout=10000)
                        time.sleep(2)
                        return True
            except Exception as e:
                continue
        
        # 如果上述选择器都失败，尝试点击第一个链接
        try:
            first_link = self.page.locator("a").filter(has_text=re.compile(r'(无损|FLAC|Hi-Res|专辑|音乐)')).first
            if first_link:
                first_link.click()
                self.page.wait_for_load_state('networkidle', timeout=10000)
                time.sleep(2)
                return True
        except Exception:
            pass
        
        print("  ❌ 无法定位搜索结果")
        return False
    
    def _calculate_match_score(self, text: str) -> int:
        """
        计算文本的匹配分数。
        
        Args:
            text: 帖子标题文本
            
        Returns:
            int: 匹配分数（越高越好）
        """
        score = 0
        text_upper = text.upper()
        
        for i, keyword in enumerate(config.QUALITY_KEYWORDS):
            if keyword.upper() in text_upper:
                score += len(config.QUALITY_KEYWORDS) - i  # 靠前的关键词得分更高
        
        return score
    
    def check_and_reply(self) -> bool:
        """
        检查页面是否需要回复才能看到下载链接，如需要则自动回复。
        
        Returns:
            bool: 是否成功回复或无需回复
        """
        content = self.page.content()
        
        # 检查是否已有可见的网盘链接
        for pattern in config.PAN_LINK_PATTERNS:
            if re.search(pattern, content):
                print("  ✅ 下载链接已可见，无需回复")
                return True
        
        # 检查是否需要回复才能查看
        need_reply_indicators = [
            '回复可见',
            '隐藏内容',
            '回复后可见',
            '需要回复',
            '发表回复',
        ]
        
        needs_reply = any(indicator in content for indicator in need_reply_indicators)
        
        if not needs_reply:
            print("  ℹ️ 页面无隐藏内容")
            return True
        
        print("  📝 需要回复解锁内容，正在回复...")
        
        # 尝试找到回复框并提交
        reply_box_selectors = [
            "#message",
            "textarea[name='message']",
            ".reply-box textarea",
            "#reply-content",
            "textarea.content",
        ]
        
        submit_btn_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:has-text('回复')",
            "button:has-text('发表')",
            "button:has-text('提交')",
            ".submit-btn",
            "#submit",
        ]
        
        reply_box = None
        for selector in reply_box_selectors:
            try:
                box = self.page.locator(selector).first
                if box.is_visible():
                    reply_box = box
                    break
            except Exception:
                continue
        
        if not reply_box:
            print("  ⚠️ 未找到回复框")
            return False
        
        # 随机选择回复内容
        reply_text = random.choice(config.REPLY_MESSAGES)
        
        try:
            reply_box.fill(reply_text)
            time.sleep(1)
            
            # 点击提交按钮
            for selector in submit_btn_selectors:
                try:
                    btn = self.page.locator(selector).first
                    if btn.is_visible():
                        btn.click()
                        print(f"  ✅ 已回复: {reply_text}")
                        
                        # 等待页面刷新
                        time.sleep(3)
                        self.page.wait_for_load_state('networkidle', timeout=10000)
                        return True
                except Exception:
                    continue
            
            print("  ⚠️ 未找到提交按钮")
            return False
            
        except Exception as e:
            print(f"  ❌ 回复失败: {e}")
            return False
    
    def extract_links(self) -> Dict:
        """
        从页面提取网盘链接、提取码和歌词。
        
        Returns:
            Dict: 包含链接、提取码和歌词的字典
        """
        # 同时获取 HTML 和纯文本
        html_content = self.page.content()
        text_content = self.page.inner_text('body')
        
        result = {
            'links': [],
            'codes': [],
            'link_code_pairs': [],  # 链接和提取码配对
            'lyrics': '',  # 歌词
        }
        
        # 提取歌词
        result['lyrics'] = self._extract_lyrics(text_content)
        
        # 提取网盘链接
        for pattern in config.PAN_LINK_PATTERNS:
            matches = re.findall(pattern, html_content)
            for match in matches:
                if match not in result['links']:
                    result['links'].append(match)
        
        # 提取提取码 - 同时从 HTML 和纯文本中提取
        all_codes = set()
        for content in [html_content, text_content]:
            for pattern in config.EXTRACT_CODE_PATTERNS:
                try:
                    matches = re.findall(pattern, content, re.MULTILINE | re.IGNORECASE)
                    for match in matches:
                        if match and len(match) == 4:
                            all_codes.add(match)
                except Exception:
                    continue
        
        # 额外：尝试在链接附近查找提取码
        for link in result['links']:
            # 找到链接在文本中的位置，提取其后 50 字符
            link_short = link.split('/')[-1][:10]  # 链接的一部分
            for content in [html_content, text_content]:
                idx = content.find(link_short)
                if idx != -1:
                    nearby_text = content[idx:idx+100]
                    # 在附近文本中查找 4 位码
                    code_match = re.search(r'[：:\s]([a-zA-Z0-9]{4})(?:\s|$|<)', nearby_text)
                    if code_match:
                        all_codes.add(code_match.group(1))
        
        result['codes'] = list(all_codes)
        
        # 配对链接和提取码（如果数量一致）
        if len(result['links']) == len(result['codes']):
            result['link_code_pairs'] = list(zip(result['links'], result['codes']))
        elif result['links'] and result['codes']:
            # 如果数量不一致，尝试就近配对
            for link in result['links']:
                result['link_code_pairs'].append((link, result['codes'][0] if result['codes'] else ''))
        
        if result['links']:
            print(f"  🔗 提取到 {len(result['links'])} 个链接, {len(result['codes'])} 个提取码")
        else:
            print("  ⚠️ 未提取到网盘链接")
        
        if result['lyrics']:
            print(f"  📝 提取到歌词 ({len(result['lyrics'])} 字符)")
        
        return result
    
    def _extract_lyrics(self, text_content: str) -> str:
        """
        从页面文本中提取歌词。
        
        歌词通常在 "歌词" 标记之后，"下载" 或链接之前。
        
        Args:
            text_content: 页面纯文本内容
            
        Returns:
            str: 提取的歌词文本
        """
        lyrics = ''
        
        try:
            # 查找歌词开始标记
            lyrics_markers = ['歌词', '歌詞', 'Lyrics']
            end_markers = ['下载', '下載', 'https://', 'http://', 'pan.baidu', 'pan.quark', '链接', '鏈接', '提取码', '提取碼']
            
            start_idx = -1
            for marker in lyrics_markers:
                idx = text_content.find(marker)
                if idx != -1:
                    start_idx = idx + len(marker)
                    break
            
            if start_idx == -1:
                return ''
            
            # 查找歌词结束位置
            remaining_text = text_content[start_idx:]
            end_idx = len(remaining_text)
            
            for marker in end_markers:
                idx = remaining_text.find(marker)
                if idx != -1 and idx < end_idx:
                    end_idx = idx
            
            lyrics = remaining_text[:end_idx].strip()
            
            # 清理歌词：移除多余的空行和首尾空白
            lines = [line.strip() for line in lyrics.split('\n') if line.strip()]
            lyrics = '\n'.join(lines)
            
            # 限制歌词长度（防止提取过多无关内容）
            if len(lyrics) > 3000:
                lyrics = lyrics[:3000] + '\n...(歌词过长，已截断)'
            
        except Exception as e:
            print(f"  ⚠️ 歌词提取失败: {e}")
        
        return lyrics
    
    def process_song(self, keyword: str) -> Optional[Dict]:
        """
        处理单首歌曲的完整流程：搜索 -> 进入帖子 -> 回复 -> 提取链接。
        
        Args:
            keyword: 歌曲搜索关键词
            
        Returns:
            Optional[Dict]: 处理结果，包含链接信息
        """
        result = {
            'keyword': keyword,
            'success': False,
            'links': [],
            'codes': [],
            'error': None,
        }
        
        try:
            # 步骤 1: 搜索
            if not self.search_song(keyword):
                result['error'] = '搜索无结果'
                return result
            
            # 步骤 2: 点击进入帖子
            if not self.click_best_match():
                result['error'] = '无法进入帖子'
                return result
            
            # 步骤 3: 回复解锁
            if not self.check_and_reply():
                result['error'] = '回复失败'
                return result
            
            # 步骤 4: 提取链接
            links_info = self.extract_links()
            result['links'] = links_info['links']
            result['codes'] = links_info['codes']
            result['success'] = len(links_info['links']) > 0
            
        except Exception as e:
            result['error'] = str(e)
            print(f"  ❌ 处理出错: {e}")
        
        return result
    
    def random_delay(self):
        """随机延迟，防止被封。"""
        delay = random.uniform(config.MIN_DELAY, config.MAX_DELAY)
        print(f"  ⏳ 等待 {delay:.1f} 秒...")
        time.sleep(delay)
