import React from 'react';
import { LogoParams, Preset } from '../types';
import { RotateCw, Grid, Layers, Palette, RefreshCcw, Download } from 'lucide-react';
import { PRESETS } from '../utils/presets';

interface ControlPanelProps {
    params: LogoParams;
    setParams: React.Dispatch<React.SetStateAction<LogoParams>>;
    onRandomize: () => void;
    onExport: () => void;
}

export const ControlPanel = ({ params, setParams, onRandomize, onExport }: ControlPanelProps) => {

    const handleChange = (key: keyof LogoParams, value: any) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const applyPreset = (preset: LogoParams) => {
        setParams(preset);
    };

    return (
        <div className="w-full h-full bg-slate-900 text-slate-200 flex flex-col overflow-y-auto border-r border-slate-800 custom-scrollbar">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    GeoGen Studio
                </h1>
                <p className="text-xs text-slate-500 mt-1">Generative Geometric Design</p>
            </div>

            <div className="p-6 space-y-8">

                {/* Presets */}
                <section>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <Grid size={14} /> Presets
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(PRESETS).map(([name, p]) => (
                            <button
                                key={name}
                                onClick={() => applyPreset(p)}
                                className="px-2 py-2 text-xs rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-blue-500/50"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Structure Layer */}
                <section>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <RotateCw size={14} /> Structure
                    </h3>
                    <div className="space-y-4">
                        <ControlRow label="Count" value={params.count} min={1} max={24} step={1} onChange={(v) => handleChange('count', v)} />
                        <ControlRow label="Global Rotation" value={params.rotationOffset} min={0} max={360} onChange={(v) => handleChange('rotationOffset', v)} />
                    </div>
                </section>

                {/* Atomic Layer */}
                <section>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <Layers size={14} /> Atoms
                    </h3>
                    <div className="space-y-4">
                        <ControlRow label="Radius (Negative Space)" value={params.innerRadius} min={0} max={100} onChange={(v) => handleChange('innerRadius', v)} />
                        <ControlRow label="Length" value={params.length} min={10} max={150} onChange={(v) => handleChange('length', v)} />
                        <ControlRow label="Spread (Angle)" value={params.spread} min={1} max={360} onChange={(v) => handleChange('spread', v)} />
                        <ControlRow label="Atomic Rotation" value={params.atomicRotation} min={-180} max={180} onChange={(v) => handleChange('atomicRotation', v)} />
                        <ControlRow label="Curvature" value={params.cornerRadius} min={0} max={1} step={0.01} onChange={(v) => handleChange('cornerRadius', v)} />
                    </div>
                </section>

                {/* Styling Layer */}
                <section>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <Palette size={14} /> Style
                    </h3>
                    <div className="space-y-4">
                        <ControlRow label="Hue" value={params.hue} min={0} max={360} gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" onChange={(v) => handleChange('hue', v)} />
                        <ControlRow label="Saturation" value={params.saturation} min={0} max={100} onChange={(v) => handleChange('saturation', v)} />
                        <ControlRow label="Lightness" value={params.lightness} min={0} max={100} onChange={(v) => handleChange('lightness', v)} />
                        <ControlRow label="Opacity" value={params.opacity} min={0.1} max={1} step={0.1} onChange={(v) => handleChange('opacity', v)} />
                        <div className="flex gap-2 text-xs">
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded">
                                <input type="checkbox" checked={params.fill} onChange={(e) => handleChange('fill', e.target.checked)} />
                                Fill
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded">
                                <input type="checkbox" checked={params.stroke} onChange={(e) => handleChange('stroke', e.target.checked)} />
                                Stroke
                            </label>
                        </div>
                        {params.stroke && (
                            <ControlRow label="Stroke Width" value={params.strokeWidth} min={0.5} max={10} step={0.5} onChange={(v) => handleChange('strokeWidth', v)} />
                        )}

                        <div className="pt-2">
                            <label className="text-xs text-slate-400 block mb-1">Blend Mode</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs"
                                value={params.blendMode}
                                onChange={(e) => handleChange('blendMode', e.target.value)}
                            >
                                <option value="normal">Normal</option>
                                <option value="multiply">Multiply (Darken)</option>
                                <option value="screen">Screen (Lighten)</option>
                                <option value="overlay">Overlay</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="pt-4 flex gap-2">
                    <button
                        onClick={onRandomize}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition-all active:scale-95"
                    >
                        <RefreshCcw size={16} /> Remix
                    </button>
                    <button
                        onClick={onExport}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded bg-slate-700 hover:bg-slate-600 text-sm font-semibold transition-all active:scale-95"
                    >
                        <Download size={16} /> SVG
                    </button>
                </div>

                <div className="h-12"></div> {/* Spacer */}
            </div>
        </div>
    );
};

const ControlRow: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    gradient?: string;
    onChange: (val: number) => void;
}> = ({ label, value, min, max, step = 1, gradient, onChange }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between">
            <label className="text-xs text-slate-400 font-medium">{label}</label>
            <span className="text-xs text-slate-500 font-mono">{Math.round(value * 100) / 100}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={gradient ? { background: gradient } : {}}
        />
    </div>
);
