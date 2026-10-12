import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Star, X } from 'lucide-react';
import { ThemeColor } from '../types';
import { THEME_CONFIGS } from '../data/items';
import { audioService } from '../utils/audio';

interface StreakRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  rewardTitle: string;
  bonusPoints: number;
  themeColor: ThemeColor;
}

export const StreakRewardModal: React.FC<StreakRewardModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  rewardTitle,
  bonusPoints,
  themeColor,
}) => {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fire celebratory confetti when opened
  useEffect(() => {
    if (!isOpen) return;
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#F97316', '#FBBF24', '#EC4899', '#A855F7'],
      });
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const theme = THEME_CONFIGS[themeColor];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audioService.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-orange-200 dark:border-orange-950 text-center space-y-5 animate-gentle-float">
        <div className="w-16 h-16 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-3xl flex items-center justify-center mx-auto text-white shadow-lg">
          <Flame className="w-9 h-9 fill-current" />
        </div>

        <div>
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 rounded-full text-xs font-bold uppercase tracking-wider">
            Cột mốc Streak {streakDays} Ngày!
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
            Phần thưởng Streak đặc biệt
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Bạn đã kiên trì tập trung liên tục trong {streakDays} ngày. Thật tuyệt vời!
          </p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-900/40 text-left flex items-center gap-3.5">
          <span className="text-3xl">🎁</span>
          <div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {rewardTitle}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold font-mono mt-0.5">
              +{bonusPoints} Focus Points đã cộng vào tài khoản
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${theme.accentBg} ${theme.accentHover}`}
        >
          Nhận thưởng & Tiếp tục giữ vững phong độ! 🔥
        </button>
      </div>
    </div>
  );
};
