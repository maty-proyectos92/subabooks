import React, { useState, useEffect } from 'react';
import { BookMetadata, CatalogItem } from './types/book';
import { Navbar } from './components/Navbar';
import { CameraModal } from './components/CameraModal';
import { ScannerZone } from './components/ScannerZone';
import { ExtractedMetadataCard } from './components/ExtractedMetadataCard';
import { LibraryCatalog } from './components/LibraryCatalog';
import { LibraryAnalytics } from './components/LibraryAnalytics';
import { SystemPromptPlayground } from './components/SystemPromptPlayground';
import { ensureJpegBase64 } from './utils/imageUtils';
import {
  Sparkles,
  BookOpen,
  Library,
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { SAMPLE_BOOKS } from './data/sampleBooks';

const LOCAL_STORAGE_KEY = 'biblioscan_library_items_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'library' | 'analytics' | 'docs'>('scan');
  const [library, setLibrary] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading library from localStorage:', e);
    }
    // Seed initial library with Borges sample so the library isn't empty on first glance
    const sample = SAMPLE_BOOKS[0];
    return [
      {
        id: 'seed-ficciones-1',
        createdAt: Date.now() - 3600000 * 24,
        imageDataUrl: sample.previewUrl,
        metadata: {
          titulo: 'Ficciones',
          autor: 'Jorge Luis Borges',
          isbn: '9789875666474',
          editorial: 'Editorial Sur',
          anio: '1944',
          idioma: 'Español',
          confianza_deteccion: 'alta',
          sinopsis:
            'Obra canónica de la literatura universal que reúne cuentos como El jardín de senderos que se bifurcan y La biblioteca de Babel.',
          genero: 'Ficción, Realismo Fantástico',
          tipo_captura: 'tapa',
        },
      },
    ];
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<BookMetadata | null>(null);
  const [isSavedCurrent, setIsSavedCurrent] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync library with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(library));
    } catch (e) {
      console.error('Error saving library to localStorage:', e);
    }
  }, [library]);

  const handleImageSelected = (base64Image: string) => {
    setSelectedImage(base64Image);
    setAnalyzedResult(null);
    setIsSavedCurrent(false);
    setErrorMessage(null);
  };

  const handleAnalyze = async (customPrompt?: string, systemInstructionOverride?: string) => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalyzedResult(null);

    try {
      const { dataUrl, mimeType } = await ensureJpegBase64(selectedImage);

      const response = await fetch('/api/catalog-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: dataUrl,
          mimeType,
          customPrompt,
          systemInstructionOverride,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al analizar la imagen del libro.');
      }

      setAnalyzedResult(data.data);
      setIsSavedCurrent(false);
    } catch (err: any) {
      console.error('Error during cataloging:', err);
      setErrorMessage(
        err?.message || 'Ocurrió un error al procesar la imagen con Gemini. Verificá la conexión.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToLibrary = (metadataToSave: BookMetadata) => {
    if (!selectedImage) return;

    const newItem: CatalogItem = {
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      imageDataUrl: selectedImage,
      metadata: metadataToSave,
    };

    setLibrary((prev) => [newItem, ...prev]);
    setIsSavedCurrent(true);
  };

  const handleDeleteLibraryItem = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateLibraryItem = (updated: CatalogItem) => {
    setLibrary((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setAnalyzedResult(null);
    setIsSavedCurrent(false);
    setErrorMessage(null);
  };

  const handleAddSampleCollection = () => {
    const newSamples: CatalogItem[] = [
      {
        id: `sample-cien-${Date.now()}-1`,
        createdAt: Date.now() - 3600000 * 48,
        imageDataUrl: SAMPLE_BOOKS[1].previewUrl,
        metadata: {
          titulo: 'Cien años de soledad',
          autor: 'Gabriel García Márquez',
          isbn: '9788437604947',
          editorial: 'Editorial Sudamericana',
          anio: '1967',
          idioma: 'Español',
          confianza_deteccion: 'alta',
          sinopsis: 'La epopeya de siete generaciones de los Buendía en el mítico pueblo de Macondo.',
          genero: 'Realismo Mágico',
          tipo_captura: 'lomo',
        },
      },
      {
        id: `sample-rayuela-${Date.now()}-2`,
        createdAt: Date.now() - 3600000 * 36,
        imageDataUrl: SAMPLE_BOOKS[2].previewUrl,
        metadata: {
          titulo: 'Rayuela',
          autor: 'Julio Cortázar',
          isbn: '9788466331906',
          editorial: 'Editorial Sudamericana',
          anio: '1963',
          idioma: 'Español',
          confianza_deteccion: 'alta',
          sinopsis: 'Novela lúdica y experimental que rompe con la linealidad tradicional.',
          genero: 'Novela Experimental',
          tipo_captura: 'tapa',
        },
      },
      {
        id: `sample-dune-${Date.now()}-3`,
        createdAt: Date.now() - 3600000 * 20,
        imageDataUrl: SAMPLE_BOOKS[3].previewUrl,
        metadata: {
          titulo: 'Dune',
          autor: 'Frank Herbert',
          isbn: '9788497596824',
          editorial: 'Debolsillo',
          anio: '1965',
          idioma: 'Inglés',
          confianza_deteccion: 'media',
          sinopsis: 'Obra maestra de la ciencia ficción ambientada en el planeta desértico Arrakis.',
          genero: 'Ciencia Ficción',
          tipo_captura: 'lomo',
        },
      },
      {
        id: `sample-principito-${Date.now()}-4`,
        createdAt: Date.now() - 3600000 * 12,
        imageDataUrl: SAMPLE_BOOKS[4].previewUrl,
        metadata: {
          titulo: 'El Principito (Le Petit Prince)',
          autor: 'Antoine de Saint-Exupéry',
          isbn: '9788498381498',
          editorial: 'Salamandra',
          anio: '1943',
          idioma: 'Francés',
          confianza_deteccion: 'alta',
          sinopsis: 'Cuento poético y filosófico sobre el valor de la amistad y los vínculos humanos.',
          genero: 'Cuento Filosófico',
          tipo_captura: 'tapa',
        },
      },
      {
        id: `sample-1984-${Date.now()}-5`,
        createdAt: Date.now() - 3600000 * 5,
        imageDataUrl: SAMPLE_BOOKS[0].previewUrl,
        metadata: {
          titulo: '1984',
          autor: 'George Orwell',
          isbn: '9788499890944',
          editorial: 'Secker & Warburg',
          anio: '1949',
          idioma: 'Inglés',
          confianza_deteccion: 'alta',
          sinopsis: 'Visión distópica y profética de un estado totalitario dominado por el Gran Hermano.',
          genero: 'Distopía Política',
          tipo_captura: 'tapa',
        },
      },
    ];

    setLibrary((prev) => {
      const existingTitles = new Set(prev.map((i) => i.metadata.titulo.toLowerCase()));
      const toAdd = newSamples.filter((s) => !existingTitles.has(s.metadata.titulo.toLowerCase()));
      return [...toAdd, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e6e8ec] flex flex-col selection:bg-amber-500/20 selection:text-amber-200">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        libraryCount={library.length}
        onOpenQuickScan={() => setIsCameraOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3 text-xs sm:text-sm shadow-xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">No se pudo catalogar el libro</p>
              <p className="text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs px-2 py-1 rounded"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Tab 1: Escanear / Analizar */}
        {activeTab === 'scan' && (
          <div className="flex flex-col gap-8">
            {/* Header Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181c2b] via-[#121522] to-[#0d0f17] border border-amber-900/30 p-6 sm:p-8 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Curaduría & OCR Multimodal con Gemini</span>
                </div>
                <h1 className="font-serif-book font-bold text-2xl sm:text-4xl text-zinc-100 tracking-tight leading-tight">
                  Catalogación Bibliográfica de Portadas y Lomos
                </h1>
                <p className="text-zinc-400 text-xs sm:text-base mt-2 leading-relaxed">
                  Identificá libros a partir de fotografías de su lomo, tapa, contratapa o solapa.
                  Extraé automáticamente <span className="text-amber-300">Título</span>,{' '}
                  <span className="text-amber-300">Autor</span>,{' '}
                  <span className="text-amber-300">ISBN</span>, Editorial, Año e Idioma en formato
                  JSON estructurado.
                </p>
              </div>

              {/* Decorative background glow */}
              <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Results card if analyzed */}
            {analyzedResult && selectedImage && (
              <ExtractedMetadataCard
                metadata={analyzedResult}
                imagePreviewUrl={selectedImage}
                onSaveToLibrary={handleSaveToLibrary}
                isSaved={isSavedCurrent}
                onClear={handleClearImage}
              />
            )}

            {/* Scanner Drop Zone */}
            <ScannerZone
              selectedImage={selectedImage}
              onImageSelected={handleImageSelected}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onOpenQuickScan={() => setIsCameraOpen(true)}
              onClearImage={handleClearImage}
            />
          </div>
        )}

        {/* Tab 2: Mi Biblioteca */}
        {activeTab === 'library' && (
          <LibraryCatalog
            items={library}
            onDeleteItem={handleDeleteLibraryItem}
            onUpdateItem={handleUpdateLibraryItem}
            onOpenScanTab={() => setActiveTab('scan')}
            onOpenAnalyticsTab={() => setActiveTab('analytics')}
          />
        )}

        {/* Tab 3: Estadísticas y Analítica con Recharts */}
        {activeTab === 'analytics' && (
          <LibraryAnalytics
            items={library}
            onAddSampleCollection={handleAddSampleCollection}
            onOpenScanTab={() => setActiveTab('scan')}
          />
        )}

        {/* Tab 4: Especificación & Documentación del Prompt */}
        {activeTab === 'docs' && <SystemPromptPlayground />}
      </main>

      {/* Camera Live Scan Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          handleImageSelected(dataUrl);
          setActiveTab('scan');
        }}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-800/80 bg-[#0a0c12] py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-amber-200/80">BiblioScan AI</span>
            <span>•</span>
            <span>Catalogador Bibliográfico Inteligente</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span>Modelo: gemini-3.8-flash</span>
            <span>•</span>
            <span>Formato: application/json</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
