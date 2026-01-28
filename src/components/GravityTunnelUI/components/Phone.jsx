import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { createScreenTexture } from '../utils/textureGen';

export function Phone() {
  const screenTexture = useMemo(() => createScreenTexture(), []);

  return (
    <group rotation={[0, 0, 0]}>
      <RoundedBox args={[1.2, 2.4, 0.15]} radius={0.15} smoothness={4}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.8} />
      </RoundedBox>

      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.05, 2.25]} />
        <meshBasicMaterial map={screenTexture} toneMapped={false} />
      </mesh>

      <mesh position={[0, 1, 0.081]}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
        <meshBasicMaterial color="black" />
      </mesh>

      <mesh position={[0, -1.05, 0.081]}>
        <planeGeometry args={[0.4, 0.01]} />
        <meshBasicMaterial color="#ccc" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
