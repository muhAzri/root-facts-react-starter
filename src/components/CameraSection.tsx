import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, ScanLine } from 'lucide-react';
import { TONE_CONFIG } from '../utils/config';
import type { AppServices } from '../hooks/useAppState';
import type { CameraType, ToneValue } from '../types';

interface CameraSectionProps {
  isRunning: boolean;
  onToggleCamera?: () => void;
  onToneChange?: (tone: ToneValue) => void;
  services: AppServices;
  modelStatus: string;
  error: string | null;
  currentTone: ToneValue;
}

function CameraSection({
  isRunning,
  onToggleCamera,
  onToneChange,
  services,
  modelStatus,
  error,
  currentTone
}: CameraSectionProps) {
  const [fps, setFps] = useState(30);
  const [cameraType, setCameraType] = useState<CameraType>('default');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (services.camera) {
      if (videoRef.current && !services.camera.video) {
        services.camera.setVideoElement(videoRef.current);
      }
      if (canvasRef.current && !services.camera.canvas) {
        services.camera.setCanvasElement(canvasRef.current);
      }
    }
  });

  useEffect(() => {
    if (services.camera) {
      services.camera.setFPS(fps);
    }
  }, [fps, services.camera]);

  const handleCameraChange = (newCameraType: CameraType) => {
    setCameraType(newCameraType);
    if (services.camera && services.camera.isActive()) {
      services.camera.startCamera();
    }
  };

  const handleFpsChange = (newFps: string) => {
    setFps(Number(newFps));
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTone = e.target.value as ToneValue;
    if (onToneChange) {
      onToneChange(newTone);
    }
  };

  const isModelReady = modelStatus === 'Model AI Siap';
  const buttonDisabled = !isModelReady;
  const buttonText = isRunning ? 'Stop Scan' : 'Mulai Scan';

  return (
    <section className="camera-section" aria-label="Camera Feed and Controls">
      <div className="camera-container">
        <div className="camera-wrapper">
          <video
            ref={videoRef}
            id="media-video"
            autoPlay
            muted
            playsInline
            className={isRunning ? '' : 'hidden'}
          />

          <canvas
            ref={canvasRef}
            id="media-canvas"
            className="hidden"
          />

          <div className={`camera-overlay ${isRunning ? 'active' : ''}`}>
            <div className="overlay-frame"></div>
          </div>

          {!isRunning && (
            <div className="camera-placeholder">
              <Camera size={48} />
              <p>Kamera tidak aktif</p>
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="camera-controls">
          <button
            id="btn-toggle"
            className={`capture-btn ${isRunning ? 'scanning' : ''}`}
            onClick={onToggleCamera}
            disabled={buttonDisabled}
            aria-label={buttonText}
            style={{ opacity: buttonDisabled ? 0.6 : 1 }}
          >
            <ScanLine size={24} />
          </button>
        </div>

        <div className="settings-bar">
          <div className="setting-item">
            <Camera size={16} />
            <select
              id="camera-select"
              value={cameraType}
              onChange={(e) => handleCameraChange(e.target.value as CameraType)}
              disabled={isRunning}
            >
              <option value="default">Belakang</option>
              <option value="front">Depan</option>
            </select>
          </div>

          <div className="setting-item fps-setting">
            <span id="fps-label">{fps} FPS</span>
            <input
              id="fps-slider"
              type="range"
              min="15"
              max="60"
              step="15"
              value={fps}
              onChange={(e) => handleFpsChange(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="setting-item tone-setting">
            <Mic size={16} />
            <select
              id="tone-select"
              value={currentTone || 'normal'}
              onChange={handleToneChange}
              disabled={isRunning}
            >
              {TONE_CONFIG.availableTones.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CameraSection;
