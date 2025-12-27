/**
 * 平台配置注册中心
 *
 * 这里统一管理所有支持的社交媒体平台配置。
 * 添加新平台只需：
 * 1. 创建新的平台配置文件（如 youtube.js）
 * 2. 在此文件中导入并注册
 */

import instagram from './instagram';
import facebook from './facebook';
import twitter from './twitter';
import pinterest from './pinterest';
import tiktok from './tiktok';
import etsy from './etsy';

// 平台配置映射
export const platformConfigs = {
  instagram,
  facebook,
  twitter,
  pinterest,
  tiktok,
  etsy,
};

// 平台ID列表
export const platformIds = Object.keys(platformConfigs);

// 获取单个平台配置
export const getPlatformConfig = (platformId) => {
  const config = platformConfigs[platformId];
  if (!config) {
    throw new Error(`Unknown platform: ${platformId}`);
  }
  return config;
};

// 获取所有平台的默认系统提示词（新结构：支持多提示词）
export const getDefaultSystemPrompts = () => {
  return Object.fromEntries(
    Object.entries(platformConfigs).map(([id, config]) => [
      id,
      {
        activeId: 'default',
        list: [
          {
            id: 'default',
            name: '默认',
            content: config.defaultSystemPrompt,
          },
        ],
      },
    ])
  );
};

// 获取某平台当前选中的提示词内容
export const getActivePromptContent = (platformPrompts, platformId) => {
  const platformData = platformPrompts[platformId];
  if (!platformData) return null;

  const activePrompt = platformData.list.find(p => p.id === platformData.activeId);
  return activePrompt?.content || platformData.list[0]?.content || '';
};

// 获取平台列表信息（用于UI展示）
export const getPlatformList = () => {
  return Object.values(platformConfigs).map((config) => ({
    id: config.id,
    name: config.name,
    icon: config.icon,
    constraints: config.constraints,
  }));
};

export default platformConfigs;
