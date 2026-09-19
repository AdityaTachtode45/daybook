import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../theme/ThemeContext';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uColorBg;
  uniform vec3 uColorAccent;
  uniform vec3 uColorSecondary;
  varying vec2 vUv;

  void main() {
    vec2 st = vUv;
    vec2 mouse = uMouse * 0.5 + 0.5;
    
    float dist = distance(st, mouse);
    float wave = sin(st.x * 3.0 + uTime * 0.3) * cos(st.y * 3.0 + uTime * 0.4);
    
    vec3 color = mix(uColorBg, uColorAccent, smoothstep(0.8, 0.0, dist + wave * 0.2) * 0.35);
    color = mix(color, uColorSecondary, sin(st.y * 2.0 + uTime * 0.2) * 0.15 + 0.15);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ShaderPlane: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { effectiveTheme } = useTheme();

  const uniforms = useMemo(() => {
    const isDark = effectiveTheme === 'dark';
    return {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorBg: { value: isDark ? new THREE.Color('#0D0E12') : new THREE.Color('#F6F2EA') },
      uColorAccent: { value: isDark ? new THREE.Color('#FF8A4C') : new THREE.Color('#C8471A') },
      uColorSecondary: { value: isDark ? new THREE.Color('#1C1F26') : new THREE.Color('#FBF8F2') },
    };
  }, [effectiveTheme]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

const LandingShader: React.FC = () => {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (prefersReducedMotion || isMobile) {
    return <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-bg to-sage/10 pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ antialias: false, alpha: true }}>
        <ShaderPlane />
      </Canvas>
    </div>
  );
};

export default LandingShader;
