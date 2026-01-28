import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';
import * as THREE from 'three';
import { VisualMode } from './types';

function Ring({ radius, speed, opacity, color }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * speed) * 0.05;
      ref.current.scale.set(scale, scale, 1);
      ref.current.rotation.z = t * 0.1;
    }
  });

  return (
    <Torus ref={ref} args={[radius, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </Torus>
  );
}

export function ForceField({ mode }) {
  const isActive =
    mode !== VisualMode.FLOAT && mode !== VisualMode.FLOAT_TUNNEL;
  const baseColor =
    mode === VisualMode.GRAVITY || mode === VisualMode.GRAVITY_TUNNEL
      ? '#60a5fa'
      : '#38bdf8';

  return (
    <group position={[0, -2, 0]}>
      <Ring radius={1.5} speed={1} opacity={isActive ? 0.6 : 0.1} color={baseColor} />
      <Ring radius={2.5} speed={0.8} opacity={isActive ? 0.4 : 0.1} color={baseColor} />
      <Ring radius={3.5} speed={0.6} opacity={isActive ? 0.2 : 0.05} color={baseColor} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial color={baseColor} transparent opacity={isActive ? 0.1 : 0.0} />
      </mesh>
    </group>
  );
}
