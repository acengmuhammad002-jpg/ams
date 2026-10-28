import React from 'react';
import { Volume2, VolumeX, Music, Settings, Maximize2, Minimize2, Sparkles, RotateCcw } from 'lucide-react';

interface TopHeaderProps {
  gameTitle: string;
  subTitle: string;
  personNumber: number;
  chancesLeft: number;
  maxChances: number;
  turnScore: number;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onOpenAdminModal: () => void;
  onResetSession: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  gameTitle,
  subTitle,
  personNumber,
  chancesLeft,
  maxChances,
  turnScore,
  soundEnabled,
  bgmEnabled,
  onToggleSound,
  onToggleBgm,
  onOpenAdminModal,
  onResetSession,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="relative w-full px-2 sm:px-4 pt-1 sm:pt-2 shrink-0">
      {/* Top Row: Left Person Badge, Center Banner, Right Status & Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Orang Ke-X Badge (No forced name queue) */}
        <div className="flex items-center gap-1.5 shrink-0 z-20">
          <div className="flex items-center gap-2 bg-white/95 px-3 py-1 sm:py-1.5 rounded-2xl border-2 sm:border-3 border-blue-500 shadow-md">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs sm:text-sm">
              👤
            </div>
            <div className="text-left">
              <span className="block text-[8px] sm:text-[9px] text-slate-500 font-semibold leading-none">Giliran:</span>
              <span className="block text-xs sm:text-sm font-black text-blue-950 leading-tight">
                Orang Ke-{personNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Vibrant Blue & Gold Arcade Banner (NO BROWN) */}
        <div className="relative text-center py-0.5 sm:py-1 z-10 mx-auto">
          {/* Decorative bunting flags */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-48 sm:w-80 flex justify-between pointer-events-none opacity-90">
            <div className="w-3 sm:w-4 h-4 sm:h-5 bg-pink-500 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
            <div className="w-3 sm:w-4 h-4 sm:h-5 bg-yellow-400 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
            <div className="w-3 sm:w-4 h-4 sm:h-5 bg-emerald-500 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
            <div className="w-3 sm:w-4 h-4 sm:h-5 bg-blue-500 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
            <div className="w-3 sm:w-4 h-4 sm:h-5 bg-purple-500 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
            <div className="w-3 sm:w-4 h-4 sm:h-5 bg-rose-500 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
          </div>

          {/* Arcade Signboard */}
          <div className="relative inline-block px-5 sm:px-9 py-1 sm:py-2 bg-gradient-to-b from-blue-600 via-indigo-600 to-indigo-800 border-3 sm:border-4 border-[#0f172a] rounded-2xl sm:rounded-3xl shadow-[0_4px_0_#020617,0_8px_16px_rgba(0,0,0,0.35)]">
            {/* Left Stuck Red Dart */}
            <div className="absolute -left-3 sm:-left-4 -top-2 sm:-top-3 w-7 h-7 sm:w-9 sm:h-9 pointer-events-none drop-shadow -rotate-12">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <polygon points="20,5 35,2 30,15" fill="#ef4444" stroke="#450a0a" strokeWidth="1.5" />
                <polygon points="20,5 30,15 25,25" fill="#dc2626" stroke="#450a0a" strokeWidth="1.5" />
                <line x1="25" y1="20" x2="10" y2="35" stroke="#ffffff" strokeWidth="3" />
                <circle cx="10" cy="35" r="3" fill="#cbd5e1" />
              </svg>
            </div>

            {/* Right Red Dart Target */}
            <div className="absolute -right-2 sm:-right-3 -top-1.5 sm:-top-2 w-6 h-6 sm:w-8 sm:h-8 pointer-events-none drop-shadow rotate-12">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <circle cx="20" cy="20" r="14" fill="#ef4444" />
                <circle cx="20" cy="20" r="9" fill="#ffffff" />
                <circle cx="20" cy="20" r="4" fill="#dc2626" />
              </svg>
            </div>

            {/* Big Cartoon 3D Title */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-wider uppercase cartoon-title select-none leading-none">
              {gameTitle}
            </h1>

            {/* Subtitle Ribbon */}
            <div className="mt-0.5 inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-0.5 bg-sky-50 rounded-full border border-sky-300 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
              <p className="text-[9px] sm:text-[11px] font-extrabold text-blue-900 tracking-tight">
                {subTitle}
              </p>
              <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Right: Badges & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-20">
          {/* Kesempatan Badge (Strictly 3 Darts per person) */}
          <div className="flex items-center gap-1.5 bg-white/95 px-2 sm:px-3 py-1 rounded-xl border-2 border-amber-400 shadow-sm">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <span className="text-xs sm:text-sm">⭐</span>
            </div>
            <div>
              <span className="block text-[8px] sm:text-[9px] text-slate-500 font-semibold leading-none">
                Kesempatan (3x):
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: Math.max(chancesLeft, maxChances) }).map((_, idx) => {
                  const isActive = idx < chancesLeft;
                  return (
                    <div
                      key={`chance-${idx}`}
                      className={`transition-all duration-300 ${
                        isActive ? 'scale-105 drop-shadow' : 'opacity-25 grayscale'
                      }`}
                      title={isActive ? 'Dart Siap' : 'Dart Terpakai'}
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                        <path
                          d="M19 5 L21 2 L18 4 L14 8 L9 9 L15 15 L16 10 Z"
                          fill={isActive ? '#EF4444' : '#94A3B8'}
                          stroke={isActive ? '#450A0A' : '#475569'}
                          strokeWidth="1"
                        />
                        <line x1="9" y1="9" x2="3" y2="15" stroke={isActive ? '#3B82F6' : '#94A3B8'} strokeWidth="2" />
                        <polygon points="3,15 2,22 9,21" fill={isActive ? '#EF4444' : '#64748B'} />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Poin Badge */}
          <div className="flex items-center gap-1.5 bg-white/95 px-2 sm:px-3 py-1 rounded-xl border-2 border-yellow-400 shadow-sm">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs sm:text-sm shadow-inner">
              🪙
            </div>
            <div>
              <span className="block text-[8px] sm:text-[9px] text-slate-500 font-semibold leading-none">
                Poin:
              </span>
              <span className="block text-xs sm:text-base font-black text-slate-900 tabular-nums leading-tight">
                {turnScore}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-1">
            {/* Tombol Musik Pengiring (BGM) */}
            <button
              onClick={onToggleBgm}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                bgmEnabled
                  ? 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200'
                  : 'bg-slate-200 border-slate-300 text-slate-500'
              }`}
              title={bgmEnabled ? 'Matikan Musik Pengiring (BGM)' : 'Nyalakan Musik Pengiring (BGM)'}
            >
              <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[9px] font-black hidden xl:inline">
                {bgmEnabled ? 'MUSIK' : 'MUTE'}
              </span>
            </button>

            {/* Tombol Efek Suara (SFX) */}
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-100 border-amber-300 text-amber-950 hover:bg-amber-200'
                  : 'bg-slate-200 border-slate-300 text-slate-500'
              }`}
              title={soundEnabled ? 'Matikan Efek Suara (SFX)' : 'Nyalakan Efek Suara (SFX)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Tombol Muat Ulang / Reset Permainan */}
            <button
              onClick={() => {
                onResetSession();
              }}
              className="group p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 border-2 border-sky-400 text-sky-950 shadow-xs transition-all active:scale-90 cursor-pointer flex items-center justify-center"
              title="Muat Ulang / Reset Lemparan ke Awal"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-active:rotate-180 transition-transform duration-300" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/80 border border-slate-300 text-slate-700 hover:bg-white transition-all cursor-pointer hidden sm:flex"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            <button
              onClick={onOpenAdminModal}
              className="p-1.5 rounded-lg bg-indigo-600 border border-indigo-900 text-white hover:bg-indigo-500 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Pengaturan Guru / Penyelenggara (PIN)"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
