export class CameraService {
  stream: MediaStream | null;
  video: HTMLVideoElement | null;
  canvas: HTMLCanvasElement | null;
  config: MediaTrackConstraints | null;

  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = null;
  }

  setVideoElement(videoElement: HTMLVideoElement): void {
    this.video = videoElement;
  }

  setCanvasElement(canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement;
  }

  // TODO [Basic] Tambahkan konfigurasi kamera untuk mendapatkan daftar perangkat input video
  // TODO [Basic] Dapatkan constraints kamera berdasarkan konfigurasi dan kamera yang dipilih
  async loadCameras(): Promise<MediaDeviceInfo[]> {
    return [];
  }

  // TODO [Basic] Memulai kamera dengan perangkat yang dipilih dan menampilkan pada elemen video
  async startCamera(selectedCameraId?: string): Promise<void> {}

  // TODO [Basic] Menghentikan siaran kamera dan membersihkan sumber daya
  stopCamera(): void {}

  // TODO [Skilled] Implementasikan metode untuk mengatur FPS kamera
  setFPS(fps: number): void {}

  // TODO [Basic] Periksa apakah kamera sedang aktif
  isActive(): boolean {
    return false;
  }

  // TODO [Basic] Periksa apakah elemen video siap untuk digunakan
  isReady(): boolean {
    return false;
  }
}