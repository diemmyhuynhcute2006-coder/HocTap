import React from 'react';

interface VirtualPetProps {
  petId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const VirtualPet: React.FC<VirtualPetProps> = ({ petId, className = '', size = 'md' }) => {
  const isSm = size === 'sm';
  const width = isSm ? 60 : 85;
  const height = isSm ? 45 : 65;

  if (petId === 'pet_shiba_taro') {
    // Shiba Inu dog
    return (
      <div className={`relative inline-block ${className}`} title="Cún Shiba Taro">
        <svg viewBox="0 0 100 80" width={width} height={height} className="overflow-visible">
          {/* Shadow */}
          <ellipse cx="50" cy="74" rx="35" ry="5" fill="rgba(0,0,0,0.12)" />
          {/* Shiba Body */}
          <ellipse cx="50" cy="52" rx="28" ry="18" fill="#F59E0B" />
          <ellipse cx="48" cy="54" rx="20" ry="12" fill="#FEF3C7" />
          {/* Wagging Tail */}
          <g className="animate-gentle-sway origin-[75px_45px]">
            <path d="M 72,48 Q 88,35 84,24 Q 78,35 70,44" fill="#F59E0B" />
            <path d="M 82,26 Q 84,24 80,30" fill="#FEF3C7" />
          </g>
          {/* Front Paws */}
          <ellipse cx="32" cy="68" rx="6" ry="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.8" />
          <ellipse cx="46" cy="68" rx="6" ry="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.8" />
          {/* Back Paws */}
          <ellipse cx="66" cy="66" rx="7" ry="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.8" />
          {/* Shiba Head */}
          <ellipse cx="28" cy="36" rx="16" ry="14" fill="#F59E0B" />
          <ellipse cx="28" cy="40" rx="11" ry="8" fill="#FEF3C7" />
          {/* Ears */}
          <polygon points="18,28 14,14 26,24" fill="#F59E0B" />
          <polygon points="18,26 16,17 24,24" fill="#FED7AA" />
          <polygon points="32,24 40,14 38,28" fill="#F59E0B" />
          <polygon points="34,24 38,17 38,26" fill="#FED7AA" />
          {/* Snout & Nose */}
          <ellipse cx="20" cy="38" rx="5" ry="4" fill="#FEF3C7" />
          <polygon points="17,36 19,38 15,38" fill="#1E293B" />
          {/* Happy Eyes */}
          <path d="M 22,32 Q 26,29 28,33" fill="none" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 32,32 Q 35,29 38,33" fill="none" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
          {/* Tongue */}
          <path d="M 18,40 Q 20,44 22,40" fill="#F43F5E" />
          {/* Little Red Scarf */}
          <path d="M 22,46 Q 32,50 38,44" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (petId === 'pet_bunny_may') {
    // White Bunny
    return (
      <div className={`relative inline-block ${className}`} title="Thỏ Bông Mây Trắng">
        <svg viewBox="0 0 100 80" width={width} height={height} className="overflow-visible">
          {/* Shadow */}
          <ellipse cx="50" cy="74" rx="30" ry="5" fill="rgba(0,0,0,0.12)" />
          {/* Bunny Body */}
          <ellipse cx="52" cy="54" rx="24" ry="17" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          {/* Puffy Tail */}
          <circle cx="76" cy="52" r="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Front Paws */}
          <ellipse cx="36" cy="68" rx="6" ry="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <ellipse cx="48" cy="68" rx="6" ry="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Bunny Head */}
          <circle cx="34" cy="40" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Long Ears with soft twitch */}
          <g className="animate-gentle-sway origin-[30px_30px]">
            <ellipse cx="26" cy="18" rx="5" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <ellipse cx="26" cy="18" rx="2.5" ry="9" fill="#FBCFE8" />
            <ellipse cx="36" cy="17" rx="5" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <ellipse cx="36" cy="17" rx="2.5" ry="9" fill="#FBCFE8" />
          </g>
          {/* Cheeks and Nose */}
          <circle cx="28" cy="44" r="3" fill="#FDA4AF" opacity="0.6" />
          <circle cx="38" cy="44" r="3" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="33" cy="42" rx="1.5" ry="1" fill="#FB7185" />
          {/* Dark gentle eyes */}
          <circle cx="29" cy="38" r="2" fill="#334155" />
          <circle cx="36" cy="38" r="2" fill="#334155" />
        </svg>
      </div>
    );
  }

  // Default: Calico Cat (Mèo Múp Mochi)
  return (
    <div className={`relative inline-block ${className}`} title="Mèo Múp Mochi">
      <svg viewBox="0 0 100 80" width={width} height={height} className="overflow-visible animate-gentle-breath">
        {/* Soft Cat Cushion / Mat */}
        <ellipse cx="50" cy="68" rx="38" ry="8" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1.2" />

        {/* Curled Cat Body */}
        <ellipse cx="50" cy="52" rx="26" ry="18" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        {/* Calico orange and black spots */}
        <path d="M 52,38 Q 65,36 68,48 Q 58,56 50,46 Z" fill="#F97316" />
        <path d="M 32,46 Q 38,40 44,48 Q 38,58 32,52 Z" fill="#334155" />

        {/* Curled Tail */}
        <path d="M 72,54 Q 82,48 78,40" fill="none" stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" />

        {/* Cat Head */}
        <circle cx="32" cy="46" r="14" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        {/* Calico spot on head */}
        <path d="M 28,34 Q 38,34 36,44 Q 30,42 26,38 Z" fill="#F97316" />

        {/* Cat Ears */}
        <polygon points="22,38 18,26 28,32" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <polygon points="22,36 20,29 26,33" fill="#FDA4AF" />
        <polygon points="34,32 40,24 40,36" fill="#334155" />
        <polygon points="36,32 39,27 39,34" fill="#FDA4AF" />

        {/* Sleeping peaceful eyes */}
        <path d="M 24,47 Q 27,50 30,47" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 33,47 Q 36,50 39,47" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        {/* Cute pink nose & whiskers */}
        <polygon points="31,50 33,50 32,51.5" fill="#FB7185" />
        <line x1="20" y1="48" x2="14" y2="47" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="20" y1="51" x2="14" y2="52" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="41" y1="48" x2="47" y2="47" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="41" y1="51" x2="47" y2="52" stroke="#CBD5E1" strokeWidth="1" />

        {/* Floating little 'z z Z' */}
        <text x="56" y="32" fontSize="9" fill="#A855F7" className="animate-gentle-float font-bold">z</text>
        <text x="64" y="24" fontSize="12" fill="#A855F7" className="animate-gentle-float font-bold">Z</text>
      </svg>
    </div>
  );
};
