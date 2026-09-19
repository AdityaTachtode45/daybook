import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

interface DayData {
  date: string;
  count: number;
}

interface Heatmap3DProps {
  data: DayData[];
  className?: string;
}

const InstancedGrid: React.FC<{ data: DayData[] }> = ({ data }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const gridWidth = 52;
  const gridHeight = 7;
  const count = Math.min(data.length, gridWidth * gridHeight);

  React.useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      const week = Math.floor(i / 7);
      const day = i % 7;
      const val = data[i]?.count || 0;

      const posX = (week - gridWidth / 2) * 0.45;
      const posZ = (day - gridHeight / 2) * 0.45;
      const height = val > 0 ? 0.3 + val * 0.8 : 0.15;

      dummy.position.set(posX, height / 2, posZ);
      dummy.scale.set(0.38, height, 0.38);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);

      const color = new THREE.Color();
      if (val === 0) color.set('#232733');
      else if (val === 1) color.set('#4CB782');
      else if (val === 2) color.set('#E0A93B');
      else color.set('#FF8A4C');

      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data, count, dummy]);

  return (
    <group position={[0, -0.5, 0]} rotation={[0.5, -0.4, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.25} metalness={0.2} />
      </instancedMesh>
    </group>
  );
};

export const Heatmap3D: React.FC<Heatmap3DProps> = ({ data, className = 'w-full h-80' }) => {
  return (
    <div className={`relative overflow-hidden rounded-panel glass-panel border border-border/80 ${className}`}>
      <Canvas camera={{ position: [0, 10, 16], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF8A4C" />
        <InstancedGrid data={data} />
        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} minPolarAngle={0.1} />
      </Canvas>
    </div>
  );
};
