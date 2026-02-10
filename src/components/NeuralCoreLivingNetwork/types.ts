export type GeometryType = 'sphere' | 'icosahedron';

export interface NeuralCoreConfig {
  geometry: GeometryType;
  smoothness: number;
  noiseAmplitude: number;
  noiseFrequency: number;
  intensity: number;
  rotationSpeed: number;
  showStars: boolean;
  showParticles: boolean;
  enableOrbit: boolean;
  // 颜色配置
  colorBase: string;
  colorAccent: string;
  colorGlow: string;
}
