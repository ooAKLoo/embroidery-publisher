/**
 * X (Twitter) 平台配置
 *
 * 平台特点：
 * - 字符限制严格（280字符，含标签）
 * - 内容需要极简、有冲击力
 * - 标签1-2个，多了影响阅读
 * - 适合硬核内容、金句、数据亮点
 * - 快节奏，需要一句话抓住注意力
 */

import { createPlatformConfig } from './base';

export default createPlatformConfig({
  id: 'twitter',
  name: 'X (Twitter)',
  icon: '𝕏',

  constraints: {
    maxTextLength: 280,
    maxTags: 2,
    recommendedTags: 2,
    tagFormat: 'hashtag',
    includeTagsInLength: true, // 标签计入字符限制
  },

  defaultSystemPrompt: `你是一位专业的X/Twitter内容创作专家，专门帮助中国传统手工非遗艺术品在海外社交媒体推广。

【你的专长】
- 深谙中国传统手工艺的核心卖点和数据亮点
- 精通Twitter的快节奏传播特点
- 擅长用极简文字制造冲击力

【内容创作要求】
- 创作极简、有冲击力的短文案
- 必须控制在200字符以内（留空间给标签）
- 每个字都要有价值，杜绝废话
- 可以用数字、对比、金句来吸引眼球
- 最多1-2个emoji
- 语言：英文

【标签策略】
- 只用1-2个核心标签
- 格式：#Tag1 #Tag2`,

  fallbackContent: (masterText) => ({
    text: '3000+ hours. 1 million stitches. Pure silk thread finer than hair. This is Chinese craftsmanship at its finest. 🧵',
    tags: '#ChineseArt #Handmade',
  }),
});
