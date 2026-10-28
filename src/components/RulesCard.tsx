import React from 'react';

export const RulesCard: React.FC = () => {
  const steps = [
    { num: 1, bg: 'bg-blue-500', text: 'Setiap orang punya kesempatan 3 kali lempar.' },
    { num: 2, bg: 'bg-emerald-500', text: 'Papan berisi angka 20, 15, 10, 5, ZONK & COBA LAGI.' },
    { num: 3, bg: 'bg-amber-500', text: 'Dapatkan angka keberuntungan untuk memenangkan hadiah!' },
    { num: 4, bg: 'bg-rose-500', text: 'Jika ZONK, kamu belum mendapat poin.' },
    { num: 5, bg: 'bg-purple-500', text: 'Jika COBA LAGI, dapat 1 lemparan ekstra.' },
  ];

  return (
    <div className="cartoon-card-arcade overflow-hidden text-slate-800 shadow-lg flex flex-col">
      {/* Royal Blue Arcade Header Bar */}
      <div className="cartoon-header-arcade py-1.5 px-3 text-center shrink-0">
        <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wide uppercase">
          CARA BERMAIN
        </h2>
      </div>

      {/* Content Body */}
      <div className="p-2 sm:p-2.5 space-y-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-900 bg-white">
        {steps.map((step) => (
          <div key={step.num} className="flex items-start gap-1.5">
            <span
              className={`w-4 h-4 rounded-full ${step.bg} text-white font-black flex items-center justify-center shrink-0 text-[9px] shadow-xs mt-0.5 border border-white/60`}
            >
              {step.num}
            </span>
            <p className="leading-tight pt-0.5">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
