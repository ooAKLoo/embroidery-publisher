import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField: React.FC = () => {
  const count = 300;
  const meshRef = useRef<THREE.Points>(null);

  // Create random positions
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread broadly
      pos[i * 3] = (Math.random() - 0.5) * 25;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5; // z (push back)
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation of entire field
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#4fd1c5" // Teal/cyan accent color
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default ParticleField;