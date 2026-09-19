import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const FloatingParticles: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 60;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -10 + Math.random() * 20;
      const yFactor = -10 + Math.random() * 20;
      const zFactor = -10 + Math.random() * 20;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      dummy.position.set(
        (xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10) / 2,
        (yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10) / 2,
        (zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10) / 2
      );
      const s = Math.cos(t) * 0.5 + 0.8;
      dummy.rotation.set(s, s, s);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#8B5CF6" roughness={0.2} metalness={0.8} emissive="#6366F1" emissiveIntensity={0.5} />
    </instancedMesh>
  );
};

const HeroOrb: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 2]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe
          roughness={0.1}
          metalness={0.9}
          emissive="#6366F1"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
};

const HeroCanvas3D: React.FC = () => {
  // Check prefers-reduced-motion or mobile/low-power
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-accent-violet/20 via-transparent to-accent-indigo/20 blur-3xl opacity-50" />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#8B5CF6" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#6366F1" />
        <HeroOrb />
        <FloatingParticles />
      </Canvas>
    </div>
  );
};

export default HeroCanvas3D;
