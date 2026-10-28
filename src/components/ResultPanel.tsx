import React from 'react';
import { SliceItem, PrizeConfig } from '../types/game';
import { Gift, Sparkles, Award, CheckCircle2, RotateCcw, UserPlus } from 'lucide-react';

interface ResultPanelProps {
  lastResult: {
    slice: SliceItem;
    prize?: PrizeConfig;
    isExtraChance?: boolean;
    pointEarned: number;
    throwCount?: number;
  } | null;
  isThrowing: boolean;
  chancesLeft: number;
  turnScore: number;
  personNumber: number;
  wonPrizes: { value: number; name: string; claimed: boolean }[];
  onClaimPrize: () => void;
  onNextPerson: () => void;
  onThrowAgain: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  lastResult,
  isThrowing,
  chancesLeft,
  turnScore,
  personNumber,
  wonPrizes,
  onClaimPrize,
  onNextPerson,
  onThrowAgain,
}) => {
  const hasWonPrizes = wonPrizes.length > 0;
  const allClaimed = hasWonPrizes && wonPrizes.every((p) => p.claimed);

  return (
    <div className="cartoon-card-arcade overflow-hidden text-slate-800 flex flex-col h-full shadow-lg bg-white">
      {/* Indigo Arcade Header Bar with Stars */}
      <div className="cartoon-header-indigo py-1.5 px-3 flex items-center justify-center gap-1.5 text-center shrink-0">
        <span className="text-yellow-300 text-sm">⭐</span>
        <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide uppercase">
          HASIL LEMPARAN
        </h2>
        <span className="text-yellow-300 text-sm">⭐</span>
      </div>

      {/* Main Content Area */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between overflow-hidden">
        {/* If Dart is actively flying */}
        {isThrowing ? (
          <div className="flex-1 flex flex-col items-center justify-center py-3 text-center animate-pulse">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-dashed border-red-500 flex items-center justify-center mb-2 bg-red-50">
              <span className="text-3xl sm:text-4xl animate-bounce">🎯</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-red-600">Dart Meluncur Cepat!</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Membidik 1 dari 25 bidang!</p>
          </div>
        ) : !lastResult ? (
          /* Initial Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
            {/* Dashed Circle with Question Mark */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-dashed border-sky-300 bg-sky-50/80 flex items-center justify-center shadow-inner mb-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-sky-600">?</span>
            </div>

            {/* Empty Pill */}
            <div className="w-20 sm:w-24 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-center text-slate-600 font-bold text-xs mb-2">
              -
            </div>

            {/* Helpful Guide Notice */}
            <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-2 text-center">
              <p className="text-[10px] sm:text-[11px] font-bold text-blue-900 leading-snug">
                Orang Ke-{personNumber} punya <span className="font-extrabold text-red-600">3 lemparan</span>. Tekan <span className="text-red-600 font-extrabold">LEMPAR DART</span> untuk membidik angka keberuntungan!
              </p>
            </div>
          </div>
        ) : (
          /* Active Result Display */
          <div className="flex-1 flex flex-col items-center justify-center py-1 text-center">
            {/* 1. NUMBER RESULT (Hit 20, 15, 10, or 5!) */}
            {lastResult.slice.type === 'number' && (
              <div className="w-full flex flex-col items-center">
                {/* Badge Circle with Points */}
                <div className="relative mb-1">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-white shadow-xl flex items-center justify-center animate-bounce ${
                      lastResult.slice.value === 20
                        ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-slate-950'
                        : lastResult.slice.value === 15
                        ? 'bg-gradient-to-b from-orange-400 to-amber-600 text-white'
                        : lastResult.slice.value === 10
                        ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white'
                        : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl font-black">
                      +{lastResult.slice.value}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 text-xl animate-spin" style={{ animationDuration: '6s' }}>
                    ✨
                  </div>
                </div>

                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-extrabold text-[10px] mb-1 animate-pulse">
                  🎉 DAPAT ANGKA {lastResult.slice.value}!
                </span>

                <h3 className="text-xs sm:text-sm font-black text-emerald-700 uppercase tracking-tight">
                  SELAMAT! KAMU MENDAPATKAN HADIAH
                </h3>

                {/* Prize Banner */}
                {lastResult.prize && (
                  <div className="mt-1 w-full bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border-2 border-amber-400 rounded-lg p-2 shadow-xs">
                    <div className="flex items-center justify-center gap-1 text-slate-900 font-black text-xs sm:text-sm">
                      <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{lastResult.prize.name}</span>
                    </div>
                    {lastResult.prize.description && (
                      <p className="text-[9px] text-slate-700 font-medium truncate mt-0.5">
                        {lastResult.prize.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. ZONK RESULT */}
            {lastResult.slice.type === 'zonk' && (
              <div className="w-full flex flex-col items-center py-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-100 border-3 border-rose-500 shadow-md flex items-center justify-center mb-1.5">
                  <span className="text-3xl sm:text-4xl">💥</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-rose-600 uppercase tracking-wider mb-0.5">
                  ZONK!
                </h3>

                <div className="w-full bg-rose-50 border border-rose-200 rounded-lg p-2 text-[10px] sm:text-[11px] font-bold text-rose-800 leading-snug">
                  Belum beruntung! Tetap semangat dan lempar lagi di kesempatan berikutnya!
                </div>
              </div>
            )}

            {/* 3. COBA LAGI RESULT */}
            {lastResult.slice.type === 'coba_lagi' && (
              <div className="w-full flex flex-col items-center py-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-100 border-3 border-purple-500 shadow-md flex items-center justify-center mb-1.5">
                  <span className="text-3xl sm:text-4xl">🎯</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-600 text-white rounded-full font-black text-[10px] uppercase mb-0.5 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  +1 Lemparan Ekstra
                </div>

                <h3 className="text-lg sm:text-xl font-black text-purple-700 uppercase tracking-tight">
                  COBA LAGI!
                </h3>

                <div className="w-full bg-purple-50 border border-purple-200 rounded-lg p-2 text-[10px] sm:text-[11px] font-bold text-purple-900 leading-snug">
                  Mendapatkan 1 lemparan ekstra! Ayo coba lempar sekali lagi!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons at Bottom */}
        <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5 shrink-0">
          {/* Claim Prize Button if won prizes exist */}
          {hasWonPrizes && (
            <button
              onClick={onClaimPrize}
              disabled={isThrowing}
              className={`w-full py-1.5 sm:py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wide transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                allClaimed
                  ? 'bg-emerald-600 text-white opacity-90 hover:bg-emerald-700'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 border border-amber-500 active:scale-98 animate-pulse'
              }`}
            >
              {allClaimed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  Hadiah Diklaim (Lihat Kupon)
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 text-slate-950" />
                  KLAIM HADIAH ({wonPrizes.length})
                </>
              )}
            </button>
          )}

          {/* When 3 chances are used up: Next person button */}
          {chancesLeft === 0 && !isThrowing ? (
            <div className="bg-sky-50 border border-sky-300 rounded-lg p-2 text-center space-y-1.5">
              <p className="text-[10px] font-bold text-sky-950">
                3 Lemparan Orang Ke-{personNumber} Selesai!
              </p>
              <button
                onClick={onNextPerson}
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-black text-xs uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                ORANG BERIKUTNYA (3 LEMPARAN)
              </button>
            </div>
          ) : lastResult && !isThrowing && chancesLeft > 0 ? (
            <button
              onClick={onThrowAgain}
              className="w-full py-1.5 px-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold text-[11px] uppercase transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Lanjut Lemparan ({chancesLeft} Sisa)
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
