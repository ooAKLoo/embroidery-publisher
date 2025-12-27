import { useState, useCallback } from 'react';
import { platforms, buildSystemPrompt } from '../config/platforms';

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = '1f7f43a7-05c6-4054-a6f7-cff0ad26c124';

/**
 * AI 内容适配器
 *
 * 极简架构：
 * - 只调用一次 AI，生成统一内容（title + text + tags）
 * - 所有平台使用相同内容
 * - 仅做格式适配（标签：# vs 逗号分隔）
 */
export function useAIAdapter() {
  const [isAdapting, setIsAdapting] = useState(false);

  const adaptContent = useCallback(async (masterText, brandPrompt) => {
    if (!masterText.trim()) return null;

    setIsAdapting(true);

    try {
      // 调用 AI
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-6-251015',
          max_completion_tokens: 65535,
          messages: [
            { role: 'system', content: buildSystemPrompt(brandPrompt) },
            { role: 'user', content: masterText },
          ],
          reasoning_effort: 'medium',
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('API返回内容为空');
      }

      // 解析 JSON
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const result = JSON.parse(cleanContent);

      const { title = '', text = '', tags = '' } = result;

      // 将 hashtag 转为 keyword 格式
      const keywordTags = tags
        .replace(/#/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .join(', ');

      // 为所有平台构建结果
      const texts = {};
      platforms.forEach(platform => {
        const platformTags = platform.tagFormat === 'keyword' ? keywordTags : tags;
        texts[platform.id] = platformTags ? `${text}\n\n${platformTags}` : text;
      });

      return { texts, title };
    } catch (error) {
      console.error('AI适配失败:', error);
      return null;
    } finally {
      setIsAdapting(false);
    }
  }, []);

  return { isAdapting, adaptContent };
}
