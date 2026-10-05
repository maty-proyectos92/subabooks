import React, { useState } from 'react';
import { BookMetadata, ConfianzaDeteccion } from '../types/book';
import {
  BookmarkCheck,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Sparkles,
  Info,
  Calendar,
  Building,
  User,
  Hash,
  Globe,
  Tag,
  BookMarked,
} from 'lucide-react';

interface ExtractedMetadataCardProps {
  metadata: BookMetadata;
  imagePreviewUrl: string;
  onSaveToLibrary: (item: BookMetadata) => void;
  isSaved?: boolean;
  onClear: () => void;
}

export const ExtractedMetadataCard: React.FC<ExtractedMetadataCardProps> = ({
  metadata: initialMetadata,
  imagePreviewUrl,
  onSaveToLibrary,
  isSaved = false,
  onClear,
}) => {
  const [formData, setFormData] = useState<BookMetadata>(initialMetadata);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setFormData(initialMetadata);
  }, [initialMetadata]);

  const handleChange = (field: keyof BookMetadata, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyJson = () => {
    // Exact schema format required by user prompt
    const cleanOutput = {
      titulo: formData.titulo,
      autor: formData.autor,
      isbn: formData.isbn,
      editorial: formData.editorial,
      anio: formData.anio,
      idioma: formData.idioma,
      confianza_deteccion: formData.confianza_deteccion,
    };

    navigator.clipboard.writeText(JSON.stringify(cleanOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceBadge = (confidence: ConfianzaDeteccion) => {
    switch (confidence) {
      case 'alta':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Confianza Alta
          </span>
        );
      case 'media':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Confianza Media
          </span>
        );
      case 'baja':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Confianza Baja / Revisar
          </span>
        );
    }
  };

  const cleanIsbn = formData.isbn?.replace(/[^0-9X]/gi, '');

  return (
    <div className="bg-[#12151e] border border-amber-900/30 rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-950/40 via-[#181c29] to-[#12151e] border-b border-amber-900/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-book font-bold text-zinc-100 text-base sm:text-lg">
              Metadatos Bibliográficos Extraídos
            </h3>
            <p className="text-xs text-zinc-400">
              Datos analizados por Gemini Vision con OCR y catálogo contextual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getConfidenceBadge(formData.confianza_deteccion)}
          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showRawJson
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700'
            }`}
            title="Ver JSON de respuesta"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Ver JSON</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Visual thumbnail + Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative group rounded-xl overflow-hidden bg-black/60 border border-zinc-800 flex items-center justify-center aspect-[3/4] max-h-[380px]">
            <img
              src={imagePreviewUrl}
              alt="Muestra del libro analizado"
              className="w-full h-full object-contain p-2"
            />
            {formData.tipo_captura && (
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono uppercase tracking-wider text-amber-300 border border-amber-500/30">
                Toma: {formData.tipo_captura}
              </span>
            )}
          </div>

          {/* External lookup if ISBN is present */}
          {cleanIsbn && cleanIsbn.length >= 10 && (
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Verificación en bases de datos:
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://openlibrary.org/isbn/${cleanIsbn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Library</span>
                </a>
                <a
                  href={`https://books.google.com/books?vid=ISBN${cleanIsbn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sky-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Books</span>
                </a>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onSaveToLibrary(formData)}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isSaved
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Guardado en Mi Biblioteca</span>
                </>
              ) : (
                <>
                  <BookMarked className="w-4 h-4" />
                  <span>Guardar en Mi Biblioteca</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">¡JSON Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copiar JSON Extraído</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClear}
              className="py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Escanear otro libro
            </button>
          </div>
        </div>

        {/* Right column: Editable Metadata Fields */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {showRawJson ? (
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono-code text-xs text-amber-200/90 overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-zinc-400">
                <span>Estructura JSON (Respuesta Gemini 3.8 Flash):</span>
                <span className="text-[11px] text-zinc-500">application/json</span>
              </div>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Título */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-amber-300/80 mb-1.5 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                  <span>Título Completo</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-serif-book font-semibold text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Título del libro"
                />
              </div>

              {/* Autor */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nombre del Autor o Autores</span>
                </label>
                <input
                  type="text"
                  value={formData.autor}
                  onChange={(e) => handleChange('autor', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Ej. Jorge Luis Borges"
                />
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>ISBN-10 o ISBN-13</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => handleChange('isbn', e.target.value)}
                    className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="9789500768000"
                  />
                  {formData.isbn ? (
                    <span className="absolute right-3 top-2.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      Detectado
                    </span>
                  ) : (
                    <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-500">
                      Sin ISBN
                    </span>
                  )}
                </div>
              </div>

              {/* Editorial */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editorial</span>
                </label>
                <input
                  type="text"
                  value={formData.editorial}
                  onChange={(e) => handleChange('editorial', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Nombre de la editorial"
                />
              </div>

              {/* Año de Edición */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Año de Publicación</span>
                </label>
                <input
                  type="text"
                  value={formData.anio}
                  onChange={(e) => handleChange('anio', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Ej. 1944"
                />
              </div>

              {/* Idioma */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Idioma Principal</span>
                </label>
                <input
                  type="text"
                  value={formData.idioma}
                  onChange={(e) => handleChange('idioma', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Español, Inglés..."
                />
              </div>

              {/* Nivel de Confianza */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nivel de Confianza
                </label>
                <select
                  value={formData.confianza_deteccion}
                  onChange={(e) => handleChange('confianza_deteccion', e.target.value as ConfianzaDeteccion)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="alta">Alta (Identificación certera y nítida)</option>
                  <option value="media">Media (Inferencia basada en lomo/parcial)</option>
                  <option value="baja">Baja (Texto poco visible o ambiguo)</option>
                </select>
              </div>

              {/* Género literario */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Género / Materia</span>
                </label>
                <input
                  type="text"
                  value={formData.genero || ''}
                  onChange={(e) => handleChange('genero', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Ej. Ficción, Ensayo, Poesía..."
                />
              </div>

              {/* Sinopsis / Resumen */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sinopsis / Notas Bibliográficas</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.sinopsis || ''}
                  onChange={(e) => handleChange('sinopsis', e.target.value)}
                  className="w-full bg-[#181c28] border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                  placeholder="Breve reseña o información complementaria..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
