import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { SpiritConfig } from '../types';

// GPGPU 位置模拟 shader
const positionSimulationShader = `
uniform float uTime;
uniform float uDelta;
uniform float uSpeed;
uniform float uDieSpeed;
uniform float uRadius;
uniform float uCurlSize;
uniform float uAttraction;
uniform float uTurbulence;
uniform vec3 uMouse;
uniform sampler2D texturePosition;

// Simplex 3D Noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

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
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

vec3 snoiseVec3( vec3 x ){
  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  return vec3( s , s1 , s2 );
}

vec3 curlNoise( vec3 p ){
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  return normalize( vec3( x , y , z ) );
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(texturePosition, uv);
  vec3 pos = posData.xyz;
  float life = posData.w;

  // 更新生命值
  life -= uDieSpeed * uDelta;

  // 如果粒子死亡，重生
  if(life < 0.0) {
    // 在球形范围内重生
    float theta = uv.x * 6.28318530718;
    float phi = uv.y * 3.14159265359;
    float r = 0.01 + fract(sin(uTime * 12.9898 + uv.x * 43758.5453) * 43758.5453) * 0.05;

    pos.x = r * sin(phi) * cos(theta);
    pos.y = r * sin(phi) * sin(theta);
    pos.z = r * cos(phi);

    life = 0.9 + fract(sin(uTime * 78.233 + uv.y * 12.9898) * 43758.5453) * 0.1;
  }

  // Curl noise 驱动
  vec3 curlPos = pos * uCurlSize + uTime * 0.05;
  vec3 curl = curlNoise(curlPos);

  // 向目标点吸引 (鼠标或中心)
  vec3 target = uMouse;
  vec3 toTarget = target - pos;
  float distToTarget = length(toTarget);

  // 速度计算
  vec3 velocity = curl * uSpeed;
  velocity += normalize(toTarget) * uAttraction * (1.0 / (distToTarget + 0.1));

  // 添加一些湍流
  velocity += snoiseVec3(pos * 2.0 + uTime * 0.3) * uTurbulence * 0.1;

  // 约束在球形范围内
  pos += velocity * uDelta;
  float dist = length(pos);
  if(dist > uRadius) {
    pos = normalize(pos) * uRadius;
  }

  gl_FragColor = vec4(pos, life);
}
`;

// 粒子渲染 vertex shader
const particleVertexShader = `
uniform sampler2D texturePosition;
uniform float uPointSize;

varying float vLife;
varying vec3 vPosition;

void main() {
  vec4 posData = texture2D(texturePosition, position.xy);
  vec3 pos = posData.xyz;
  vLife = posData.w;
  vPosition = pos;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uPointSize * (300.0 / -mvPosition.z) * smoothstep(0.0, 0.2, vLife);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// 粒子渲染 fragment shader
const particleFragmentShader = `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying float vLife;
varying vec3 vPosition;

