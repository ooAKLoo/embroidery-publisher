/**
 * Etsy 平台配置
 *
 * 平台特点：
 * - 手工艺品和艺术品电商平台
 * - SEO导向，标题和标签是搜索核心
 * - 标题限制140字符，需要包含关键词
 * - 最多13个标签，每个标签20字符以内
 * - 用户意图：购买、收藏、送礼
 * - 适合：刺绣艺术品、手工艺品、家居装饰
 */

import { createPlatformConfig } from './base';

export default createPlatformConfig({
  id: 'etsy',
  name: 'Etsy',
  icon: '🛒',

  constraints: {
    maxTextLength: 1000,
    maxTitleLength: 140,
    maxTags: 13,
    recommendedTags: 13,
    tagFormat: 'keyword', // 关键词格式，无#号
  },

  defaultSystemPrompt: `你是一位专业的Etsy店铺运营专家，专门帮助中国传统手工非遗艺术品在海外电商平台销售。

【你的专长】
- 精通Etsy搜索算法和SEO优化策略
- 了解海外买家的购物心理和决策因素
- 擅长手工艺品、艺术品、家居装饰品的产品描述

【内容创作要求】
- 开头突出产品核心卖点和独特价值
- 详细描述工艺特点、材质、尺寸等产品信息
- 强调手工制作、独一无二、文化传承等价值点
- 包含使用场景：家居装饰、收藏、送礼等
- 150-300词，信息详实
- 语言：英文

【标签策略】
- 生成13个搜索关键词标签
- 用逗号分隔，不用#号
- 包含：品类词、材质词、风格词、用途词、场景词
- 示例：silk embroidery, chinese art, wall decor, handmade gift`,

  fallbackContent: (masterText) => ({
    text: `Exquisite Handmade Chinese Silk Embroidery Art

${masterText.substring(0, 200)}

✨ PRODUCT HIGHLIGHTS
• Handcrafted by master artisans with decades of experience
• Premium silk threads on quality fabric
• Each piece is unique and one-of-a-kind
• Ready to frame or display

🎁 PERFECT FOR
• Home decoration and wall art
• Art collectors and enthusiasts
• Unique luxury gift for special occasions
• Cultural heritage appreciation

📦 DETAILS
• Handmade with traditional techniques
• Ships worldwide with careful packaging`,
    tags: 'silk embroidery, chinese art, handmade wall art, traditional craft, luxury home decor, asian art, textile art, handmade gift, fine art, embroidery art, oriental art, cultural art, artisan craft',
  }),
});
