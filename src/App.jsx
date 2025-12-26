import { useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import MediaUploader from './components/MediaUploader';
import ContentEditor from './components/ContentEditor';
import PlatformPreview from './components/PlatformPreview';
import ActionBar from './components/ActionBar';
import { useAIAdapter } from './hooks/useAIAdapter';

function App() {
  // 核心状态
  const [images, setImages] = useState([]);
  const [masterText, setMasterText] = useState('');
  // 平台特定文案（可独立编辑）
  const [platformTexts, setPlatformTexts] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    pinterest: ''
  });

  // 平台标签
  const [platformTags, setPlatformTags] = useState({
    instagram: '#SuEmbroidery #SilkArt #Handmade #ChineseArt #LuxuryArt',
    facebook: '#SuEmbroidery #ChineseArt #Handmade',
    twitter: '#SuEmbroidery #Art',
    pinterest: 'Su Embroidery, Silk Art, Chinese Handmade, Wall Art'
  });

  // 账号连接状态（默认全部连接）
  const [connectedAccounts] = useState({
    instagram: true,
    facebook: true,
    twitter: true,
    pinterest: true
  });

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

  // 账号配置（统一头像和名称）
  const [accountProfile, setAccountProfile] = useState({
    displayName: 'Your Brand',
    username: 'yourbrand',
    avatar: null
  });

  const [activePlatform, setActivePlatform] = useState('instagram');

  const { isAdapting, adaptContent } = useAIAdapter();

  // AI一键润色
  const handleAIAdapt = useCallback(async () => {
    if (!masterText.trim()) return;

    const result = await adaptContent(masterText);
    if (result) {
      setPlatformTexts(result.texts);
      setPlatformTags(result.tags);
    }
  }, [masterText, adaptContent]);

  // 更新单个平台文案
  const updatePlatformText = useCallback((platform, text) => {
    setPlatformTexts(prev => ({
      ...prev,
      [platform]: text
    }));
  }, []);

  // 更新单个平台标签
  const updatePlatformTags = useCallback((platform, tags) => {
    setPlatformTags(prev => ({
      ...prev,
      [platform]: tags
    }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* 顶部状态栏 */}
      <Header
        accountProfile={accountProfile}
        setAccountProfile={setAccountProfile}
      />

      {/* 主内容区域 - 主从模式 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧编辑区 - 50% */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col overflow-hidden p-6 gap-6">
          {/* 媒体上传 - 固定高度，内部滚动 */}
          <div className="flex-1 min-h-0">
            <MediaUploader
              images={images}
              setImages={setImages}
              settings={settings}
              setSettings={setSettings}
            />
          </div>

          {/* 核心文案 - 固定在底部 */}
          <div className="flex-shrink-0">
            <ContentEditor
              masterText={masterText}
              setMasterText={setMasterText}
              onAIAdapt={handleAIAdapt}
              isAdapting={isAdapting}
            />
          </div>
        </div>

        {/* 右侧预览区 - 50% */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-slate-100">
          <PlatformPreview
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            images={images}
            platformTexts={platformTexts}
            platformTags={platformTags}
            updatePlatformText={updatePlatformText}
            updatePlatformTags={updatePlatformTags}
            accountProfile={accountProfile}
          />
        </div>
      </div>

      {/* 底部操作栏 */}
      <ActionBar
        connectedAccounts={connectedAccounts}
        hasContent={images.length > 0 || masterText.trim()}
      />
    </div>
  );
}

export default App;
