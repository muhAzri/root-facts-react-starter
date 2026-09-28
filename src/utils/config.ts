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

export const ROOT_FACTS_MODEL_ID = 'Xenova/LaMini-Flan-T5-77M';

export const TONE_PROMPTS: Record<ToneValue, (vegetableName: string) => string> = {
  normal: (name) => `Berikan satu fakta menarik dan singkat tentang sayuran ${name} dalam Bahasa Indonesia.`,
  funny: (name) => `Ceritakan satu fakta unik tentang sayuran ${name} dengan gaya bahasa yang lucu dan menghibur dalam Bahasa Indonesia.`,
  professional: (name) => `Jelaskan satu fakta ilmiah tentang sayuran ${name} dengan gaya bahasa formal dan profesional dalam Bahasa Indonesia.`,
  casual: (name) => `Ceritain dong fakta seru tentang sayuran ${name}, pakai bahasa santai kayak lagi ngobrol sama teman.`
};

export const TONE_GENERATION_PARAMS: Record<ToneValue, { temperature: number; top_p: number }> = {
  normal: { temperature: 0.7, top_p: 0.9 },
  funny: { temperature: 1.0, top_p: 0.95 },
  professional: { temperature: 0.4, top_p: 0.85 },
  casual: { temperature: 0.85, top_p: 0.9 }
};

export const GENERATION_CONFIG = {
  max_new_tokens: 80,
  do_sample: true
};
