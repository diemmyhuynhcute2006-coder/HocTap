import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  AlertCircle,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck,
  PenTool,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { ActivityType, FocusSession, ThemeColor } from '../types';
import { ACTIVITIES, TIME_PRESETS, THEME_CONFIGS } from '../data/items';
import { audioService } from '../utils/audio';

interface FocusTimerProps {
  themeColor: ThemeColor;
  onSessionComplete: (session: Omit<FocusSession, 'id'>) => void;
  onSessionAbandon: (session: Omit<FocusSession, 'id'>) => void;
  onFocusStateChange: (isFocusing: boolean) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  themeColor,
  onSessionComplete,
  onSessionAbandon,
  onFocusStateChange,
}) => {
  // Setup form states
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('study');
  const [goal, setGoal] = useState<string>('Học 30 từ vựng N3');
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [customDurationInput, setCustomDurationInput] = useState<string>('');

  // Active session states
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalPausedSeconds, setTotalPausedSeconds] = useState<number>(0);
  const [lastPauseTimestamp, setLastPauseTimestamp] = useState<number | null>(null);

  // Violation Tracking states (Tab hidden & Window blur)
  const [violationCount, setViolationCount] = useState<number>(0);
  const [violationWarning, setViolationWarning] = useState<{ show: boolean; count: number }>({
    show: false,
    count: 0,
  });
  const [failedDueToViolations, setFailedDueToViolations] = useState<boolean>(false);

  // Modals & results
  const [showAbandonConfirm, setShowAbandonConfirm] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [completedPoints, setCompletedPoints] = useState<number>(0);
  const [completedMinutes, setCompletedMinutes] = useState<number>(0);

  // Ambient sound selector during focus
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'fireplace' | 'cafe' | 'forest' | 'whitenoise'>('rain');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  const theme = THEME_CONFIGS[themeColor];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic live refs for listeners
  const isActiveRef = useRef(isActive);
  const isPausedRef = useRef(isPaused);
  const secondsRemainingRef = useRef(secondsRemaining);
  const totalPausedSecondsRef = useRef(totalPausedSeconds);
  const lastViolationTimeRef = useRef<number>(0);
  const originalTitleRef = useRef<string>(typeof document !== 'undefined' ? document.title : 'My Alcove');

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining;
  }, [secondsRemaining]);

  useEffect(() => {
    totalPausedSecondsRef.current = totalPausedSeconds;
  }, [totalPausedSeconds]);

  // Icon mapper helper
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'CalendarCheck': return <CalendarCheck className="w-4 h-4" />;
      case 'PenTool': return <PenTool className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Flame className="w-4 h-4" />;
    }
  };

  // Resume function to unpause timer
  const handleResume = () => {
    audioService.playClick();
    if (lastPauseTimestamp) {
      const pauseDelta = Math.floor((Date.now() - lastPauseTimestamp) / 1000);
      setTotalPausedSeconds((prev) => prev + pauseDelta);
    }
    setIsPaused(false);
    setLastPauseTimestamp(null);
    document.title = originalTitleRef.current;
    if (!isSoundMuted) {
      audioService.setAmbient(ambientSound);
    }
  };

  // Pause function
  const handlePause = () => {
    audioService.playClick();
    setIsPaused(true);
    setLastPauseTimestamp(Date.now());
    audioService.stopAmbient();
  };

  // Trigger violation handler: Pauses timer & records violation
  const triggerViolation = (reason: string) => {
    if (!isActiveRef.current) return;
    const now = Date.now();
    // 2-second cooldown to avoid duplicate triggers from compound blur + visibilitychange events
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    // 1. TỰ ĐỘNG TẠM DỪNG BỘ ĐẾM KHI RỜI TAB HOẶC RỜI CỬA SỔ
    if (!isPausedRef.current) {
      setIsPaused(true);
      setLastPauseTimestamp(Date.now());
      audioService.stopAmbient();
    }

    // 2. Đổi tiêu đề trang & phát âm thanh nhắc nhở
    document.title = '⚠️ Vui lòng quay lại ngay!';
    audioService.playGiveupSound();

    // 3. Tăng số lần vi phạm & xử lý cảnh báo / hủy phiên
    setViolationCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        // Tự động hủy phiên khi vi phạm >= 3 lần
        handleViolationsExceeded();
        return 0;
      } else {
        setViolationWarning({
          show: true,
          count: next,
        });
        return next;
      }
    });
  };

  const handleUserReturned = () => {
    // When returning to tab, title will be restored once dismissed or resumed
  };

  // Session canceled due to exceeding 3 violations
  const handleViolationsExceeded = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.stopAmbient();
    audioService.playGiveupSound();

    const finalDuration = customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration;
    const totalSecondsInitial = finalDuration * 60;
    const elapsedSeconds = Math.max(0, totalSecondsInitial - secondsRemainingRef.current - totalPausedSecondsRef.current);
    const actualMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const now = new Date();
    const startStr = sessionStartTime ? sessionStartTime.toISOString() : now.toISOString();

    onSessionAbandon({
      startTime: startStr,
      endTime: now.toISOString(),
      activityType: selectedActivity,
      goal: goal.trim() || 'Phiên tập trung',
      durationMinutes: finalDuration,
      actualMinutes: actualMins,
      status: 'abandoned',
      pointsEarned: 0,
      dateStr: new Date().toLocaleDateString('en-CA'),
    });

    setIsActive(false);
    setIsPaused(false);
    onFocusStateChange(false);
    setViolationWarning({ show: false, count: 0 });
    setFailedDueToViolations(true);
    document.title = originalTitleRef.current;
  };

  // Violation event listeners: Tab hidden (visibilitychange) and Window blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isActiveRef.current) {
          triggerViolation('Chuyển tab');
        }
      } else {
        handleUserReturned();
      }
    };

    const handleWindowBlur = () => {
      if (isActiveRef.current) {
        triggerViolation('Rời khỏi cửa sổ');
      }
    };

    const handleWindowFocus = () => {
      handleUserReturned();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Timer Tick Hook
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused]);

  // Sync ambient sound when session is active and sound changes
  useEffect(() => {
    if (isActive && !isPaused && !isSoundMuted) {
      audioService.setAmbient(ambientSound);
    } else {
      audioService.stopAmbient();
    }

    return () => {
      audioService.stopAmbient();
    };
  }, [isActive, isPaused, isSoundMuted, ambientSound]);

  // Start Focus Session (Enters In-App Fullscreen Modal)
  const handleStart = () => {
    const finalDuration = customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration;
    if (isNaN(finalDuration) || finalDuration <= 0 || finalDuration > 120) return;

    audioService.playClick();
    setSecondsRemaining(finalDuration * 60);
    setSessionStartTime(new Date());
    setTotalPausedSeconds(0);
    setLastPauseTimestamp(null);
    setViolationCount(0);
    setViolationWarning({ show: false, count: 0 });
    setFailedDueToViolations(false);
    setIsActive(true);
    setIsPaused(false);
    onFocusStateChange(true);
  };

  // Pause / Resume Focus
  const handleTogglePause = () => {
    if (!isPaused) {
      handlePause();
    } else {
      handleResume();
    }
  };

  // Timer Finished Successfully
  const handleTimerFinished = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioService.stopAmbient();
    audioService.playChime();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FDE047', '#C084FC', '#38BDF8', '#4ADE80', '#FB7185'],
      });
    } catch {
      // ignore
    }

    const durationMins = customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration;
    const now = new Date();
    const startStr = sessionStartTime ? sessionStartTime.toISOString() : now.toISOString();

    setCompletedPoints(durationMins);
    setCompletedMinutes(durationMins);
    setShowCompleteModal(true);
    setIsActive(false);
    setIsPaused(false);
    setViolationCount(0);
    onFocusStateChange(false);
    document.title = originalTitleRef.current;

    onSessionComplete({
      startTime: startStr,
      endTime: now.toISOString(),
      activityType: selectedActivity,
      goal: goal.trim() || 'Phiên tập trung',
      durationMinutes: durationMins,
      actualMinutes: durationMins,
      status: 'completed',
      pointsEarned: durationMins,
      dateStr: new Date().toLocaleDateString('en-CA'),
    });
  };

  // Confirm Abandon Session
  const handleConfirmAbandon = () => {
    audioService.playGiveupSound();
    audioService.stopAmbient();
    setShowAbandonConfirm(false);
    setIsActive(false);
    setIsPaused(false);
    setViolationCount(0);
    onFocusStateChange(false);
    document.title = originalTitleRef.current;

    const totalSecondsInitial = (customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration) * 60;
    const elapsedSeconds = Math.max(0, totalSecondsInitial - secondsRemaining - totalPausedSeconds);
    const actualMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const now = new Date();
    const startStr = sessionStartTime ? sessionStartTime.toISOString() : now.toISOString();

    onSessionAbandon({
      startTime: startStr,
      endTime: now.toISOString(),
      activityType: selectedActivity,
      goal: goal.trim() || 'Phiên tập trung',
      durationMinutes: customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration,
      actualMinutes: actualMins,
      status: 'abandoned',
      pointsEarned: 0,
      dateStr: new Date().toLocaleDateString('en-CA'),
    });
  };

  // Formatter for MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentDurationValue = customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration;
  const currentActivityMeta = ACTIVITIES.find((a) => a.type === selectedActivity) || ACTIVITIES[0];

  // Keyboard ESC listener for dialogs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showAbandonConfirm) setShowAbandonConfirm(false);
        if (showCompleteModal) setShowCompleteModal(false);
        if (violationWarning.show) {
          setViolationWarning((prev) => ({ ...prev, show: false }));
          document.title = originalTitleRef.current;
        }
        if (failedDueToViolations) setFailedDueToViolations(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAbandonConfirm, showCompleteModal, violationWarning.show, failedDueToViolations]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ============================================================== */}
      {/* 1. SETUP VIEW (WHEN NOT IN ACTIVE SESSION)                      */}
      {/* ============================================================== */}
      {!isActive ? (
        <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/60 dark:border-stone-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Thiết lập phiên tập trung</span>
                <span className="text-base font-normal text-stone-400">· Pomodoro</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Tạo một khoảng lặng không xao nhãng để hoàn thành mục tiêu của bạn.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/60 px-3 py-1.5 rounded-full self-start sm:self-auto">
              <span>Nhận +1 Focus Point mỗi phút</span>
            </div>
          </div>

          {/* Activity Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              1. Loại hoạt động
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {ACTIVITIES.map((act) => {
                const isSelected = selectedActivity === act.type;
                return (
                  <button
                    key={act.type}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setSelectedActivity(act.type);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1.5 ${
                      isSelected
                        ? `${theme.accentBg} ${theme.border} shadow-md scale-[1.02]`
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="p-1 rounded-lg">
                      {getActivityIcon(act.iconName)}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Goal Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                2. Mục tiêu cụ thể
              </label>
              <span className="text-[11px] text-stone-400">Ví dụ: Học 30 từ vựng N3</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                maxLength={60}
                placeholder="Nhập mục tiêu bạn muốn hoàn thành..."
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-stone-400 font-mono">
                {goal.length}/60
              </span>
            </div>
          </div>

          {/* Duration Presets & Custom Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              3. Thời gian tập trung (Tối đa 120 phút)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {TIME_PRESETS.map((preset) => {
                const isSelected = selectedDuration === preset && !customDurationInput;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setSelectedDuration(preset);
                      setCustomDurationInput('');
                    }}
                    className={`py-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? `${theme.accentBg} ${theme.border} font-bold shadow-md`
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="text-sm font-mono font-bold">{preset}</div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">phút</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Minutes Input */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-stone-500 dark:text-stone-400">Hoặc tự nhập:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customDurationInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 120)) {
                      setCustomDurationInput(val);
                    }
                  }}
                  placeholder="Tự nhập..."
                  className="w-24 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="text-xs text-stone-400">phút</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStart}
              className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 ${theme.accentBg} ${theme.accentHover}`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Bắt đầu tập trung ({currentDurationValue || 25} phút)</span>
            </button>
            <p className="text-center text-xs text-stone-400 mt-2">
              Khung bộ đếm sẽ phủ kín toàn trang. Rời tab sẽ tự động tạm dừng. Quá 3 lần vi phạm sẽ hủy phiên.
            </p>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. KHUNG BỘ ĐẾM THỜI GIAN PHỦ KÍN (IN-APP FULLSCREEN OVERLAY)   */
        /* (ĐÃ XÓA NÚT ZOOM, THIẾT KẾ TỐI GIẢN TẬP TRUNG CAO ĐỘ)           */
        /* ============================================================== */
        <div
          className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden select-none animate-fade-in"
          style={{ background: '#0f0f11' }}
        >
          {/* Subtle Ambient Radial Light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

          {/* Top Bar in Focus Mode */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-800/80 relative z-10 w-full">
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                {currentActivityMeta.label}
              </span>
              <h3 className="text-sm sm:text-base font-medium text-stone-200 truncate max-w-[240px] sm:max-w-md">
                {goal || 'Phiên tập trung'}
              </h3>
            </div>

            {/* Violation Tracker Badge + Ambient Sound Controls (NO ZOOM BUTTON) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Violation Count Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  violationCount === 0
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : violationCount === 1
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse'
                }`}
                title="Rời khỏi tab sẽ tự động tạm dừng đồng hồ và tính 1 lần vi phạm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Vi phạm: {violationCount}/3</span>
              </div>

              {/* Sound Controls */}
              <button
                type="button"
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-300 transition-colors"
                title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              <select
                value={ambientSound}
                onChange={(e) => setAmbientSound(e.target.value as any)}
                className="bg-stone-800/90 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none hidden sm:block"
              >
                <option value="rain">🌧️ Tiếng mưa</option>
                <option value="fireplace">🔥 Lò sưởi</option>
                <option value="cafe">☕ Quán cafe</option>
                <option value="forest">🌲 Rừng thông</option>
                <option value="whitenoise">💨 Tiếng ồn trắng</option>
                <option value="none">🔇 Tắt âm thanh</option>
              </select>
            </div>
          </div>

          {/* Central Centered Timer Display (Massive Font Size & Perfect Centering) */}
          <div className="my-auto py-8 sm:py-12 flex flex-col items-center justify-center text-center relative z-10 w-full">
            <p className="text-xs sm:text-sm text-stone-400 mb-6 max-w-md mx-auto">
              🌿 Hãy giữ màn hình này và hạn chế thiết bị khác. Khi bạn chuyển tab, bộ đếm sẽ tự động tạm dừng.
            </p>

            {/* Huge Prominent Countdown Timer */}
            <div
              className="font-bold tracking-tight font-mono tabular-nums text-white select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
              style={{
                fontSize: 'clamp(5.5rem, 16vw, 13rem)',
                lineHeight: 1,
              }}
            >
              {formatTime(secondsRemaining)}
            </div>

            {/* Status Indicator */}
            <div className="mt-8 flex items-center gap-2.5 text-xs font-semibold px-4 py-2 rounded-full bg-stone-800/90 border border-stone-700/80 shadow-md">
              <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-stone-300">
                {isPaused ? 'Đang tạm dừng (Bấm Tiếp tục khi đã sẵn sàng)' : 'Đang tập trung cao độ'}
              </span>
            </div>
          </div>

          {/* Controls Bar: Pause/Resume + Abandon */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-stone-800/80 relative z-10 w-full">
            <button
              type="button"
              onClick={handleTogglePause}
              className={`px-8 sm:px-12 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-xl ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Tiếp tục</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Tạm dừng</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setShowAbandonConfirm(true);
              }}
              className="px-6 sm:px-8 py-4 rounded-2xl font-medium text-sm text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-900/50 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Từ bỏ phiên</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. VIOLATION WARNING MODAL (LẦN 1 & 2 - BỘ ĐẾM ĐÃ TỰ ĐỘNG TẠM DỪNG) */}
      {/* ============================================================== */}
      {violationWarning.show && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViolationWarning((prev) => ({ ...prev, show: false }));
              document.title = originalTitleRef.current;
            }
          }}
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-gentle-float text-stone-100">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400 text-2xl shadow-inner">
              ⏸️
            </div>

            <h3 className="text-xl font-bold text-amber-300">
              Vui lòng quay lại tập trung!
            </h3>

            {/* Notification that timer was automatically paused */}
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-200">
              Bộ đếm thời gian đã được tự động tạm dừng.
            </div>

            <p className="text-sm text-stone-300 leading-relaxed">
              Cảnh báo vi phạm <span className="font-bold text-amber-400">{violationWarning.count}/3</span> lần do chuyển tab hoặc rời khỏi ứng dụng.
            </p>
            <p className="text-xs text-rose-400 font-medium">
              Quá 3 lần phiên sẽ bị hủy hoàn toàn!
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setViolationWarning((prev) => ({ ...prev, show: false }));
                  document.title = originalTitleRef.current;
                  handleResume(); // Unpauses and resumes focus
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Tiếp tục tập trung</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setViolationWarning((prev) => ({ ...prev, show: false }));
                  document.title = originalTitleRef.current;
                  // Keeps timer paused as requested
                }}
                className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors border border-stone-700"
              >
                Giữ tạm dừng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. VIOLATION EXCEEDED (HỦY PHIÊN DO VI PHẠM >= 3 LẦN)          */}
      {/* ============================================================== */}
      {failedDueToViolations && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFailedDueToViolations(false);
            }
          }}
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-stone-900 border-2 border-rose-600 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-gentle-float text-stone-100">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-3xl flex items-center justify-center mx-auto text-rose-400 text-3xl shadow-inner">
              🛑
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-rose-400">
                Phiên tập trung đã bị hủy!
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Phiên tập trung đã bị hủy do Bạn đã vi phạm rời khỏi màn hình quá 3 lần!
              </p>
            </div>

            <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-900/50 text-xs text-rose-300">
              🌱 Đừng nản lòng, hãy tạo một không gian yên tĩnh hơn và thử lại nhé!
            </div>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setFailedDueToViolations(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm transition-all border border-stone-700 shadow-md"
            >
              Đóng và thử lại
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CONFIRM ABANDON MODAL                                       */}
      {/* ============================================================== */}
      {showAbandonConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAbandonConfirm(false);
            }
          }}
          className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-4 animate-gentle-float">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Bạn có chắc muốn từ bỏ phiên tập trung này?
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Thời gian đã tập trung sẽ được lưu vào lịch sử nhưng bạn sẽ không nhận được phần thưởng hoàn thành phiên.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Tiếp tục tập trung
              </button>
              <button
                type="button"
                onClick={handleConfirmAbandon}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-md"
              >
                Từ bỏ phiên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. COMPLETION MODAL                                            */}
      {/* ============================================================== */}
      {showCompleteModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              audioService.playClick();
              setShowCompleteModal(false);
            }
          }}
          className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-5 animate-gentle-float">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner">
              🎉
            </div>

            <div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-serif">
                Bạn đã hoàn thành!
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                Bạn đã tập trung trọn vẹn trong <span className="font-semibold text-stone-900 dark:text-stone-100">{completedMinutes} phút</span>.
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-3">
              <span className="text-2xl">⭐</span>
              <div className="text-left">
                <div className="text-lg font-bold text-amber-800 dark:text-amber-300 font-mono">
                  +{completedPoints} Focus Points
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400">
                  Dùng điểm để trang trí thêm góc My Alcove của bạn!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                setShowCompleteModal(false);
              }}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${theme.accentBg} ${theme.accentHover}`}
            >
              Tuyệt vời, tiếp tục thôi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
