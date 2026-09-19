import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export type MoodType = 'GREAT' | 'GOOD' | 'OKAY' | 'LOW' | 'BAD';

interface MoodOrbProps {
  mood: MoodType;
  className?: string;
  interactive?: boolean;
}

const MOOD_COLORS: Record<MoodType, string> = {
  GREAT: '#4CB782',
  GOOD: '#4BA3C7',
  OKAY: '#E0A93B',
  LOW: '#8B7FD1',
  BAD: '#D9576B',
};

const InnerOrb: React.FC<{ color: string; interactive?: boolean }> = ({ color, interactive }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.6;
      meshRef.current.rotation.y += delta * 0.9;
    }
  });

  return (
    <Float speed={interactive ? 2.5 : 1.2} rotationIntensity={0.8} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.15}
          transmission={0.5}
          thickness={1.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
    </Float>
  );
};

export const MoodOrb: React.FC<MoodOrbProps> = ({ mood, className = 'w-8 h-8', interactive = false }) => {
  const color = MOOD_COLORS[mood] || MOOD_COLORS.GOOD;

  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#FFFFFF" />
        <InnerOrb color={color} interactive={interactive} />
      </Canvas>
    </div>
  );
};
