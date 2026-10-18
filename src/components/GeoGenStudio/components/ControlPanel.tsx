import React from 'react';
import { LogoParams, Preset } from '../types';
import { Shuffle, Download, RotateCw, Layers, Palette } from 'lucide-react';
import { PRESETS } from '../utils/presets';
import { LogoRenderer } from './LogoRenderer';

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
        <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-[13px] font-medium text-neutral-700">GeoGen Studio</h2>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Generative Geometric Design</p>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onRandomize}
                        className="p-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-500 hover:text-neutral-700 transition-colors"
                        title="Remix"
                    >
                        <Shuffle size={14} />
                    </button>
                    <button
                        onClick={onExport}
                        className="p-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-500 hover:text-neutral-700 transition-colors"
                        title="Download SVG"
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">

                {/* Presets */}
                <section>
                    <h3 className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                        Presets
                    </h3>
                    <div className="grid grid-cols-5 gap-1.5">
                        {Object.entries(PRESETS).map(([name, p]) => (
                            <button
                                key={name}
                                onClick={() => applyPreset(p)}
                                className="aspect-square rounded-lg bg-white hover:bg-neutral-50 transition-all overflow-hidden"
                                title={name}
                            >
                                <LogoRenderer params={p} size={60} backgroundColor="#0b1120" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* Structure */}
                <section className="bg-white rounded-xl p-3">
                    <h3 className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <RotateCw size={11} /> Structure
                    </h3>
                    <div className="space-y-3">
                        <ControlRow label="Count" value={params.count} min={1} max={24} step={1} onChange={(v) => handleChange('count', v)} />
                        <ControlRow label="Global Rotation" value={params.rotationOffset} min={0} max={360} onChange={(v) => handleChange('rotationOffset', v)} />
                    </div>
                </section>

                {/* Atoms */}
                <section className="bg-white rounded-xl p-3">
                    <h3 className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Layers size={11} /> Atoms
                    </h3>
                    <div className="space-y-3">
                        <ControlRow label="Radius" value={params.innerRadius} min={0} max={100} onChange={(v) => handleChange('innerRadius', v)} />
                        <ControlRow label="Length" value={params.length} min={10} max={150} onChange={(v) => handleChange('length', v)} />
                        <ControlRow label="Spread" value={params.spread} min={1} max={360} onChange={(v) => handleChange('spread', v)} />
                        <ControlRow label="Atomic Rotation" value={params.atomicRotation} min={-180} max={180} onChange={(v) => handleChange('atomicRotation', v)} />
                        <ControlRow label="Curvature" value={params.cornerRadius} min={0} max={1} step={0.01} onChange={(v) => handleChange('cornerRadius', v)} />
                    </div>
                </section>

                {/* Style */}
                <section className="bg-white rounded-xl p-3">
                    <h3 className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Palette size={11} /> Style
                    </h3>
                    <div className="space-y-3">
                        <ControlRow label="Hue" value={params.hue} min={0} max={360} gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" onChange={(v) => handleChange('hue', v)} />
                        <ControlRow label="Saturation" value={params.saturation} min={0} max={100} onChange={(v) => handleChange('saturation', v)} />
                        <ControlRow label="Lightness" value={params.lightness} min={0} max={100} onChange={(v) => handleChange('lightness', v)} />
                        <ControlRow label="Opacity" value={params.opacity} min={0.1} max={1} step={0.1} onChange={(v) => handleChange('opacity', v)} />

                        <div className="flex gap-1.5">
                            <button
                                onClick={() => handleChange('fill', !params.fill)}
                                className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                                    params.fill
                                        ? 'bg-neutral-800 text-white'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                }`}
                            >
                                Fill
                            </button>
                            <button
                                onClick={() => handleChange('stroke', !params.stroke)}
                                className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                                    params.stroke
                                        ? 'bg-neutral-800 text-white'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                }`}
                            >
                                Stroke
                            </button>
                        </div>

                        {params.stroke && (
                            <ControlRow label="Stroke Width" value={params.strokeWidth} min={0.5} max={10} step={0.5} onChange={(v) => handleChange('strokeWidth', v)} />
                        )}

                        <div>
                            <label className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide block mb-1">Blend Mode</label>
                            <select
                                className="w-full bg-neutral-50 rounded-lg p-2 text-[10px] text-neutral-700 focus:outline-none"
                                value={params.blendMode}
                                onChange={(e) => handleChange('blendMode', e.target.value)}
                            >
                                <option value="normal">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Depth */}
                <section className="bg-white rounded-xl p-3">
                    <h3 className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Layers size={11} /> Depth
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <ToggleRow label="Auto Depth Color" value={params.autoDepthColor} onChange={(v) => handleChange('autoDepthColor', v)} />
                            <ToggleRow label="Drop Shadow" value={params.shadowEnabled} onChange={(v) => handleChange('shadowEnabled', v)} />
                            <div className={params.shadowEnabled ? "space-y-2" : "space-y-2 opacity-40"}>
                                <ColorRow label="Color" value={params.shadowColor} disabled={!params.shadowEnabled || params.autoDepthColor} onChange={(v) => handleChange('shadowColor', v)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="X" value={params.shadowX} min={-30} max={30} onChange={(v) => handleChange('shadowX', v)} disabled={!params.shadowEnabled} />
                                    <ControlRow label="Y" value={params.shadowY} min={-30} max={30} onChange={(v) => handleChange('shadowY', v)} disabled={!params.shadowEnabled} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="Blur" value={params.shadowBlur} min={0} max={40} onChange={(v) => handleChange('shadowBlur', v)} disabled={!params.shadowEnabled} />
                                    <ControlRow label="Opacity" value={params.shadowOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('shadowOpacity', v)} disabled={!params.shadowEnabled} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-neutral-100" />

                        <div className="space-y-2">
                            <ToggleRow label="Inner Shadow" value={params.innerShadowEnabled} onChange={(v) => handleChange('innerShadowEnabled', v)} />
                            <div className={params.innerShadowEnabled ? "space-y-2" : "space-y-2 opacity-40"}>
                                <ColorRow label="Color" value={params.innerShadowColor} disabled={!params.innerShadowEnabled || params.autoDepthColor} onChange={(v) => handleChange('innerShadowColor', v)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="X" value={params.innerShadowX} min={-30} max={30} onChange={(v) => handleChange('innerShadowX', v)} disabled={!params.innerShadowEnabled} />
                                    <ControlRow label="Y" value={params.innerShadowY} min={-30} max={30} onChange={(v) => handleChange('innerShadowY', v)} disabled={!params.innerShadowEnabled} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="Blur" value={params.innerShadowBlur} min={0} max={40} onChange={(v) => handleChange('innerShadowBlur', v)} disabled={!params.innerShadowEnabled} />
                                    <ControlRow label="Opacity" value={params.innerShadowOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('innerShadowOpacity', v)} disabled={!params.innerShadowEnabled} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-neutral-100" />

                        <div className="space-y-2">
                            <ToggleRow label="Double Stroke" value={params.doubleStrokeEnabled} onChange={(v) => handleChange('doubleStrokeEnabled', v)} />
                            <div className={params.doubleStrokeEnabled ? "space-y-2" : "space-y-2 opacity-40"}>
                                <ColorRow label="Outer Color" value={params.doubleStrokeColor} disabled={!params.doubleStrokeEnabled || params.autoDepthColor} onChange={(v) => handleChange('doubleStrokeColor', v)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="Width" value={params.doubleStrokeWidth} min={0} max={12} step={0.5} onChange={(v) => handleChange('doubleStrokeWidth', v)} disabled={!params.doubleStrokeEnabled} />
                                    <ControlRow label="Opacity" value={params.doubleStrokeOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('doubleStrokeOpacity', v)} disabled={!params.doubleStrokeEnabled} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-neutral-100" />

                        <div className="space-y-2">
                            <ToggleRow label="Extrude" value={params.extrudeEnabled} onChange={(v) => handleChange('extrudeEnabled', v)} />
                            <div className={params.extrudeEnabled ? "space-y-2" : "space-y-2 opacity-40"}>
                                <ColorRow label="Side Color" value={params.extrudeColor} disabled={!params.extrudeEnabled || params.autoDepthColor} onChange={(v) => handleChange('extrudeColor', v)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="Depth" value={params.extrudeDepth} min={1} max={24} step={1} onChange={(v) => handleChange('extrudeDepth', v)} disabled={!params.extrudeEnabled} />
                                    <ControlRow label="Opacity" value={params.extrudeOpacity} min={0} max={1} step={0.01} onChange={(v) => handleChange('extrudeOpacity', v)} disabled={!params.extrudeEnabled} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlRow label="Offset X" value={params.extrudeOffsetX} min={-30} max={30} step={1} onChange={(v) => handleChange('extrudeOffsetX', v)} disabled={!params.extrudeEnabled} />
                                    <ControlRow label="Offset Y" value={params.extrudeOffsetY} min={-30} max={30} step={1} onChange={(v) => handleChange('extrudeOffsetY', v)} disabled={!params.extrudeEnabled} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-6" />
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
    <div>
        <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
            <span className="text-[9px] font-semibold text-neutral-700 tabular-nums">{Math.round(value * 100) / 100}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
            style={gradient ? { background: gradient } : {}}
        />
    </div>
);

const ToggleRow: React.FC<{
    label: string;
    value: boolean;
    onChange: (val: boolean) => void;
}> = ({ label, value, onChange }) => (
    <label className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
        <button
            onClick={() => onChange(!value)}
            className={`w-8 h-4 rounded-full relative transition-colors ${
                value ? 'bg-neutral-800' : 'bg-neutral-300'
            }`}
        >
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${value ? 'translate-x-4' : ''}`} />
        </button>
    </label>
);

const ColorRow: React.FC<{
    label: string;
    value: string;
    disabled?: boolean;
    onChange: (val: string) => void;
}> = ({ label, value, disabled = false, onChange }) => (
    <div className="flex items-center gap-2">
        <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide min-w-[48px]">{label}</span>
        <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent h-5 w-full cursor-pointer disabled:opacity-40 rounded"
        />
    </div>
);
