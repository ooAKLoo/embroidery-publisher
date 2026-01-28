import { GeneratedPosition, PosterPreset } from '../types';

export const generatePositions = (
    count: number,
    preset: PosterPreset,
    seed: number = 1
): GeneratedPosition[] => {
    const positions: GeneratedPosition[] = [];
    const { layout, card } = preset;

    // Simple seeded random function
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.3999 rad

    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;
        let rotX = 0, rotY = 0, rotZ = 0;
        let motion: GeneratedPosition['motion'];

        const t = i / Math.max(count - 1, 1); // Normalized 0 to 1

        if (preset.motionMode) {
            const theta = random() * Math.PI * 2;
            const phi = (random() - 0.5) * Math.PI;
            const radiusBase = 3 + random() * 4;
            const speed = 0.2 + random() * 0.5;
            const randomOffset = random() * 100;

            let targetRadius = radiusBase;
            let targetY = radiusBase * Math.sin(phi);
            if (preset.motionMode === 'absorb') {
                targetRadius = 1.5 + (randomOffset % 1) * 0.5;
                targetY = targetY * 0.2;
            } else if (preset.motionMode === 'orbit') {
            } else if (preset.motionMode === 'float') {
                targetRadius = radiusBase * 1.8;
            }

            const currentTheta = theta;
            const bobbing = Math.sin(randomOffset) * 0.2;

            x = targetRadius * Math.cos(currentTheta);
            z = targetRadius * Math.sin(currentTheta);
            y = targetY + bobbing;

            motion = { theta, phi, radiusBase, speed, randomOffset };
        } else if (layout.mode === 'vortex') {
            // Golden spiral distribution
            const theta = i * goldenAngle;
            // Radius grows with index, but kept within bounds
            const r = layout.radiusMin + (layout.radiusMax - layout.radiusMin) * Math.sqrt(t);

            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            // Z depth spirals away or towards
            z = (t - 0.5) * layout.zRange;

            // Add height variation
            y += (random() - 0.5) * layout.heightRange;

        } else if (layout.mode === 'halo') {
            // Concentric rings or just a spherical shell
            const r = layout.radiusMin + random() * (layout.radiusMax - layout.radiusMin);
            const theta = random() * Math.PI * 2;
            const phi = (random() - 0.5) * 0.5; // Flattened vertical angle

            x = r * Math.cos(theta);
            z = r * Math.sin(theta) + (random() - 0.5) * layout.zRange;
            y = r * Math.sin(phi) * layout.heightRange;

        } else if (layout.mode === 'scatter') {
            // Random cloud excluding center
            const r = layout.radiusMin + random() * (layout.radiusMax - layout.radiusMin);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);

            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta) * (layout.heightRange / 2);
            z = r * Math.cos(phi) * (layout.zRange / 2);
        }

        // Determine rotation
        if (preset.card.faceCenter) {
            // Look at center (0,0,0) logic handled in scene usually, 
            // but we can pre-calculate rotation for static optimization if needed.
            // Here we will let the Mesh logic handle LookAt or use Euler.
            // We'll leave rotation 0 here and use LookAt in the component.
        } else {
            rotX = (random() - 0.5) * 0.5;
            rotY = (random() - 0.5) * 0.5;
            rotZ = (random() - 0.5) * 0.5;
        }

        // Determine scale
        const baseScale = card.size;
        const variance = card.randomizeSize;
        const scale = baseScale * (1 - variance / 2 + random() * variance);

        positions.push({
            id: `pos-${i}`,
            position: [x, y, z],
            rotation: [rotX, rotY, rotZ],
            scale,
            motion,
        });
    }

    return positions;
};
