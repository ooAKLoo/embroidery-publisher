import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Phone } from './Phone';
import { FloatingCards } from './FloatingCards';
import { GravityRings } from './GravityRings';

export function Scene() {
  return (
    <Canvas className="w-full h-full bg-gray-50">
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 10, 0]} intensity={0.5} penumbra={1} />

      <group position={[0, 0, 0]}>
        <group>
          <Phone />
        </group>

        <GravityRings />
        <FloatingCards />
      </group>

      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4.5}
      />

      <Environment preset="city" />

      <OrbitControls
        enablePan={false}
        enableZoom
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={12}
      />
    </Canvas>
  );
}
