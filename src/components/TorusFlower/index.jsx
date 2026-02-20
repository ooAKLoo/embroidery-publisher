import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { DebugLayerMaterial, Depth, Fresnel, LayerMaterial, Color } from 'lamina'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

function Bg() {
  const mesh = useRef()
  useFrame((state, delta) => {
    mesh.current.rotation.x = mesh.current.rotation.y = mesh.current.rotation.z += delta
  })
  return (
    <mesh ref={mesh} scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <LayerMaterial color="#f0aed2" attach="material" side={THREE.BackSide}>
        <Depth colorA="blue" colorB="#00aaff" alpha={0.5} mode="multiply" near={0} far={300} origin={[10, 10, 10]} />
        <Depth colorA="#ff0000" colorB="#00aaff" alpha={0.5} mode="multiply" near={0} far={300} origin={[100, 100, 100]} />
      </LayerMaterial>
    </mesh>
  )
}

function Flower() {
  const mesh = useRef()
  const depth = useRef()
  useFrame((state, delta) => {
    mesh.current.rotation.z += delta / 2
    depth.current.origin.set(-state.mouse.y, state.mouse.x, 0)
  })
  return (
    <mesh castShadow receiveShadow rotation-y={Math.PI / 2} scale={[2, 2, 2]} ref={mesh}>
      <torusKnotGeometry args={[0.4, 0.05, 400, 8, 3, 7]} />
      <DebugLayerMaterial color="#ff4eb8" name="Flower">
        <Color color="#ff4eb8" />
        <Depth far={3} origin={[1, 1, 1]} colorA="#ff00e3" colorB="#00ffff" alpha={0.5} mode="multiply" mapping="camera" />
        <Depth ref={depth} near={0.25} far={2} colorA="#ffe100" alpha={0.5} mode="lighten" mapping="vector" />
        <Fresnel mode="softlight" />
      </DebugLayerMaterial>
    </mesh>
  )
}

function GlassSphere() {
  return (
    <mesh>
      <sphereGeometry args={[0.2, 64, 64]} />
      <meshPhysicalMaterial transmission={1} thickness={10} roughness={0.2} />
    </mesh>
  )
}

export default function TorusFlower() {
  return (
    <div className="h-full w-full bg-white rounded-2xl overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [2, 0, 0], fov: 80 }}>
        <Suspense fallback={null}>
          <Bg />
          <Flower />
          <GlassSphere />
          <OrbitControls />
          <directionalLight intensity={20} castShadow shadow-mapSize-height={1024} shadow-mapSize-width={1024} />
          <ambientLight intensity={0.4} />
        </Suspense>
      </Canvas>
    </div>
  )
}
