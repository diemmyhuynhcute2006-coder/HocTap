import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  AlertCircle,
  Clock,
  Target,
  GraduationCap,
  Briefcase,
  BookOpen,
  CalendarCheck,
  PenTool,
  Flame,
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

  // Distraction-free & UI modals
  const [isMinimalistMode, setIsMinimalistMode] = useState<boolean>(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [completedPoints, setCompletedPoints] = useState<number>(0);
  const [completedMinutes, setCompletedMinutes] = useState<number>(0);

  // Ambient sound selector during focus
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'fireplace' | 'cafe' | 'forest' | 'whitenoise'>('rain');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  const theme = THEME_CONFIGS[themeColor];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Start Focus Session
  const handleStart = () => {
    const finalDuration = customDurationInput ? parseInt(customDurationInput, 10) : selectedDuration;
    if (isNaN(finalDuration) || finalDuration <= 0 || finalDuration > 120) return;

    audioService.playClick();
    setSecondsRemaining(finalDuration * 60);
    setSessionStartTime(new Date());
    setTotalPausedSeconds(0);
    setLastPauseTimestamp(null);
    setIsActive(true);
    setIsPaused(false);
    setIsMinimalistMode(true);
    onFocusStateChange(true);
  };

  // Pause / Resume Focus
  const handleTogglePause = () => {
    audioService.playClick();
    if (!isPaused) {
      setIsPaused(true);
      setLastPauseTimestamp(Date.now());
      audioService.stopAmbient();
    } else {
      if (lastPauseTimestamp) {
        const pauseDelta = Math.floor((Date.now() - lastPauseTimestamp) / 1000);
        setTotalPausedSeconds((prev) => prev + pauseDelta);
      }
      setIsPaused(false);
      setLastPauseTimestamp(null);
      if (!isSoundMuted) {
        audioService.setAmbient(ambientSound);
      }
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
    onFocusStateChange(false);

    onSessionComplete({
      startTime: startStr,
      endTime: now.toISOString(),
      activityType: selectedActivity,
      goal: goal.trim() || 'Phiên tập trung',
      durationMinutes: durationMins,
      actualMinutes: durationMins,
      status: 'completed',
      pointsEarned: durationMins,
      dateStr: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD local format
    });
  };

  // Confirm Abandon Session
  const handleConfirmAbandon = () => {
    audioService.playGiveupSound();
    audioService.stopAmbient();
    setShowAbandonConfirm(false);
    setIsActive(false);
    setIsPaused(false);
    setIsMinimalistMode(false);
    onFocusStateChange(false);

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

          {/* Goal Input */}
          <div className="space-y-2">
            <label htmlFor="goal-input" className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>2. Mục tiêu cụ thể trong phiên này</span>
            </label>
            <input
              id="goal-input"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ví dụ: Đọc xong chương 3, Lập dàn ý bài luận..."
              maxLength={80}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>3. Thời gian tập trung (tối đa 120 phút)</span>
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {currentDurationValue || 25} phút
              </span>
            </label>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {TIME_PRESETS.map((mins) => {
                const isSelected = selectedDuration === mins && !customDurationInput;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setSelectedDuration(mins);
                      setCustomDurationInput('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? `${theme.accentBg} shadow-sm`
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {mins}p
                  </button>
                );
              })}

              {/* Custom Minutes Input */}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customDurationInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomDurationInput(val);
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
              Chế độ Không làm phiền sẽ được kích hoạt để giúp bạn tập trung cao độ.
            </p>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. CHẾ ĐỘ KHÔNG LÀM PHIỀN (ACTIVE MINIMALIST FOCUS MODE)        */
        /* ============================================================== */
        <div className="bg-stone-900/95 dark:bg-black/95 text-stone-100 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-2xl relative overflow-hidden transition-all">
          {/* Subtle Ambient Radial Light */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          {/* Top Bar in Focus Mode */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-stone-800 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                {currentActivityMeta.label}
              </span>
              <h3 className="text-sm sm:text-base font-medium text-stone-200 truncate max-w-[280px] sm:max-w-md">
                {goal || 'Phiên tập trung'}
              </h3>
            </div>

            {/* Ambient Sound & View Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
                title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              <select
                value={ambientSound}
                onChange={(e) => setAmbientSound(e.target.value as any)}
                className="bg-stone-800/80 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none"
              >
                <option value="rain">🌧️ Tiếng mưa</option>
                <option value="fireplace">🔥 Lò sưởi</option>
                <option value="cafe">☕ Quán cafe</option>
                <option value="forest">🌲 Rừng thông</option>
                <option value="whitenoise">💨 Tiếng ồn trắng</option>
                <option value="none">🔇 Tắt âm thanh</option>
              </select>

              <button
                type="button"
                onClick={() => setIsMinimalistMode(!isMinimalistMode)}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors hidden sm:block"
                title="Thu gọn / Mở rộng"
              >
                {isMinimalistMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Central Timer Display */}
          <div className="py-10 sm:py-14 flex flex-col items-center justify-center text-center relative z-10">
            {/* Friendly Non-distraction Reminder */}
            <p className="text-xs sm:text-sm text-stone-400 mb-4 max-w-md">
              🌿 Hãy tạm gác lại điện thoại và các thiết bị gây xao nhãng để tận hưởng không gian riêng của bạn.
            </p>

            {/* Big Countdown Timer */}
            <div className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight font-mono tabular-nums text-white select-none drop-shadow-lg">
              {formatTime(secondsRemaining)}
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-stone-400">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{isPaused ? 'Đang tạm dừng' : 'Đang tập trung'}</span>
            </div>
          </div>

          {/* Controls Bar: Pause/Resume + Abandon */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-stone-800 relative z-10">
            <button
              type="button"
              onClick={handleTogglePause}
              className={`px-6 sm:px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
              className="px-5 py-3.5 rounded-2xl font-medium text-sm text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-900/40 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Từ bỏ phiên</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CONFIRM ABANDON MODAL (EXACT SPEC RULE)                     */}
      {/* ============================================================== */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
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
      {/* 4. COMPLETION MODAL                                            */}
      {/* ============================================================== */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
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
