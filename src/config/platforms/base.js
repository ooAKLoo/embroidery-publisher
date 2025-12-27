/**
 * 平台配置基础模块
 *
 * 新架构：
 * - systemPrompt: 用户可编辑，定义AI角色和风格
 * - outputFormat: 固定不可编辑，确保解析成功
 * - user message: 只包含用户输入的核心文案
 */

// 固定的输出格式要求（不可编辑，确保解析成功）
export const OUTPUT_FORMAT_INSTRUCTION = `

【输出格式要求 - 必须严格遵守】
你必须严格按以下JSON格式返回，不要添加任何其他内容：
{"text": "生成的文案内容", "tags": "标签内容"}

注意：
- 只返回JSON，不要有任何解释或前缀
- text: 生成的文案
- tags: 标签（用空格或逗号分隔，根据平台要求）`;

// 平台基础配置模板
export const createPlatformConfig = ({
  id,
  name,
  icon,
  constraints,
  defaultSystemPrompt,
  fallbackContent,
}) => ({
  id,
  name,
  icon,
  constraints,
  defaultSystemPrompt,
  fallbackContent,

  // 构建完整的系统提示词（用户编辑的 + 固定输出格式）
  buildSystemPrompt(customSystemPrompt) {
    const prompt = customSystemPrompt || this.defaultSystemPrompt;
    return prompt + OUTPUT_FORMAT_INSTRUCTION;
  },

  // 生成该平台的回退内容
  getFallbackContent(masterText) {
    return typeof this.fallbackContent === 'function'
      ? this.fallbackContent(masterText)
      : this.fallbackContent;
  },
});

// 通用标签生成辅助
export const COMMON_TAGS = {
  embroidery: ['#Embroidery', '#SilkEmbroidery', '#ChineseEmbroidery', '#HandEmbroidery'],
  suzhou: ['#SuEmbroidery', '#SuzhouEmbroidery', '#苏绣'],
  xiang: ['#XiangEmbroidery', '#HunanEmbroidery', '#湘绣'],
  art: ['#TextileArt', '#FineArt', '#TraditionalArt', '#AsianArt', '#ChineseArt'],
  luxury: ['#LuxuryArt', '#LuxuryGift', '#LuxuryDecor', '#HighEndArt'],
  handmade: ['#Handmade', '#Handcrafted', '#Artisan', '#MasterCraftsman'],
  decor: ['#WallArt', '#HomeDecor', '#InteriorDesign', '#ArtCollector'],
};