void main() {
  // 圆形粒子
  float dist = length(gl_PointCoord - vec2(0.5));
  if(dist > 0.5) discard;

  // 柔和边缘
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // 基于生命周期的颜色混合
  vec3 color = mix(uColorB, uColorA, smoothstep(0.0, 0.7, vLife));

  // 基于生命周期的透明度
  alpha *= smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.8, vLife);
  alpha *= uOpacity;

  gl_FragColor = vec4(color, alpha);
}
`;

// GPGPU 计算渲染器
class GPUComputationRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private mesh: THREE.Mesh;
  private passThruUniforms: { [key: string]: THREE.IUniform };
  private passThruShader: THREE.ShaderMaterial;
  private variables: any[] = [];
  private currentTextureIndex = 0;
  public sizeX: number;
  public sizeY: number;

  constructor(sizeX: number, sizeY: number, renderer: THREE.WebGLRenderer) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.camera.position.z = 1;

    this.passThruUniforms = {
      passThruTexture: { value: null }
    };

    this.passThruShader = this.createShaderMaterial(
      this.getPassThroughVertexShader(),
      this.getPassThroughFragmentShader(),
      this.passThruUniforms
    );

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.passThruShader);
    this.scene.add(this.mesh);
  }

  private createShaderMaterial(vertexShader: string, fragmentShader: string, uniforms: any) {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
  }

  private getPassThroughVertexShader() {
    return `void main() { gl_Position = vec4(position, 1.0); }`;
  }

  private getPassThroughFragmentShader() {
    return `
      uniform sampler2D passThruTexture;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        gl_FragColor = texture2D(passThruTexture, uv);
      }
    `;
  }

  createTexture(): THREE.DataTexture {
    const data = new Float32Array(this.sizeX * this.sizeY * 4);
    const texture = new THREE.DataTexture(data, this.sizeX, this.sizeY, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
  }

  createRenderTarget(): THREE.WebGLRenderTarget {
    return new THREE.WebGLRenderTarget(this.sizeX, this.sizeY, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
    });
  }

  addVariable(variableName: string, computeFragmentShader: string, initialValueTexture: THREE.DataTexture) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        [variableName]: { value: null },
        resolution: { value: new THREE.Vector2(this.sizeX, this.sizeY) },
      },
      vertexShader: this.getPassThroughVertexShader(),
      fragmentShader: computeFragmentShader,
    });

    const variable = {
      name: variableName,
      initialValueTexture,
      material,
      renderTargets: [this.createRenderTarget(), this.createRenderTarget()],
      dependencies: null as any,
    };

    this.variables.push(variable);
    return variable;
  }

  setVariableDependencies(variable: any, dependencies: any[]) {
    variable.dependencies = dependencies;
  }

  init() {
    // 初始化纹理
    for (const variable of this.variables) {
      // 渲染初始值到 render target
      this.passThruUniforms.passThruTexture.value = variable.initialValueTexture;
      this.doRenderTarget(this.passThruShader, variable.renderTargets[0]);
      this.doRenderTarget(this.passThruShader, variable.renderTargets[1]);
    }
    return null;
  }

  compute() {
    this.currentTextureIndex = 1 - this.currentTextureIndex;
    const nextIndex = this.currentTextureIndex;
    const prevIndex = 1 - nextIndex;

    for (const variable of this.variables) {
      // 设置依赖纹理
      if (variable.dependencies) {
        for (const dep of variable.dependencies) {
          variable.material.uniforms[dep.name].value = dep.renderTargets[prevIndex].texture;
        }
      }
      // 渲染到下一个 render target
      this.doRenderTarget(variable.material, variable.renderTargets[nextIndex]);
    }
  }

  private doRenderTarget(material: THREE.ShaderMaterial, output: THREE.WebGLRenderTarget) {
    this.mesh.material = material;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  getCurrentRenderTarget(variable: any): THREE.WebGLRenderTarget {
    return variable.renderTargets[this.currentTextureIndex];
  }
}

interface SpiritParticlesProps {
  config: SpiritConfig;
}

const SpiritParticles: React.FC<SpiritParticlesProps> = ({ config }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const gpuComputeRef = useRef<GPUComputationRenderer | null>(null);
  const positionVariableRef = useRef<any>(null);
  const { gl, mouse, size } = useThree();

  const configRef = useRef(config);
  configRef.current = config;

  // 计算纹理尺寸
  const textureSize = useMemo(() => {
    const size = Math.ceil(Math.sqrt(config.particleCount));
    return size;
  }, [config.particleCount]);

  // 初始化 GPGPU
  useEffect(() => {
    const gpuCompute = new GPUComputationRenderer(textureSize, textureSize, gl);
    gpuComputeRef.current = gpuCompute;

    // 创建初始位置纹理
    const positionTexture = gpuCompute.createTexture();
    const posArray = positionTexture.image.data;

    // 初始化粒子位置 - 球形分布
    for (let i = 0; i < posArray.length; i += 4) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 0.3;

      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = r * Math.cos(phi);
      posArray[i + 3] = Math.random(); // life
    }

    // 添加位置变量
    const positionVariable = gpuCompute.addVariable(
      'texturePosition',
      positionSimulationShader,
      positionTexture
    );
    positionVariableRef.current = positionVariable;

    // 设置依赖
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable]);

    // 添加 uniforms
    Object.assign(positionVariable.material.uniforms, {
      uTime: { value: 0 },
      uDelta: { value: 0 },
      uSpeed: { value: config.speed * 0.5 },
      uDieSpeed: { value: 0.01 },
      uRadius: { value: 2.0 },
      uCurlSize: { value: config.curlScale * 50 },
      uAttraction: { value: 0.5 },
      uTurbulence: { value: config.turbulence },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
    });

    gpuCompute.init();

    return () => {
      gpuComputeRef.current = null;
    };
  }, [gl, textureSize]);

  // 创建粒子几何体
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(textureSize * textureSize * 3);

    // UV 坐标作为位置 (用于从纹理采样)
    for (let i = 0; i < textureSize; i++) {
      for (let j = 0; j < textureSize; j++) {
        const idx = (i * textureSize + j) * 3;
        positions[idx] = j / textureSize;
        positions[idx + 1] = i / textureSize;
        positions[idx + 2] = 0;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [textureSize]);

  // 创建材质
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        uPointSize: { value: config.particleSize },
        uColorA: { value: new THREE.Color(config.colorA) },
        uColorB: { value: new THREE.Color(config.colorB) },
        uOpacity: { value: config.opacity },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // 动画循环
  useFrame((state, delta) => {
    const gpuCompute = gpuComputeRef.current;
    const positionVariable = positionVariableRef.current;
    if (!gpuCompute || !positionVariable || !pointsRef.current) return;

    const cfg = configRef.current;

    // 更新模拟 uniforms
    const uniforms = positionVariable.material.uniforms;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uDelta.value = Math.min(delta, 0.05);
    uniforms.uSpeed.value = cfg.speed * 0.5;
    uniforms.uDieSpeed.value = (1 - cfg.trailLength) * 0.1;
    uniforms.uCurlSize.value = cfg.curlScale * 50;
    uniforms.uAttraction.value = cfg.mouseInfluence * 2;
    uniforms.uTurbulence.value = cfg.turbulence;

    // 鼠标位置
    const mouseX = mouse.x * 2;
    const mouseY = mouse.y * 2;
    uniforms.uMouse.value.set(mouseX, mouseY, 0);

    // 执行 GPU 计算
    gpuCompute.compute();

    // 更新渲染材质
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
    mat.uniforms.uPointSize.value = cfg.particleSize;
    mat.uniforms.uColorA.value.set(cfg.colorA);
    mat.uniforms.uColorB.value.set(cfg.colorB);
    mat.uniforms.uOpacity.value = cfg.opacity;

    // 缓慢旋转
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

export default SpiritParticles;
