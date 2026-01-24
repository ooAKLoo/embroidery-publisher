import { LogoParams } from '../types';

export const DEFAULT_PARAMS: LogoParams = {
    count: 6,
    rotationOffset: 0,
    innerRadius: 20,
    length: 80,
    spread: 40,
    cornerRadius: 0.5,
    atomicRotation: 0,
    hue: 250,
    saturation: 80,
    lightness: 60,
    opacity: 0.8,
    blendMode: 'normal',
    fill: true,
    stroke: false,
    strokeWidth: 2,
};

export const PRESETS: { [key: string]: LogoParams } = {
    "Turbine": {
        ...DEFAULT_PARAMS,
        count: 8,
        innerRadius: 0,
        length: 100,
        spread: 30,
        atomicRotation: 15,
        blendMode: 'multiply',
        opacity: 0.7,
        hue: 210
    },
    "Bio Hazard": {
        ...DEFAULT_PARAMS,
        count: 3,
        innerRadius: 30,
        length: 80,
        spread: 100,
        cornerRadius: 1,
        hue: 45,
        saturation: 100,
        lightness: 50,
        stroke: true,
        strokeWidth: 8,
        fill: false
    },
    "Aperture": {
        ...DEFAULT_PARAMS,
        count: 6,
        innerRadius: 40,
        length: 60,
        spread: 50,
        atomicRotation: 45,
        cornerRadius: 0.1,
        hue: 160,
        blendMode: 'screen',
        opacity: 0.6
    },
    "Flower": {
        ...DEFAULT_PARAMS,
        count: 5,
        innerRadius: 10,
        length: 90,
        spread: 60,
        atomicRotation: 0,
        cornerRadius: 1, // Makes it petal-like
        hue: 320,
        blendMode: 'normal',
        opacity: 0.9
    },
    "Hexweave": {
        ...DEFAULT_PARAMS,
        count: 6,
        innerRadius: 50,
        length: 50,
        spread: 10,
        atomicRotation: 90,
        cornerRadius: 0,
        stroke: true,
        fill: false,
        strokeWidth: 4,
        hue: 190
    }
};
