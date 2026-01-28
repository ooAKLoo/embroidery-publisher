import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, OrbitControls, Environment, Float } from '@react-three/drei';
import { EffectComposer, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ImageNode, PosterPreset, GeneratedPosition, MotionMode } from '../types';
import { generatePositions } from '../utils/layout';

interface SceneProps {
    centerImage: string;
    aroundImages: ImageNode[];
    preset: PosterPreset;
    count: number;
    seed: number;
    backgroundColor: string;
    blurStrength: number;
    centerOutlineColor: string;
    centerOutlineWidth: number;
    centerOutlineOpacity: number;
    centerShadowOpacity: number;
    centerShadowOffset: number;
    onReady?: () => void;
}

interface CardProps {
    url: string;
    pos: GeneratedPosition;
    faceCenter: boolean;
    motionMode?: MotionMode;
}

// Reusable card component
const Card = ({
    url,
    pos,
    faceCenter,
    motionMode
}: CardProps) => {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!ref.current) return;

        if (motionMode && pos.motion) {
            const time = state.clock.getElapsedTime();
            const lerpFactor = 0.05;

            let targetRadius = pos.motion.radiusBase;
            let targetY = pos.motion.radiusBase * Math.sin(pos.motion.phi);
            let rotationSpeed = pos.motion.speed;

            if (motionMode === 'absorb') {
                targetRadius = 1.5 + (pos.motion.randomOffset % 1) * 0.5;
                targetY = targetY * 0.2;
                rotationSpeed = pos.motion.speed * 3;
            } else if (motionMode === 'orbit') {
                rotationSpeed = pos.motion.speed * 1.5;
            } else if (motionMode === 'float') {
                targetRadius = pos.motion.radiusBase * 1.8;
                rotationSpeed = pos.motion.speed * 0.2;
            }

            const currentTheta = pos.motion.theta + time * rotationSpeed * 0.5;
            const bobbing = Math.sin(time * 2 + pos.motion.randomOffset) * 0.2;

            const x = targetRadius * Math.cos(currentTheta);
            const z = targetRadius * Math.sin(currentTheta);
            const y = targetY + bobbing;

            ref.current.position.x += (x - ref.current.position.x) * lerpFactor;
            ref.current.position.y += (y - ref.current.position.y) * lerpFactor;
            ref.current.position.z += (z - ref.current.position.z) * lerpFactor;

            const scalePulse = motionMode === 'absorb' ? 0.8 : 1;
            ref.current.scale.set(
                pos.scale * scalePulse,
                pos.scale * scalePulse * 1.4,
                1
            );
        }

        if (faceCenter) {
            ref.current.lookAt(0, 0, 0);
        }
    });

    const image = (
        <Image
            ref={ref as any}
            url={url}
            position={pos.position}
            rotation={pos.rotation}
            scale={[pos.scale, pos.scale * 1.4, 1]}
            transparent
        />
    );

    if (motionMode && pos.motion) {
        return image;
    }

    return (
        <Float
            speed={1}
            rotationIntensity={faceCenter ? 0.2 : 1}
            floatIntensity={0.5}
        >
            {image}
        </Float>
    );
};

const PosterContent = ({
    centerImage,
    aroundImages,
    preset,
    count,
    seed,
    backgroundColor,
    blurStrength,
    centerOutlineColor,
    centerOutlineWidth,
    centerOutlineOpacity,
    centerShadowOpacity,
    centerShadowOffset,
}: Omit<SceneProps, 'onReady'>) => {
    const { camera } = useThree();

    // Update camera based on preset
    React.useEffect(() => {
        camera.position.set(0, 0, preset.camera.distance);
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = preset.camera.fov;
            camera.updateProjectionMatrix();
        }
    }, [preset, camera]);

    // Generate positions
    const positions = useMemo(() => {
        return generatePositions(count, preset, seed);
    }, [count, preset, seed]);

    // Select a subset of images to cycle through if count > images.length
    const getImageUrl = (index: number) => {
        if (aroundImages.length === 0) return '';
        return aroundImages[index % aroundImages.length].url;
    };

    return (
        <>
            <color attach="background" args={[backgroundColor]} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="blue" />

            {/* Center Image */}
            <group>
                {centerShadowOpacity > 0 ? (
                    <mesh position={[centerShadowOffset, -centerShadowOffset, -0.2]}>
                        <planeGeometry args={[2.5 * 1.05, 3.5 * 1.05]} />
                        <meshBasicMaterial color="#000000" transparent opacity={centerShadowOpacity} />
                    </mesh>
                ) : null}
                {centerOutlineOpacity > 0 && centerOutlineWidth > 0 ? (
                    <mesh position={[0, 0, -0.08]}>
                        <planeGeometry
                            args={[
                                2.5 * (1 + centerOutlineWidth),
                                3.5 * (1 + centerOutlineWidth),
                            ]}
                        />
                        <meshBasicMaterial
                            color={centerOutlineColor}
                            transparent
                            opacity={centerOutlineOpacity}
                        />
                    </mesh>
                ) : null}
                {/* Main Hero Image */}
                <Image
                    url={centerImage}
                    position={[0, 0, 0]}
                    scale={[2.5, 3.5, 1]}
                    transparent
                />
            </group>

            {/* Surrounding Cards */}
            {positions.map((pos, i) => (
                <Card
                    key={pos.id}
                    url={getImageUrl(i)}
                    pos={pos}
                    faceCenter={preset.card.faceCenter}
                    motionMode={preset.motionMode}
                />
            ))}

            {/* Post Processing */}
            <EffectComposer>
                {blurStrength > 0 ? (
                    <DepthOfField
                        target={[0, 0, preset.post.focusDistance]} // Focus on center
                        focalLength={preset.post.focalLength}
                        bokehScale={blurStrength}
                        height={480}
                    />
                ) : null}
                <Vignette eskil={false} offset={0.1} darkness={preset.post.vignetteDarkness} />
                <Noise opacity={0.05} />
            </EffectComposer>

            {/* Controls for user interaction during preview */}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2}
                maxDistance={20}
                autoRotate={preset.motionMode === 'orbit'}
                autoRotateSpeed={0.5}
            />
        </>
    );
};

export const Scene = (props: SceneProps) => {
    return (
        <Canvas
            dpr={[1, 2]} // Better quality on high DPI
            gl={{ preserveDrawingBuffer: true, antialias: false }} // Needed for export
            className="w-full h-full"
        >
            <PosterContent {...props} />
        </Canvas>
    );
};
