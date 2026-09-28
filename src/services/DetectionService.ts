import type { LayersModel } from '@tensorflow/tfjs';
import type { DetectionResult, ModelMetadata } from '../types';

export class DetectionService {
  model: LayersModel | null;
  labels: string[];
  config: ModelMetadata | null;

  constructor() {
    this.model = null;
    this.labels = [];
    this.config = null;
  }

  // TODO [Basic] Muat model dan metadata secara bersamaan, lalu simpan ke instance
  // TODO [Advance] Implementasikan strategi Backend Adaptive
  async loadModel(): Promise<void> {}

  // TODO [Basic] Lakukan prediksi pada elemen gambar yang diberikan dan kembalikan hasilnya
  async predict(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<DetectionResult | null> {
    return null;
  }

  // TODO [Basic] Periksa apakah model sudah dimuat dan siap digunakan
  isLoaded(): boolean {
    return false;
  }
}
