import { PosterPreset } from './types';

export const DEFAULT_PRESETS: PosterPreset[] = [
    {
        id: 'orbit',
        name: 'Orbit',
        description: 'Organized rings orbiting the subject.',
        motionMode: 'orbit',
        layout: {
            mode: 'halo',
            radiusMin: 2,
            radiusMax: 4,
            heightRange: 0.5,
            zRange: 2,
        },
        camera: {
            distance: 7,
            fov: 45,
        },
        post: {
            focusDistance: 0,
            focalLength: 0.02,
            bokehScale: 3,
            vignetteDarkness: 0.4,
        },
        card: {
            size: 1.0,
            randomizeSize: 0.1,
            faceCenter: true,
        },
    },
    {
        id: 'absorb',
        name: 'Absorb',
        description: 'A spiral galaxy-like formation with strong depth.',
        motionMode: 'absorb',
        layout: {
            mode: 'vortex',
            radiusMin: 1.5,
            radiusMax: 6,
            heightRange: 1,
            zRange: 4,
            spiralTightness: 0.5,
        },
        camera: {
            distance: 8,
            fov: 35,
        },
        post: {
            focusDistance: 0,
            focalLength: 0.05,
            bokehScale: 6,
            vignetteDarkness: 0.6,
        },
        card: {
            size: 1.2,
            randomizeSize: 0.3,
            faceCenter: true,
        },
    },
    {
        id: 'float',
        name: 'Float',
        description: 'Floating chaotic particles with heavy blur.',
        motionMode: 'float',
        layout: {
            mode: 'scatter',
            radiusMin: 1.2,
            radiusMax: 5,
            heightRange: 4,
            zRange: 3,
        },
        camera: {
            distance: 6,
            fov: 50,
        },
        post: {
            focusDistance: 0.1,
            focalLength: 0.1,
            bokehScale: 8,
            vignetteDarkness: 0.5,
        },
        card: {
            size: 0.8,
            randomizeSize: 0.5,
            faceCenter: false,
        },
    },
    {
        id: 'vortex-clean',
        name: 'Vortex Clean',
        description: 'A spiral galaxy-like formation with strong depth.',
        layout: {
            mode: 'vortex',
            radiusMin: 1.5,
            radiusMax: 6,
            heightRange: 1,
            zRange: 4,
            spiralTightness: 0.5,
        },
        camera: {
            distance: 8,
            fov: 35,
        },
        post: {
            focusDistance: 0,
            focalLength: 0.05,
            bokehScale: 6,
            vignetteDarkness: 0.6,
        },
        card: {
            size: 1.2,
            randomizeSize: 0.3,
            faceCenter: true,
        },
    },
    {
        id: 'halo-product',
        name: 'Halo Product',
        description: 'Organized rings orbiting the subject.',
        layout: {
            mode: 'halo',
            radiusMin: 2,
            radiusMax: 4,
            heightRange: 0.5,
            zRange: 2,
        },
        camera: {
            distance: 7,
            fov: 45,
        },
        post: {
            focusDistance: 0,
            focalLength: 0.02,
            bokehScale: 3,
            vignetteDarkness: 0.4,
        },
        card: {
            size: 1.0,
            randomizeSize: 0.1,
            faceCenter: true,
        },
    },
    {
        id: 'scatter-dreamy',
        name: 'Scatter Dreamy',
        description: 'Floating chaotic particles with heavy blur.',
        layout: {
            mode: 'scatter',
            radiusMin: 1.2,
            radiusMax: 5,
            heightRange: 4,
            zRange: 3,
        },
        camera: {
            distance: 6,
            fov: 50,
        },
        post: {
            focusDistance: 0.1, // Slightly off center focus
            focalLength: 0.1,
            bokehScale: 8,
            vignetteDarkness: 0.5,
        },
        card: {
            size: 0.8,
            randomizeSize: 0.5,
            faceCenter: false,
        },
    },
];

export const PLACEHOLDER_CENTER = 'https://picsum.photos/id/237/800/800'; // Dog
// Generate a list of placeholders
export const PLACEHOLDER_AROUND = Array.from({ length: 30 }).map((_, i) => ({
    id: `mock-${i}`,
    url: `https://picsum.photos/id/${10 + i}/400/600`,
}));
