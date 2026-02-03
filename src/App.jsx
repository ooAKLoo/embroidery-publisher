import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import AccountCard from './components/AccountCard';
import MediaUploader from './components/MediaUploader';
import ContentEditor from './components/ContentEditor';
import PlatformPreview from './components/PlatformPreview';
import NavSidebar from './components/NavSidebar';
import ProductManager from './components/ProductManager';
import GeometricLogoGenerator from './components/GeometricLogoGenerator';
import MarketAnalysis from './components/MarketAnalysis';
import AnimationShowcase from './components/AnimationShowcase';
import GenerativeVectorLab from './components/GenerativeVectorLab';
import NeonGeoLogo from './components/NeonGeoLogo';
import ParametricLogo from './components/ParametricLogo';
import GeoGenStudio from './components/GeoGenStudio';
import GeometricSpiralGenerator from './components/GeometricSpiralGenerator';
import GravityPosterGenerator from './components/GravityPosterGenerator';
import GravityOrbitVisualizer from './components/GravityOrbitVisualizer';
import GravityPosterLayout from './components/GravityPosterLayout';
import GravityTunnelUI from './components/GravityTunnelUI';
import SocialLensPreviewer from './components/SocialLensPreviewer';
import StrokeLab from './components/StrokeLab';
import GradientTubeStroke from './components/GradientTubeStroke';
import { AppleMusicPlaylist } from './modules/AppleMusic';
import { useAIAdapter } from './hooks/useAIAdapter';
import { DEFAULT_BRAND_PROMPT, platforms } from './config/platforms';

