import { useState, useCallback } from 'react';
import './App.css';
import AccountCard from './components/AccountCard';
import MediaUploader from './components/MediaUploader';
import ContentEditor from './components/ContentEditor';
import PlatformPreview from './components/PlatformPreview';
import { useAIAdapter } from './hooks/useAIAdapter';
import { getDefaultSystemPrompts } from './config/platforms';

function App() {
  // 核心状态
  const [images, setImages] = useState([]);
  const [masterText, setMasterText] = useState('');
  // 平台特定文案（可独立编辑，标签直接写在文案里）
  const [platformTexts, setPlatformTexts] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    pinterest: '',
    tiktok: ''
  });

  // Pinterest 标题（仅 Pinterest 需要）
  const [pinterestTitle, setPinterestTitle] = useState('');

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

  // AI 系统提示词配置（分平台，从配置文件获取默认值）
  const [platformPrompts, setPlatformPrompts] = useState(getDefaultSystemPrompts);

  const { isAdapting, adaptContent } = useAIAdapter();

  // AI一键润色
  const handleAIAdapt = useCallback(async () => {
    if (!masterText.trim()) return;

    const result = await adaptContent(masterText, platformPrompts, pinterestTitle);
    if (result) {
      // 合并文案和标签到一个字段
      const mergedTexts = {};
      Object.keys(result.texts).forEach(platform => {
        const text = result.texts[platform] || '';
        const tags = result.tags[platform] || '';
        mergedTexts[platform] = tags ? `${text}\n\n${tags}` : text;
      });
      setPlatformTexts(mergedTexts);
      // 使用 AI 翻译后的 Pinterest 标题
      if (result.pinterestTitle) {
        setPinterestTitle(result.pinterestTitle);
      }
    }
  }, [masterText, adaptContent, platformPrompts, pinterestTitle]);

  return (
    <div className="h-screen flex flex-col bg-[#F8F8F8]">
      {/* 主内容区域 - 主从模式 */}
      <div className="flex-1 flex overflow-hidden gap-3 p-4">
        {/* 左侧编辑区 - 50% */}
        <div className="w-1/2 flex flex-col overflow-hidden gap-4">
          {/* 账号信息 - 顶部固定 */}
          <div className="flex-shrink-0">
            <AccountCard
              accountProfile={accountProfile}
              setAccountProfile={setAccountProfile}
            />
          </div>

          {/* 媒体上传 - 填充剩余空间，内部滚动 */}
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
              title={pinterestTitle}
              setTitle={setPinterestTitle}
              onAIAdapt={handleAIAdapt}
              isAdapting={isAdapting}
              prompts={platformPrompts}
              setPrompts={setPlatformPrompts}
            />
          </div>
        </div>

        {/* 右侧预览区 - 50% */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-white rounded-2xl h-full overflow-hidden">
            <PlatformPreview
              activePlatform={activePlatform}
              setActivePlatform={setActivePlatform}
              images={images}
              platformTexts={platformTexts}
              pinterestTitle={pinterestTitle}
              accountProfile={accountProfile}
              platformPrompts={platformPrompts}
              masterText={masterText}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
