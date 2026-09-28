import type { DetectionResult, ToneOption, ToneValue } from '../types';

export const APP_CONFIG = {
  detectionConfidenceThreshold: 70,
  analyzingDelay: 2000,
  factsGenerationDelay: 2000,
  detectionRetryInterval: 100
};

export const TONE_CONFIG: {
  availableTones: ToneOption[];
  defaultTone: ToneValue;
} = {
  availableTones: [
    { value: 'normal', label: 'Normal' },
    { value: 'funny', label: 'Lucu' },
    { value: 'professional', label: 'Profesional' },
    { value: 'casual', label: 'Santai' }
  ],
  defaultTone: 'normal'
};

export const isValidDetection = (result: DetectionResult | null | undefined): boolean => {
  const { detectionConfidenceThreshold } = APP_CONFIG;
  return Boolean(result && result.isValid && (result.confidence ?? 0) >= detectionConfidenceThreshold);
};
