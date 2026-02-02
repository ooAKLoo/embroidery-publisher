import { useMemo, useRef } from 'react';
import { interpolate } from 'remotion';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { sampleTextPoints } from '../../utils/textSampler';
import { createSeededRandom } from '../../utils/random';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// 缓动函数
const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeInExpo = (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10);
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// 将文字采样点映射到 3D 空间
const mapTextPoints = (points, canvasWidth, canvasHeight, scale = 5) => {
  if (!points.length) return [];
  return points.map((point) => {
    const nx = (point.x / canvasWidth - 0.5) * scale;
    const ny = (0.5 - point.y / canvasHeight) * scale;
    return [nx, ny];
  });
};

// 创建粒子数据
const createParticleData = (images, inputText, seed, particleCount = 800) => {
  const textPoints = sampleTextPoints({
    text: inputText,
    width: 900,
    height: 300,
    step: 5
  });
  const mapped = mapTextPoints(textPoints, 900, 300, 6);
  const rng = createSeededRandom(seed || 1);
  
  // 文字区域的粒子
  const textParticles = images.map((src, index) => {
    const basePoint = mapped[index % Math.max(1, mapped.length)] || [0, 0];
    const jitter = 0.15;
    return {
      id: index,
      src,
      type: 'text',
      basePosition: new THREE.Vector3(
        basePoint[0] + (rng() - 0.5) * jitter,
        basePoint[1] + (rng() - 0.5) * jitter,
        (rng() - 0.5) * 0.3
      ),
      // 随机角度用于隧道/爆炸效果
      angle: rng() * Math.PI * 2,
      radius: 1.5 + rng() * 4,
      depth: -8 - rng() * 15,
      rotation: new THREE.Euler(
        (rng() - 0.5) * 0.2,
        (rng() - 0.5) * 0.2,
        (rng() - 0.5) * 0.15
      ),
      // 闪烁参数
      flickerPhase: rng() * Math.PI * 2,
      flickerSpeed: 2 + rng() * 4,
      scale: 0.6 + rng() * 0.4
    };
  });

  // 背景填充粒子
  const backgroundParticles = [];
  for (let i = 0; i < particleCount - images.length; i++) {
    backgroundParticles.push({
      id: `bg-${i}`,
      src: images[i % images.length],
      type: 'background',
      basePosition: new THREE.Vector3(
        (rng() - 0.5) * 14,
        (rng() - 0.5) * 10,
        -1 - rng() * 3
      ),
      angle: rng() * Math.PI * 2,
      radius: 2 + rng() * 5,
      depth: -5 - rng() * 20,
      rotation: new THREE.Euler(
        (rng() - 0.5) * 0.3,
        (rng() - 0.5) * 0.3,
        (rng() - 0.5) * 0.2
      ),
      flickerPhase: rng() * Math.PI * 2,
      flickerSpeed: 1 + rng() * 2,
      scale: 0.3 + rng() * 0.3
    });
  }

  return [...textParticles, ...backgroundParticles];
};

