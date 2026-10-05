import React, { useMemo, useState } from 'react';
import { CatalogItem } from '../types/book';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  Globe,
  Calendar,
  Tag,
  ShieldCheck,
  BookOpen,
  Hash,
  Sparkles,
  TrendingUp,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { SAMPLE_BOOKS } from '../data/sampleBooks';

interface LibraryAnalyticsProps {
  items: CatalogItem[];
  onAddSampleCollection?: () => void;
  onOpenScanTab: () => void;
}

// Warm, sophisticated palette matching the dark editorial aesthetic
const PALETTE = [
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#38bdf8', // Sky
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#fb923c', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#e2e8f0', // Slate
];

const CONFIDENCE_COLORS: Record<string, string> = {
  alta: '#10b981',
  media: '#f59e0b',
  baja: '#f43f5e',
};

// Custom dark tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#141724] border border-amber-900/40 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
        <p className="font-semibold text-zinc-200 mb-1">{label || data.name}</p>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color || data.fill || '#f59e0b' }}
          />
          <span className="text-zinc-400">Cantidad:</span>
          <span className="font-mono font-bold text-amber-300">{data.value}</span>
          {data.payload?.percentage !== undefined && (
            <span className="text-zinc-500 font-mono">({data.payload.percentage}%)</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const LibraryAnalytics: React.FC<LibraryAnalyticsProps> = ({
  items,
  onAddSampleCollection,
  onOpenScanTab,
}) => {
  const [timelineGrouping, setTimelineGrouping] = useState<'decade' | 'year'>('decade');

  // KPI Calculations
  const stats = useMemo(() => {
    const total = items.length;
    if (total === 0) {
      return {
        total: 0,
        languagesCount: 0,
        genresCount: 0,
        highConfidencePct: 0,
        withIsbnPct: 0,
        minYear: null,
        maxYear: null,
      };
    }

    const languages = new Set<string>();
    const genres = new Set<string>();
    let highConfCount = 0;
    let withIsbnCount = 0;
    const years: number[] = [];

    items.forEach((item) => {
      const meta = item.metadata;
      if (meta.idioma) languages.add(meta.idioma.trim().toLowerCase());
      if (meta.genero) genres.add(meta.genero.trim().toLowerCase());
      if (meta.confianza_deteccion === 'alta') highConfCount++;
      if (meta.isbn && meta.isbn.trim().length >= 8) withIsbnCount++;

      const parsedYear = parseInt(meta.anio?.replace(/[^0-9]/g, '') || '', 10);
      if (!isNaN(parsedYear) && parsedYear > 1000 && parsedYear <= 2030) {
        years.push(parsedYear);
      }
    });

    years.sort((a, b) => a - b);

    return {
      total,
      languagesCount: languages.size,
      genresCount: genres.size,
      highConfidencePct: Math.round((highConfCount / total) * 100),
      withIsbnPct: Math.round((withIsbnCount / total) * 100),
      minYear: years.length > 0 ? years[0] : null,
      maxYear: years.length > 0 ? years[years.length - 1] : null,
    };
  }, [items]);

  // 1. Language Distribution
  const languageData = useMemo(() => {
    const countMap: Record<string, number> = {};
    items.forEach((item) => {
      let lang = item.metadata.idioma?.trim() || 'No especificado';
      // Normalize common names
      const lower = lang.toLowerCase();
      if (lower.includes('español') || lower === 'es' || lower === 'spa') lang = 'Español';
      else if (lower.includes('inglés') || lower.includes('ingles') || lower === 'en' || lower === 'eng') lang = 'Inglés';
      else if (lower.includes('francés') || lower.includes('frances') || lower === 'fr' || lower === 'fra') lang = 'Francés';
      else if (lower.includes('alemán') || lower.includes('aleman') || lower === 'de' || lower === 'deu') lang = 'Alemán';
      else if (lower.includes('italiano') || lower === 'it' || lower === 'ita') lang = 'Italiano';
      else if (lower.includes('portugués') || lower.includes('portugues') || lower === 'pt') lang = 'Portugués';

      countMap[lang] = (countMap[lang] || 0) + 1;
    });

    const total = items.length || 1;
    return Object.entries(countMap)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
        color: PALETTE[index % PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  // 2. Year / Decade Distribution
  const timelineData = useMemo(() => {
    const countMap: Record<string, number> = {};

    items.forEach((item) => {
      const parsed = parseInt(item.metadata.anio?.replace(/[^0-9]/g, '') || '', 10);
      if (!isNaN(parsed) && parsed > 1800 && parsed <= 2030) {
        if (timelineGrouping === 'decade') {
          const decade = Math.floor(parsed / 10) * 10;
          const key = `${decade}s`;
          countMap[key] = (countMap[key] || 0) + 1;
        } else {
          const key = parsed.toString();
          countMap[key] = (countMap[key] || 0) + 1;
        }
      } else {
        const key = 'Sin fecha';
        countMap[key] = (countMap[key] || 0) + 1;
      }
    });

    return Object.entries(countMap)
      .map(([period, cantidad]) => ({
        period,
        cantidad,
      }))
      .sort((a, b) => {
        if (a.period === 'Sin fecha') return 1;
        if (b.period === 'Sin fecha') return -1;
        return a.period.localeCompare(b.period);
      });
  }, [items, timelineGrouping]);

  // 3. Genre Distribution
  const genreData = useMemo(() => {
    const countMap: Record<string, number> = {};

    items.forEach((item) => {
      let g = item.metadata.genero?.trim() || 'General / Sin clasificar';
      // Split comma separated genres if multiple
      const splitGenres = g.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
      const targetList = splitGenres.length > 0 ? splitGenres : ['General'];

      targetList.forEach((sub) => {
        // Capitalize first letter
        const formatted = sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
        countMap[formatted] = (countMap[formatted] || 0) + 1;
      });
    });

    return Object.entries(countMap)
      .map(([genre, cantidad]) => ({
        genre,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8); // Top 8 genres
  }, [items]);

  // 4. Detection Confidence Distribution
  const confidenceData = useMemo(() => {
    const counts = { alta: 0, media: 0, baja: 0 };
    items.forEach((item) => {
      const conf = item.metadata.confianza_deteccion;
      if (conf === 'alta' || conf === 'media' || conf === 'baja') {
        counts[conf]++;
      } else {
        counts.baja++;
      }
    });

    const total = items.length || 1;
    return [
      {
        name: 'Alta Certeza',
        value: counts.alta,
        percentage: Math.round((counts.alta / total) * 100),
        color: CONFIDENCE_COLORS.alta,
      },
      {
        name: 'Media (Inferencia)',
        value: counts.media,
        percentage: Math.round((counts.media / total) * 100),
        color: CONFIDENCE_COLORS.media,
      },
      {
        name: 'Baja / Revisar',
        value: counts.baja,
        percentage: Math.round((counts.baja / total) * 100),
        color: CONFIDENCE_COLORS.baja,
      },
    ].filter((d) => d.value > 0);
  }, [items]);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-[#161a28] via-[#121522] to-[#0c0e15] border border-amber-900/30 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Analítica de Colección con Recharts</span>
          </div>
          <h2 className="font-serif-book font-bold text-2xl sm:text-3xl text-zinc-100 tracking-tight">
            Panel Estadístico de la Biblioteca
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Visualización interactiva sobre la distribución lingüística, períodos de publicación,
            géneros catalogados y nivel de certeza OCR de los libros registrados.
          </p>
        </div>

        {onAddSampleCollection && items.length < 5 && (
          <button
            type="button"
            onClick={onAddSampleCollection}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer shadow-md"
            title="Cargar colección de prueba multilingüe y de diversas décadas"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Cargar libros de muestra para ver más datos</span>
          </button>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Libros */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121520] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Libros</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-serif-book font-bold text-zinc-100">
              {stats.total}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Obras registradas</p>
          </div>
        </div>

        {/* Idiomas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121520] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Idiomas</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-serif-book font-bold text-sky-300">
              {stats.languagesCount}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Lenguas en acervo</p>
          </div>
        </div>

        {/* Años abarcados */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121520] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cronología</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-serif-book font-bold text-emerald-300">
              {stats.minYear && stats.maxYear
                ? `${stats.minYear} – ${stats.maxYear}`
                : '1940 – Hoy'}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Rango de publicación</p>
          </div>
        </div>

        {/* ISBNs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121520] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Con ISBN</span>
            <Hash className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-serif-book font-bold text-purple-300">
              {stats.withIsbnPct}%
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Identificador detectado</p>
          </div>
        </div>

        {/* Calidad OCR */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#121520] border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Certeza Alta</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-serif-book font-bold text-amber-400">
              {stats.highConfidencePct}%
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Confianza máxima</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Distribución por Idiomas (Pie / Donut) */}
        <div className="lg:col-span-6 bg-[#121520] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-book font-bold text-base text-zinc-100">
                  Distribución por Idioma
                </h3>
                <p className="text-xs text-zinc-400">Lengua principal del texto analizado</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {languageData.length === 0 ? (
              <p className="text-xs text-zinc-500">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#0e111a"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                      <span className="text-xs text-zinc-300 font-medium">
                        {value} ({entry.payload?.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Calidad de Detección de Metadatos (Pie / Donut) */}
        <div className="lg:col-span-6 bg-[#121520] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-book font-bold text-base text-zinc-100">
                  Nivel de Confianza de Detección
                </h3>
                <p className="text-xs text-zinc-400">
                  Certeza basada en nitidez y texto visible de la foto
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {confidenceData.length === 0 ? (
              <p className="text-xs text-zinc-500">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {confidenceData.map((entry, index) => (
                      <Cell
                        key={`conf-${index}`}
                        fill={entry.color}
                        stroke="#0e111a"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                      <span className="text-xs text-zinc-300 font-medium">
                        {value} ({entry.payload?.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Años / Cronología de Publicación (BarChart / AreaChart) */}
        <div className="lg:col-span-7 bg-[#121520] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-book font-bold text-base text-zinc-100">
                  Cronología de Publicación
                </h3>
                <p className="text-xs text-zinc-400">
                  Distribución temporal de los libros catalogados
                </p>
              </div>
            </div>

            {/* Toggle grouping */}
            <div className="flex items-center bg-[#0e111a] border border-zinc-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setTimelineGrouping('decade')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timelineGrouping === 'decade'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Por Décadas
              </button>
              <button
                type="button"
                onClick={() => setTimelineGrouping('year')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timelineGrouping === 'year'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Por Años
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No hay información cronológica suficiente
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9" />
                      <stop offset="100%" stop-color="#b45309" stop-opacity="0.5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262b3d" vertical={false} />
                  <XAxis
                    dataKey="period"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="cantidad"
                    name="Obras publicadas"
                    fill="url(#yearGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Géneros Literarios y Materias (Horizontal BarChart) */}
        <div className="lg:col-span-5 bg-[#121520] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-book font-bold text-base text-zinc-100">
                  Géneros y Materias
                </h3>
                <p className="text-xs text-zinc-400">Temáticas más recurrentes</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {genreData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No hay géneros clasificados
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genreData}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="genreGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8" />
                      <stop offset="100%" stop-color="#c084fc" stop-opacity="1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262b3d" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="genre"
                    stroke="#cbd5e1"
                    fontSize={11}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="cantidad"
                    name="Libros"
                    fill="url(#genreGradient)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
