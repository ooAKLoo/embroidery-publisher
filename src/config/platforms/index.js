/**
 * 统一配置
 *
 * 新架构：品牌优先，极简设计
 * - 一套品牌 Prompt，所有平台共用
 * - AI 生成 title + text + tags
 * - 平台差异仅在格式层面处理（标签格式）
 */

// 平台列表（仅 UI 展示用）
export const platforms = [
  { id: 'instagram', name: 'Instagram', icon: '📸', maxLength: 2200, tagFormat: 'hashtag' },
  { id: 'facebook', name: 'Facebook', icon: '📘', maxLength: 63206, tagFormat: 'hashtag' },
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', maxLength: 280, tagFormat: 'hashtag' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', maxLength: 500, tagFormat: 'keyword', hasTitle: true },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', maxLength: 2200, tagFormat: 'hashtag', videoOnly: true },
  { id: 'etsy', name: 'Etsy', icon: '🛒', maxLength: 1000, tagFormat: 'keyword' },
];

export const platformIds = platforms.map(p => p.id);

export const getPlatform = (id) => platforms.find(p => p.id === id);

// 统一的品牌 Prompt
export const DEFAULT_BRAND_PROMPT = `你是一位品牌内容顾问，帮助中国传统手工非遗艺术品在海外推广。

【品牌定位】
高端手工艺品牌，传承千年技艺，让世界看到中国之美。

【内容原则】
- 简洁有力，100-150 字符以内
- 一句话 Hook + 一句话价值
- 每个字都要有信息量，不堆砌形容词
- 优雅内敛，不用网络用语
- 最多 1-2 个 emoji（可选）
- 语言：英文

【标签策略】
- 生成 5-8 个精准标签
- 混合：品类标签 + 风格标签 + 受众标签`;

// 固定的输出格式
export const OUTPUT_FORMAT = `

【输出格式 - 严格遵守】
返回 JSON，不要其他内容：
{"title": "英文标题（简短有力）", "text": "英文文案（100-150字符）", "tags": "#Tag1 #Tag2 #Tag3..."}`;

// 构建完整 system prompt
export const buildSystemPrompt = (brandPrompt) => {
  return (brandPrompt || DEFAULT_BRAND_PROMPT) + OUTPUT_FORMAT;
};