// 单个粒子组件
const ParticleMesh = ({
  particle,
  texture,
  time,
  mosaicProgress,
  zoomProgress,
  explosionProgress,
  phases,
  zoomIntensity = 1
}) => {
  const meshRef = useRef();
  
  // 计算当前位置
  let position = particle.basePosition.clone();
  let scale = particle.scale;
  let opacity = 1;
  
  // 阶段1: 蒙太奇文字 - 粒子在文字位置，带闪烁
  if (mosaicProgress > 0 && mosaicProgress < 1) {
    // 闪烁效果
    const flicker = Math.sin(time * particle.flickerSpeed + particle.flickerPhase);
    opacity = 0.7 + flicker * 0.3;
    scale = particle.scale * (0.9 + flicker * 0.1);
    
    // 微小抖动
    position.x += Math.sin(time * 3 + particle.flickerPhase) * 0.02;
    position.y += Math.cos(time * 2.5 + particle.flickerPhase) * 0.02;
  }

  // 阶段2: 极速缩放 - 粒子向外飞散并产生运动模糊感
  if (zoomProgress > 0) {
    const eased = easeInExpo(zoomProgress);
    const radialDir = position.clone().normalize();
    
    // 向外飞散
    const flyOutDistance = eased * 15 * zoomIntensity;
    position.add(radialDir.multiplyScalar(flyOutDistance));
    
    // 缩放和淡出
    scale = particle.scale * (1 + eased * 0.5);
    opacity = 1 - eased * 0.7;
    
    // 向后推（z轴）
    position.z -= eased * 5;
  }

  // 阶段4: 碎片化炸裂回退 - 从中心向外爆炸，然后回归
  if (explosionProgress > 0) {
    // 前半段爆炸，后半段回归
    const explosionPhase = explosionProgress < 0.5
      ? easeOutExpo(explosionProgress * 2)
      : 1 - easeOutBack((explosionProgress - 0.5) * 2);
    
    // 从中心向外爆炸
    const explosionRadius = explosionPhase * 12;
    const explosionX = Math.cos(particle.angle) * explosionRadius;
    const explosionY = Math.sin(particle.angle) * explosionRadius;
    
    // 混合爆炸位置和原始位置
    const returnProgress = explosionProgress > 0.5 ? (explosionProgress - 0.5) * 2 : 0;
    position.x = explosionX * (1 - returnProgress) + particle.basePosition.x * returnProgress;
    position.y = explosionY * (1 - returnProgress) + particle.basePosition.y * returnProgress;
    position.z = -explosionPhase * 8 + particle.basePosition.z * returnProgress;
    
    // 发光效果
    opacity = explosionProgress < 0.5
      ? 0.3 + explosionProgress * 1.4
      : 1 - (explosionProgress - 0.5) * 0.6;
    scale = particle.scale * (1 + explosionPhase * 0.8);
  }

  // 旋转动画
  const rotation = new THREE.Euler(
    particle.rotation.x + Math.sin(time * 0.5) * 0.05,
    particle.rotation.y + Math.cos(time * 0.4) * 0.05,
    particle.rotation.z + time * 0.1
  );

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.8, 0.6]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={Math.max(0, Math.min(1, opacity))}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// 发光粒子背景
const GlowParticles = ({ count, time, zoomProgress, explosionProgress }) => {
  const positions = useMemo(() => {
    const rng = createSeededRandom(42);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * 20;
      pos[i * 3 + 1] = (rng() - 0.5) * 15;
      pos[i * 3 + 2] = -5 - rng() * 15;
    }
    return pos;
  }, [count]);

  // 动态更新位置
  const animatedPositions = useMemo(() => {
    const animated = new Float32Array(positions);
    for (let i = 0; i < count; i++) {
      // 缩放阶段：向外飞散
      if (zoomProgress > 0) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const dist = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        const newDist = dist + zoomProgress * 10;
        animated[i * 3] = Math.cos(angle) * newDist;
        animated[i * 3 + 1] = Math.sin(angle) * newDist;
        animated[i * 3 + 2] = positions[i * 3 + 2] - zoomProgress * 8;
      }
      // 爆炸阶段：脉冲效果
      if (explosionProgress > 0 && explosionProgress < 0.5) {
        const pulse = Math.sin(explosionProgress * Math.PI);
        animated[i * 3] *= 1 + pulse * 0.2;
        animated[i * 3 + 1] *= 1 + pulse * 0.2;
      }
    }
    return animated;
  }, [positions, count, zoomProgress, explosionProgress]);

  const size = 0.04 + Math.sin(time * 2) * 0.01;
  const opacity = zoomProgress > 0 ? 0.3 + zoomProgress * 0.4 : 0.4;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={animatedPositions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a0d4ff"
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
      />
    </points>
  );
};

export const MosaicTextScene = ({
  frame,
  fps,
  width,
  height,
  duration,
  images,
  inputText = '回忆',
  phases,
  mosaicProgress,
  zoomProgress,
  explosionProgress,
  particleCount = 800,
  zoomIntensity = 1,
  seed = 1
}) => {
  const { camera } = useThree();
  const time = frame / fps;

  // 创建粒子数据
  const particles = useMemo(
    () => createParticleData(images, inputText, seed, particleCount),
    [images, inputText, seed, particleCount]
  );

  // 加载纹理
  const textures = useTexture(images);
  textures.forEach((texture) => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  });

  // 相机动画
  const cameraZ = interpolate(
    time,
    [
      phases.mosaic[0],
      phases.mosaic[1],
      phases.zoom[0],
      phases.zoom[1],
      phases.interface[0],
      phases.explosion[0],
      phases.explosion[1]
    ],
    [10, 9, 8, 0.5, 0.5, 0.5, 10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);

  return (
    <group>
      <color attach="background" args={['#0a0c12']} />
      <ambientLight intensity={0.6} color="#c0d8ff" />
      <directionalLight intensity={0.7} position={[3, 5, 5]} color="#fff5e6" />

      {/* 发光粒子背景 */}
      <GlowParticles
        count={1200}
        time={time}
        zoomProgress={zoomProgress}
        explosionProgress={explosionProgress}
      />

      {/* 照片粒子 */}
      {particles.map((particle, index) => (
        <ParticleMesh
          key={particle.id}
          particle={particle}
          texture={textures[index % textures.length]}
          time={time}
          mosaicProgress={mosaicProgress}
          zoomProgress={zoomProgress}
          explosionProgress={explosionProgress}
          phases={phases}
          zoomIntensity={zoomIntensity}
        />
      ))}

      {/* 中心光晕 - 缩放阶段 */}
      {zoomProgress > 0.5 && (
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.5 + zoomProgress * 2, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={(zoomProgress - 0.5) * 1.5}
          />
        </mesh>
      )}
    </group>
  );
};
