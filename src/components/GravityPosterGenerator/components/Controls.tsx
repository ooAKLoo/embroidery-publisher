import React from 'react';
import { PosterPreset } from '../types';
import { DEFAULT_PRESETS } from '../constants';

interface ControlsProps {
    presets: PosterPreset[];
    activePresetId: string;
    onSelectPreset: (id: string) => void;

    cardCount: number;
    onCountChange: (n: number) => void;

    backgroundColor: string;
    onBackgroundColorChange: (color: string) => void;
    blurStrength: number;
    onBlurStrengthChange: (n: number) => void;

    centerOutlineColor: string;
    onCenterOutlineColorChange: (color: string) => void;
    centerOutlineWidth: number;
    onCenterOutlineWidthChange: (n: number) => void;
    centerOutlineOpacity: number;
    onCenterOutlineOpacityChange: (n: number) => void;
    centerShadowOpacity: number;
    onCenterShadowOpacityChange: (n: number) => void;
    centerShadowOffset: number;
    onCenterShadowOffsetChange: (n: number) => void;

    onCenterUpload: (file: File) => void;
    onAroundUpload: (files: FileList) => void;

    onDownload: () => void;
}

export const Controls = ({
    presets,
    activePresetId,
    onSelectPreset,
    cardCount,
    onCountChange,
    backgroundColor,
    onBackgroundColorChange,
    blurStrength,
    onBlurStrengthChange,
    centerOutlineColor,
    onCenterOutlineColorChange,
    centerOutlineWidth,
    onCenterOutlineWidthChange,
    centerOutlineOpacity,
    onCenterOutlineOpacityChange,
    centerShadowOpacity,
    onCenterShadowOpacityChange,
    centerShadowOffset,
    onCenterShadowOffsetChange,
    onCenterUpload,
    onAroundUpload,
    onDownload,
}: ControlsProps) => {
    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-md text-white border-l border-white/10 p-6 overflow-y-auto flex flex-col gap-8 z-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Gravity Poster
                </h1>
                <p className="text-xs text-gray-400 mt-1">3D Generative Layouts</p>
            </div>

            {/* Image Uploads */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Assets</h2>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">Center Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && onCenterUpload(e.target.files[0])}
                        className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-xs file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              cursor-pointer"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">Surrounding Images</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => e.target.files && onAroundUpload(e.target.files)}
                        className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-xs file:font-semibold
              file:bg-gray-700 file:text-white
              hover:file:bg-gray-600
              cursor-pointer"
                    />
                </div>
            </div>

            {/* Style Presets */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Style Preset</h2>
                <div className="grid grid-cols-1 gap-3">
                    {presets.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onSelectPreset(p.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${activePresetId === p.id
                                    ? 'bg-white/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                    : 'bg-transparent border-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="font-bold text-sm">{p.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{p.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Parameters */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Parameters</h2>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Background</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{backgroundColor.toUpperCase()}</span>
                            <input
                                type="color"
                                value={backgroundColor}
                                onChange={(e) => onBackgroundColorChange(e.target.value)}
                                className="h-7 w-10 rounded border border-white/10 bg-transparent cursor-pointer"
                                aria-label="Background color"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span>Center Outline</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{centerOutlineColor.toUpperCase()}</span>
                            <input
                                type="color"
                                value={centerOutlineColor}
                                onChange={(e) => onCenterOutlineColorChange(e.target.value)}
                                className="h-7 w-10 rounded border border-white/10 bg-transparent cursor-pointer"
                                aria-label="Center outline color"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Outline Width</span>
                            <span className="text-gray-400">{centerOutlineWidth.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="0.25"
                            step="0.01"
                            value={centerOutlineWidth}
                            onChange={(e) => onCenterOutlineWidthChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Outline Opacity</span>
                            <span className="text-gray-400">{centerOutlineOpacity.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={centerOutlineOpacity}
                            onChange={(e) => onCenterOutlineOpacityChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Density (Count)</span>
                        <span className="text-gray-400">{cardCount}</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        step="1"
                        value={cardCount}
                        onChange={(e) => onCountChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Blur (Bokeh)</span>
                        <span className="text-gray-400">{blurStrength.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={blurStrength}
                        onChange={(e) => onBlurStrengthChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>Center Shadow</span>
                        <span className="text-gray-400">{centerShadowOpacity.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={centerShadowOpacity}
                        onChange={(e) => onCenterShadowOpacityChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Offset</span>
                        <span>{centerShadowOffset.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="0.2"
                        step="0.01"
                        value={centerShadowOffset}
                        onChange={(e) => onCenterShadowOffsetChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 mt-auto">
                <button
                    onClick={onDownload}
                    className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export Poster
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                    Output will be captured at screen resolution.
                </p>
            </div>

        </div>
    );
};
