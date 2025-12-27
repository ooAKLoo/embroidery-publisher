import { useState, useCallback } from 'react';
import { platformIds, getPlatformConfig, getActivePromptContent } from '../config/platforms';

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = '1f7f43a7-05c6-4054-a6f7-cff0ad26c124';

/**
 * 调用AI API
 *
 * 新架构：
 * - systemPrompt: 用户编辑的提示词 + 固定输出格式
 * - userMessage: 只包含用户输入的核心文案
 */
async function callAI(systemPrompt, userMessage) {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
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

  return content;
}

/**
 * 解析AI返回的JSON内容
 */
function parseAIResponse(content) {
  const cleanContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleanContent);
}

/**
 * 为单个平台生成内容
 *
 * @param {string} platformId - 平台ID
 * @param {string} masterText - 用户输入的核心文案
 * @param {string} customSystemPrompt - 用户编辑的系统提示词（可选）
 */
async function generateForPlatform(platformId, masterText, customSystemPrompt) {
  const config = getPlatformConfig(platformId);
  const systemPrompt = config.buildSystemPrompt(customSystemPrompt);

  try {
    const content = await callAI(systemPrompt, masterText);
    const result = parseAIResponse(content);

    return {
      text: result.text || '',
      tags: result.tags || '',
    };
  } catch (error) {
    console.error(`[${platformId}] AI生成失败:`, error);
    return config.getFallbackContent(masterText);
  }
}

export function useAIAdapter() {
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptingPlatforms, setAdaptingPlatforms] = useState({});

  /**
   * 为单个平台适配内容
   */
  const adaptForPlatform = useCallback(
    async (masterText, platformId, customSystemPrompt) => {
      setAdaptingPlatforms((prev) => ({ ...prev, [platformId]: true }));

      try {
        return await generateForPlatform(platformId, masterText, customSystemPrompt);
      } finally {
        setAdaptingPlatforms((prev) => ({ ...prev, [platformId]: false }));
      }
    },
    []
  );

  /**
   * 为所有平台适配内容
   *
   * @param {string} masterText - 用户输入的核心文案
   * @param {Object} platformPrompts - 各平台的提示词配置 { platformId: { activeId, list } }
   */
  const adaptContent = useCallback(async (masterText, platformPrompts) => {
    setIsAdapting(true);

    const results = { texts: {}, tags: {} };

    try {
      const promises = platformIds.map(async (platformId) => {
        // 获取当前选中的提示词内容
        const customSystemPrompt = getActivePromptContent(platformPrompts, platformId);
        const result = await generateForPlatform(platformId, masterText, customSystemPrompt);
        return { platformId, result };
      });

      const platformResults = await Promise.all(promises);

      for (const { platformId, result } of platformResults) {
        results.texts[platformId] = result.text;
        results.tags[platformId] = result.tags;
      }

      return results;
    } catch (error) {
      console.error('AI适配失败:', error);

      for (const platformId of platformIds) {
        const config = getPlatformConfig(platformId);
        const fallback = config.getFallbackContent(masterText);
        results.texts[platformId] = fallback.text;
        results.tags[platformId] = fallback.tags;
      }

      return results;
    } finally {
      setIsAdapting(false);
    }
  }, []);

  return {
    isAdapting,
    adaptingPlatforms,
    adaptContent,
    adaptForPlatform,
  };
}
