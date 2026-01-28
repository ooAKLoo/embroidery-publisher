import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows
} from '@react-three/drei';
import { PhoneModel } from './PhoneModel';
import { FloatingElements } from './FloatingElements';
import { ForceField } from './ForceField';
import { VisualMode } from './types';

export function Scene({ mode, images }) {
  return (
    <Canvas className="w-full h-full" dpr={[1, 2]}>
      <fog attach="fog" args={['#f3f4f6', 5, 25]} />

      <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={50} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={15}
        autoRotate={mode === VisualMode.ORBIT}
        autoRotateSpeed={0.5}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />

      <Environment preset="city" />

      <group position={[0, 0, 0]}>
        <PhoneModel />
        <FloatingElements count={80} mode={mode} images={images} />
        <ForceField mode={mode} />
      </group>

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4.5}
      />
    </Canvas>
  );
}
