import React, { useState, useRef, useCallback } from 'react';
import { LogoParams } from './types';
import { DEFAULT_PARAMS } from './utils/presets';
import { ControlPanel } from './components/ControlPanel';
import { LogoRenderer } from './components/LogoRenderer';
import { SeriesGrid } from './components/SeriesGrid';
import { PreviewToolbar } from '../../shared/icon-export';

export default function GeoGenStudio() {
    const [params, setParams] = useState<LogoParams>(DEFAULT_PARAMS);
    const [bgColor, setBgColor] = useState('#0b1120');
    const [iconScale, setIconScale] = useState(0.7);
    const [borderRadius, setBorderRadius] = useState(0.22);
    const svgRef = useRef<HTMLDivElement>(null);

    const handleRandomize = () => {
        setParams({
            count: Math.floor(Math.random() * 10) + 3,
            rotationOffset: Math.random() * 360,
            innerRadius: Math.random() * 60,
            length: 40 + Math.random() * 80,
            spread: 20 + Math.random() * 100,
            cornerRadius: Math.random() > 0.5 ? 1 : Math.random(),
            atomicRotation: (Math.random() * 90) - 45,
            hue: Math.floor(Math.random() * 360),
            saturation: 60 + Math.random() * 40,
            lightness: 40 + Math.random() * 30,
            opacity: 0.6 + Math.random() * 0.4,
            blendMode: Math.random() > 0.7 ? 'multiply' : 'normal',
            fill: Math.random() > 0.2,
            stroke: Math.random() > 0.8,
            strokeWidth: 2,
            shadowEnabled: DEFAULT_PARAMS.shadowEnabled,
            shadowX: DEFAULT_PARAMS.shadowX,
            shadowY: DEFAULT_PARAMS.shadowY,
            shadowBlur: DEFAULT_PARAMS.shadowBlur,
            shadowOpacity: DEFAULT_PARAMS.shadowOpacity,
            shadowColor: DEFAULT_PARAMS.shadowColor,
            innerShadowEnabled: DEFAULT_PARAMS.innerShadowEnabled,
            innerShadowX: DEFAULT_PARAMS.innerShadowX,
            innerShadowY: DEFAULT_PARAMS.innerShadowY,
            innerShadowBlur: DEFAULT_PARAMS.innerShadowBlur,
            innerShadowOpacity: DEFAULT_PARAMS.innerShadowOpacity,
            innerShadowColor: DEFAULT_PARAMS.innerShadowColor,
            doubleStrokeEnabled: DEFAULT_PARAMS.doubleStrokeEnabled,
            doubleStrokeWidth: DEFAULT_PARAMS.doubleStrokeWidth,
            doubleStrokeOpacity: DEFAULT_PARAMS.doubleStrokeOpacity,
            doubleStrokeColor: DEFAULT_PARAMS.doubleStrokeColor,
            extrudeEnabled: DEFAULT_PARAMS.extrudeEnabled,
            extrudeDepth: DEFAULT_PARAMS.extrudeDepth,
            extrudeOffsetX: DEFAULT_PARAMS.extrudeOffsetX,
            extrudeOffsetY: DEFAULT_PARAMS.extrudeOffsetY,
            extrudeOpacity: DEFAULT_PARAMS.extrudeOpacity,
            extrudeFade: DEFAULT_PARAMS.extrudeFade,
            extrudeColor: DEFAULT_PARAMS.extrudeColor,
            autoDepthColor: DEFAULT_PARAMS.autoDepthColor,
        });
    };

    const handleExport = () => {
        if (!svgRef.current) return;
        const svgElement = svgRef.current.querySelector('svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "geogen-logo.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const readmeMeta = {
        generator: 'GeoGenStudio',
        config: params,
        export: { bgColor, iconScale, borderRadius },
    };

    return (
        <div className="h-full w-full bg-white rounded-2xl overflow-hidden flex relative">
            <aside className="w-80 flex-shrink-0 bg-neutral-100 rounded-2xl">
                <ControlPanel
                    params={params}
                    setParams={setParams}
                    onRandomize={handleRandomize}
                    onExport={handleExport}
                />
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />

                    <div ref={svgRef} className="relative z-10 w-full h-full flex items-center justify-center">
                        <LogoRenderer
                            params={params}
                            size={400}
                            backgroundColor={bgColor}
                            className="w-full h-full max-w-[500px] max-h-[500px]"
                        />
                    </div>
                </div>

                <div className="flex-shrink-0 bg-neutral-100 p-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide">Series Generation</span>
                        <span className="text-[9px] text-neutral-400">Sampling Variations</span>
                    </div>
                    <SeriesGrid baseParams={params} onSelect={setParams} bgColor={bgColor} />
                </div>

                <div className="flex-shrink-0 bg-white px-6 py-4">
                    <PreviewToolbar
                        svgRef={svgRef}
                        logoName="geogen-studio"
                        bgColor={bgColor}
                        setBgColor={setBgColor}
                        iconScale={iconScale}
                        setIconScale={setIconScale}
                        borderRadius={borderRadius}
                        setBorderRadius={setBorderRadius}
                        readmeMeta={readmeMeta}
                    />
                </div>
            </main>
        </div>
    );
}
