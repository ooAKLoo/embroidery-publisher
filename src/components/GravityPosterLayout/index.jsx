import { useMemo, useState } from 'react';
import ControlPanel from './ControlPanel';
import EditorCanvas from './EditorCanvas';
import { generateLayout } from './layoutGenerator';

export default function GravityPosterLayout() {
  const [config, setConfig] = useState({
    layoutStyle: 'orbit',
    itemCount: 16,
    spreadRadius: 800,
    depthIntensity: 600,
    blurStrength: 4,
    perspective: 1200,
    showGuides: true,
    centerScale: 1,
    itemScaleBase: 1,
    heroBorderWidth: 1,
    heroBorderOpacity: 0.75,
    heroBorderColor: '#e2e8f0',
    heroDropDistance: 26,
    heroDropStrength: 0.6,
    heroInnerStrength: 0.18
  });

  const [centerImage, setCenterImage] = useState(null);
  const [centerAspect, setCenterAspect] = useState(0.5);
  const [surroundImages, setSurroundImages] = useState([]);

  const items = useMemo(() => {
    return generateLayout(
      config.layoutStyle,
      config.itemCount,
      config.spreadRadius,
      config.depthIntensity,
      surroundImages
    );
  }, [
    config.layoutStyle,
    config.itemCount,
    config.spreadRadius,
    config.depthIntensity,
    surroundImages.length
  ]);

  const handleCenterUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const url = URL.createObjectURL(event.target.files[0]);
      setCenterImage(url);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setCenterAspect(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = url;
    }
  };

  const handleSurroundUpload = (event) => {
    if (event.target.files) {
      const newUrls = Array.from(event.target.files).map((file) => URL.createObjectURL(file));
      setSurroundImages((prev) => [...prev, ...newUrls]);
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden text-gray-900">
      <ControlPanel
        config={config}
        setConfig={setConfig}
        onCenterUpload={handleCenterUpload}
        onSurroundUpload={handleSurroundUpload}
        surroundCount={surroundImages.length}
      />

      <main className="flex-1 relative bg-gray-50 h-full">
        <EditorCanvas
          config={config}
          centerImage={centerImage}
          centerAspect={centerAspect}
          items={items}
        />

        <div className="absolute bottom-6 right-6 opacity-50 text-[10px] text-gray-400 pointer-events-none">
          Perspective: {config.perspective}px | Spread: {config.spreadRadius}px
        </div>
      </main>
    </div>
  );
}
