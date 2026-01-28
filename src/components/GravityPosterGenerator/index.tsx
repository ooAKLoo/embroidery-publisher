import React, { useEffect, useState } from 'react';
import { Scene } from './components/Scene';
import { Controls } from './components/Controls';
import { DEFAULT_PRESETS, PLACEHOLDER_CENTER, PLACEHOLDER_AROUND } from './constants';
import { ImageNode } from './types';

export default function GravityPosterGenerator() {
    // State
    const [centerImage, setCenterImage] = useState<string>(PLACEHOLDER_CENTER);
    const [aroundImages, setAroundImages] = useState<ImageNode[]>(PLACEHOLDER_AROUND);
    const [activePresetId, setActivePresetId] = useState<string>(DEFAULT_PRESETS[0].id);
    const [cardCount, setCardCount] = useState<number>(30);
    const [seed, setSeed] = useState<number>(1);
    const [backgroundColor, setBackgroundColor] = useState<string>('#050505');
    const [blurStrength, setBlurStrength] = useState<number>(DEFAULT_PRESETS[0].post.bokehScale);
    const [centerOutlineColor, setCenterOutlineColor] = useState<string>('#ffffff');
    const [centerOutlineWidth, setCenterOutlineWidth] = useState<number>(0.06);
    const [centerOutlineOpacity, setCenterOutlineOpacity] = useState<number>(0.25);
    const [centerShadowOpacity, setCenterShadowOpacity] = useState<number>(0.35);
    const [centerShadowOffset, setCenterShadowOffset] = useState<number>(0.08);

    // Derived state
    const activePreset = DEFAULT_PRESETS.find(p => p.id === activePresetId) || DEFAULT_PRESETS[0];

    useEffect(() => {
        setBlurStrength(activePreset.post.bokehScale);
    }, [activePresetId, activePreset.post.bokehScale]);

    // Handlers
    const handleCenterUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        setCenterImage(url);
    };

    const handleAroundUpload = (files: FileList) => {
        const newImages: ImageNode[] = Array.from(files).map((file, i) => ({
            id: `user-${Date.now()}-${i}`,
            url: URL.createObjectURL(file),
        }));
        // Replace current placeholders with user images
        // If it was already user images, maybe append? For now, replace to keep it clean.
        setAroundImages(newImages);
        // Auto adjust count if low
        if (newImages.length > 0 && newImages.length < cardCount) {
            setCardCount(newImages.length);
        }
    };

    const handleDownload = () => {
        // Basic screenshot logic for WebGL
        // In a production app, we might resize the renderer to 4k, render once, then save.
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `poster-${activePresetId}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0); // High quality
            link.click();
        }
    };

    return (
        <div
            className="w-full h-full relative rounded-2xl overflow-hidden"
            style={{
                backgroundColor,
                margin: 0,
                padding: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* 3D Scene Container */}
            <div className="absolute inset-0 z-0">
                <Scene
                    centerImage={centerImage}
                    aroundImages={aroundImages}
                    preset={activePreset}
                    count={cardCount}
                    seed={seed}
                    backgroundColor={backgroundColor}
                    blurStrength={blurStrength}
                    centerOutlineColor={centerOutlineColor}
                    centerOutlineWidth={centerOutlineWidth}
                    centerOutlineOpacity={centerOutlineOpacity}
                    centerShadowOpacity={centerShadowOpacity}
                    centerShadowOffset={centerShadowOffset}
                />
            </div>

            {/* UI Overlay */}
            <Controls
                presets={DEFAULT_PRESETS}
                activePresetId={activePresetId}
                onSelectPreset={setActivePresetId}
                cardCount={cardCount}
                onCountChange={setCardCount}
                onCenterUpload={handleCenterUpload}
                onAroundUpload={handleAroundUpload}
                onDownload={handleDownload}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={setBackgroundColor}
                blurStrength={blurStrength}
                onBlurStrengthChange={setBlurStrength}
                centerOutlineColor={centerOutlineColor}
                onCenterOutlineColorChange={setCenterOutlineColor}
                centerOutlineWidth={centerOutlineWidth}
                onCenterOutlineWidthChange={setCenterOutlineWidth}
                centerOutlineOpacity={centerOutlineOpacity}
                onCenterOutlineOpacityChange={setCenterOutlineOpacity}
                centerShadowOpacity={centerShadowOpacity}
                onCenterShadowOpacityChange={setCenterShadowOpacity}
                centerShadowOffset={centerShadowOffset}
                onCenterShadowOffsetChange={setCenterShadowOffset}
            />

            {/* Info / Title Overlay (Top Left) */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <h2 className="text-white font-mono text-xs mb-1 opacity-60">PREVIEW MODE</h2>
                    <div className="text-white text-sm font-semibold">
                        {activePreset.name}
                    </div>
                    <div className="text-white/50 text-xs">
                        {cardCount} items • Seed {seed}
                    </div>
                </div>
            </div>

            {/* Helper for Seed */}
            <div className="absolute bottom-6 left-6 z-10">
                <button
                    onClick={() => setSeed(s => s + 1)}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur px-4 py-2 rounded-full text-xs font-mono border border-white/10 transition-colors"
                >
                    Randomize Layout (Seed: {seed})
                </button>
            </div>

        </div>
    );
};
