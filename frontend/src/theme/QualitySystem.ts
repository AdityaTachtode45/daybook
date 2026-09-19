export type GraphicsQuality = 'high' | 'medium' | 'low' | 'off';

export interface QualitySettings {
  quality: GraphicsQuality;
  simpleMode: boolean;
  dpr: number;
  particlesCount: number;
  enablePostprocessing: boolean;
  enableParallax: boolean;
}

const STORAGE_KEY_QUALITY = 'daybook_graphics_quality';
const STORAGE_KEY_SIMPLE = 'daybook_simple_mode';

export function detectGPUQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'high';

  // Check mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Hardware concurrency check
  const concurrency = navigator.hardwareConcurrency || 4;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'off';

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
      
      // Known low-end GPUs or software renderers
      if (renderer.includes('swiftshader') || renderer.includes('llvmpipe') || renderer.includes('basic render')) {
        return 'low';
      }

      // Integrated graphics / mobile GPUs
      if (renderer.includes('intel') || renderer.includes('mali') || renderer.includes('adreno')) {
        return isMobile || concurrency < 4 ? 'low' : 'medium';
      }
    }
  } catch {
    return 'medium';
  }

  if (isMobile) return 'medium';
  if (concurrency >= 8) return 'high';
  if (concurrency >= 4) return 'medium';
  return 'low';
}

export function getStoredQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'high';
  const stored = localStorage.getItem(STORAGE_KEY_QUALITY) as GraphicsQuality;
  if (stored && ['high', 'medium', 'low', 'off'].includes(stored)) {
    return stored;
  }
  return detectGPUQuality();
}

export function getStoredSimpleMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_SIMPLE) === 'true';
}

export function getQualitySettings(quality: GraphicsQuality, simpleMode: boolean): QualitySettings {
  if (simpleMode || quality === 'off') {
    return {
      quality: 'off',
      simpleMode: true,
      dpr: 1,
      particlesCount: 0,
      enablePostprocessing: false,
      enableParallax: false,
    };
  }

  switch (quality) {
    case 'high':
      return {
        quality: 'high',
        simpleMode: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        particlesCount: 120,
        enablePostprocessing: true,
        enableParallax: true,
      };
    case 'medium':
      return {
        quality: 'medium',
        simpleMode: false,
        dpr: 1.25,
        particlesCount: 60,
        enablePostprocessing: false,
        enableParallax: true,
      };
    case 'low':
      return {
        quality: 'low',
        simpleMode: false,
        dpr: 1,
        particlesCount: 25,
        enablePostprocessing: false,
        enableParallax: false,
      };
    default:
      return {
        quality: 'off',
        simpleMode: true,
        dpr: 1,
        particlesCount: 0,
        enablePostprocessing: false,
        enableParallax: false,
      };
  }
}
