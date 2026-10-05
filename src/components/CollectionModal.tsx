import React, { useState } from 'react';
import { Package, X, Check, Home, Sparkles } from 'lucide-react';
import { ItemCategory, RoomCustomization, ShopItem, ThemeColor } from '../types';
import { SHOP_ITEMS, THEME_CONFIGS } from '../data/items';
import { audioService } from '../utils/audio';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedItemIds: string[];
  roomSetup: RoomCustomization;
  themeColor: ThemeColor;
  onPlaceItem: (item: ShopItem) => void;
  onRemoveItem: (item: ShopItem) => void;
  onSelectTheme: (theme: ThemeColor) => void;
  onOpenShop: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  ownedItemIds,
  roomSetup,
  themeColor,
  onPlaceItem,
  onRemoveItem,
  onSelectTheme,
  onOpenShop,
}) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const theme = THEME_CONFIGS[themeColor];

  if (!isOpen) return null;

  const categories: { key: ItemCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: '🎒' },
    { key: 'plants', label: 'Cây & Hoa', icon: '🌱' },
    { key: 'furniture', label: 'Nội thất & Bàn', icon: '🪑' },
    { key: 'wall', label: 'Trang trí tường', icon: '🖼️' },
    { key: 'pets', label: 'Thú cưng', icon: '🐱' },
    { key: 'window', label: 'Cảnh ngoài trời', icon: '🪟' },
    { key: 'themes', label: 'Chủ đề', icon: '🎨' },
  ];

  // Filter items owned by the user (including default free items)
  const ownedItems = SHOP_ITEMS.filter((item) => {
    const isOwned = ownedItemIds.includes(item.id) || item.price === 0;
    if (!isOwned) return false;
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Check if an item is currently placed in the room
  const isItemActive = (item: ShopItem) => {
    if (item.category === 'plants') {
      return roomSetup.deskItem === item.id || roomSetup.floorItem === item.id;
    }
    if (item.category === 'furniture') {
      return roomSetup.deskItem === item.id || roomSetup.floorItem === item.id || roomSetup.shelfItem === item.id;
    }
    if (item.category === 'wall') {
      return roomSetup.wallItem === item.id;
    }
    if (item.category === 'pets') {
      return roomSetup.petItem === item.id;
    }
    if (item.category === 'window') {
      return roomSetup.windowView === item.windowType;
    }
    if (item.category === 'themes') {
      return themeColor === item.themeId;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Bộ sưu tập của bạn</span>
                <span className="text-xs font-normal text-stone-400">· {ownedItems.length} vật phẩm</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Lựa chọn và bày trí vật phẩm vào căn phòng My Alcove của bạn.
              </p>
            </div>
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

        {/* Categories */}
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

        {/* Content / Items Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {ownedItems.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="text-4xl">🎒</div>
              <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
                Bộ sưu tập của bạn đang trống
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Hãy hoàn thành các phiên tập trung để nhận Focus Points và ghé Cửa hàng mở khóa những vật phẩm xinh xắn nhé!
              </p>
              <button
                onClick={() => {
                  audioService.playClick();
                  onClose();
                  onOpenShop();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${theme.accentBg} ${theme.accentHover}`}
              >
                Ghé thăm Cửa hàng ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {ownedItems.map((item) => {
                const active = isItemActive(item);

                return (
                  <div
                    key={item.id}
                    className={`bg-stone-50/80 dark:bg-stone-800/40 rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      active
                        ? 'border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-400/20'
                        : 'border-stone-200/70 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-3xl p-2 bg-white dark:bg-stone-800 rounded-xl shadow-xs">
                          {item.icon}
                        </span>
                        {active && (
                          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 flex items-center gap-1">
                            <Home className="w-3 h-3" /> Đang dùng
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
                      {item.category === 'themes' ? (
                        <button
                          onClick={() => {
                            audioService.playClick();
                            if (item.themeId) onSelectTheme(item.themeId);
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                            active
                              ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-default'
                              : `${theme.accentBg} ${theme.accentHover}`
                          }`}
                        >
                          {active ? 'Chủ đề đang dùng' : 'Áp dụng chủ đề'}
                        </button>
                      ) : active ? (
                        <button
                          onClick={() => {
                            audioService.playClick();
                            onRemoveItem(item);
                          }}
                          className="w-full py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-700/60 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                        >
                          Bỏ ra khỏi phòng
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            audioService.playRewardChime();
                            onPlaceItem(item);
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${theme.accentBg} ${theme.accentHover}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Trang trí vào phòng</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
