import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { VisualMode } from './types';

const tempObject = new THREE.Object3D();

export function FloatingElements({ count, mode, images = [] }) {
  const meshRefs = useRef([]);

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const radiusBase = 3 + Math.random() * 4;
      const speed = 0.2 + Math.random() * 0.5;
      const scale = 0.5 + Math.random() * 0.5;
      const randomOffset = Math.random() * 100;
      const baseZ = Math.random();

      return { theta, phi, radiusBase, speed, scale, randomOffset, baseZ };
    });
  }, [count]);

  const textureSources = useMemo(() => {
    if (images.length) return images;
    return new Array(12)
      .fill(0)
      .map((_, i) => `https://picsum.photos/seed/orbit-${i + 1}/400/600`);
  }, [images]);

  const textures = useTexture(textureSources);
  const textureList = Array.isArray(textures) ? textures : [textures];

  useFrame((state) => {
    if (!meshRefs.current.length) return;

    const time = state.clock.getElapsedTime();
    const lerpFactor = 0.05;
    const isTunnel =
      mode === VisualMode.ORBIT_TUNNEL ||
      mode === VisualMode.GRAVITY_TUNNEL ||
      mode === VisualMode.FLOAT_TUNNEL;
    const tunnelLength = 16;

    particles.forEach((particle, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      const { theta, phi, radiusBase, speed, scale, randomOffset, baseZ } = particle;

      let targetRadius = radiusBase;
      let targetY = radiusBase * Math.sin(phi);
      let rotationSpeed = speed;

      if (mode === VisualMode.GRAVITY || mode === VisualMode.GRAVITY_TUNNEL) {
        targetRadius = 1.5 + Math.random() * 0.5;
        targetY = targetY * 0.2;
        rotationSpeed = speed * 3;
      } else if (mode === VisualMode.ORBIT || mode === VisualMode.ORBIT_TUNNEL) {
        targetRadius = radiusBase;
        rotationSpeed = speed * 1.5;
      } else if (mode === VisualMode.FLOAT || mode === VisualMode.FLOAT_TUNNEL) {
        targetRadius = radiusBase * 1.8;
        rotationSpeed = speed * 0.2;
      }

      const currentTheta = theta + time * rotationSpeed * 0.5;
      const bobbing = Math.sin(time * 2 + randomOffset) * 0.2;

      let x = targetRadius * Math.cos(currentTheta);
      let y = targetY + bobbing;
      let z = targetRadius * Math.sin(currentTheta);

      if (isTunnel) {
        const depthBase = (baseZ - 0.5) * tunnelLength;
        const depthDrift = Math.sin(time * 0.4 + randomOffset) * 0.6;
        z = depthBase + depthDrift;
        y = targetRadius * Math.sin(currentTheta);
        x = targetRadius * Math.cos(currentTheta);
      }

      tempObject.position.copy(mesh.position);
      tempObject.position.x += (x - tempObject.position.x) * lerpFactor;
      tempObject.position.y += (y - tempObject.position.y) * lerpFactor;
      tempObject.position.z += (z - tempObject.position.z) * lerpFactor;

      mesh.position.copy(tempObject.position);
      if (isTunnel) {
        mesh.lookAt(0, 0, mesh.position.z);
      } else {
        mesh.lookAt(0, 0, 0);
      }

      const scalePulse =
        mode === VisualMode.GRAVITY || mode === VisualMode.GRAVITY_TUNNEL ? 0.8 : 1;
      const depthFactor = isTunnel
        ? (mesh.position.z + tunnelLength * 0.5) / tunnelLength
        : 0.5;
      const depthScale = isTunnel ? 0.65 + depthFactor * 0.9 : 1;
      const finalScale = scale * scalePulse * depthScale;
      mesh.scale.set(finalScale, finalScale, finalScale);

      if (mesh.material) {
        const opacity = isTunnel
          ? 0.3 + Math.max(0, depthFactor) * 0.7
          : 1 - (Math.abs(mesh.position.z) / 10) * 0.2;
        mesh.material.opacity = Math.max(0.35, Math.min(0.95, opacity));
      }
    });
  });

  return (
    <group>
      {particles.map((particle, index) => {
        const texture = textureList[index % textureList.length];
        return (
          <mesh
            key={`card-${index}`}
            ref={(el) => {
              meshRefs.current[index] = el;
            }}
          >
            <planeGeometry args={[0.9, 0.6]} />
            <meshStandardMaterial
              map={texture}
              transparent
              opacity={0.95}
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
