import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Library,
} from 'lucide-react';
import { SAMPLE_BOOKS, SampleBook } from '../data/sampleBooks';

interface ScannerZoneProps {
  onImageSelected: (base64Image: string) => void;
  selectedImage: string | null;
  onAnalyze: (customPrompt?: string, systemInstructionOverride?: string) => void;
  isAnalyzing: boolean;
  onOpenQuickScan: () => void;
  onClearImage: () => void;
}

export const ScannerZone: React.FC<ScannerZoneProps> = ({
  onImageSelected,
  selectedImage,
  onAnalyze,
  isAnalyzing,
  onOpenQuickScan,
  onClearImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(
    'Analizá la imagen adjunta del libro y extraé los metadatos bibliográficos según el esquema JSON definido.'
  );
  const [systemInstructionOverride, setSystemInstructionOverride] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor arrastrá una imagen válida (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleBook) => {
    onImageSelected(sample.previewUrl);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload & Drop Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all p-6 sm:p-10 text-center flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-amber-400 bg-amber-500/10 scale-[1.005]'
            : selectedImage
            ? 'border-amber-600/40 bg-[#12151f]/80'
            : 'border-zinc-800 hover:border-amber-600/50 bg-[#10131d]/60 hover:bg-[#121522]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {selectedImage ? (
          /* Preview state */
          <div className="w-full flex flex-col items-center gap-6">
            <div className="relative group max-w-sm rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black/40">
              <img
                src={selectedImage}
                alt="Imagen de libro seleccionada"
                className="max-h-[320px] w-auto object-contain mx-auto"
              />
              <button
                type="button"
                onClick={onClearImage}
                className="absolute top-3 right-3 px-2.5 py-1 text-xs rounded-lg bg-black/80 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 backdrop-blur-md transition-colors"
              >
                Cambiar foto
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() =>
                  onAnalyze(
                    customPrompt !== 'Analizá la imagen adjunta del libro y extraé los metadatos bibliográficos según el esquema JSON definido.'
                      ? customPrompt
                      : undefined,
                    systemInstructionOverride.trim() ? systemInstructionOverride : undefined
                  )
                }
                className="w-full flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analizando con Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Extraer Metadatos con Gemini</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium border border-zinc-700 transition-colors"
                title="Subir otro archivo"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            {/* Analysis progress indicators if running */}
            {isAnalyzing && (
              <div className="w-full max-w-md bg-zinc-950/70 border border-amber-900/30 rounded-xl p-4 flex flex-col gap-2.5 text-left text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Ejecutando OCR visual sobre portada / lomo...</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Identificando título, autor, editorial y año</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Detección de código de barras / ISBN-10 / ISBN-13</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generando esquema JSON tipado (gemini-3.8-flash)</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Initial state */
          <div className="flex flex-col items-center gap-4 max-w-lg">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <ImageIcon className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif-book text-xl font-bold text-zinc-100 mb-1">
                Subí la foto de un libro
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Arrastrá una imagen de la <span className="text-amber-300 font-semibold">tapa</span>,{' '}
                <span className="text-amber-300 font-semibold">lomo</span>,{' '}
                <span className="text-amber-300 font-semibold">contratapa</span> o solapa.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Examinar archivo</span>
              </button>

              <button
                type="button"
                onClick={onOpenQuickScan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm border border-zinc-700 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Usar Cámara en vivo</span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono pt-1">
              Formatos soportados: JPG, PNG, WEBP (hasta 25MB)
            </p>
          </div>
        )}
      </div>

      {/* Preset Sample Books for instant 1-click test */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              O probá al instante con estos ejemplos bibliográficos:
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Click para cargar y analizar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SAMPLE_BOOKS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="group text-left p-2.5 rounded-xl bg-[#131622] hover:bg-[#181c2c] border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/60 border border-zinc-800/80 flex items-center justify-center p-1 group-hover:scale-[1.02] transition-transform">
                <img
                  src={sample.previewUrl}
                  alt={sample.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 block truncate">
                  {sample.typeLabel}
                </span>
                <p className="font-serif-book font-bold text-xs text-zinc-200 truncate group-hover:text-amber-200">
                  {sample.name}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {sample.authorHint}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Prompt / System Instruction Customization */}
      <div className="border border-zinc-800/80 rounded-2xl bg-[#11131e]/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Configuración de Prompt & Instrucciones de Sistema (Opcional)</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-5 border-t border-zinc-800 flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Prompt de usuario enviado a Gemini Vision:
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-[#181c28] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Sobrescribir System Instructions (por defecto usa las reglas del curador):
              </label>
              <textarea
                rows={4}
                value={systemInstructionOverride}
                onChange={(e) => setSystemInstructionOverride(e.target.value)}
                placeholder="Dejar vacío para usar las instrucciones del sistema configuradas por defecto..."
                className="w-full bg-[#181c28] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 font-mono text-[11px] focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
