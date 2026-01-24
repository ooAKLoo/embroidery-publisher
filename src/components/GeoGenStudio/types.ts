export interface LogoParams {
    // Structural Layer
    count: number; // Number of items (symmetry order)
    rotationOffset: number; // Global rotation

    // Atomic Layer
    innerRadius: number; // Distance from center (creating negative space)
    length: number; // Length of the primitive
    spread: number; // Angular width of the primitive (0-360)
    cornerRadius: number; // Softness of edges
    atomicRotation: number; // Rotation of the individual atom itself relative to its polar axis

    // Styling
    hue: number;
    saturation: number;
    lightness: number;
    opacity: number;
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
    fill: boolean;
    stroke: boolean;
    strokeWidth: number;
}

export type Preset = {
    name: string;
    params: LogoParams;
};
