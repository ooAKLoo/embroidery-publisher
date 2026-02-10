import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GeometryType } from '../../types';

interface CoreBlobProps {
  geometry: GeometryType;
  smoothness: number;
  noiseFrequency: number;
  noiseAmplitude: number;
  intensity: number;
  rotationSpeed: number;
  colorBase: string;
  colorAccent: string;
  colorGlow: string;
}

const vertexShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uNoiseFrequency;
uniform float uNoiseAmplitude;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; 
  vec3 x3 = x0 - D.yyy;      

  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normal;
  
  float noiseVal = snoise(position * uNoiseFrequency + uTime * 0.2);
  vDisplacement = noiseVal;
  
  float displacement = noiseVal * (uNoiseAmplitude + uIntensity * 0.1);
  vec3 newPosition = position + normal * displacement;
  
  vPosition = newPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;
uniform vec3 uColorGlow;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vPosition);
  
  float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
  
  vec3 color = mix(uColorBase, uColorAccent, smoothstep(-0.2, 0.5, vDisplacement));
  
  float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
  vec3 finalColor = mix(color, uColorGlow, fresnel * (0.5 + uIntensity * 0.5));
  finalColor += uColorGlow * fresnel * pulse * 0.4;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const CoreBlob: React.FC<CoreBlobProps> = ({
  geometry,
  smoothness,
  noiseFrequency,
  noiseAmplitude,
  intensity,
  rotationSpeed,
  colorBase,
  colorAccent,
  colorGlow,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // 使用 ref 存储最新的 props 值，解决 useFrame 闭包问题
  const propsRef = useRef({
    noiseFrequency,
    noiseAmplitude,
    intensity,
    rotationSpeed,
    colorBase,
    colorAccent,
    colorGlow,
  });

  // 每次渲染时更新 ref
  propsRef.current = {
    noiseFrequency,
    noiseAmplitude,
    intensity,
    rotationSpeed,
    colorBase,
    colorAccent,
    colorGlow,
  };

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uNoiseFrequency: { value: noiseFrequency },
      uNoiseAmplitude: { value: noiseAmplitude },
      uColorBase: { value: new THREE.Color(colorBase) },
      uColorAccent: { value: new THREE.Color(colorAccent) },
      uColorGlow: { value: new THREE.Color(colorGlow) },
    }),
    []
  );

  const smooth = Math.min(Math.max(smoothness, 0), 1);
  const sphereSegments = Math.round(32 + smooth * 128);
  const icosaDetail = Math.round(6 + smooth * 20);
  const scale = geometry === 'sphere' ? 2.2 : 2.0;

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    const props = propsRef.current;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uNoiseFrequency.value = props.noiseFrequency;
    material.uniforms.uNoiseAmplitude.value = props.noiseAmplitude;
    material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      material.uniforms.uIntensity.value,
      props.intensity,
      0.08
    );

    // 更新颜色
    material.uniforms.uColorBase.value.set(props.colorBase);
    material.uniforms.uColorAccent.value.set(props.colorAccent);
    material.uniforms.uColorGlow.value.set(props.colorGlow);

    meshRef.current.rotation.y = state.clock.elapsedTime * props.rotationSpeed;
    meshRef.current.rotation.z = state.clock.elapsedTime * props.rotationSpeed * 0.5;
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      {geometry === 'sphere' ? (
        <sphereGeometry args={[1, sphereSegments, sphereSegments]} />
      ) : (
        <icosahedronGeometry args={[1.05, icosaDetail]} />
      )}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
      />
    </mesh>
  );
};

export default CoreBlob;
