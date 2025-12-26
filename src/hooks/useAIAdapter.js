import { useState, useCallback } from 'react';

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = '1f7f43a7-05c6-4054-a6f7-cff0ad26c124';

export function useAIAdapter() {
  const [isAdapting, setIsAdapting] = useState(false);

  const adaptContent = useCallback(async (masterText) => {
    setIsAdapting(true);

    const prompt = `你是一个专业的社交媒体文案专家，专门帮助中国苏绣/湘绣艺术品在海外社交媒体推广。

用户输入的原始描述：
"${masterText}"

请根据以上信息，生成适合以下4个平台的英文文案和标签。注意每个平台的风格差异：

1. Instagram: 优雅感性，可用表情符号，强调视觉美感和手工艺价值
2. Facebook: 可以较长，讲述作品背后的文化故事和非遗传承
3. X (Twitter): 极简硬核，必须控制在200字符以内，突出亮点
4. Pinterest: SEO导向，标题要带关键词如"Luxury Wall Art", "Handmade Gift"

请严格按照以下JSON格式返回（不要包含任何其他文字）：
{
  "texts": {
    "instagram": "Instagram文案内容",
    "facebook": "Facebook文案内容",
    "twitter": "Twitter文案内容（200字符以内）",
    "pinterest": "Pinterest标题和描述"
  },
  "tags": {
    "instagram": "#Tag1 #Tag2 #Tag3 ...(最多15个标签)",
    "facebook": "#Tag1 #Tag2 #Tag3 (3-5个标签)",
    "twitter": "#Tag1 #Tag2 (1-2个标签)",
    "pinterest": "Keyword1, Keyword2, Keyword3 (搜索关键词，逗号分隔)"
  }
}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-6-251015',
          max_completion_tokens: 65535,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
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

      // 尝试解析JSON
      // 移除可能的markdown代码块标记
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        const result = JSON.parse(cleanContent);
        return result;
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        console.log('原始内容:', content);

        // 如果解析失败，尝试手动构造结果
        return {
          texts: {
            instagram: `${masterText}\n\nHandcrafted with love.`,
            facebook: masterText,
            twitter: masterText.substring(0, 200),
            pinterest: `Luxury Handmade Art - ${masterText.substring(0, 100)}`,
          },
          tags: {
            instagram: '#SuEmbroidery #SilkArt #Handmade #ChineseArt #LuxuryArt #ArtCollector #TextileArt #FineArt #HandEmbroidery #SilkThread #TraditionalCraft #AsianArt #WallArt #HomeDecor #Artisan',
            facebook: '#SuEmbroidery #ChineseArt #Handmade #TextileArt #LuxuryArt',
            twitter: '#SuEmbroidery #Art',
            pinterest: 'Su Embroidery, Silk Art, Chinese Handmade, Wall Art, Luxury Gift, Home Decor, Fine Art',
          },
        };
      }
    } catch (error) {
      console.error('AI适配失败:', error);

      // 返回默认的英文翻译
      return {
        texts: {
          instagram: `${masterText}\n\nA masterpiece of traditional Chinese silk embroidery.`,
          facebook: `${masterText}\n\nThis piece represents centuries of Chinese embroidery tradition, where each stitch tells a story of dedication and artistry.`,
          twitter: 'Exquisite Chinese silk embroidery. Handcrafted with centuries-old techniques.',
          pinterest: `Luxury Chinese Silk Embroidery Wall Art - Handmade Fine Art | ${masterText.substring(0, 100)}`,
        },
        tags: {
          instagram: '#SuEmbroidery #SilkArt #Handmade #ChineseArt #LuxuryArt #ArtCollector #TextileArt #FineArt #HandEmbroidery #SilkThread #TraditionalCraft #AsianArt #WallArt #HomeDecor #Artisan',
          facebook: '#SuEmbroidery #ChineseArt #Handmade #TextileArt #LuxuryArt',
          twitter: '#SuEmbroidery #Art',
          pinterest: 'Su Embroidery, Silk Art, Chinese Handmade, Wall Art, Luxury Gift, Home Decor, Fine Art',
        },
      };
    } finally {
      setIsAdapting(false);
    }
  }, []);

  return {
    isAdapting,
    adaptContent,
  };
}
