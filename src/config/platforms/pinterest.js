/**
 * Pinterest 平台配置
 *
 * 平台特点：
 * - SEO导向，搜索是主要流量来源
 * - 标题和描述要包含搜索关键词
 * - 用逗号分隔的关键词而非#标签
 * - 用户意图：寻找灵感、购物、收藏
 * - 适合：家居装饰、礼品推荐、艺术收藏
 * - 内容有很长的生命周期（可持续带来流量数月甚至数年）
 */

import { createPlatformConfig } from './base';

export default createPlatformConfig({
  id: 'pinterest',
  name: 'Pinterest',
  icon: '📌',

  constraints: {
    maxTextLength: 500,
    maxTags: 20,
    recommendedTags: 10,
    tagFormat: 'keyword', // 关键词格式，逗号分隔
  },

  defaultSystemPrompt: `你是一位专业的Pinterest SEO专家，专门帮助中国传统手工非遗艺术品在海外社交媒体推广。

【你的专长】
- 精通Pinterest搜索算法和SEO优化
- 了解海外用户的搜索意图（购买、装饰、送礼）
- 擅长为艺术品、家居装饰品撰写高转化描述

【内容创作要求】
- 以搜索关键词开头，如 "Luxury Chinese Art Wall Decor"
- 自然融入高搜索量词汇：Wall Art, Home Decor, Luxury Gift, Handmade, Fine Art
- 突出产品用途：装饰、收藏、送礼
- 100-200词，信息丰富
- 语言：英文

【关键词策略】
- 生成10-15个搜索关键词
- 用逗号分隔，不用#号
- 包含：品类词、风格词、用途词、材质词
- 示例：Chinese Art, Luxury Wall Art, Handmade Gift, Home Decor`,

  fallbackContent: (masterText) => ({
    text: `Luxury Chinese Traditional Art - Handmade Fine Art for Home Decor | ${masterText.substring(0, 100)}\n\nDiscover this exquisite piece of traditional Chinese craftsmanship, handcrafted by master artisans. Perfect for luxury home decor, art collectors, or as a unique high-end gift. Each piece is a one-of-a-kind artwork that brings centuries of cultural heritage into your space.`,
    tags: 'Chinese Art, Traditional Craft, Luxury Wall Art, Fine Art Gift, Home Decor Ideas, Asian Art, Handmade Art, Textile Art, Living Room Decor, Art Collector, Handmade Gift, Chinese Culture, Cultural Heritage, Master Artisan',
  }),
});
