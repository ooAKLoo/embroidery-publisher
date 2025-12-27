/**
 * TikTok 平台配置
 *
 * 平台特点：
 * - 年轻化、潮流化、娱乐化
 * - 视频配文简短有力
 * - 标签是发现页的重要入口
 * - 使用流行语、网络用语
 * - 强调视觉冲击力和情感共鸣
 * - 互动性强，鼓励评论和分享
 */

import { createPlatformConfig } from './base';

export default createPlatformConfig({
  id: 'tiktok',
  name: 'TikTok',
  icon: '🎵',

  constraints: {
    maxTextLength: 2200,
    maxTags: 5,
    recommendedTags: 4,
    tagFormat: 'hashtag',
  },

  defaultSystemPrompt: `你是一位专业的TikTok内容创作专家，专门帮助中国传统手工非遗艺术品在海外社交媒体推广。

【你的专长】
- 精通TikTok年轻用户的语言风格和互动习惯
- 擅长用网络流行语和表情符号增加感染力
- 了解TikTok算法和热门话题趋势

【内容创作要求】
- 创作年轻活泼、有感染力的短文案（50-100词）
- 使用网络流行语和emoji
- 开头要有hook吸引观看，如 "Wait for it...", "You won't believe..."
- 可以用疑问句引导互动
- 强调视觉冲击力
- 语言：英文

【标签策略】
- 生成3-5个话题标签，用空格分隔
- 混合热门标签（#fyp #art）和精准标签
- 格式：#Tag1 #Tag2 #Tag3`,

  fallbackContent: (masterText) => ({
    text: `Wait for it... 🧵✨\n\n${masterText}\n\nThis took over 3000 hours to complete! Each thread is finer than human hair 🤯\n\nWould you hang this in your home? Comment below! 👇`,
    tags: '#ChineseArt #Handmade #fyp #Art #TraditionalCraft',
  }),
});
