import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export function PhoneModel() {
  const groupRef = useRef(null);
  const screenRef = useRef(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.2, 2.4, 0.15]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </RoundedBox>

      <mesh position={[0, 0, 0.08]} ref={screenRef}>
        <planeGeometry args={[1.05, 2.25]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <group position={[0, 0, 0.09]}>
        <mesh position={[0, 0.9, 0]}>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color="#f3f4f6" />
        </mesh>
        <mesh position={[-0.2, 0.5, 0]}>
          <planeGeometry args={[0.5, 0.15]} />
          <meshBasicMaterial color="#e5e7eb" />
        </mesh>
        <mesh position={[0.2, 0.2, 0]}>
          <planeGeometry args={[0.5, 0.15]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[-0.2, -0.1, 0]}>
          <planeGeometry args={[0.5, 0.15]} />
          <meshBasicMaterial color="#e5e7eb" />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <planeGeometry args={[0.9, 0.15]} />
          <meshBasicMaterial color="#f3f4f6" />
        </mesh>
      </group>

      <mesh position={[0.62, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}
