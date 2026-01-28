export type LayoutMode = 'vortex' | 'halo' | 'scatter';
export type MotionMode = 'orbit' | 'absorb' | 'float';

export interface PosterPreset {
    id: string;
    name: string;
    description: string;
    motionMode?: MotionMode;
    layout: {
        mode: LayoutMode;
        radiusMin: number; // Minimum distance from center
        radiusMax: number; // Maximum distance
        heightRange: number; // Vertical spread
        zRange: number; // Depth spread
        spiralTightness?: number; // For vortex
    };
    camera: {
        distance: number;
        fov: number;
    };
    post: {
        focusDistance: number; // 0 to 1 range usually, or absolute units
        focalLength: number; // Lens focal length
        bokehScale: number; // Blur intensity
        vignetteDarkness: number;
    };
    card: {
        size: number;
        randomizeSize: number; // 0-1 variance
        faceCenter: boolean; // If true, cards look at center
    };
}

export interface ImageNode {
    id: string;
    url: string;
    width?: number;
    height?: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface GeneratedPosition {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
    motion?: {
        theta: number;
        phi: number;
        radiusBase: number;
        speed: number;
        randomOffset: number;
    };
}
