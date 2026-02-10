import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import SpiritParticles from './SpiritParticles';
import { SpiritConfig } from '../types';

interface SceneProps {
  config: SpiritConfig;
}

const Scene: React.FC<SceneProps> = ({ config }) => {
  return (
    <div className="relative w-full h-full bg-black">
      <Canvas
        className="absolute inset-0 w-full h-full"
        camera={{ position: [0, 0, 3], fov: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.NoToneMapping,
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[config.showBackground ? '#000000' : '#050505']} />

          <SpiritParticles config={config} />

          <AdaptiveDpr pixelated />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
