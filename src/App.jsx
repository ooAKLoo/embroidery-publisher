import { useState, useCallback } from 'react';
import './App.css';
import AccountCard from './components/AccountCard';
import MediaUploader from './components/MediaUploader';
import ContentEditor from './components/ContentEditor';
import PlatformPreview from './components/PlatformPreview';
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

  // 统一的品牌 Prompt
  const [brandPrompt, setBrandPrompt] = useState(DEFAULT_BRAND_PROMPT);

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

  return (
    <div className="h-screen flex flex-col bg-[#F8F8F8]">
      <div className="flex-1 flex overflow-hidden gap-3 p-4">
        {/* 左侧编辑区 */}
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
              brandPrompt={brandPrompt}
              setBrandPrompt={setBrandPrompt}
            />
          </div>
        </div>

        {/* 右侧预览区 */}
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
    </div>
  );
}

export default App;
