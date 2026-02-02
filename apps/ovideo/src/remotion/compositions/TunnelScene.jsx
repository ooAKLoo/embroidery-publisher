import { useMemo } from 'react';
import { interpolate } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { sampleTextPoints } from '../utils/textSampler';
import { createSeededRandom } from '../utils/random';

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const mapTextPoints = (points, width, height, scale = 6) => {
  if (!points.length) return [];
  return points.map((point) => {
    const nx = (point.x / width - 0.5) * scale;
    const ny = (0.5 - point.y / height) * scale;
    return [nx, ny];
  });
};

const createCardData = (images, titleText, seed) => {
  const textPoints = sampleTextPoints({ text: titleText, width: 900, height: 260, step: 6 });
  const mapped = mapTextPoints(textPoints, 900, 260, 6.5);
  const rng = createSeededRandom(seed || 1);

  return images.map((src, index) => {
    const basePoint = mapped[index % Math.max(1, mapped.length)] || [0, 0];
    const angle = rng() * Math.PI * 2;
    const radius = 1.2 + rng() * 3.2;
    const depth = -10 - rng() * 20;
    return {
      id: index,
      src,
      base: new THREE.Vector3(basePoint[0] + (rng() - 0.5) * 0.3, basePoint[1] + (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.4),
      angle,
      radius,
      depth,
      rotation: new THREE.Euler((rng() - 0.5) * 0.3, (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.3),
      tilt: (rng() - 0.5) * 0.2
    };
  });
};

const buildTunnelPositions = (count, seed, length = 40) => {
  const rng = createSeededRandom(seed + 99);
  const base = [];
  for (let i = 0; i < count; i += 1) {
    base.push({
      angle: rng() * Math.PI * 2,
      radius: 1.2 + rng() * 3,
      depth: -length * rng()
    });
  }
  return base;
};

const getHighlightInfo = (flashEvents, frame, fps) => {
  return flashEvents
    .map((event) => {
      const start = event.start;
      const peak = event.peak;
      const holdEnd = event.peak + event.freezeFrames;
      const end = event.end;
      const progress = interpolate(
        frame,
        [start, peak, holdEnd, end],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      return { index: event.index, progress };
    })
    .filter((item) => item.progress > 0);
};

export const TunnelScene = ({
  frame,
  fps,
  width,
  height,
  duration,
  images,
  titleText,
  tunnelSpeed = 420,
  cardScaleMax = 2.6,
  seed = 1,
  flashEvents,
  phases
}) => {
  const { camera } = useThree();

  const cards = useMemo(() => createCardData(images, titleText, seed), [images, titleText, seed]);
  const textures = useTexture(images);
  const tunnelPoints = useMemo(() => buildTunnelPositions(1200, seed, 50), [seed]);

  textures.forEach((texture) => {
    if (!texture) return;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  const time = frame / fps;
  const collapseProgress = clamp01((time - phases.collapse[0]) / (phases.collapse[1] - phases.collapse[0]));
  const outroProgress = clamp01((time - phases.outro[0]) / (phases.outro[1] - phases.outro[0]));

  const cameraZ = interpolate(
    time,
    [phases.text[0], phases.text[1], phases.tunnel[0], phases.tunnel[1], phases.outro[1]],
    [8.2, 7.6, 6.2, 4.2, 3.8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, -4);

  const highlightInfo = getHighlightInfo(flashEvents, frame, fps);

  const tunnelSpeedUnits = (tunnelSpeed / 120) * 0.6;
  const tunnelLength = 50;

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(tunnelPoints.length * 3);
    tunnelPoints.forEach((point, index) => {
      const z = ((point.depth + time * tunnelSpeedUnits) % tunnelLength) - tunnelLength * 0.5;
      const x = Math.cos(point.angle + time * 0.4) * point.radius;
      const y = Math.sin(point.angle + time * 0.4) * point.radius;
      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
    });
    return positions;
  }, [tunnelPoints, time, tunnelSpeedUnits, tunnelLength]);

  return (
    <group>
      <color attach="background" args={['#0b0e14']} />
      <ambientLight intensity={0.7} color="#b5c3ff" />
      <directionalLight intensity={0.8} position={[4, 6, 6]} color="#fff1d6" />

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particlePositions}
            count={particlePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#8fd3ff" size={0.05} sizeAttenuation transparent opacity={0.55} />
      </points>

      {cards.map((card, index) => {
        const highlight = highlightInfo.find((item) => item.index === card.id);
        const highlightBoost = highlight ? highlight.progress : 0;

        const textPosition = card.base.clone();
        const collapseTarget = new THREE.Vector3(
          Math.cos(card.angle) * 0.4,
          Math.sin(card.angle) * 0.4,
          -4
        );

        const collapsePos = textPosition.clone().lerp(collapseTarget, easeOutCubic(collapseProgress));

        const tunnelPhaseZ = ((card.depth + time * tunnelSpeedUnits) % tunnelLength) - tunnelLength * 0.5;
        const tunnelX = Math.cos(card.angle + time * 0.4) * card.radius;
        const tunnelY = Math.sin(card.angle + time * 0.4) * card.radius;

        const tunnelPos = new THREE.Vector3(tunnelX, tunnelY, tunnelPhaseZ);

        let position = textPosition;
        if (time >= phases.collapse[0] && time < phases.tunnel[0]) {
          position = collapsePos;
        } else if (time >= phases.tunnel[0]) {
          position = tunnelPos;
        }

        if (highlightBoost > 0) {
          const popOffset = new THREE.Vector3(
            -position.x * 0.6,
            -position.y * 0.6,
            4.5
          );
          position = position.clone().add(popOffset.multiplyScalar(highlightBoost));
        }

        const scale = 0.85 + highlightBoost * (cardScaleMax - 1);
        const opacity = 1 - outroProgress * 0.8;
        const rotation = new THREE.Euler(
          card.rotation.x + highlightBoost * 0.1,
          card.rotation.y + highlightBoost * 0.1,
          card.rotation.z + Math.sin(time * 1.2 + card.tilt) * 0.1
        );

        return (
          <mesh key={card.id} position={position} rotation={rotation} scale={scale}>
            <planeGeometry args={[1.2, 0.9]} />
            <meshBasicMaterial
              map={textures[index % textures.length]}
              transparent
              opacity={opacity}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, -6]}>
        <ringGeometry args={[2.2, 2.6, 64]} />
        <meshBasicMaterial color="#7bd3ff" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0, -9]}>
        <ringGeometry args={[2.8, 3.3, 64]} />
        <meshBasicMaterial color="#7bd3ff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
};
