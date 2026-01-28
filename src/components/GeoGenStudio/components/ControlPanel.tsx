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

                {/* Depth Layer */}
                <section>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <Layers size={14} /> Depth
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-3">
                            <ToggleRow label="Auto Depth Color" value={params.autoDepthColor} onChange={(v) => handleChange('autoDepthColor', v)} />
                            <ToggleRow label="Drop Shadow" value={params.shadowEnabled} onChange={(v) => handleChange('shadowEnabled', v)} />
                            <div className={params.shadowEnabled ? "space-y-3" : "space-y-3 opacity-50"}>
                                <ColorRow label="Color" value={params.shadowColor} disabled={!params.shadowEnabled || params.autoDepthColor} onChange={(v) => handleChange('shadowColor', v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Offset X" value={params.shadowX} min={-30} max={30} onChange={(v) => handleChange('shadowX', v)} disabled={!params.shadowEnabled} />
                                    <ControlRow label="Offset Y" value={params.shadowY} min={-30} max={30} onChange={(v) => handleChange('shadowY', v)} disabled={!params.shadowEnabled} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Blur" value={params.shadowBlur} min={0} max={40} onChange={(v) => handleChange('shadowBlur', v)} disabled={!params.shadowEnabled} />
                                    <ControlRow label="Opacity" value={params.shadowOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('shadowOpacity', v)} disabled={!params.shadowEnabled} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <ToggleRow label="Inner Shadow" value={params.innerShadowEnabled} onChange={(v) => handleChange('innerShadowEnabled', v)} />
                            <div className={params.innerShadowEnabled ? "space-y-3" : "space-y-3 opacity-50"}>
                                <ColorRow label="Color" value={params.innerShadowColor} disabled={!params.innerShadowEnabled || params.autoDepthColor} onChange={(v) => handleChange('innerShadowColor', v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Offset X" value={params.innerShadowX} min={-30} max={30} onChange={(v) => handleChange('innerShadowX', v)} disabled={!params.innerShadowEnabled} />
                                    <ControlRow label="Offset Y" value={params.innerShadowY} min={-30} max={30} onChange={(v) => handleChange('innerShadowY', v)} disabled={!params.innerShadowEnabled} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Blur" value={params.innerShadowBlur} min={0} max={40} onChange={(v) => handleChange('innerShadowBlur', v)} disabled={!params.innerShadowEnabled} />
                                    <ControlRow label="Opacity" value={params.innerShadowOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('innerShadowOpacity', v)} disabled={!params.innerShadowEnabled} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <ToggleRow label="Double Stroke" value={params.doubleStrokeEnabled} onChange={(v) => handleChange('doubleStrokeEnabled', v)} />
                            <div className={params.doubleStrokeEnabled ? "space-y-3" : "space-y-3 opacity-50"}>
                                <ColorRow label="Outer Color" value={params.doubleStrokeColor} disabled={!params.doubleStrokeEnabled || params.autoDepthColor} onChange={(v) => handleChange('doubleStrokeColor', v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Extra Width" value={params.doubleStrokeWidth} min={0} max={12} step={0.5} onChange={(v) => handleChange('doubleStrokeWidth', v)} disabled={!params.doubleStrokeEnabled} />
                                    <ControlRow label="Opacity" value={params.doubleStrokeOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('doubleStrokeOpacity', v)} disabled={!params.doubleStrokeEnabled} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <ToggleRow label="Extrude" value={params.extrudeEnabled} onChange={(v) => handleChange('extrudeEnabled', v)} />
                            <div className={params.extrudeEnabled ? "space-y-3" : "space-y-3 opacity-50"}>
                                <ColorRow label="Side Color" value={params.extrudeColor} disabled={!params.extrudeEnabled || params.autoDepthColor} onChange={(v) => handleChange('extrudeColor', v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Depth" value={params.extrudeDepth} min={1} max={24} step={1} onChange={(v) => handleChange('extrudeDepth', v)} disabled={!params.extrudeEnabled} />
                                    <ControlRow label="Opacity" value={params.extrudeOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('extrudeOpacity', v)} disabled={!params.extrudeEnabled} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ControlRow label="Offset X" value={params.extrudeOffsetX} min={-30} max={30} step={1} onChange={(v) => handleChange('extrudeOffsetX', v)} disabled={!params.extrudeEnabled} />
                                    <ControlRow label="Offset Y" value={params.extrudeOffsetY} min={-30} max={30} step={1} onChange={(v) => handleChange('extrudeOffsetY', v)} disabled={!params.extrudeEnabled} />
                                </div>
                            </div>
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
    disabled?: boolean;
    onChange: (val: number) => void;
}> = ({ label, value, min, max, step = 1, gradient, disabled = false, onChange }) => (
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
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
            style={gradient ? { background: gradient } : {}}
        />
    </div>
);

const ToggleRow: React.FC<{
    label: string;
    value: boolean;
    onChange: (val: boolean) => void;
}> = ({ label, value, onChange }) => (
    <label className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500"
        />
    </label>
);

const ColorRow: React.FC<{
    label: string;
    value: string;
    disabled?: boolean;
    onChange: (val: string) => void;
}> = ({ label, value, disabled = false, onChange }) => (
    <label className="flex items-center gap-2 text-xs text-slate-400">
        <span className="min-w-[60px]">{label}</span>
        <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent h-6 w-full cursor-pointer disabled:opacity-40"
        />
    </label>
);
