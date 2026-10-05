import React from 'react';
import { BookOpen, Sparkles, Library, BarChart3, Terminal, Camera, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scan' | 'library' | 'analytics' | 'docs';
  setActiveTab: (tab: 'scan' | 'library' | 'analytics' | 'docs') => void;
  libraryCount: number;
  onOpenQuickScan?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  libraryCount,
  onOpenQuickScan,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0e14]/90 backdrop-blur-md border-b border-amber-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('scan')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 p-0.5 shadow-lg shadow-amber-500/10 flex items-center justify-center">
              <div className="w-full h-full bg-[#12151e] rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-wide text-amber-100">
                  BiblioScan
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-amber-200/50 hidden sm:block">
                Catalogación bibliográfica inteligente
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Escanear</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'library'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Library className="w-4 h-4 text-amber-400" />
              <span>Mi Biblioteca</span>
              {libraryCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {libraryCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Estadísticas</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Prompt & Esquema</span>
              <span className="sm:hidden">API</span>
            </button>
          </nav>

          {/* Right Action / System Status */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">gemini-3.8-flash</span>
            </div>

            {onOpenQuickScan && (
              <button
                onClick={onOpenQuickScan}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-amber-600/20"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cámara</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
