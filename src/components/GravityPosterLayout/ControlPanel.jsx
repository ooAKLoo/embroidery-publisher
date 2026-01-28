import { Settings, Image as ImageIcon, Layers, Upload, Box } from 'lucide-react';

export default function ControlPanel({
  config,
  setConfig,
  onCenterUpload,
  onSurroundUpload,
  surroundCount
}) {
  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-xl z-50 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Box className="w-6 h-6 text-indigo-600" />
          Gravity Layout
        </h1>
        <p className="text-xs text-gray-500 mt-1">Generate 3D poster visuals</p>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Layout Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['orbit', 'vortex'].map((style) => (
              <button
                key={style}
                onClick={() => handleChange('layoutStyle', style)}
                className={`px-3 py-2 text-xs font-medium rounded-md capitalize transition-colors ${
                  config.layoutStyle === style
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Images
          </label>

          <div className="space-y-2">
            <label className="block text-xs text-gray-500 uppercase tracking-wider">Center Hero</label>
            <label className="flex items-center justify-center w-full h-12 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-500 focus:outline-none">
              <span className="flex items-center space-x-2 text-gray-600">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-medium">Upload Hero</span>
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={onCenterUpload} />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-gray-500 uppercase tracking-wider">
              Surrounding ({surroundCount})
            </label>
            <label className="flex items-center justify-center w-full h-12 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-500 focus:outline-none">
              <span className="flex items-center space-x-2 text-gray-600">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-medium">Add Floating Images</span>
              </span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={onSurroundUpload} />
            </label>
            <p className="text-[10px] text-gray-400">Select multiple files to populate the cloud.</p>
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Properties
          </label>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Density</span>
              <span>{config.itemCount} items</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={config.itemCount}
              onChange={(e) => handleChange('itemCount', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Spread</span>
              <span>{config.spreadRadius}px</span>
            </div>
            <input
              type="range"
              min="300"
              max="1500"
              step="50"
              value={config.spreadRadius}
              onChange={(e) => handleChange('spreadRadius', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>3D Depth</span>
              <span>{config.depthIntensity}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={config.depthIntensity}
              onChange={(e) => handleChange('depthIntensity', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Blur (Depth of Field)</span>
              <span>{config.blurStrength}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={config.blurStrength}
              onChange={(e) => handleChange('blurStrength', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Hero Scale</span>
              <span>{config.centerScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={config.centerScale}
              onChange={(e) => handleChange('centerScale', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Hero Frame
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Border Width</span>
                <span>{config.heroBorderWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={config.heroBorderWidth}
                onChange={(e) => handleChange('heroBorderWidth', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Border Opacity</span>
                <span>{config.heroBorderOpacity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.heroBorderOpacity}
                onChange={(e) => handleChange('heroBorderOpacity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Border Color</span>
              <input
                type="color"
                value={config.heroBorderColor}
                onChange={(e) => handleChange('heroBorderColor', e.target.value)}
                className="h-6 w-10 rounded border border-gray-200"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Drop Distance</span>
                <span>{config.heroDropDistance}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={config.heroDropDistance}
                onChange={(e) => handleChange('heroDropDistance', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Drop Strength</span>
                <span>{config.heroDropStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={config.heroDropStrength}
                onChange={(e) => handleChange('heroDropStrength', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Inner Strength</span>
                <span>{config.heroInnerStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.02"
                value={config.heroInnerStrength}
                onChange={(e) => handleChange('heroInnerStrength', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={config.showGuides}
                onChange={(e) => handleChange('showGuides', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Show Gravity Lines</span>
          </label>
        </div>
      </div>
    </div>
  );
}
