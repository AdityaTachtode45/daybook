import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AmbientWorldProps {
  effectiveTheme: 'light' | 'dark';
  isWriting: boolean;
  enableParticles: boolean;
  enableParallax: boolean;
}

export const AmbientWorld: React.FC<AmbientWorldProps> = ({
  effectiveTheme,
  isWriting,
  enableParticles,
  enableParallax,
}) => {
  const { camera, pointer } = useThree();
  const pointLightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Smooth background color interpolation
  const targetBg = effectiveTheme === 'dark' ? '#0D0E12' : '#F6F2EA';
  const fogColor = effectiveTheme === 'dark' ? '#0D0E12' : '#F6F2EA';

  useFrame((state, delta) => {
    // Smooth camera pointer parallax
    if (enableParallax && !isWriting) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.x * 0.8, delta * 2);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, pointer.y * 0.5, delta * 2);
      state.camera.lookAt(0, 0, 0);
    } else if (isWriting) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, delta * 1.5);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, delta * 1.5);
    }

    // Move cursor light
    if (pointLightRef.current) {
      pointLightRef.current.position.x = pointer.x * 6;
      pointLightRef.current.position.y = pointer.y * 4;
    }

    // Idle rotation of group
    if (groupRef.current && !isWriting) {
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <>
      <color attach="background" args={[targetBg]} />
      <fog attach="fog" args={[fogColor, 12, 35]} />

      {/* Cursor Light Highlight */}
      <pointLight
        ref={pointLightRef}
        position={[0, 0, 5]}
        intensity={effectiveTheme === 'dark' ? 1.8 : 1.2}
        color={effectiveTheme === 'dark' ? '#FF8A4C' : '#C8471A'}
        distance={12}
        decay={2}
      />

      {/* Main Lighting */}
      <ambientLight intensity={effectiveTheme === 'dark' ? 0.35 : 0.85} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={effectiveTheme === 'dark' ? 0.6 : 1.4}
        color={effectiveTheme === 'dark' ? '#F5C15A' : '#FFFFFF'}
      />

      <group ref={groupRef}>
        {/* Dark Theme Night Sky Features */}
        {effectiveTheme === 'dark' && (
          <>
            <Stars radius={40} depth={50} count={1200} factor={4} saturation={0.5} fade speed={isWriting ? 0.2 : 1} />
            {enableParticles && (
              <Sparkles
                count={isWriting ? 30 : 90}
                scale={[25, 25, 25]}
                size={3.5}
                speed={isWriting ? 0.1 : 0.4}
                color="#FF8A4C"
              />
            )}
          </>
        )}

        {/* Light Theme Sunlit Motes */}
        {effectiveTheme === 'light' && enableParticles && (
          <>
            <Sparkles
              count={isWriting ? 20 : 60}
              scale={[20, 20, 20]}
              size={4}
              speed={isWriting ? 0.1 : 0.3}
              color="#C98A12"
            />
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
              <mesh position={[-3, 2, -5]} rotation={[0.4, 0.2, 0]}>
                <boxGeometry args={[1.2, 1.8, 0.02]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.6} opacity={0.3} transparent />
              </mesh>
              <mesh position={[4, -1, -8]} rotation={[-0.3, 0.5, 0.2]}>
                <boxGeometry args={[0.9, 1.4, 0.02]} />
                <meshStandardMaterial color="#FBF8F2" roughness={0.7} opacity={0.25} transparent />
              </mesh>
            </Float>
          </>
        )}
      </group>
    </>
  );
};
