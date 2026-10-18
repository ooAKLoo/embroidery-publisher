import React, { useEffect, useState } from 'react';
import { LogoParams } from '../types';
import { LogoRenderer } from './LogoRenderer';

interface SeriesGridProps {
    baseParams: LogoParams;
    onSelect: (p: LogoParams) => void;
    bgColor?: string;
}

export const SeriesGrid = ({ baseParams, onSelect, bgColor = '#0b1120' }: SeriesGridProps) => {
    const [variations, setVariations] = useState<LogoParams[]>([]);

    useEffect(() => {
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-1">
            {variations.map((p, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(p)}
                    className="aspect-square bg-white rounded-lg hover:ring-2 hover:ring-neutral-800 hover:ring-offset-1 transition-all flex items-center justify-center relative group overflow-hidden"
                >
                    <div className="absolute top-1.5 left-1.5 text-[8px] text-neutral-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {i + 1}
                    </div>
                    <LogoRenderer params={p} size={80} backgroundColor={bgColor} />
                </button>
            ))}
        </div>
    );
};
