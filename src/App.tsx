/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from './utils/audio';
import {
  GameSettings,
  SliceItem,
  PrizeConfig,
  PlayerHistoryEntry,
  DartCoord,
  ThrowLog,
} from './types/game';
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  addHistoryEntry,
  updateHistoryClaim,
  clearHistory,
  exportHistoryToCSV,
  loadGlobalThrowCounter,
  saveGlobalThrowCounter,
} from './utils/storage';
import { DartBoard } from './components/DartBoard';
import { TopHeader } from './components/TopHeader';
import { RulesCard } from './components/RulesCard';
import { PrizeListCard } from './components/PrizeListCard';
import { ResultPanel } from './components/ResultPanel';
import { AdminModal } from './components/AdminModal';
import { ClaimModal } from './components/ClaimModal';
import { UserPlus, RefreshCw } from 'lucide-react';

export default function App() {
  // Global Settings & History
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [history, setHistory] = useState<PlayerHistoryEntry[]>(loadHistory);
  const [globalThrowCount, setGlobalThrowCount] = useState<number>(loadGlobalThrowCounter);

  // Turn state: each person strictly has 3 chances
  const [personNumber, setPersonNumber] = useState<number>(1);
  const [chancesLeft, setChancesLeft] = useState<number>(settings.initialChances);
  const [extraChancesCount, setExtraChancesCount] = useState<number>(0);
  const [turnScore, setTurnScore] = useState<number>(0);
  const [wonPrizes, setWonPrizes] = useState<{ value: number; name: string; claimed: boolean }[]>([]);
  const [stuckDarts, setStuckDarts] = useState<DartCoord[]>([]);
  const [sessionThrows, setSessionThrows] = useState<ThrowLog[]>([]);

  // Throw & Animation State
  const [isThrowing, setIsThrowing] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [highlightSliceIndex, setHighlightSliceIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{
    slice: SliceItem;
    prize?: PrizeConfig;
    isExtraChance?: boolean;
    pointEarned: number;
    throwCount?: number;
  } | null>(null);

  const [flyingDartPos, setFlyingDartPos] = useState<{
    x: number;
    y: number;
    scale: number;
    angle: number;
    opacity: number;
  } | null>(null);

  // Visual reload toast state
  const [reloadNotice, setReloadNotice] = useState<string | null>(null);

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Animation frame ref
  const animFrameRef = useRef<number | null>(null);

  // Sync sound & BGM settings with audio manager
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setBgmEnabled(settings.bgmEnabled);
  }, [settings.soundEnabled, settings.bgmEnabled]);

  // Unlock Web Audio on first user interaction
  useEffect(() => {
    const handleFirstGesture = () => {
      soundManager.init();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const toggleSound = () => {
    const updated = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: updated };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.setSoundEnabled(updated);
    if (updated) soundManager.playClick();
  };

  const toggleBgm = () => {
    soundManager.init();
    const updated = !settings.bgmEnabled;
    const newSettings = { ...settings, bgmEnabled: updated };
    setSettings(newSettings);
    saveSettings(newSettings);
    soundManager.setBgmEnabled(updated);
    if (updated && settings.soundEnabled) soundManager.playClick();
  };

  // Next person starts fresh with 3 throws
  const handleNextPerson = () => {
    soundManager.playClick();
    setPersonNumber((prev) => prev + 1);
    setChancesLeft(settings.initialChances);
    setExtraChancesCount(0);
    setTurnScore(0);
    setWonPrizes([]);
    setStuckDarts([]);
    setSessionThrows([]);
    setHighlightSliceIndex(null);
    setLastResult(null);
    setFlyingDartPos(null);
  };

  // Fully functional reload / reset button
  const handleResetSession = () => {
    soundManager.playClick();
    setChancesLeft(settings.initialChances);
    setExtraChancesCount(0);
    setTurnScore(0);
    setWonPrizes([]);
    setStuckDarts([]);
    setSessionThrows([]);
    setHighlightSliceIndex(null);
    setLastResult(null);
    setFlyingDartPos(null);

    // Show quick feedback banner
    setReloadNotice('Permainan Dimuat Ulang! 3 Dart Siap.');
    setTimeout(() => {
      setReloadNotice(null);
    }, 1500);
  };

  const handleResetThrowCount = () => {
    setGlobalThrowCount(0);
    saveGlobalThrowCounter(0);
  };

  // Throw the dart!
  const handleThrowDart = () => {
    if (isThrowing) return;

    // If 3 attempts already used up, clicking throw automatically passes turn to next person
    if (chancesLeft <= 0) {
      handleNextPerson();
      return;
    }

    soundManager.playClick();
    soundManager.playThrow();

    setIsThrowing(true);
    setHighlightSliceIndex(null);
    setChancesLeft((prev) => prev - 1);

    // Increment global throw counter
    const currentThrowNum = globalThrowCount + 1;
    setGlobalThrowCount(currentThrowNum);
    saveGlobalThrowCounter(currentThrowNum);

    const slices = settings.slices;

    // RANDOM PRIZE RULE (Acak murni, persentase kecil disetel di menu admin):
    const winRate = (settings.winProbabilityPercent || 3.5) / 100;
    const isPrizeWin = Math.random() < winRate;
    let targetIndex: number;

    const prizeIndices = slices
      .map((s, idx) => (s.type === 'number' ? idx : -1))
      .filter((idx) => idx !== -1);

    const otherIndices = slices
      .map((s, idx) => (s.type !== 'number' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (isPrizeWin && prizeIndices.length > 0) {
      // Pick one of the prize numbers [20, 15, 10, 5] randomly
      const roll = Math.random();
      let targetValue = 5;
      if (roll < 0.15) targetValue = 20; // Hadiah Utama
      else if (roll < 0.35) targetValue = 15; // Hadiah Menengah
      else if (roll < 0.65) targetValue = 10; // Alat Tulis
      else targetValue = 5; // Stiker

      const matchedSliceIdx = prizeIndices.find((idx) => slices[idx].value === targetValue);
      targetIndex = matchedSliceIdx !== undefined ? matchedSliceIdx : prizeIndices[Math.floor(Math.random() * prizeIndices.length)];
    } else {
      // Non-prize: Lands randomly on ZONK (majority) or COBA LAGI
      targetIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)];
    }

    const targetSlice = slices[targetIndex];

    // Compute target coordinates on SVG dartboard (viewBox 0 0 460 460)
    const boardCenter = 230;
    const anglePerSlice = 360 / slices.length; // 14.4 degrees per slice
    const midAngle = targetIndex * anglePerSlice;

    // Strict alignment: needle tip lands exactly at the slice's center angle (midAngle)
    // with 0 angular skew so it is 100% inside the chosen slice and cannot overlap adjacent slices!
    const targetAngle = midAngle;
    const targetRadius = 130; // perfectly in the label zone of the sector

    // Convert to Cartesian coordinates relative to center (polarToCartesian formula: ((angle - 90) * PI) / 180)
    const rad = ((targetAngle - 90) * Math.PI) / 180;
    const targetX = boardCenter + targetRadius * Math.cos(rad);
    const targetY = boardCenter + targetRadius * Math.sin(rad);

    // Animation trajectory: starts below the board, curves up into the target
    const startX = boardCenter;
    const startY = 460;
    const startTime = performance.now();
    const duration = 600; // ms

    const animateFlight = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      // Interpolate position along an arc
      const curX = startX + (targetX - startX) * ease;
      const arcHeight = Math.sin(progress * Math.PI) * 35;
      const curY = startY + (targetY - startY) * ease - arcHeight;

      // Scale from foreground to board depth
      const curScale = 1.3 - 0.55 * ease;

      // Rotation facing trajectory
      const angle = (targetAngle - 90) * 0.4;

      setFlyingDartPos({
        x: curX,
        y: curY,
        scale: curScale,
        angle,
        opacity: 1,
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateFlight);
      } else {
        // Dart lands!
        soundManager.playHit();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);

        setFlyingDartPos(null);

        const newDart: DartCoord = {
          id: `dart-${Date.now()}`,
          x: targetX - boardCenter,
          y: targetY - boardCenter,
          angle: targetAngle,
          sliceIndex: targetIndex,
          label: targetSlice.label,
        };

        setStuckDarts((prev) => [...prev, newDart]);
        setHighlightSliceIndex(targetIndex);

        // Process outcome
        let pointEarned = 0;
        let matchedPrize: PrizeConfig | undefined;
        let isExtraChance = false;

        if (targetSlice.type === 'number') {
          pointEarned = targetSlice.value;
          setTurnScore((prev) => prev + pointEarned);

          matchedPrize = settings.prizes.find((p) => p.value === targetSlice.value);
          if (matchedPrize) {
            setWonPrizes((prev) => [
              ...prev,
              { value: matchedPrize!.value, name: matchedPrize!.name, claimed: false },
            ]);
          }

          soundManager.playWin();
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {}
        } else if (targetSlice.type === 'zonk') {
          soundManager.playZonk();
        } else if (targetSlice.type === 'coba_lagi') {
          if (extraChancesCount < settings.maxExtraChances) {
            isExtraChance = true;
            setChancesLeft((prev) => prev + 1);
            setExtraChancesCount((prev) => prev + 1);
            soundManager.playExtraChance();
          } else {
            soundManager.playZonk();
          }
        }

        const resultObj = {
          slice: targetSlice,
          prize: matchedPrize,
          isExtraChance,
          pointEarned,
          throwCount: currentThrowNum,
        };

        setLastResult(resultObj);

        const throwLog: ThrowLog = {
          id: `throw-${Date.now()}`,
          throwNumber: sessionThrows.length + 1,
          slice: targetSlice,
          sliceIndex: targetIndex,
          timestamp: Date.now(),
          prizeWon: matchedPrize?.name,
          pointEarned,
          isExtraChance,
        };

        const updatedThrows = [...sessionThrows, throwLog];
        setSessionThrows(updatedThrows);

        const historyEntry: PlayerHistoryEntry = {
          id: `hist-p-${personNumber}-${Date.now()}`,
          studentName: `Orang Ke-${personNumber}`,
          date: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          timestamp: Date.now(),
          totalScore: turnScore + pointEarned,
          throws: updatedThrows,
          prizesWon: matchedPrize
            ? [...wonPrizes, { value: matchedPrize.value, name: matchedPrize.name }]
            : wonPrizes,
          isClaimed: false,
        };

        addHistoryEntry(historyEntry);
        setHistory(loadHistory());

        setIsThrowing(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateFlight);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleConfirmClaim = () => {
    soundManager.playClaimPrize();
    setWonPrizes((prev) => prev.map((p) => ({ ...p, claimed: true })));

    const historyList = loadHistory();
    const entry = historyList.find((h) => h.studentName.includes(`Orang Ke-${personNumber}`));
    if (entry) {
      updateHistoryClaim(entry.id, true);
      setHistory(loadHistory());
    }
  };

  const handleContinueFromClaim = () => {
    setIsClaimModalOpen(false);
    handleNextPerson();
  };

  return (
    /* Outer Stage Wrapper (Deep Navy/Indigo, NO BROWN) */
    <div className="w-screen h-screen bg-[#091e3a] flex items-center justify-center overflow-hidden p-0 sm:p-2 select-none relative">
      {/* Visual Reload Toast Notification */}
      {reloadNotice && (
        <div className="absolute top-4 z-50 bg-sky-900 text-sky-100 border-2 border-sky-400 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-300" />
          <span className="text-xs font-bold">{reloadNotice}</span>
        </div>
      )}

      {/* 16:9 Aspect Ratio Frame Container */}
      <div className="relative w-full max-w-[calc(100vh*16/9)] aspect-[16/9] max-h-screen bg-[#70c5f4] shadow-2xl rounded-none sm:rounded-2xl border-0 sm:border-4 border-[#0f172a] overflow-hidden flex flex-col justify-between">
        {/* Sky Clouds Background */}
        <div className="absolute top-8 left-8 w-28 h-10 bg-white/60 rounded-full blur-[1px] pointer-events-none -z-0" />
        <div className="absolute top-16 right-12 w-40 h-12 bg-white/50 rounded-full blur-[1px] pointer-events-none -z-0" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-8 bg-white/40 rounded-full blur-[1px] pointer-events-none -z-0" />

        {/* Top Header Billboard */}
        <TopHeader
          gameTitle={settings.gameTitle}
          subTitle={settings.subTitle}
          personNumber={personNumber}
          chancesLeft={chancesLeft}
          maxChances={settings.initialChances}
          turnScore={turnScore}
          soundEnabled={settings.soundEnabled}
          bgmEnabled={settings.bgmEnabled}
          onToggleSound={toggleSound}
          onToggleBgm={toggleBgm}
          onOpenAdminModal={() => setIsAdminOpen(true)}
          onResetSession={handleResetSession}
        />

        {/* Main 3-Column 16:9 Arena */}
        <main className="relative z-10 w-full px-3 sm:px-6 flex-1 min-h-0 flex items-center my-1 overflow-visible">
          <div className="grid grid-cols-12 gap-2 sm:gap-4 lg:gap-6 items-stretch w-full h-full min-h-0">
            {/* LEFT COLUMN: CARA BERMAIN & DAFTAR HADIAH (3 Columns) */}
            <div className="col-span-3 flex flex-col justify-between gap-1.5 sm:gap-2.5 h-full min-h-0 overflow-hidden">
              <RulesCard />
              <PrizeListCard prizes={settings.prizes} />
            </div>

            {/* CENTER COLUMN: DART WHEEL & THROW BUTTON (6 Columns) */}
            <div className="col-span-6 flex flex-col items-center justify-between h-full min-h-0 pb-1">
              {/* Papan Dart Digital (25 Slices, 20, 15, 10, 5, ZONK & COBA LAGI) */}
              <div className="w-full flex-1 min-h-0 flex justify-center items-center py-0.5">
                <DartBoard
                  slices={settings.slices}
                  highlightSliceIndex={highlightSliceIndex}
                  isShaking={isShaking}
                  stuckDarts={stuckDarts}
                  flyingDartPos={flyingDartPos}
                />
              </div>

              {/* Action Button: LEMPAR DART or ORANG BERIKUTNYA (Guaranteed visible, never clipped) */}
              <div className="relative z-30 shrink-0 mt-1 flex items-center justify-center">
                {/* Comic Speed Lines Left */}
                <div className="flex flex-col gap-1 mr-2 pointer-events-none opacity-80">
                  <div className="w-4 sm:w-6 h-1 sm:h-1.5 bg-blue-950/40 rounded-full rotate-12" />
                  <div className="w-6 sm:w-8 h-1.5 sm:h-2 bg-blue-950/50 rounded-full" />
                  <div className="w-3 sm:w-5 h-1 sm:h-1.5 bg-blue-950/40 rounded-full -rotate-12" />
                </div>

                {chancesLeft > 0 ? (
                  /* Standard Throw Button */
                  <button
                    onClick={handleThrowDart}
                    disabled={isThrowing}
                    className="relative px-6 sm:px-10 md:px-12 py-2 sm:py-2.5 rounded-full text-white font-black text-sm sm:text-lg md:text-xl tracking-wider uppercase cartoon-btn-red flex items-center justify-center gap-2 sm:gap-3 border-2 sm:border-4 border-[#0f172a] select-none cursor-pointer transition-transform animate-pulse hover:animate-none shadow-xl"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 -rotate-45 shrink-0 drop-shadow">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <polygon points="12,2 15,10 9,10" fill="#ffffff" />
                        <rect x="10.5" y="10" width="3" height="6" fill="#fbbf24" rx="1" />
                        <line x1="12" y1="16" x2="12" y2="22" stroke="#ffffff" strokeWidth="2.5" />
                        <polygon points="12,18 7,22 17,22" fill="#ef4444" />
                      </svg>
                    </div>
                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {isThrowing ? 'MELEMPAR...' : `LEMPAR DART (${chancesLeft})`}
                    </span>
                  </button>
                ) : (
                  /* Pass Turn to Next Person Button */
                  <button
                    onClick={handleNextPerson}
                    disabled={isThrowing}
                    className="relative px-6 sm:px-10 md:px-12 py-2 sm:py-2.5 rounded-full text-white font-black text-sm sm:text-base md:text-lg tracking-wider uppercase bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-[0_5px_0_#064e3b,0_10px_18px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2 sm:gap-3 border-2 sm:border-4 border-[#0f172a] select-none cursor-pointer transition-all animate-bounce active:translate-y-1"
                  >
                    <UserPlus className="w-5 h-5 shrink-0" />
                    <span>ORANG BERIKUTNYA (3 LEMPARAN)</span>
                  </button>
                )}

                {/* Comic Speed Lines Right */}
                <div className="flex flex-col gap-1 ml-2 pointer-events-none opacity-80">
                  <div className="w-4 sm:w-6 h-1 sm:h-1.5 bg-blue-950/40 rounded-full -rotate-12" />
                  <div className="w-6 sm:w-8 h-1.5 sm:h-2 bg-blue-950/50 rounded-full" />
                  <div className="w-3 sm:w-5 h-1 sm:h-1.5 bg-blue-950/40 rounded-full rotate-12" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HASIL LEMPARAN (3 Columns) */}
            <div className="col-span-3 h-full min-h-0 overflow-hidden">
              <ResultPanel
                lastResult={lastResult}
                isThrowing={isThrowing}
                chancesLeft={chancesLeft}
                turnScore={turnScore}
                personNumber={personNumber}
                wonPrizes={wonPrizes}
                onClaimPrize={() => setIsClaimModalOpen(true)}
                onNextPerson={handleNextPerson}
                onThrowAgain={handleThrowDart}
              />
            </div>
          </div>
        </main>

        {/* Bottom Terrace Curb & Corner Bushes/Gifts (Overlay style: never covers center dart/button) */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10 overflow-hidden h-7 sm:h-9">
          <div className="absolute inset-x-0 bottom-0 h-2 bg-[#94a3b8] border-t-2 border-[#475569]" />

          {/* Left Corner Gift & Bush */}
          <div className="absolute left-2 sm:left-4 bottom-0 flex items-end gap-1">
            <div className="w-10 sm:w-12 h-6 sm:h-8 bg-[#10b981] rounded-t-full border-2 border-[#047857] shadow-sm -mr-2" />
            <div className="relative w-6 sm:w-8 h-6 sm:h-8 bg-blue-500 rounded-md border-2 border-blue-700 shadow-md flex items-center justify-center">
              <div className="absolute inset-y-0 w-1.5 bg-yellow-400" />
              <div className="absolute inset-x-0 h-1.5 bg-yellow-400" />
              <div className="absolute -top-1 w-3 h-1.5 bg-yellow-400 rounded-full border border-yellow-600" />
            </div>
          </div>

          {/* Right Corner Gift & Bush */}
          <div className="absolute right-2 sm:right-4 bottom-0 flex items-end gap-1">
            <div className="relative w-6 sm:w-8 h-6 sm:h-8 bg-purple-500 rounded-md border-2 border-purple-700 shadow-md flex items-center justify-center">
              <div className="absolute inset-y-0 w-1.5 bg-rose-500" />
              <div className="absolute inset-x-0 h-1.5 bg-rose-500" />
              <div className="absolute -top-1 w-3 h-1.5 bg-rose-500 rounded-full border border-rose-700" />
            </div>
            <div className="w-10 sm:w-12 h-6 sm:h-8 bg-[#10b981] rounded-t-full border-2 border-[#047857] shadow-sm -ml-2" />
          </div>
        </div>
      </div>

      {/* Admin Settings Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        history={history}
        onUpdateHistoryClaim={(id, claimed) => {
          const updated = updateHistoryClaim(id, claimed);
          setHistory(updated);
        }}
        onClearHistory={() => {
          clearHistory();
          setHistory([]);
        }}
        onExportCSV={() => exportHistoryToCSV(history)}
        globalThrowCount={globalThrowCount}
        onResetThrowCount={handleResetThrowCount}
      />

      {/* Prize Claim Modal */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        roundNumber={personNumber}
        totalScore={turnScore}
        prizes={wonPrizes}
        onConfirmClaim={handleConfirmClaim}
        onContinue={handleContinueFromClaim}
      />
    </div>
  );
}
