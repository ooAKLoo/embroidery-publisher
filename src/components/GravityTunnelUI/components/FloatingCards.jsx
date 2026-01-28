import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createChatCardTexture } from '../utils/textureGen';

function Card({ initialPos, rot, speed, texture }) {
  const meshRef = useRef(null);
  const offset = useMemo(() => Math.random() * 100, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    meshRef.current.position.z += speed * 0.02;

    if (meshRef.current.position.z > 6) {
      meshRef.current.position.z = -15;
    }

    meshRef.current.position.y = initialPos.y + Math.sin(time + offset) * 0.1;

    meshRef.current.rotation.x = rot.x + Math.sin(time * 0.5 + offset) * 0.05;
    meshRef.current.rotation.y = rot.y + Math.cos(time * 0.3 + offset) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={initialPos} rotation={rot}>
      <planeGeometry args={[1.2, 0.6]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        roughness={0.4}
      />
    </mesh>
  );
}

export function FloatingCards() {
  const cardCount = 80;

  const cards = useMemo(() => {
    const tempCards = [];
    const texA = createChatCardTexture(false);
    const texB = createChatCardTexture(true);

    for (let i = 0; i < cardCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 5;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.6;
      const z = Math.random() * 20 - 15;

      const rot = new THREE.Euler(
        Math.random() * 0.5,
        Math.atan2(x, z) + (Math.random() - 0.5),
        Math.random() * 0.2
      );

      tempCards.push({
        pos: new THREE.Vector3(x, y, z),
        rot,
        speed: 0.5 + Math.random() * 1.5,
        texture: Math.random() > 0.5 ? texA : texB
      });
    }
    return tempCards;
  }, []);

  return (
    <group>
      {cards.map((data, i) => (
        <Card
          key={`card-${i}`}
          initialPos={data.pos}
          rot={data.rot}
          speed={data.speed}
          texture={data.texture}
        />
      ))}
    </group>
  );
}
