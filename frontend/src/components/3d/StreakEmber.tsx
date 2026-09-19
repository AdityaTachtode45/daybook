import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

interface StreakEmberProps {
  streak: number;
  className?: string;
}

const FlameMesh: React.FC<{ streak: number }> = ({ streak }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5) * 0.12;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  const emberColor = streak >= 30 ? '#FF5500' : streak >= 7 ? '#FF8A4C' : '#F5C15A';

  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={1.2}>
      <group>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={emberColor}
            roughness={0.2}
            metalness={0.3}
            emissive={emberColor}
            emissiveIntensity={1.8}
          />
        </mesh>

        <mesh ref={glowRef}>
          <sphereGeometry args={[1.3, 16, 16]} />
          <meshBasicMaterial color={emberColor} transparent opacity={0.3} />
        </mesh>

        <Sparkles count={Math.min(25 + streak * 2, 90)} scale={[3.2, 3.2, 3.2]} size={4} speed={1} color={emberColor} />
      </group>
    </Float>
  );
};

export const StreakEmber: React.FC<StreakEmberProps> = ({ streak, className = 'w-24 h-24' }) => {
  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 3, 4]} intensity={2.5} color="#FF8A4C" />
        <FlameMesh streak={streak} />
      </Canvas>
    </div>
  );
};
