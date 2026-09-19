import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { useTheme } from '../../theme/ThemeContext';
import { useWritingMode } from '../../theme/WritingModeContext';
import { AmbientWorld } from './AmbientWorld';
import { QualitySettings } from '../../theme/QualitySystem';

interface GlobalCanvasProps {
  settings: QualitySettings;
}

export const GlobalCanvas: React.FC<GlobalCanvasProps> = ({ settings }) => {
  const { effectiveTheme } = useTheme();
  const { isWriting } = useWritingMode();

  if (settings.simpleMode || settings.quality === 'off') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ isolation: 'isolate' }}
      aria-hidden="true"
    >
      <Canvas
        dpr={settings.dpr}
        frameloop={isWriting ? 'demand' : 'always'}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{
          antialias: settings.quality === 'high',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <AmbientWorld
            effectiveTheme={effectiveTheme}
            isWriting={isWriting}
            enableParticles={settings.particlesCount > 0}
            enableParallax={settings.enableParallax}
          />
          <View.Port />
        </Suspense>
      </Canvas>
    </div>
  );
};
