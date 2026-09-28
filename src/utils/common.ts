import type { ModelMetadata } from '../types';

export const logError = (context: string, error: unknown): void => {
  console.error(`❌ ${context}:`, error);
};

export const isWebGPUSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
};

export const isMobileDevice = (): boolean => {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  return nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const createDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const validateModelMetadata = (metadata: unknown): metadata is ModelMetadata => {
  return Boolean(
    metadata &&
    typeof metadata === 'object' &&
    Array.isArray((metadata as ModelMetadata).labels),
  );
};

export const getCameraErrorMessage = (error: { name?: string }): string => {
  const errorMessages: Record<string, string> = {
    'NotAllowedError': 'Izin kamera ditolak. Harap izinkan akses kamera.',
    'NotFoundError': 'Tidak ada kamera ditemukan pada perangkat ini.',
    'NotReadableError': 'Kamera sedang digunakan oleh aplikasi lain.'
  };

  return errorMessages[error.name ?? ''] || 'Gagal memulai kamera';
};
