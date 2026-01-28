import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Ring({ delay }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const cycle = (time + delay) % 3;

    const scale = 1 + cycle * 1.5;
    meshRef.current.scale.set(scale, scale, 1);

    const opacity = 1 - cycle / 3;
    const material = meshRef.current.material;
    material.opacity = Math.max(0, opacity * 0.5);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <ringGeometry args={[1, 1.05, 64]} />
      <meshBasicMaterial
        color="#60a5fa"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function GravityRings() {
  return (
    <group>
      <Ring delay={0} />
      <Ring delay={1} />
      <Ring delay={2} />
    </group>
  );
}
