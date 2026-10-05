import React from 'react';
import { ChibiCharacter } from './ChibiCharacter';
import { ThemeColor } from '../types';
import { THEME_CONFIGS } from '../data/items';
import { audioService } from '../utils/audio';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: ThemeColor;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, themeColor }) => {
  if (!isOpen) return null;
  const theme = THEME_CONFIGS[themeColor];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-5 animate-gentle-float">
        {/* Satisfy Font Brand Logo */}
        <div className="space-y-1">
          <div className="font-['Satisfy'] text-4xl sm:text-5xl text-amber-700 dark:text-amber-400 select-none">
            My Alcove
          </div>
          <div className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
            Personal Cozy Focus Space
          </div>
        </div>

        {/* Waving Chibi Character */}
        <div className="py-2 flex justify-center">
          <ChibiCharacter state="welcome" size="md" showSpeechBubble={false} />
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Chào mừng bạn đến với My Alcove
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-xs mx-auto">
            Một góc nhỏ dành riêng cho sự tập trung của bạn. Nơi bạn có thể học tập, làm việc, tích lũy điểm và tự tay trang trí căn phòng yêu thích.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${theme.accentBg} ${theme.accentHover}`}
        >
          Khám phá không gian ngay ✨
        </button>
      </div>
    </div>
  );
};