function App() {
  // 核心状态
  const [images, setImages] = useState([]);
  const [masterText, setMasterText] = useState('');

  // 平台文案（AI 生成后填充）
  const [platformTexts, setPlatformTexts] = useState(
    Object.fromEntries(platforms.map(p => [p.id, '']))
  );

  // AI 生成的标题（用于 Pinterest）
  const [generatedTitle, setGeneratedTitle] = useState('');

  // 设置项
  const [settings, setSettings] = useState({
    addWatermark: true,
    watermarkType: 'text',
    watermarkText: '© Your Brand',
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 0.8,
    watermarkColor: '#FFFFFF',
    watermarkFontSize: 14,
    watermarkImage: null,
    watermarkSize: 'medium'
  });

  // 账号配置
  const [accountProfile, setAccountProfile] = useState({
    displayName: 'Your Brand',
    username: 'yourbrand',
    avatar: null
  });

  const [activePlatform, setActivePlatform] = useState('instagram');

  // 提示词列表
  const [prompts, setPrompts] = useState([
    { id: 'default', name: '默认提示词', content: DEFAULT_BRAND_PROMPT }
  ]);
  const [activePromptId, setActivePromptId] = useState('default');

  // 当前模块
  const [activeModule, setActiveModule] = useState('content');

  // 获取当前激活的提示词内容
  const activePrompt = prompts.find(p => p.id === activePromptId);
  const brandPrompt = activePrompt?.content || DEFAULT_BRAND_PROMPT;

  const { isAdapting, adaptContent } = useAIAdapter();

  // AI 一键润色
  const handleAIAdapt = useCallback(async () => {
    if (!masterText.trim()) return;

    const result = await adaptContent(masterText, brandPrompt);
    if (result) {
      setPlatformTexts(result.texts);
      setGeneratedTitle(result.title);
    }
  }, [masterText, adaptContent, brandPrompt]);

  // Mock 数据生成（用于测试 Chrome 插件）
  const handleMockGenerate = useCallback(() => {
    const mockTitle = 'Exquisite Suzhou Embroidery - Cat Playing with Butterfly';
    const mockTextHashtag = `This stunning piece of Suzhou embroidery "Cat Playing with Butterfly" showcases the pinnacle of traditional Chinese silk art. Crafted over 3 months by master artisans, each strand of silk is split to 1/16th of its original width, creating lifelike fur textures.

#SuzhouEmbroidery #ChineseArt #SilkArt #Handmade #TraditionalCraft #Embroidery #AsianArt #LuxuryArt #ArtCollector #FineArt`;

    const mockTextKeyword = `This stunning piece of Suzhou embroidery "Cat Playing with Butterfly" showcases the pinnacle of traditional Chinese silk art. Crafted over 3 months by master artisans, each strand of silk is split to 1/16th of its original width, creating lifelike fur textures.

Suzhou Embroidery, Chinese Art, Silk Art, Handmade, Traditional Craft, Embroidery, Asian Art, Luxury Art, Art Collector, Fine Art`;

    setPlatformTexts({
      instagram: mockTextHashtag,
      facebook: mockTextHashtag,
      twitter: 'Exquisite Suzhou embroidery "Cat Playing with Butterfly" - 3 months of meticulous handcraft, silk split to 1/16th width. #SuzhouEmbroidery #ChineseArt #SilkArt',
      pinterest: mockTextKeyword,
      tiktok: mockTextHashtag,
      etsy: mockTextKeyword
    });
    setGeneratedTitle(mockTitle);
    setMasterText('这幅苏绣作品《猫戏蝶》采用了传统的劈丝工艺，由绣娘历时3个月纯手工完成。作品中猫咪的毛发根根分明，每一根丝线都被劈成1/16的细度，展现了苏绣「精、细、雅、洁」的艺术特色。');
  }, []);

  // 同步内容状态到 Tauri 后端（供 Chrome 插件读取）
  useEffect(() => {
    const syncToBackend = async () => {
      try {
        // 准备图片信息（不包含完整的文件对象）
        const imageInfos = images.map(img => ({
          id: String(img.id),
          name: img.name || '',
          type: img.type || 'image',
          preview: img.preview || ''
        }));

        await invoke('update_content', {
          platformTexts,
          generatedTitle,
          images: imageInfos,
          accountProfile: {
            displayName: accountProfile.displayName,
            username: accountProfile.username,
            avatar: accountProfile.avatar || null
          }
        });
      } catch (error) {
        console.error('同步内容到后端失败:', error);
      }
    };

    syncToBackend();
  }, [platformTexts, generatedTitle, images, accountProfile]);

  return (
    <div className="h-screen flex bg-[#F8F8F8] p-4 gap-4">
      {/* 左侧导航栏 */}
      <NavSidebar activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* 右侧内容区 */}
      <div className="flex-1 overflow-hidden">
        {activeModule === 'content' ? (
          // 内容发布模块
          <div className="h-full flex gap-4">
            {/* 编辑区 */}
            <div className="w-1/2 flex flex-col overflow-hidden gap-4">
              <div className="flex-shrink-0">
                <AccountCard
                  accountProfile={accountProfile}
                  setAccountProfile={setAccountProfile}
                />
              </div>

              <div className="flex-1 min-h-0">
                <MediaUploader
                  images={images}
                  setImages={setImages}
                  settings={settings}
                  setSettings={setSettings}
                />
              </div>

              <div className="flex-shrink-0">
                <ContentEditor
                  masterText={masterText}
                  setMasterText={setMasterText}
                  onAIAdapt={handleAIAdapt}
                  isAdapting={isAdapting}
                  prompts={prompts}
                  setPrompts={setPrompts}
                  activePromptId={activePromptId}
                  setActivePromptId={setActivePromptId}
                  onMockGenerate={handleMockGenerate}
                />
              </div>
            </div>

            {/* 预览区 */}
            <div className="w-1/2 flex flex-col">
              <div className="bg-white rounded-2xl h-full overflow-hidden">
                <PlatformPreview
                  activePlatform={activePlatform}
                  setActivePlatform={setActivePlatform}
                  images={images}
                  platformTexts={platformTexts}
                  generatedTitle={generatedTitle}
                  accountProfile={accountProfile}
                  brandPrompt={brandPrompt}
                  masterText={masterText}
                />
              </div>
            </div>
          </div>
        ) : activeModule === 'products' ? (
          // 产品中心模块
          <ProductManager />
        ) : activeModule === 'logo' ? (
          // Logo 生成器模块
          <GeometricLogoGenerator />
        ) : activeModule === 'market' ? (
          // 市场分析模块
          <MarketAnalysis />
        ) : activeModule === 'motion' ? (
          // 动效演示模块
          <AnimationShowcase />
        ) : activeModule === 'music' ? (
          // Apple Music 播放列表模块
          <AppleMusicPlaylist />
        ) : activeModule === 'vector' ? (
          // 矢量 Lab 模块
          <GenerativeVectorLab />
        ) : activeModule === 'neongeo' ? (
          // NeonGeo Logo 模块
          <NeonGeoLogo />
        ) : activeModule === 'parametric' ? (
          // 参数化 Logo 模块
          <ParametricLogo />
        ) : activeModule === 'geogen' ? (
          // GeoGen Studio 模块
          <GeoGenStudio />
        ) : activeModule === 'spiral' ? (
          // 几何螺旋图标生成模块
          <GeometricSpiralGenerator />
        ) : activeModule === 'gravity' ? (
          // Gravity Poster 模块
          <GravityPosterGenerator />
        ) : activeModule === 'orbit' ? (
          // Gravity & Orbit 3D 模块
          <GravityOrbitVisualizer />
        ) : activeModule === 'gravity-layout' ? (
          // Gravity Poster Layout 模块
          <GravityPosterLayout />
        ) : activeModule === 'gravity-tunnel' ? (
          // Gravity Tunnel UI 模块
          <GravityTunnelUI />
        ) : activeModule === 'avatar' ? (
          // Avatar 预览模块
          <SocialLensPreviewer />
        ) : activeModule === 'stroke' ? (
          // 3D 笔触工坊模块
          <StrokeLab />
        ) : activeModule === 'tube' ? (
          // 渐变管状笔触模块
          <GradientTubeStroke />
        ) : null}
      </div>
    </div>
  );
}

export default App;
