import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import ParticleField from './Visuals/ParticleField';
import CoreBlob from './Visuals/CoreBlob';
import { NeuralCoreConfig } from '../types';

interface SceneProps {
  config: NeuralCoreConfig;
}

const Scene: React.FC<SceneProps> = ({ config }) => {
  return (
    <div className="relative w-full h-full bg-[#02020a]">
      <Canvas
        className="absolute inset-0 w-full h-full"
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#02020a']} />
          
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.2} color="#4c1d95" />
          <pointLight position={[-10, -10, -10]} intensity={0.6} color="#2563eb" />
          <pointLight position={[0, 5, 5]} intensity={0.6} color="#e879f9" />
          
          {config.showStars && (
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
          )}

          {config.showParticles && <ParticleField />}

          <CoreBlob
            geometry={config.geometry}
            smoothness={config.smoothness}
            noiseAmplitude={config.noiseAmplitude}
            noiseFrequency={config.noiseFrequency}
            intensity={config.intensity}
            rotationSpeed={config.rotationSpeed}
            colorBase={config.colorBase}
            colorAccent={config.colorAccent}
            colorGlow={config.colorGlow}
          />

          {config.enableOrbit && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
              rotateSpeed={0.5}
            />
          )}

          <AdaptiveDpr pixelated />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
