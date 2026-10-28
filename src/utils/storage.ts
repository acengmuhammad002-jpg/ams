import { GameSettings, SliceItem, PrizeConfig, PlayerHistoryEntry } from '../types/game';

export const DEFAULT_PRIZES: PrizeConfig[] = [
  {
    value: 20,
    name: 'Hadiah Utama (Skor 20)',
    description: 'Paket Spesial / Tempat Pensil Eksklusif / Tumbler / Boneka',
    badgeColor: 'bg-yellow-400 text-slate-950',
    iconType: 'grand',
  },
  {
    value: 15,
    name: 'Hadiah Menengah (Skor 15)',
    description: 'Buku Catatan / Penggaris Set / Gantungan Kunci Keren',
    badgeColor: 'bg-amber-500 text-white',
    iconType: 'large',
  },
  {
    value: 10,
    name: 'Alat Tulis (Skor 10)',
    description: 'Pensil / Penghapus / Pulpen Lucu',
    badgeColor: 'bg-blue-500 text-white',
    iconType: 'medium',
  },
  {
    value: 5,
    name: 'Stiker Keren (Skor 5)',
    description: 'Stiker Karakter / Emoticon Keren',
    badgeColor: 'bg-emerald-500 text-white',
    iconType: 'small',
  },
];

// 25 Sectors on the Board:
// Featuring numbers 20, 15, 10, and 5 at cardinal points,
// with majority ZONK (14) and COBA LAGI (7) slices!
export const DEFAULT_SLICES: SliceItem[] = [
  { id: 's-0', type: 'number', value: 20, label: '20', color: '#FBBF24', textColor: '#0F172A' },
  { id: 's-1', type: 'zonk', value: 0, label: 'ZONK', color: '#EF4444', textColor: '#FFFFFF' },
  { id: 's-2', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#8B5CF6', textColor: '#FFFFFF' },
  { id: 's-3', type: 'zonk', value: 0, label: 'ZONK', color: '#DC2626', textColor: '#FFFFFF' },
  { id: 's-4', type: 'zonk', value: 0, label: 'ZONK', color: '#F43F5E', textColor: '#FFFFFF' },
  { id: 's-5', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#06B6D4', textColor: '#FFFFFF' },
  { id: 's-6', type: 'number', value: 15, label: '15', color: '#F97316', textColor: '#FFFFFF' },
  { id: 's-7', type: 'zonk', value: 0, label: 'ZONK', color: '#E11D48', textColor: '#FFFFFF' },
  { id: 's-8', type: 'zonk', value: 0, label: 'ZONK', color: '#DC2626', textColor: '#FFFFFF' },
  { id: 's-9', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#8B5CF6', textColor: '#FFFFFF' },
  { id: 's-10', type: 'zonk', value: 0, label: 'ZONK', color: '#EF4444', textColor: '#FFFFFF' },
  { id: 's-11', type: 'zonk', value: 0, label: 'ZONK', color: '#E11D48', textColor: '#FFFFFF' },
  { id: 's-12', type: 'number', value: 10, label: '10', color: '#3B82F6', textColor: '#FFFFFF' },
  { id: 's-13', type: 'zonk', value: 0, label: 'ZONK', color: '#DC2626', textColor: '#FFFFFF' },
  { id: 's-14', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#8B5CF6', textColor: '#FFFFFF' },
  { id: 's-15', type: 'zonk', value: 0, label: 'ZONK', color: '#F43F5E', textColor: '#FFFFFF' },
  { id: 's-16', type: 'zonk', value: 0, label: 'ZONK', color: '#EF4444', textColor: '#FFFFFF' },
  { id: 's-17', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#06B6D4', textColor: '#FFFFFF' },
  { id: 's-18', type: 'number', value: 5, label: '5', color: '#10B981', textColor: '#FFFFFF' },
  { id: 's-19', type: 'zonk', value: 0, label: 'ZONK', color: '#E11D48', textColor: '#FFFFFF' },
  { id: 's-20', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#8B5CF6', textColor: '#FFFFFF' },
  { id: 's-21', type: 'zonk', value: 0, label: 'ZONK', color: '#DC2626', textColor: '#FFFFFF' },
  { id: 's-22', type: 'zonk', value: 0, label: 'ZONK', color: '#F43F5E', textColor: '#FFFFFF' },
  { id: 's-23', type: 'coba_lagi', value: 0, label: 'COBA LAGI', color: '#3B82F6', textColor: '#FFFFFF' },
  { id: 's-24', type: 'zonk', value: 0, label: 'ZONK', color: '#E11D48', textColor: '#FFFFFF' },
];

export const DEFAULT_SETTINGS: GameSettings = {
  gameTitle: 'DART BERHADIAH',
  subTitle: 'Lempar dart, dapatkan angka, menangkan hadiah!',
  initialChances: 3,
  maxExtraChances: 2,
  allowMultiplePrizes: true,
  prizes: DEFAULT_PRIZES,
  slices: DEFAULT_SLICES,
  adminPin: '1234',
  soundEnabled: true,
  bgmEnabled: true,
  winProbabilityPercent: 3.5, // Rare/small random chance ~3.5%
};

const SETTINGS_KEY = 'dart_game_settings_v5';
const HISTORY_KEY = 'dart_game_history_v5';
const THROW_COUNTER_KEY = 'dart_global_throw_counter_v5';

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        bgmEnabled: parsed.bgmEnabled !== undefined ? parsed.bgmEnabled : true,
        prizes: DEFAULT_PRIZES,
        slices: DEFAULT_SLICES,
      };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadHistory(): PlayerHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
  return [];
}

export function saveHistory(history: PlayerHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function addHistoryEntry(entry: PlayerHistoryEntry) {
  const current = loadHistory();
  const updated = [entry, ...current];
  saveHistory(updated);
  return updated;
}

export function updateHistoryClaim(id: string, isClaimed: boolean) {
  const current = loadHistory();
  const updated = current.map((item) =>
    item.id === id
      ? { ...item, isClaimed, claimedAt: isClaimed ? new Date().toLocaleString('id-ID') : undefined }
      : item
  );
  saveHistory(updated);
  return updated;
}

export function clearHistory() {
  saveHistory([]);
}

// Global Throw Counter for "Setiap Kelipatan 30"
export function loadGlobalThrowCounter(): number {
  try {
    const val = localStorage.getItem(THROW_COUNTER_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveGlobalThrowCounter(count: number) {
  try {
    localStorage.setItem(THROW_COUNTER_KEY, count.toString());
  } catch {}
}

export function exportHistoryToCSV(history: PlayerHistoryEntry[]) {
  if (history.length === 0) return;
  const headers = ['Waktu', 'Orang Ke / Putaran', 'Total Poin', 'Hadiah Didapat', 'Jumlah Lemparan', 'Status Klaim', 'Waktu Klaim'];
  const rows = history.map((h) => [
    `"${h.date}"`,
    `"${h.studentName}"`,
    h.totalScore,
    `"${h.prizesWon.map((p) => p.name).join(', ') || '-'}"`,
    h.throws.length,
    `"${h.isClaimed ? 'Sudah Diklaim' : 'Belum Diklaim'}"`,
    `"${h.claimedAt || '-'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `riwayat_dart_berhadiah_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
