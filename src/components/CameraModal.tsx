import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Layers, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [guideMode, setGuideMode] = useState<'cover' | 'spine'>('cover');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Verificá los permisos del navegador o probá subiendo una imagen desde el archivo.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#141722] border border-amber-900/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#0e1017]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif-book font-semibold text-zinc-100 text-sm sm:text-base">
              Escanear libro con cámara
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Guide mode toggle */}
            <button
              type="button"
              onClick={() => setGuideMode((prev) => (prev === 'cover' ? 'spine' : 'cover'))}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Cambiar guía de encuadre"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Guía: {guideMode === 'cover' ? 'Tapa/Contratapa' : 'Lomo'}</span>
            </button>

            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Cambiar cámara"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Viewport with visual alignment frame */}
        <div className="relative flex-1 bg-black min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="text-zinc-200 font-medium mb-2">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-xs rounded-lg transition-colors"
              >
                Reintentar acceso
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Overlays */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {guideMode === 'cover' ? (
                  <div className="w-[68%] max-w-[340px] aspect-[3/4] border-2 border-dashed border-amber-400/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative flex flex-col justify-between p-3">
                    <span className="text-[11px] font-mono font-medium text-amber-300 bg-black/60 px-2 py-0.5 rounded self-center backdrop-blur-sm">
                      Encuadre: Tapa o Contratapa
                    </span>
                    <span className="text-[10px] text-zinc-300 text-center bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      Alineá el título y el código de barras (ISBN)
                    </span>
                  </div>
                ) : (
                  <div className="w-[34%] max-w-[170px] h-[82%] border-2 border-dashed border-amber-400/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative flex flex-col justify-between p-2">
                    <span className="text-[11px] font-mono font-medium text-amber-300 bg-black/60 px-1.5 py-0.5 rounded self-center backdrop-blur-sm text-center">
                      Guía Lomo
                    </span>
                    <span className="text-[10px] text-zinc-300 text-center bg-black/60 px-1 py-0.5 rounded backdrop-blur-sm">
                      Texto vertical
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer with Shutter */}
        <div className="p-4 bg-[#0e1017] border-t border-zinc-800 flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            Asegurá buena iluminación para un OCR óptimo.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={Boolean(cameraError)}
              onClick={handleCapture}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Tomar Foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
