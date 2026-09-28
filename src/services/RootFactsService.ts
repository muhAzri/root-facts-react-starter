import { pipeline } from '@huggingface/transformers';
import type { Text2TextGenerationPipeline } from '@huggingface/transformers';
import {
  GENERATION_CONFIG,
  ROOT_FACTS_MODEL_ID,
  TONE_CONFIG,
  TONE_GENERATION_PARAMS,
  TONE_PROMPTS
} from '../utils/config';
import { logError } from '../utils/common';
import type { ToneValue } from '../types';

export class RootFactsService {
  generator: Text2TextGenerationPipeline | null;
  isModelLoaded: boolean;
  isGenerating: boolean;
  config: unknown;
  currentBackend: string | null;
  currentTone: ToneValue;

  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.config = null;
    this.currentBackend = null;
    this.currentTone = TONE_CONFIG.defaultTone;
  }

  private async createPipeline(
    device: 'webgpu' | 'wasm',
    onProgress?: (percent: number) => void
  ): Promise<Text2TextGenerationPipeline> {
    const textToTextTask = 'text2text-generation' as const;
    const generator = await pipeline(textToTextTask, ROOT_FACTS_MODEL_ID, {
      device,
      progress_callback: (info) => {
        if (info.status === 'progress' && typeof info.progress === 'number') {
          onProgress?.(Math.round(info.progress));
        }
      }
    });

    return generator as unknown as Text2TextGenerationPipeline;
  }

  // Prioritaskan WebGPU untuk akselerasi grafis; jika tidak tersedia atau gagal
  // diinisialisasi, otomatis beralih (fallback) ke WebAssembly (WASM).
  async loadModel(onProgress?: (percent: number) => void): Promise<void> {
    const preferWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

    try {
      const device = preferWebGPU ? 'webgpu' : 'wasm';
      this.generator = await this.createPipeline(device, onProgress);
      this.currentBackend = device;
    } catch (error) {
      if (preferWebGPU) {
        logError('Gagal memuat model generatif dengan WebGPU, beralih ke WASM', error);
        this.generator = await this.createPipeline('wasm', onProgress);
        this.currentBackend = 'wasm';
      } else {
        throw error;
      }
    }

    this.isModelLoaded = true;
    onProgress?.(100);
  }

  setTone(tone: ToneValue): void {
    this.currentTone = tone;
  }

  async generateFacts(vegetableName: string): Promise<string | null> {
    if (!this.isReady() || this.isGenerating) return null;

    this.isGenerating = true;

    try {
      const buildPrompt = TONE_PROMPTS[this.currentTone];
      const { temperature, top_p: topP } = TONE_GENERATION_PARAMS[this.currentTone];

      const rawOutput = await this.generator!(buildPrompt(vegetableName), {
        max_new_tokens: GENERATION_CONFIG.max_new_tokens,
        do_sample: GENERATION_CONFIG.do_sample,
        temperature,
        top_p: topP
      });

      const outputs = Array.isArray(rawOutput) ? rawOutput : [rawOutput];
      const first = outputs[0] as { generated_text?: string } | undefined;

      return first?.generated_text?.trim() || null;
    } catch (error) {
      logError('Gagal menghasilkan fun fact', error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  isReady(): boolean {
    return this.generator !== null && this.isModelLoaded;
  }
}
