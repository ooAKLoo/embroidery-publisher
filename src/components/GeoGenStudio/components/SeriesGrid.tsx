import React, { useEffect, useState } from 'react';
import { LogoParams } from '../types';
import { LogoRenderer } from './LogoRenderer';

interface SeriesGridProps {
    baseParams: LogoParams;
    onSelect: (p: LogoParams) => void;
}

export const SeriesGrid = ({ baseParams, onSelect }: SeriesGridProps) => {
    const [variations, setVariations] = useState<LogoParams[]>([]);

    // The "Sampling Strategy" logic
    useEffect(() => {
        // We generate variations by perturbing specific layers while keeping others constant.
        // This simulates the "Cohesive Series" concept.

        const vars: LogoParams[] = [];

        // Variation 1: Structure Change (Count)
        vars.push({ ...baseParams, count: Math.max(3, (baseParams.count + 2) % 12) });

        // Variation 2: Negative Space Change (Radius)
        vars.push({ ...baseParams, innerRadius: Math.max(0, baseParams.innerRadius + (baseParams.innerRadius < 20 ? 30 : -20)) });

        // Variation 3: Atomic Shape Change (Spread)
        vars.push({ ...baseParams, spread: baseParams.spread > 180 ? 45 : baseParams.spread * 1.5 });

        // Variation 4: Style Change (Invert Stroke/Fill)
        vars.push({ ...baseParams, fill: !baseParams.fill, stroke: !baseParams.stroke || !baseParams.fill });

        // Variation 5: Atomic Rotation (Spin the atoms)
        vars.push({ ...baseParams, atomicRotation: baseParams.atomicRotation + 45 });

        // Variation 6: Mutation (Slight random jitter to all)
        vars.push({
            ...baseParams,
            length: baseParams.length * 0.9,
            count: Math.max(3, baseParams.count - 1),
            hue: (baseParams.hue + 180) % 360
        });

        setVariations(vars);
    }, [baseParams]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
            {variations.map((p, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(p)}
                    className="aspect-square bg-slate-800 rounded-lg border border-slate-700 hover:border-indigo-500 transition-all flex items-center justify-center relative group overflow-hidden"
                >
                    <div className="absolute top-2 left-2 text-[10px] text-slate-500 uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        Var {i + 1}
                    </div>
                    <LogoRenderer params={p} size={80} backgroundColor="#1e293b" />
                </button>
            ))}
        </div>
    );
};
