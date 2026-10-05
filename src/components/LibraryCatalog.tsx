import React, { useState, useMemo } from 'react';
import { CatalogItem, ConfianzaDeteccion } from '../types/book';
import {
  Search,
  Download,
  Trash2,
  ExternalLink,
  BookOpen,
  Filter,
  FileSpreadsheet,
  FileJson,
  FileText,
  Calendar,
  Building,
  User,
  Hash,
  Globe,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  BarChart3,
} from 'lucide-react';

interface LibraryCatalogProps {
  items: CatalogItem[];
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: CatalogItem) => void;
  onSelectForView?: (item: CatalogItem) => void;
  onOpenScanTab: () => void;
  onOpenAnalyticsTab?: () => void;
}

export const LibraryCatalog: React.FC<LibraryCatalogProps> = ({
  items,
  onDeleteItem,
  onUpdateItem,
  onSelectForView,
  onOpenScanTab,
  onOpenAnalyticsTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Extract unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    items.forEach((item) => {
      if (item.metadata.idioma) {
        langs.add(item.metadata.idioma);
      }
    });
    return Array.from(langs);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchTerm.toLowerCase();
      const meta = item.metadata;
      const matchesSearch =
        meta.titulo.toLowerCase().includes(q) ||
        meta.autor.toLowerCase().includes(q) ||
        meta.editorial.toLowerCase().includes(q) ||
        meta.isbn.toLowerCase().includes(q) ||
        (meta.genero && meta.genero.toLowerCase().includes(q));

      const matchesConfidence =
        filterConfidence === 'all' || meta.confianza_deteccion === filterConfidence;

      const matchesLanguage =
        filterLanguage === 'all' || meta.idioma.toLowerCase() === filterLanguage.toLowerCase();

      return matchesSearch && matchesConfidence && matchesLanguage;
    });
  }, [items, searchTerm, filterConfidence, filterLanguage]);

  // Export to JSON
  const handleExportJson = () => {
    const exportData = items.map((item) => ({
      titulo: item.metadata.titulo,
      autor: item.metadata.autor,
      isbn: item.metadata.isbn,
      editorial: item.metadata.editorial,
      anio: item.metadata.anio,
      idioma: item.metadata.idioma,
      confianza_deteccion: item.metadata.confianza_deteccion,
      sinopsis: item.metadata.sinopsis || '',
      genero: item.metadata.genero || '',
      fecha_catalogado: new Date(item.createdAt).toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca_catalogo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Titulo',
      'Autor',
      'ISBN',
      'Editorial',
      'Anio',
      'Idioma',
      'Confianza',
      'Genero',
      'Fecha',
    ];

    const rows = items.map((item) => [
      `"${item.metadata.titulo.replace(/"/g, '""')}"`,
      `"${item.metadata.autor.replace(/"/g, '""')}"`,
      `"${item.metadata.isbn}"`,
      `"${item.metadata.editorial.replace(/"/g, '""')}"`,
      `"${item.metadata.anio}"`,
      `"${item.metadata.idioma}"`,
      `"${item.metadata.confianza_deteccion}"`,
      `"${(item.metadata.genero || '').replace(/"/g, '""')}"`,
      `"${new Date(item.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca_catalogo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to BibTeX
  const handleExportBibTex = () => {
    const bibtexEntries = items.map((item) => {
      const citeKey = `${item.metadata.autor.split(' ')[0] || 'libro'}${item.metadata.anio || 's_f'}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      return `@book{${citeKey},
  title = {${item.metadata.titulo}},
  author = {${item.metadata.autor}},
  year = {${item.metadata.anio}},
  publisher = {${item.metadata.editorial}},
  isbn = {${item.metadata.isbn}},
  language = {${item.metadata.idioma}}
}`;
    });

    const blob = new Blob([bibtexEntries.join('\n\n')], {
      type: 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliografia_${new Date().toISOString().slice(0, 10)}.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceBadge = (confidence: ConfianzaDeteccion) => {
    switch (confidence) {
      case 'alta':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Media
          </span>
        );
      case 'baja':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Baja
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Export controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12151e] border border-zinc-800">
        <div>
          <h2 className="font-serif-book font-bold text-xl sm:text-2xl text-zinc-100 flex items-center gap-2">
            <span>Catálogo Bibliográfico</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {items.length} {items.length === 1 ? 'libro' : 'libros'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Registro estructurado de libros catalogados a partir de fotografías y lomos.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {onOpenAnalyticsTab && (
              <button
                type="button"
                onClick={onOpenAnalyticsTab}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-colors"
                title="Ver gráficos interactivos de la biblioteca"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Estadísticas</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
              title="Descargar base de datos en JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
              title="Descargar tabla compatible con Excel/Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportBibTex}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
              title="Descargar citas en formato BibTeX"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>BibTeX</span>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty Catalog state */
        <div className="p-12 text-center rounded-3xl bg-[#10131d]/60 border border-zinc-800 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif-book text-lg font-bold text-zinc-100">
              Tu biblioteca aún está vacía
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-1">
              Escaneá la portada o el lomo de un libro con la cámara o seleccioná uno de los
              ejemplos para extraer los metadatos bibliográficos automáticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenScanTab}
            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20"
          >
            Comenzar a escanear
          </button>
        </div>
      ) : (
        /* Search, Filter & Items List */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, autor, editorial, ISBN o género..."
                className="w-full bg-[#141724] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <select
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value)}
                className="bg-[#141724] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todas las confianzas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>

              {availableLanguages.length > 1 && (
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="bg-[#141724] border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Todos los idiomas</option>
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              )}

              {/* View switcher */}
              <div className="flex items-center bg-[#141724] border border-zinc-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Cuadrícula
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#12151e] border border-zinc-800 text-zinc-400 text-xs">
              No se encontraron libros que coincidan con la búsqueda.
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const cleanIsbn = item.metadata.isbn?.replace(/[^0-9X]/gi, '');
                return (
                  <div
                    key={item.id}
                    className="group bg-[#121520] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40"
                  >
                    <div>
                      {/* Visual header */}
                      <div className="flex gap-3.5 mb-3">
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-black/60 border border-zinc-800 shrink-0 flex items-center justify-center p-1">
                          <img
                            src={item.imageDataUrl}
                            alt={item.metadata.titulo}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              {getConfidenceBadge(item.metadata.confianza_deteccion)}
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4
                              className="font-serif-book font-bold text-sm sm:text-base text-zinc-100 truncate group-hover:text-amber-200"
                              title={item.metadata.titulo}
                            >
                              {item.metadata.titulo}
                            </h4>
                            <p className="text-xs text-amber-300/80 truncate">
                              {item.metadata.autor}
                            </p>
                          </div>

                          <div className="text-[11px] text-zinc-400 flex flex-col gap-0.5">
                            <span className="truncate">
                              {item.metadata.editorial} {item.metadata.anio ? `(${item.metadata.anio})` : ''}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 truncate">
                              ISBN: {item.metadata.isbn || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.metadata.sinopsis && (
                        <p className="text-xs text-zinc-400 line-clamp-2 italic mb-3">
                          "{item.metadata.sinopsis}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {cleanIsbn && cleanIsbn.length >= 10 && (
                          <a
                            href={`https://openlibrary.org/isbn/${cleanIsbn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 text-xs transition-colors"
                            title="Ver en Open Library"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {item.metadata.genero && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                            {item.metadata.genero}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#121520]">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#0e1017] text-zinc-400 uppercase text-[10px] tracking-wider font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Miniatura</th>
                    <th className="px-4 py-3">Título & Autor</th>
                    <th className="px-4 py-3">Editorial / Año</th>
                    <th className="px-4 py-3">ISBN</th>
                    <th className="px-4 py-3">Idioma</th>
                    <th className="px-4 py-3">Confianza</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="w-10 h-14 rounded overflow-hidden bg-black/40 border border-zinc-800 flex items-center justify-center p-0.5">
                          <img
                            src={item.imageDataUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 max-w-[220px]">
                        <p className="font-serif-book font-bold text-zinc-100 truncate">
                          {item.metadata.titulo}
                        </p>
                        <p className="text-zinc-400 truncate">{item.metadata.autor}</p>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <p className="text-zinc-200">{item.metadata.editorial}</p>
                        <p className="text-zinc-400">{item.metadata.anio || '-'}</p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                        {item.metadata.isbn || '—'}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{item.metadata.idioma}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {getConfidenceBadge(item.metadata.confianza_deteccion)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                          title="Eliminar libro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
