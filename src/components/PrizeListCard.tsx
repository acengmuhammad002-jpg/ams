import React from 'react';
import { PrizeConfig } from '../types/game';

interface PrizeListCardProps {
  prizes: PrizeConfig[];
}

export const PrizeListCard: React.FC<PrizeListCardProps> = ({ prizes }) => {
  const getBadgeStyle = (val: number) => {
    switch (val) {
      case 20:
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300';
      case 15:
        return 'bg-orange-500 text-white border-orange-400';
      case 10:
        return 'bg-blue-500 text-white border-blue-400';
      case 5:
        return 'bg-emerald-500 text-white border-emerald-400';
      default:
        return 'bg-purple-500 text-white border-purple-400';
    }
  };

  return (
    <div className="cartoon-card-arcade overflow-hidden text-slate-800 shadow-lg flex flex-col">
      {/* Emerald Arcade Header Bar */}
      <div className="cartoon-header-emerald py-1.5 px-3 flex items-center justify-center gap-1.5 shrink-0">
        <span className="text-sm sm:text-base" role="img" aria-label="gift">
          🎁
        </span>
        <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide uppercase">
          DAFTAR HADIAH
        </h2>
      </div>

      {/* Prize List Items */}
      <div className="p-2 space-y-1 bg-white">
        {prizes.map((prize) => (
          <div
            key={prize.value}
            className="flex items-center gap-2 bg-slate-50 hover:bg-amber-50/70 rounded-lg px-2 py-1 border border-slate-200 shadow-2xs transition-colors"
          >
            {/* Number Pill matching wheel color */}
            <span
              className={`w-10 py-0.5 rounded-md font-black text-[11px] text-center shadow-xs border ${getBadgeStyle(
                prize.value
              )}`}
            >
              {prize.value}
            </span>

            {/* Prize Label & Description */}
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-extrabold text-slate-900 truncate">
                {prize.name}
              </span>
              {prize.description && (
                <span className="block text-[9px] text-slate-500 truncate leading-none">
                  {prize.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
