export interface ModelMetadata {
  tfjsVersion?: string;
  tmVersion?: string;
  packageVersion?: string;
  packageName?: string;
  timeStamp?: string;
  userMetadata?: Record<string, unknown>;
  modelName?: string;
  labels: string[];
  imageSize?: number;
}

export interface DetectionResult {
  className: string;
  score: number;
  isValid?: boolean;
  confidence?: number;
}

export type FunFactData = string | 'error' | null;

export type AppStateName = 'idle' | 'analyzing' | 'result';

export type ToneValue = 'normal' | 'funny' | 'professional' | 'casual';

export interface ToneOption {
  value: ToneValue;
  label: string;
}

export type CameraType = 'default' | 'front';
