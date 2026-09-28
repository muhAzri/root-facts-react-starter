import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import type { LayersModel } from '@tensorflow/tfjs';
import type { DetectionResult, ModelMetadata } from '../types';
import { isWebGPUSupported, logError, validateModelMetadata } from '../utils/common';

const MODEL_URL = '/model/model.json';
const METADATA_URL = '/model/metadata.json';
const DEFAULT_IMAGE_SIZE = 224;

export class DetectionService {
  model: LayersModel | null;
  labels: string[];
  config: ModelMetadata | null;
  currentBackend: string | null;

  constructor() {
    this.model = null;
    this.labels = [];
    this.config = null;
    this.currentBackend = null;
  }

  private async selectBackend(): Promise<void> {
    const backendPriority = isWebGPUSupported() ? ['webgpu', 'webgl', 'cpu'] : ['webgl', 'cpu'];

    for (const backend of backendPriority) {
      try {
        const success = await tf.setBackend(backend);
        if (!success) continue;

        await tf.ready();
        this.currentBackend = tf.getBackend();
        return;
      } catch (error) {
        logError(`Backend "${backend}" gagal diinisialisasi, mencoba fallback`, error);
      }
    }

    throw new Error('Tidak ada backend TensorFlow.js yang tersedia pada perangkat ini.');
  }

  async loadModel(onProgress?: (percent: number) => void): Promise<void> {
    await this.selectBackend();

    const [model, metadataResponse] = await Promise.all([
      tf.loadLayersModel(MODEL_URL, {
        onProgress: (fraction) => onProgress?.(Math.round(fraction * 100))
      }),
      fetch(METADATA_URL).then((res) => res.json())
    ]);

    if (!validateModelMetadata(metadataResponse)) {
      throw new Error('Metadata model tidak valid.');
    }

    const imageSize = metadataResponse.imageSize ?? DEFAULT_IMAGE_SIZE;

    // Warm-up inferensi awal di dalam tf.tidy() agar tensor sementara langsung
    // dibuang dan tidak membebani memori GPU/CPU sebelum prediksi pertama pengguna.
    tf.tidy(() => {
      const warmupOutput = model.predict(tf.zeros([1, imageSize, imageSize, 3])) as tf.Tensor;
      warmupOutput.dataSync();
    });

    this.model = model;
    this.config = metadataResponse;
    this.labels = metadataResponse.labels;
    onProgress?.(100);
  }

  async predict(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<DetectionResult | null> {
    if (!this.isLoaded()) return null;

    const imageSize = this.config?.imageSize ?? DEFAULT_IMAGE_SIZE;

    // Seluruh tensor perantara (fromPixels, resize, normalisasi) dibuat di dalam
    // tf.tidy() supaya otomatis di-dispose, hanya tensor output yang dikembalikan.
    const output = tf.tidy(() => {
      const tensor = tf.browser
        .fromPixels(imageElement)
        .resizeBilinear([imageSize, imageSize])
        .toFloat()
        .div(255.0)
        .expandDims(0);

      return this.model!.predict(tensor) as tf.Tensor;
    });

    const scores = await output.data();
    output.dispose();

    let maxIndex = 0;
    for (let i = 1; i < scores.length; i += 1) {
      if (scores[i] > scores[maxIndex]) maxIndex = i;
    }

    const score = scores[maxIndex];

    return {
      className: this.labels[maxIndex] ?? 'Tidak diketahui',
      score,
      confidence: Math.round(score * 100),
      isValid: true
    };
  }

  isLoaded(): boolean {
    return this.model !== null && this.labels.length > 0;
  }
}
