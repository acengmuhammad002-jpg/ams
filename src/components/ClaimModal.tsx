import React from 'react';
import { Award, CheckCircle, X, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundNumber: number;
  totalScore: number;
  prizes: { value: number; name: string; claimed: boolean }[];
  onConfirmClaim: () => void;
  onContinue: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  roundNumber,
  totalScore,
  prizes,
  onConfirmClaim,
  onContinue,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAllClaimed = prizes.length > 0 && prizes.every((p) => p.claimed);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-[#0f172a] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-800">
        {/* Arcade Header */}
        <div className="cartoon-header-arcade px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-300" />
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
              Kupon Klaim Hadiah
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Voucher Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-black text-amber-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> SELAMAT KEPADA PEMENANG!
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Pemenang Ronde #{roundNumber}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Berhasil menembus peluang 1:25 dan memperoleh hadiah:
            </p>
          </div>

          {/* Ticket Card */}
          <div className="relative bg-gradient-to-br from-amber-50 to-sky-50 border-2 border-dashed border-amber-400 rounded-2xl p-4 shadow-inner">
            {isAllClaimed && (
              <div className="absolute right-4 top-4 rotate-12 pointer-events-none select-none">
                <div className="border-3 border-emerald-600 text-emerald-700 font-black text-xs sm:text-sm uppercase px-3 py-1 rounded-lg tracking-widest bg-white/90 shadow-sm">
                  ✓ RESMI DIKLAIM
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-700">Ronde #{roundNumber}</span>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Poin</span>
                <span className="text-lg font-black text-amber-900 tabular-nums">{totalScore}</span>
              </div>
            </div>

            {/* List of Won Prizes */}
            <div className="space-y-2">
              <span className="block text-xs font-black text-slate-900 uppercase tracking-wide">
                Daftar Hadiah:
              </span>
              {prizes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Belum ada hadiah yang dimenangkan.</p>
              ) : (
                prizes.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                        +{p.value}
                      </div>
                      <div className="text-left">
                        <span className="block text-xs sm:text-sm font-bold text-slate-800">
                          {p.name}
                        </span>
                      </div>
                    </div>
                    <Gift className="w-4 h-4 text-amber-600" />
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            📢 Tunjukkan kupon ini kepada Guru atau Penyelenggara untuk mengambil hadiah fisik secara langsung!
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {!isAllClaimed ? (
              <button
                onClick={() => {
                  onConfirmClaim();
                  try {
                    confetti({ particleCount: 50, spread: 60 });
                  } catch {}
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <CheckCircle className="w-4 h-4" /> Tandai Sudah Diambil
              </button>
            ) : (
              <div className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-800">
                ✓ Hadiah sudah tercatat diambil
              </div>
            )}

            <button
              onClick={onContinue}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold rounded-xl shadow-md transition-colors text-sm cursor-pointer"
            >
              Lanjut Main Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
