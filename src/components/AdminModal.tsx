import React, { useState } from 'react';
import { GameSettings, PlayerHistoryEntry } from '../types/game';
import { X, Lock, Check, Save, Download, Trash2, Award, RotateCcw, AlertTriangle, ListChecks } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
  history: PlayerHistoryEntry[];
  onUpdateHistoryClaim: (id: string, isClaimed: boolean) => void;
  onClearHistory: () => void;
  onExportCSV: () => void;
  globalThrowCount: number;
  onResetThrowCount: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  history,
  onUpdateHistoryClaim,
  onClearHistory,
  onExportCSV,
  globalThrowCount,
  onResetThrowCount,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'prizes' | 'rules' | 'history'>('prizes');

  // Editable settings state
  const [tempSettings, setTempSettings] = useState<GameSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSave = () => {
    onSaveSettings(tempSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua pengaturan ke standar awal?')) {
      // Reload defaults
      import('../utils/storage').then((m) => {
        setTempSettings(m.DEFAULT_SETTINGS);
        onSaveSettings(m.DEFAULT_SETTINGS);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-[#0f172a] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="cartoon-header-arcade px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
              Pengaturan Guru & Penyelenggara
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-800" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">
              Masukkan PIN Admin
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Menu ini khusus untuk guru / panitia pengelola kegiatan.
              <br />
              <span className="text-amber-800 font-bold">(PIN Default: 1234)</span>
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Ketik PIN..."
                autoFocus
                className="w-full text-center tracking-widest text-2xl font-bold py-2.5 px-4 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white"
              />

              {pinError && (
                <p className="text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> PIN salah! Gunakan 1234.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Masuk ke Pengaturan
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-amber-200 bg-amber-50/70 px-4 pt-2 gap-2 text-xs sm:text-sm font-bold">
              <button
                onClick={() => setActiveTab('prizes')}
                className={`py-2 px-3 sm:px-4 rounded-t-xl transition-colors cursor-pointer ${
                  activeTab === 'prizes'
                    ? 'bg-[#fffdf8] text-amber-950 border-t-2 border-x-2 border-amber-300 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎁 Daftar Hadiah
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-2 px-3 sm:px-4 rounded-t-xl transition-colors cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-[#fffdf8] text-amber-950 border-t-2 border-x-2 border-amber-300 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚙️ Aturan & Judul
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-3 sm:px-4 rounded-t-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-[#fffdf8] text-amber-950 border-t-2 border-x-2 border-amber-300 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListChecks className="w-4 h-4" /> Riwayat ({history.length})
              </button>
            </div>

            {/* Scrollable Tab Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
              {/* TAB 1: PRIZES */}
              {activeTab === 'prizes' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                    💡 Sesuaikan nama hadiah dan deskripsinya dengan barang riil yang disiapkan untuk siswa sekolah dasar.
                  </div>

                  <div className="space-y-3">
                    {tempSettings.prizes.map((prize, idx) => (
                      <div
                        key={prize.value}
                        className="bg-white border-2 border-slate-200 rounded-2xl p-3 shadow-xs space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-12 py-1 bg-amber-500 text-white font-black text-sm text-center rounded-lg shadow-xs">
                            {prize.value}
                          </span>
                          <input
                            type="text"
                            value={prize.name}
                            onChange={(e) => {
                              const updated = [...tempSettings.prizes];
                              updated[idx] = { ...prize, name: e.target.value };
                              setTempSettings({ ...tempSettings, prizes: updated });
                            }}
                            placeholder="Nama Hadiah"
                            className="flex-1 font-bold text-sm text-slate-800 border rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
                          />
                        </div>
                        <input
                          type="text"
                          value={prize.description}
                          onChange={(e) => {
                            const updated = [...tempSettings.prizes];
                            updated[idx] = { ...prize, description: e.target.value };
                            setTempSettings({ ...tempSettings, prizes: updated });
                          }}
                          placeholder="Deskripsi hadiah (contoh: Stiker Lucu / Buku Tulis)"
                          className="w-full text-xs text-slate-600 border rounded-lg px-2.5 py-1 outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: RULES & TITLE */}
              {activeTab === 'rules' && (
                <div className="space-y-4">
                  {/* Title & Subtitle */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      Tampilan Teks Game
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Judul Game
                      </label>
                      <input
                        type="text"
                        value={tempSettings.gameTitle}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, gameTitle: e.target.value })
                        }
                        className="w-full font-bold text-sm border rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Subjudul / Slogan
                      </label>
                      <input
                        type="text"
                        value={tempSettings.subTitle}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, subTitle: e.target.value })
                        }
                        className="w-full text-xs font-semibold border rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Pengaturan Peluang Hadiah Acak (Disimpan di bagian admin/ikon) */}
                  <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-sm text-sky-950 flex items-center justify-between">
                      <span>🎯 Peluang Hadiah Acak (Menang Sedikit)</span>
                      <span className="px-2.5 py-0.5 bg-sky-200 text-sky-900 rounded-full font-black text-xs">
                        {tempSettings.winProbabilityPercent || 3.5}%
                      </span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Pemenang ditentukan <b>secara acak murni</b> (tidak berpola), dengan persentase kemenangan yang sedikit agar hadiah tetap langka dan menantang!
                    </p>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'Sangat Sedikit (3.5%)', val: 3.5 },
                        { label: 'Sedikit (5%)', val: 5 },
                        { label: 'Sedang (10%)', val: 10 },
                        { label: 'Sering (20%)', val: 20 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() =>
                            setTempSettings({ ...tempSettings, winProbabilityPercent: preset.val })
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            (tempSettings.winProbabilityPercent || 3.5) === preset.val
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-sky-200">
                      <span className="text-xs font-bold text-slate-700">Persentase Peluang Kustom (%):</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          step={0.5}
                          value={tempSettings.winProbabilityPercent || 3.5}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              winProbabilityPercent: Math.max(0.5, Math.min(50, parseFloat(e.target.value) || 3.5)),
                            })
                          }
                          className="w-20 font-bold text-xs text-center border rounded-lg px-2 py-1 outline-none focus:border-blue-500 bg-white"
                        />
                        <span className="text-xs font-bold text-slate-600">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Chances & Rules */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-800">
                      Kesempatan & Batasan Lemparan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Kesempatan Awal (Dart)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={tempSettings.initialChances}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              initialChances: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-full font-bold text-sm border rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Maksimal Bonus &quot;COBA LAGI&quot;
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          value={tempSettings.maxExtraChances}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              maxExtraChances: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-full font-bold text-sm border rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-500">
                          Mencegah lemparan tak berujung
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempSettings.allowMultiplePrizes}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              allowMultiplePrizes: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-400"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          Boleh mengklaim semua hadiah yang didapat (jika tidak dicentang, hanya hadiah skor tertinggi)
                        </span>
                      </label>
                    </div>

                    <div className="pt-2 border-t space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempSettings.soundEnabled}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              soundEnabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-400"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          🔊 Aktifkan Efek Suara (SFX: lemparan, benturan, dan kemenangan)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempSettings.bgmEnabled}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              bgmEnabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          🎵 Aktifkan Musik Pengiring (BGM ceria arcade non-stop)
                        </span>
                      </label>
                    </div>

                    {/* Change Admin PIN */}
                    <div className="pt-2 border-t">
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Ganti Kata Sandi / PIN Admin
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={tempSettings.adminPin}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, adminPin: e.target.value })
                        }
                        className="w-36 font-mono text-sm border rounded-lg px-3 py-1 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-600">
                      Total <b>{history.length}</b> siswa telah bermain.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onExportCSV}
                        disabled={history.length === 0}
                        className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh CSV
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus seluruh riwayat permainan?')) {
                            onClearHistory();
                          }
                        }}
                        disabled={history.length === 0}
                        className="py-1 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Belum ada catatan permainan tersimpan.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {item.studentName}
                              </span>
                              <span className="px-2 py-0.5 bg-yellow-100 text-amber-900 rounded font-black text-xs">
                                {item.totalScore} Poin
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.date} · {item.throws.length} lemparan
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.prizesWon.length > 0 ? (
                                item.prizesWon.map((p, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold"
                                  >
                                    🎁 {p.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400">Tidak ada hadiah</span>
                              )}
                            </div>
                          </div>

                          {/* Claim Status toggle */}
                          <button
                            onClick={() => onUpdateHistoryClaim(item.id, !item.isClaimed)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                              item.isClaimed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800 border border-slate-300'
                            }`}
                          >
                            {item.isClaimed ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Hadiah Diberikan
                              </>
                            ) : (
                              <>
                                <Award className="w-3.5 h-3.5 text-amber-600" /> Tandai Diambil
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="p-4 bg-amber-50/80 border-t border-amber-200 flex items-center justify-between">
              <button
                onClick={handleResetDefaults}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Tersimpan!
                  </span>
                )}
                <button
                  onClick={handleSave}
                  className="py-2 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
