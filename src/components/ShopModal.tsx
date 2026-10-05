import React, { useState } from 'react';
import { ShoppingBag, Lock, Check, Sparkles, X } from 'lucide-react';
import { ItemCategory, ShopItem, ThemeColor } from '../types';
import { SHOP_ITEMS, THEME_CONFIGS } from '../data/items';
import { audioService } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  currentStreak: number;
  ownedItemIds: string[];
  themeColor: ThemeColor;
  onBuyItem: (item: ShopItem) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  currentStreak,
  ownedItemIds,
  themeColor,
  onBuyItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const theme = THEME_CONFIGS[themeColor];

  if (!isOpen) return null;

  const categories: { key: ItemCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: '🛍️' },
    { key: 'plants', label: 'Cây & Hoa', icon: '🌱' },
    { key: 'furniture', label: 'Nội thất & Bàn', icon: '🪑' },
    { key: 'wall', label: 'Trang trí tường', icon: '🖼️' },
    { key: 'pets', label: 'Thú cưng ảo', icon: '🐱' },
    { key: 'window', label: 'Cảnh ngoài trời', icon: '🪟' },
    { key: 'themes', label: 'Chủ đề giao diện', icon: '🎨' },
  ];

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Cửa hàng Alcove</span>
                <span className="text-xs font-normal text-stone-400">· Trang trí phòng</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sử dụng Focus Points để mở khóa các vật phẩm ấm cúng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Current Balance Display */}
            <div className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 font-mono">
              <span>⭐</span>
              <span>{currentPoints} FP</span>
            </div>

            <button
              onClick={() => {
                audioService.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setActiveCategory(cat.key);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${theme.accentBg} shadow-xs`
                    : 'bg-white dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 border border-stone-200/60 dark:border-stone-700/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const isOwned = ownedItemIds.includes(item.id) || item.price === 0;
            const isLockedByStreak = Boolean(item.streakRequired && currentStreak < item.streakRequired);
            const canAfford = currentPoints >= item.price;

            return (
              <div
                key={item.id}
                className="bg-stone-50/80 dark:bg-stone-800/40 rounded-2xl p-4 border border-stone-200/70 dark:border-stone-800 flex flex-col justify-between hover:border-amber-400/50 dark:hover:border-amber-600/50 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-3xl p-2 bg-white dark:bg-stone-800 rounded-xl shadow-xs">
                      {item.icon}
                    </span>
                    {isOwned ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã có
                      </span>
                    ) : isLockedByStreak ? (
                      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Cần Streak {item.streakRequired} ngày
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
                        {item.price} FP
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-200/50 dark:border-stone-800/80">
                  {isOwned ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl text-xs font-medium text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/60 cursor-not-allowed"
                    >
                      Đã sở hữu
                    </button>
                  ) : isLockedByStreak ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl text-xs font-medium text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/60 cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" /> Chưa mở khóa
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          audioService.playRewardChime();
                          onBuyItem(item);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? `${theme.accentBg} ${theme.accentHover}`
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{canAfford ? `Mua ngay · ${item.price} FP` : `Thiếu ${item.price - currentPoints} FP`}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
