import type { CameraType } from '../types';

export class CameraService {
  stream: MediaStream | null;
  video: HTMLVideoElement | null;
  canvas: HTMLCanvasElement | null;
  config: MediaTrackConstraints | null;
  fps: number;

  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = null;
    this.fps = 30;
  }

  setVideoElement(videoElement: HTMLVideoElement): void {
    this.video = videoElement;
  }

  setCanvasElement(canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement;
  }

  async loadCameras(): Promise<MediaDeviceInfo[]> {
    this.config = {
      width: { ideal: 640 },
      height: { ideal: 480 }
    };

    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
  }

  getConstraints(cameraType: CameraType = 'default'): MediaStreamConstraints {
    return {
      video: {
        ...this.config,
        facingMode: cameraType === 'front' ? 'user' : 'environment',
        frameRate: { ideal: this.fps }
      },
      audio: false
    };
  }

  async startCamera(cameraType: CameraType = 'default'): Promise<void> {
    this.stopCamera();

    if (!this.config) {
      await this.loadCameras();
    }

    const constraints = this.getConstraints(cameraType);
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (this.video) {
      this.video.srcObject = this.stream;
      await this.video.play();
    }
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  setFPS(fps: number): void {
    this.fps = fps;

    const [track] = this.stream?.getVideoTracks() ?? [];
    if (track?.applyConstraints) {
      track.applyConstraints({ frameRate: { ideal: fps } }).catch(() => {
        // Sebagian perangkat/browser tidak mendukung penyesuaian frameRate secara langsung.
        // FPS tetap dikendalikan lewat interval loop deteksi di sisi aplikasi.
      });
    }
  }

  isActive(): boolean {
    return Boolean(this.stream?.getVideoTracks().some((track) => track.readyState === 'live'));
  }

  isReady(): boolean {
    return Boolean(this.video && this.video.readyState >= 2 && this.video.videoWidth > 0);
  }
}
