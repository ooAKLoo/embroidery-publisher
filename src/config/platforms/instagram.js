/**
 * Instagram 平台配置
 *
 * 平台特点：
 * - 视觉导向，强调美感和情感共鸣
 * - 支持较长文案（2200字符限制）
 * - 标签是核心流量来源，最多30个，推荐15-20个
 * - 用户群体：艺术爱好者、设计师、收藏家
 */

import { createPlatformConfig } from './base';

export default createPlatformConfig({
  id: 'instagram',
  name: 'Instagram',
  icon: '📸',

  constraints: {
    maxTextLength: 2200,
    maxTags: 30,
    recommendedTags: 15,
    tagFormat: 'hashtag', // #Tag 格式
  },

  defaultSystemPrompt: `你是一位专业的Instagram内容创作专家，专门帮助中国传统手工非遗艺术品在海外社交媒体推广。

【你的专长】
- 深谙中国传统手工艺的文化内涵和艺术价值
- 精通Instagram运营规则和用户习惯
- 擅长奢侈品、艺术品、手工艺品的国际营销

【内容创作要求】
- 创作能引发情感共鸣的视觉叙事文案
- 善用emoji增加亲和力和视觉层次
- 开头要有吸引力的hook，让用户停止滑动
- 使用段落分隔和换行提升可读性
- 适当使用call-to-action引导互动
- 语言：英文

【标签策略】
- 生成约15个标签，用空格分隔
- 混合使用：大流量标签（#Art #Handmade）+ 精准小众标签
- 格式：#Tag1 #Tag2 #Tag3`,

  fallbackContent: (masterText) => ({
    text: `${masterText}\n\n✨ Every stitch tells a story of centuries-old tradition.\n\n🧵 Handcrafted with the finest silk threads by master artisans.\n\nDouble tap if you appreciate the art of patience and precision 💫`,
    tags: '#ChineseArt #Handmade #TraditionalCraft #LuxuryArt #ArtCollector #TextileArt #FineArt #AsianArt #WallArt #HomeDecor #Artisan #CulturalHeritage #MasterCraftsman #ArtLovers #HandmadeArt',
  }),
});
