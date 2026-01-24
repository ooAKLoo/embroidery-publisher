import React, { useState, useRef } from 'react';
import { LogoParams } from './types';
import { DEFAULT_PARAMS } from './utils/presets';
import { ControlPanel } from './components/ControlPanel';
import { LogoRenderer } from './components/LogoRenderer';
import { SeriesGrid } from './components/SeriesGrid';

export default function GeoGenStudio() {
    const [params, setParams] = useState<LogoParams>(DEFAULT_PARAMS);
    const svgRef = useRef<HTMLDivElement>(null);

    const handleRandomize = () => {
        // "Safe" Randomization Strategy
        setParams({
            count: Math.floor(Math.random() * 10) + 3, // 3 to 12
            rotationOffset: Math.random() * 360,
            innerRadius: Math.random() * 60,
            length: 40 + Math.random() * 80,
            spread: 20 + Math.random() * 100,
            cornerRadius: Math.random() > 0.5 ? 1 : Math.random(), // Bias towards organic or sharp
            atomicRotation: (Math.random() * 90) - 45,
            hue: Math.floor(Math.random() * 360),
            saturation: 60 + Math.random() * 40,
            lightness: 40 + Math.random() * 30,
            opacity: 0.6 + Math.random() * 0.4,
            blendMode: Math.random() > 0.7 ? 'multiply' : 'normal',
            fill: Math.random() > 0.2,
            stroke: Math.random() > 0.8,
            strokeWidth: 2
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

    return (
        <div className="flex w-full h-full bg-slate-950 text-slate-200 font-sans overflow-hidden rounded-2xl">

            {/* Sidebar Controls */}
            <aside className="w-80 lg:w-96 flex-shrink-0 h-full z-20 shadow-xl border-r border-slate-800">
                <ControlPanel
                    params={params}
                    setParams={setParams}
                    onRandomize={handleRandomize}
                    onExport={handleExport}
                />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative">

                {/* Background Grid Pattern */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}>
                </div>

                {/* Canvas */}
                <div className="flex-1 flex items-center justify-center p-8 z-10 relative bg-gradient-to-br from-slate-900/50 to-slate-950/50">
                    <div
                        ref={svgRef}
                        className="relative drop-shadow-[0_0_50px_rgba(79,70,229,0.15)] transition-all duration-300"
                    >
                        <LogoRenderer params={params} size={400} className="w-full h-full max-w-[400px] max-h-[400px] md:max-w-[500px] md:max-h-[500px]" />
                    </div>
                </div>

                {/* Series Footer */}
                <div className="h-auto bg-slate-900 border-t border-slate-800 z-10 flex-shrink-0">
                    <div className="px-6 py-2 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Series Generation</span>
                        <span className="text-[10px] text-slate-600">Sampling Variations from Seed</span>
                    </div>
                    <SeriesGrid baseParams={params} onSelect={setParams} />
                </div>

            </main>
        </div>
    );
}
