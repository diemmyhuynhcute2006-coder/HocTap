import React from 'react';
import { CharacterState } from '../types';

interface ChibiCharacterProps {
  state: CharacterState;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeechBubble?: boolean;
  customMessage?: string;
}

export const ChibiCharacter: React.FC<ChibiCharacterProps> = ({
  state,
  className = '',
  size = 'md',
  showSpeechBubble = false,
  customMessage,
}) => {
  // Dimensions based on size
  const sizeMap = {
    sm: { width: 110, height: 170 },
    md: { width: 150, height: 230 },
    lg: { width: 190, height: 290 },
  };

  const { width, height } = sizeMap[size];

  // Speech bubble text based on state if not custom
  const getSpeechBubble = () => {
    if (customMessage) return customMessage;
    switch (state) {
      case 'welcome':
        return '👋 Chào mừng bạn đến với My Alcove!';
      case 'focus':
        return '📚 Cùng nhau tập trung nhé...';
      case 'complete':
        return '🎉 Tuyệt vời! Bạn đã hoàn thành!';
      case 'giveup':
        return '🌱 Không sao, lần sau thử lại nhé!';
      case 'idle':
      default:
        return '✨ Hôm nay bạn muốn làm gì nào?';
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {showSpeechBubble && (
        <div className="mb-2 px-3 py-1.5 bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl shadow-md border border-stone-200/80 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-200 max-w-[210px] text-center animate-gentle-float">
          {getSpeechBubble()}
          <div className="w-2 h-2 bg-white/95 dark:bg-stone-800/95 border-r border-b border-stone-200/80 dark:border-stone-700 rotate-45 mx-auto -mb-2.5 mt-0.5" />
        </div>
      )}

      {/* SVG Canvas for Chibi Character */}
      <svg
        viewBox="0 0 200 300"
        width={width}
        height={height}
        className="overflow-visible drop-shadow-md transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for hair, skin, pajama */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A2A2E" />
            <stop offset="70%" stopColor="#1E1E22" />
            <stop offset="100%" stopColor="#141416" />
          </linearGradient>

          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A4A52" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2A2A2E" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF2E8" />
            <stop offset="100%" stopColor="#FFE5D4" />
          </linearGradient>

          {/* Pastel Pajama Gradient: soft peach/lavender with cute subtle stars */}
          <linearGradient id="pajamaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E9D5FF" /> {/* soft lavender */}
            <stop offset="100%" stopColor="#FBCFE8" /> {/* soft rose pastel */}
          </linearGradient>

          <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#F5D0FE" />
          </linearGradient>

          {/* Blue Eye Gradient */}
          <linearGradient id="eyeBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>

          {/* Cheek Blush */}
          <radialGradient id="blushGrad">
            <stop offset="0%" stopColor="#F87171" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ============================================================== */}
        {/* CHARACTER RENDERING BY STATE (CONSISTENT PALETTE & PROPORTIONS) */}
        {/* ============================================================== */}

        {/* 1. FOCUS STATE: Sitting at desk with book and laptop/pen */}
        {state === 'focus' ? (
          <g className="animate-gentle-breath">
            {/* Soft Shadow */}
            <ellipse cx="100" cy="275" rx="55" ry="10" fill="rgba(0,0,0,0.12)" />

            {/* Back Hair Strands */}
            <path
              d="M 60,95 Q 40,165 65,210 Q 95,225 105,210 Q 140,215 145,170 Q 155,120 140,95 Z"
              fill="url(#hairGrad)"
            />

            {/* Body (Seated leaning slightly forward at desk) */}
            <g transform="translate(0, 10)">
              {/* Seated Legs in Pastel Pajama Pants */}
              <path
                d="M 65,225 Q 70,255 90,260 L 115,260 Q 135,255 135,225 Q 100,230 65,225 Z"
                fill="url(#pantsGrad)"
              />
              {/* Cute socks/slippers */}
              <ellipse cx="88" cy="264" rx="14" ry="7" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.2" />
              <ellipse cx="118" cy="264" rx="14" ry="7" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.2" />

              {/* Pajama Top (Torso) */}
              <path
                d="M 72,150 Q 65,195 70,225 Q 100,230 130,225 Q 135,195 128,150 Z"
                fill="url(#pajamaGrad)"
              />
              {/* Cute pajama print: little yellow star */}
              <polygon points="100,185 102,190 107,190 103,193 105,198 100,195 95,198 97,193 93,190 98,190" fill="#FDE047" opacity="0.85" />
              {/* Collar */}
              <path d="M 85,148 Q 100,160 115,148" fill="none" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />

              {/* Arms leaning on desk, holding pen */}
              {/* Left arm */}
              <path
                d="M 72,160 Q 60,185 75,200 L 92,205 Q 98,200 90,190 Q 78,180 82,160 Z"
                fill="url(#pajamaGrad)"
              />
              <circle cx="94" cy="202" r="6" fill="url(#skinGrad)" />

              {/* Right arm writing with pen */}
              <path
                d="M 128,160 Q 138,185 125,200 L 108,206 Q 103,200 110,190 Q 122,180 118,160 Z"
                fill="url(#pajamaGrad)"
              />
              <circle cx="106" cy="204" r="6" fill="url(#skinGrad)" />
              {/* Pastel Pen in hand */}
              <g className="animate-gentle-sway origin-[106px_204px]">
                <line x1="104" y1="200" x2="98" y2="216" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
                <polygon points="98,216 97,219 100,218" fill="#1E293B" />
              </g>

              {/* Study Notebook / Journal on table */}
              <rect x="75" y="210" width="50" height="24" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
              <line x1="100" y1="210" x2="100" y2="234" stroke="#D97706" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="80" y1="216" x2="95" y2="216" stroke="#92400E" strokeWidth="1" opacity="0.5" />
              <line x1="80" y1="221" x2="93" y2="221" stroke="#92400E" strokeWidth="1" opacity="0.5" />
              <line x1="105" y1="216" x2="120" y2="216" stroke="#92400E" strokeWidth="1" opacity="0.5" />
              <line x1="105" y1="221" x2="117" y2="221" stroke="#92400E" strokeWidth="1" opacity="0.5" />
            </g>

            {/* Neck */}
            <rect x="94" y="135" width="12" height="15" rx="4" fill="url(#skinGrad)" />

            {/* Head (Round chibi face) */}
            <ellipse cx="100" cy="95" rx="42" ry="40" fill="url(#skinGrad)" />

            {/* Blush cheeks */}
            <circle cx="75" cy="105" r="9" fill="url(#blushGrad)" />
            <circle cx="125" cy="105" r="9" fill="url(#blushGrad)" />

            {/* Focused Eyes (Gently looking down at book) */}
            <path d="M 76,96 Q 84,103 92,96" fill="none" stroke="#1E1E22" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 108,96 Q 116,103 124,96" fill="none" stroke="#1E1E22" strokeWidth="2.8" strokeLinecap="round" />

            {/* Concentrated peaceful soft smile */}
            <path d="M 96,114 Q 100,117 104,114" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />

            {/* Hair bangs and front hair (Soft shoulder-length black hair) */}
            <path
              d="M 58,85 Q 56,60 85,55 Q 120,53 142,65 Q 146,85 142,105 Q 135,115 130,95 Q 120,70 100,75 Q 85,73 70,100 Q 64,110 58,85 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair Side Locks */}
            <path d="M 58,85 Q 52,115 62,145 Q 67,130 64,105 Z" fill="url(#hairGrad)" />
            <path d="M 142,85 Q 148,115 138,145 Q 133,130 136,105 Z" fill="url(#hairGrad)" />

            {/* Hair Highlight Band */}
            <ellipse cx="100" cy="67" rx="28" ry="4" fill="url(#hairHighlight)" opacity="0.6" />
          </g>
        ) : (
          /* STANDING STATES: Welcome, Idle, Complete, Give Up */
          <g className={state === 'complete' ? 'animate-gentle-float' : state === 'idle' ? 'animate-gentle-breath' : ''}>
            {/* Shadow */}
            <ellipse cx="100" cy="285" rx="42" ry="7" fill="rgba(0,0,0,0.12)" />

            {/* Back Hair Strands (Black, wavy shoulder length) */}
            <path
              d="M 60,95 Q 42,160 58,205 Q 75,220 100,215 Q 125,220 142,205 Q 158,160 140,95 Z"
              fill="url(#hairGrad)"
            />

            {/* Legs with pastel pajama pants */}
            <rect x="80" y="210" width="16" height="60" rx="7" fill="url(#pantsGrad)" />
            <rect x="104" y="210" width="16" height="60" rx="7" fill="url(#pantsGrad)" />

            {/* Soft pink slippers with bunny/pompom */}
            <ellipse cx="88" cy="275" rx="13" ry="7" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.2" />
            <ellipse cx="112" cy="275" rx="13" ry="7" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.2" />
            <circle cx="88" cy="273" r="3" fill="#FBCFE8" />
            <circle cx="112" cy="273" r="3" fill="#FBCFE8" />

            {/* Torso: Pajama Top */}
            <path
              d="M 73,145 Q 67,185 72,215 Q 100,222 128,215 Q 133,185 127,145 Z"
              fill="url(#pajamaGrad)"
            />
            {/* Pajama Patterns: Cute tiny crescent moon and star */}
            <path d="M 88,172 A 4,4 0 0,0 93,178 A 5,5 0 0,1 88,172 Z" fill="#FDE047" opacity="0.9" />
            <polygon points="112,185 113.5,188 117,188 114,190 115,194 112,192 109,194 110,190 107,188 110.5,188" fill="#FDE047" opacity="0.85" />
            {/* Collar */}
            <path d="M 86,145 Q 100,157 114,145" fill="none" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />

            {/* Arms depending on state */}
            {state === 'welcome' && (
              /* Waving Right Hand, Left Arm at Side */
              <>
                {/* Left Arm at side */}
                <path d="M 73,150 Q 64,175 66,198" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                <circle cx="66" cy="202" r="6" fill="url(#skinGrad)" />

                {/* Right Arm Waving with motion */}
                <g className="animate-wave-hand origin-[130px_150px]">
                  <path d="M 127,150 Q 146,140 148,118" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                  <circle cx="148" cy="114" r="6" fill="url(#skinGrad)" />
                  {/* Tiny waving sparkles */}
                  <text x="156" y="112" fontSize="12" fill="#F59E0B">✨</text>
                </g>
              </>
            )}

            {state === 'complete' && (
              /* Joyful Victory: Both Hands Raised in Celebration */
              <>
                <g className="animate-gentle-sway origin-[100px_200px]">
                  {/* Left Arm Up */}
                  <path d="M 74,152 Q 52,130 55,108" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                  <circle cx="55" cy="104" r="6" fill="url(#skinGrad)" />
                  <text x="38" y="100" fontSize="14">✨</text>

                  {/* Right Arm Up */}
                  <path d="M 126,152 Q 148,130 145,108" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                  <circle cx="145" cy="104" r="6" fill="url(#skinGrad)" />
                  <text x="150" y="100" fontSize="14">⭐</text>
                </g>
              </>
            )}

            {state === 'giveup' && (
              /* Empathetic / Resting hands in front */
              <>
                <path d="M 73,150 Q 75,185 92,192" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                <circle cx="94" cy="193" r="6" fill="url(#skinGrad)" />

                <path d="M 127,150 Q 125,185 108,192" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                <circle cx="106" cy="193" r="6" fill="url(#skinGrad)" />
              </>
            )}

            {state === 'idle' && (
              /* Natural relaxed arms */
              <>
                <path d="M 73,150 Q 66,175 70,198" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                <circle cx="70" cy="202" r="6" fill="url(#skinGrad)" />

                <path d="M 127,150 Q 134,175 130,198" fill="none" stroke="url(#pajamaGrad)" strokeWidth="13" strokeLinecap="round" />
                <circle cx="130" cy="202" r="6" fill="url(#skinGrad)" />
              </>
            )}

            {/* Neck */}
            <rect x="94" y="132" width="12" height="16" rx="4" fill="url(#skinGrad)" />

            {/* Head (Chibi proportion 1:3) */}
            <ellipse cx="100" cy="94" rx="42" ry="40" fill="url(#skinGrad)" />

            {/* Blush Cheeks */}
            <circle cx="75" cy="104" r="9" fill="url(#blushGrad)" />
            <circle cx="125" cy="104" r="9" fill="url(#blushGrad)" />

            {/* Eyes & Expression by state */}
            {state === 'complete' ? (
              /* Happy Closed Arcs (Joyful celebration) */
              <>
                <path d="M 75,98 Q 84,88 93,98" fill="none" stroke="#1E1E22" strokeWidth="3" strokeLinecap="round" />
                <path d="M 107,98 Q 116,88 125,98" fill="none" stroke="#1E1E22" strokeWidth="3" strokeLinecap="round" />
                {/* Wide Happy Smile */}
                <path d="M 93,108 Q 100,122 107,108 Z" fill="#E11D48" />
                <ellipse cx="100" cy="112" rx="4" ry="2" fill="#FDA4AF" />
              </>
            ) : state === 'giveup' ? (
              /* Empathetic, gentle wistful eyes */
              <>
                {/* Blue Eyes looking gently with slight droop */}
                <ellipse cx="83" cy="96" rx="9" ry="11" fill="url(#eyeBlueGrad)" />
                <ellipse cx="117" cy="96" rx="9" ry="11" fill="url(#eyeBlueGrad)" />
                <circle cx="83" cy="96" r="6" fill="#0C4A6E" />
                <circle cx="117" cy="96" r="6" fill="#0C4A6E" />
                {/* Sparkle highlights */}
                <circle cx="81" cy="92" r="3" fill="#FFFFFF" />
                <circle cx="115" cy="92" r="3" fill="#FFFFFF" />
                {/* Eyelids */}
                <path d="M 73,92 Q 83,86 93,92" fill="none" stroke="#1E1E22" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 107,92 Q 117,86 127,92" fill="none" stroke="#1E1E22" strokeWidth="2.5" strokeLinecap="round" />
                {/* Soft encouraging smile */}
                <path d="M 95,114 Q 100,118 105,114" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              /* Welcome & Idle: Wide twinkly blue eyes with friendly smile */
              <>
                {/* Left Blue Eye */}
                <ellipse cx="83" cy="96" rx="9.5" ry="12" fill="url(#eyeBlueGrad)" />
                <circle cx="83" cy="96" r="6" fill="#0C4A6E" />
                {/* Highlights */}
                <circle cx="80" cy="91" r="3.5" fill="#FFFFFF" />
                <circle cx="86" cy="99" r="1.5" fill="#FFFFFF" />
                <path d="M 73,88 Q 83,82 93,89" fill="none" stroke="#1E1E22" strokeWidth="2.8" strokeLinecap="round" />

                {/* Right Blue Eye */}
                <ellipse cx="117" cy="96" rx="9.5" ry="12" fill="url(#eyeBlueGrad)" />
                <circle cx="117" cy="96" r="6" fill="#0C4A6E" />
                {/* Highlights */}
                <circle cx="114" cy="91" r="3.5" fill="#FFFFFF" />
                <circle cx="120" cy="99" r="1.5" fill="#FFFFFF" />
                <path d="M 107,89 Q 117,82 127,88" fill="none" stroke="#1E1E22" strokeWidth="2.8" strokeLinecap="round" />

                {/* Warm cheerful smile */}
                <path d="M 94,111 Q 100,119 106,111" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}

            {/* Hair bangs and front hair (Soft shoulder-length black hair) */}
            <path
              d="M 58,85 Q 56,60 85,55 Q 120,53 142,65 Q 146,85 142,105 Q 135,115 130,95 Q 120,70 100,75 Q 85,73 70,100 Q 64,110 58,85 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair Side Locks */}
            <path d="M 58,85 Q 52,115 62,150 Q 68,135 64,105 Z" fill="url(#hairGrad)" />
            <path d="M 142,85 Q 148,115 138,150 Q 132,135 136,105 Z" fill="url(#hairGrad)" />

            {/* Hair Highlight Band */}
            <ellipse cx="100" cy="67" rx="28" ry="4" fill="url(#hairHighlight)" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
};
