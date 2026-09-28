import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import CameraSection from './components/CameraSection';
import InfoPanel from './components/InfoPanel';
import { useAppState } from './hooks/useAppState';
import type { AppServices } from './hooks/useAppState';
import { CameraService } from './services/CameraService';
import { DetectionService } from './services/DetectionService';
import { RootFactsService } from './services/RootFactsService';
import { isValidDetection } from './utils/config';
import { getCameraErrorMessage, logError } from './utils/common';
import type { CameraType, ToneValue } from './types';

function App() {
  const { state, actions } = useAppState();
  const isRunningRef = useRef(false);
  const lastClassRef = useRef<string | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesRef = useRef<AppServices>({ detector: null, camera: null, generator: null });
  const [currentTone, setCurrentTone] = useState<ToneValue>('normal');
  const [copied, setCopied] = useState(false);

  // Inisialisasi layanan deteksi, kamera, dan generator fakta saat aplikasi dimuat
  useEffect(() => {
    let cancelled = false;

    const camera = new CameraService();
    const detector = new DetectionService();
    const generator = new RootFactsService();

    servicesRef.current = { camera, detector, generator };
    actions.setServices({ camera, detector, generator });

    const progress = { detector: 0, generator: 0 };
    const reportProgress = () => {
      if (cancelled) return;
      const overall = Math.round((progress.detector + progress.generator) / 2);
      if (overall < 100) {
        actions.setModelStatus(`Menunggu Model... ${overall}%`);
      }
    };

    (async () => {
      try {
        await detector.loadModel((percent) => {
          progress.detector = percent;
          reportProgress();
        });

        if (cancelled) return;

        await generator.loadModel((percent) => {
          progress.generator = percent;
          reportProgress();
        });

        if (!cancelled) {
          actions.setModelStatus('Model AI Siap');
        }
      } catch (error) {
        logError('Gagal memuat model AI', error);
        if (!cancelled) {
          actions.setModelStatus('Gagal Memuat Model');
          actions.setError('Gagal memuat model AI. Silakan muat ulang halaman.');
        }
      }
    })();

    // Bersihkan sumber daya saat komponen ditinggalkan
    return () => {
      cancelled = true;
      isRunningRef.current = false;
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      camera.stopCamera();
    };
  }, []);

  // Fungsi untuk memulai loop deteksi
  const detectFrame = async () => {
    if (!isRunningRef.current) return;

    const { detector, camera, generator } = servicesRef.current;

    if (detector?.isLoaded() && camera?.isReady()) {
      try {
        const result = await detector.predict(camera.video!);

        if (result && isValidDetection(result)) {
          actions.setDetectionResult(result);

          if (lastClassRef.current !== result.className) {
            lastClassRef.current = result.className;
            actions.setAppState('analyzing');
            actions.setFunFactData(null);

            generator
              ?.generateFacts(result.className)
              .then((fact) => {
                if (!isRunningRef.current) return;
                actions.setFunFactData(fact ?? 'error');
                actions.setAppState('result');
              })
              .catch((error) => {
                logError('Gagal membuat fun fact', error);
                if (!isRunningRef.current) return;
                actions.setFunFactData('error');
                actions.setAppState('result');
              });
          }
        } else if (lastClassRef.current !== null) {
          lastClassRef.current = null;
          actions.resetResults();
        }
      } catch (error) {
        logError('Gagal melakukan prediksi', error);
      }
    }

    if (isRunningRef.current) {
      const fps = camera?.fps ?? 30;
      loopTimeoutRef.current = setTimeout(detectFrame, 1000 / fps);
    }
  };

  // Fungsi untuk memulai dan menghentikan kamera
  const handleToggleCamera = async (cameraType: CameraType) => {
    const { camera } = servicesRef.current;
    if (!camera) return;

    if (state.isRunning) {
      isRunningRef.current = false;
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      camera.stopCamera();
      lastClassRef.current = null;
      actions.setRunning(false);
      actions.resetResults();
      return;
    }

    try {
      actions.setError(null);
      await camera.startCamera(cameraType);
      actions.setRunning(true);
      isRunningRef.current = true;
      detectFrame();
    } catch (error) {
      logError('Gagal memulai kamera', error);
      actions.setError(getCameraErrorMessage(error as { name?: string }));
    }
  };

  // Fungsi untuk mengubah nada fakta yang dihasilkan
  const handleToneChange = (tone: ToneValue) => {
    setCurrentTone(tone);
    servicesRef.current.generator?.setTone(tone);
  };

  // Fungsi untuk menyalin fakta ke clipboard
  const handleCopyFact = async () => {
    if (!state.funFactData || state.funFactData === 'error') return;

    try {
      await navigator.clipboard.writeText(state.funFactData);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      logError('Gagal menyalin fakta', error);
    }
  };

  return (
    <div className="app-container">
      <Header modelStatus={state.modelStatus} />

      <main className="main-content">
        <CameraSection
          isRunning={state.isRunning}
          onToggleCamera={handleToggleCamera}
          onToneChange={handleToneChange}
          services={state.services}
          modelStatus={state.modelStatus}
          error={state.error}
          currentTone={currentTone}
        />

        <InfoPanel
          appState={state.appState}
          detectionResult={state.detectionResult}
          funFactData={state.funFactData}
          error={state.error}
          onCopyFact={handleCopyFact}
          copied={copied}
        />
      </main>

      <footer className="footer">
        <p>Powered by TensorFlow.js & Transformers.js</p>
      </footer>

      {state.error && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '380px',
          padding: '0.875rem 1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: '#991b1b',
          fontSize: '0.8125rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000
        }}>
          <strong>Error:</strong> {state.error}
          <button
            onClick={() => actions.setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#991b1b',
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
