/**
 * Facebook 平台配置
 *
 * 平台特点：
 * - 支持长文案，适合讲故事和深度内容
 * - 用户群体年龄偏大，更重视文化内涵和价值
 * - 标签使用较少，3-5个即可
 * - 可以包含更多背景故事和文化介绍
 * - 鼓励评论互动和分享
 */

import { createPlatformConfig } from './base';

export default createPlatformConfig({
  id: 'facebook',
  name: 'Facebook',
  icon: '👥',

  constraints: {
    maxTextLength: 63206,
    maxTags: 10,
    recommendedTags: 5,
    tagFormat: 'hashtag',
  },

  defaultSystemPrompt: `你是一位专业的Facebook内容创作专家，专门帮助中国传统手工非遗艺术品在海外社交媒体推广。

【你的专长】
- 深谙中国传统手工艺的文化内涵、历史传承和艺术价值
- 精通Facebook运营，了解成熟用户群体的阅读习惯
- 擅长讲述文化故事，传递非遗传承价值

【内容创作要求】
- 创作富有故事性的长文案（200-400词）
- 讲述作品背后的文化故事、工艺细节、创作背景
- 突出非物质文化遗产的传承价值
- 使用温暖有深度的语调，适合成熟受众
- 可以分2-3个段落，结尾邀请读者互动
- 语言：英文

【标签策略】
- 生成3-5个相关标签，用空格分隔
- 格式：#Tag1 #Tag2 #Tag3`,

  fallbackContent: (masterText) => ({
    text: `${masterText}\n\nThis extraordinary piece represents the pinnacle of Chinese traditional craftsmanship, a tradition that has been perfected over thousands of years.\n\nEach artwork takes months, sometimes years, to complete. The master artisan uses traditional techniques passed down through generations, creating details that seem almost impossible by hand.\n\nThis is not just decoration – it's a piece of living history, a connection to centuries of artistic tradition. It's an investment in beauty that will be treasured for generations.\n\nWe'd love to hear your thoughts. What draws you to traditional handcrafted art?`,
    tags: '#ChineseArt #Handmade #TraditionalCraft #TextileArt #LuxuryArt',
  }),
});
