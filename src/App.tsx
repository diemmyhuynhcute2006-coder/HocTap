import React, { useState, useEffect } from 'react';
import {
  Home,
  Target,
  Package,
  ShoppingBag,
  BarChart3,
  History,
  Settings as SettingsIcon,
  Flame,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CharacterState,
  FocusSession,
  RoomCustomization,
  ShopItem,
  ThemeColor,
  UserProgress,
  UserSettings,
} from './types';
import { THEME_CONFIGS, STREAK_REWARDS } from './data/items';
import { AlcoveRoom } from './components/AlcoveRoom';
import { FocusTimer } from './components/FocusTimer';
import { ShopModal } from './components/ShopModal';
import { CollectionModal } from './components/CollectionModal';
import { StatisticsView } from './components/StatisticsView';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { StreakRewardModal } from './components/StreakRewardModal';
import { audioService } from './utils/audio';

const STORAGE_KEY_PROGRESS = 'my_alcove_progress_v1';
const STORAGE_KEY_SETTINGS = 'my_alcove_settings_v1';

// Initial default state
const getInitialProgress = (): UserProgress => {
  const today = new Date().toLocaleDateString('en-CA');
  const initialSession: FocusSession = {
    id: 'init-1',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    activityType: 'study',
    goal: 'Khởi động không gian My Alcove',
    durationMinutes: 25,
    actualMinutes: 25,
    status: 'completed',
    pointsEarned: 25,
    dateStr: today,
  };

  return {
    focusPoints: 45,
    totalPointsEarned: 45,
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: today,
    ownedItemIds: ['window_sunny', 'theme_green', 'desk_coffee_mug'],
    roomSetup: {
      deskItem: 'desk_coffee_mug',
      wallItem: null,
      floorItem: null,
      shelfItem: null,
      petItem: null,
      windowView: 'sunny',
      lampOn: true,
    },
    sessions: [initialSession],
    streakRewardsClaimed: [],
  };
};

const getInitialSettings = (): UserSettings => ({
  themeColor: 'green',
  darkMode: false,
  soundVolume: 0.6,
  ambientSound: 'none',
  timerChime: true,
  showCharacter: true,
  showPet: true,
  hasSeenWelcome: false,
});

export default function App() {
  // Navigation tabs: 'room' | 'focus' | 'stats' | 'history'
  const [activeTab, setActiveTab] = useState<'room' | 'focus' | 'stats' | 'history'>('room');

  // Modals state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  // Streak Reward popup state
  const [streakModalData, setStreakModalData] = useState<{
    streakDays: number;
    rewardTitle: string;
    bonusPoints: number;
  } | null>(null);

  // App Persistent State
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialProgress();
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialSettings();
  });

  // Character emotional state
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [isFocusing, setIsFocusing] = useState<boolean>(false);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Dark mode HTML class sync
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // First time welcome dialog
  useEffect(() => {
    if (!settings.hasSeenWelcome) {
      setIsWelcomeOpen(true);
      setCharacterState('welcome');
    }
  }, [settings.hasSeenWelcome]);

  const theme = THEME_CONFIGS[settings.themeColor];

  // Helper: check and update Streak
  const updateStreakOnSessionComplete = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('en-CA');

    let newStreak = progress.currentStreak;

    if (!progress.lastActiveDate) {
      newStreak = 1;
    } else if (progress.lastActiveDate === today) {
      // already completed a session today, streak stays current
      newStreak = progress.currentStreak;
    } else if (progress.lastActiveDate === yesterday) {
      // completed yesterday, streak advances!
      newStreak = progress.currentStreak + 1;
    } else {
      // missed days, resets to 1
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, progress.longestStreak);

    // Check if newStreak hits a 5-day milestone that hasn't been claimed yet
    let bonusFP = 0;
    let newItemsUnlocked = [...progress.ownedItemIds];
    const newRewardsClaimed = [...progress.streakRewardsClaimed];

    const milestoneReward = STREAK_REWARDS.find(
      (r) => r.streakDays === newStreak && !progress.streakRewardsClaimed.includes(newStreak)
    );

    if (milestoneReward) {
      bonusFP = milestoneReward.bonusPoints;
      if (milestoneReward.itemId && !newItemsUnlocked.includes(milestoneReward.itemId)) {
        newItemsUnlocked.push(milestoneReward.itemId);
      }
      newRewardsClaimed.push(newStreak);

      setStreakModalData({
        streakDays: newStreak,
        rewardTitle: milestoneReward.rewardTitle,
        bonusPoints: milestoneReward.bonusPoints,
      });
    }

    return {
      newStreak,
      newLongest,
      bonusFP,
      newItemsUnlocked,
      newRewardsClaimed,
      today,
    };
  };

  // Complete a focus session
  const handleSessionComplete = (sessionData: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
    };

    const streakUpdate = updateStreakOnSessionComplete();

    setProgress((prev) => ({
      ...prev,
      focusPoints: prev.focusPoints + sessionData.pointsEarned + streakUpdate.bonusFP,
      totalPointsEarned: prev.totalPointsEarned + sessionData.pointsEarned + streakUpdate.bonusFP,
      currentStreak: streakUpdate.newStreak,
      longestStreak: streakUpdate.newLongest,
      lastActiveDate: streakUpdate.today,
      ownedItemIds: streakUpdate.newItemsUnlocked,
      streakRewardsClaimed: streakUpdate.newRewardsClaimed,
      sessions: [newSession, ...prev.sessions],
    }));

    setCharacterState('complete');
    setTimeout(() => {
      setCharacterState('idle');
    }, 7000);
  };

  // Abandon a focus session
  const handleSessionAbandon = (sessionData: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
    };

    setProgress((prev) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
    }));

    setCharacterState('giveup');
    setTimeout(() => {
      setCharacterState('idle');
    }, 6000);
  };

  // Handle focus active state change
  const handleFocusStateChange = (isNowFocusing: boolean) => {
    setIsFocusing(isNowFocusing);
    setCharacterState(isNowFocusing ? 'focus' : 'idle');
  };

  // Buy item in shop
  const handleBuyItem = (item: ShopItem) => {
    if (progress.focusPoints < item.price) return;

    setProgress((prev) => ({
      ...prev,
      focusPoints: prev.focusPoints - item.price,
      ownedItemIds: [...prev.ownedItemIds, item.id],
    }));
  };

  // Place item into room
  const handlePlaceItem = (item: ShopItem) => {
    setProgress((prev) => {
      const room = { ...prev.roomSetup };

      if (item.category === 'plants') {
        if (item.id === 'plant_snake' || item.id === 'plant_monstera') {
          room.floorItem = item.id;
        } else {
          room.deskItem = item.id;
        }
      } else if (item.category === 'furniture') {
        if (item.id === 'floor_rug_boho') {
          room.floorItem = item.id;
        } else if (item.id === 'shelf_crystal') {
          room.shelfItem = item.id;
        } else {
          room.deskItem = item.id;
        }
      } else if (item.category === 'wall') {
        room.wallItem = item.id;
      } else if (item.category === 'pets') {
        room.petItem = item.id;
      } else if (item.category === 'window' && item.windowType) {
        room.windowView = item.windowType;
      }

      return { ...prev, roomSetup: room };
    });
  };

  // Remove item from room
  const handleRemoveItem = (item: ShopItem) => {
    setProgress((prev) => {
      const room = { ...prev.roomSetup };
      if (room.deskItem === item.id) room.deskItem = null;
      if (room.floorItem === item.id) room.floorItem = null;
      if (room.wallItem === item.id) room.wallItem = null;
      if (room.shelfItem === item.id) room.shelfItem = null;
      if (room.petItem === item.id) room.petItem = null;
      if (item.category === 'window') room.windowView = 'sunny';
      return { ...prev, roomSetup: room };
    });
  };

  // Toggle room desk lamp
  const handleToggleLamp = () => {
    audioService.playClick();
    setProgress((prev) => ({
      ...prev,
      roomSetup: { ...prev.roomSetup, lampOn: !prev.roomSetup.lampOn },
    }));
  };

  // Reset Progress
  const handleResetProgress = () => {
    audioService.playClick();
    setProgress((prev) => ({
      ...prev,
      focusPoints: 0,
      currentStreak: 0,
      streakRewardsClaimed: [],
    }));
  };

  // Clear All Data
  const handleClearAllData = () => {
    audioService.playClick();
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    setProgress(getInitialProgress());
    setSettings(getInitialSettings());
  };

  // Export JSON backup
  const handleExportData = () => {
    const data = {
      progress,
      settings,
      exportedAt: new Date().toISOString(),
      app: 'My Alcove',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-alcove-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (jsonStr: string) => {
    const parsed = JSON.parse(jsonStr);
    if (parsed.progress) setProgress(parsed.progress);
    if (parsed.settings) setSettings(parsed.settings);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${settings.darkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-800'}`}>
      {/* ============================================================== */}
      {/* TOP BAR CONTRACT: Brand — Nav/Stats — Actions                  */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Zone 1: Single Brand element */}
        <div
          onClick={() => setActiveTab('room')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <span className="font-['Satisfy'] text-2xl sm:text-3xl text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform">
            My Alcove
          </span>
          <span className="hidden md:inline text-xs text-stone-400 font-medium ml-1">
            Không gian tập trung ấm áp
          </span>
        </div>

        {/* Zone 2: Streak & Points Display */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Streak Indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold font-mono"
            title={`Streak hiện tại: ${progress.currentStreak} ngày liên tiếp. Kỷ lục: ${progress.longestStreak} ngày.`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-orange-500 animate-pulse" />
            <span>{progress.currentStreak} ngày</span>
          </div>

          {/* Focus Points Balance */}
          <div
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
            title="Focus Points dùng để mở khóa vật phẩm trong Cửa hàng"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{progress.focusPoints} FP</span>
          </div>
        </div>

        {/* Zone 3: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Shop button */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setIsShopOpen(true);
            }}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="Cửa hàng vật phẩm"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Collection button */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setIsCollectionOpen(true);
            }}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="Bộ sưu tập phòng"
          >
            <Package className="w-4 h-4" />
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="Cài đặt"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN LAYOUT (DESKTOP SIDEBAR + CONTENT / MOBILE BOTTOM NAV)    */}
      {/* ============================================================== */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 sm:p-6 gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-56 space-y-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setActiveTab('room');
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'room'
                ? `${theme.accentBg} shadow-md`
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Góc của tôi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setActiveTab('focus');
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'focus'
                ? `${theme.accentBg} shadow-md`
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Tập trung</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setIsCollectionOpen(true);
            }}
            className="w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Bộ sưu tập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setIsShopOpen(true);
            }}
            className="w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cửa hàng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setActiveTab('stats');
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'stats'
                ? `${theme.accentBg} shadow-md`
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống kê</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setActiveTab('history');
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'history'
                ? `${theme.accentBg} shadow-md`
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              setIsSettingsOpen(true);
            }}
            className="w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Cài đặt</span>
          </button>

          {/* Quick Streak Tip box */}
          <div className="pt-6 mt-auto">
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                <span>🔥 Streak 5 ngày</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Hoàn thành phiên mỗi ngày để nhận Mèo Múp Mochi và bonus Focus Points!
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col space-y-6 pb-20 lg:pb-6">
          {/* TAB 1: GÓC CỦA TÔI (MY ALCOVE ROOM & FOCUS SHORTCUT) */}
          {activeTab === 'room' && (
            <div className="space-y-6">
              {/* Cozy Room Canvas */}
              <AlcoveRoom
                characterState={characterState}
                roomSetup={progress.roomSetup}
                showCharacter={settings.showCharacter}
                showPet={settings.showPet}
                onToggleLamp={handleToggleLamp}
                onSlotClick={() => setIsCollectionOpen(true)}
                isFocusModeActive={isFocusing}
              />

              {/* Focus Quick Action / Timer Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Sẵn sàng cho một phiên tập trung mới?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Đặt mục tiêu, bật tiếng mưa và cùng Chibi hoàn thành công việc của bạn.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setActiveTab('focus');
                    }}
                    className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-all ${theme.accentBg} ${theme.accentHover} flex items-center justify-center gap-2`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Mở góc tập trung</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setIsCollectionOpen(true);
                    }}
                    className="px-4 py-3 rounded-2xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    Trang trí phòng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TẬP TRUNG (TIMER VIEW & COMPANION) */}
          {activeTab === 'focus' && (
            <div className="space-y-6">
              {/* Small mini-view of Room while focusing */}
              <div className="max-w-2xl mx-auto">
                <AlcoveRoom
                  characterState={characterState}
                  roomSetup={progress.roomSetup}
                  showCharacter={settings.showCharacter}
                  showPet={settings.showPet}
                  onToggleLamp={handleToggleLamp}
                  isFocusModeActive={isFocusing}
                />
              </div>

              {/* The Focus Timer Controller */}
              <FocusTimer
                themeColor={settings.themeColor}
                onSessionComplete={handleSessionComplete}
                onSessionAbandon={handleSessionAbandon}
                onFocusStateChange={handleFocusStateChange}
              />
            </div>
          )}

          {/* TAB 3: THỐNG KÊ (STATISTICS) */}
          {activeTab === 'stats' && (
            <StatisticsView
              sessions={progress.sessions}
              currentPoints={progress.focusPoints}
              totalPointsEarned={progress.totalPointsEarned}
              currentStreak={progress.currentStreak}
              longestStreak={progress.longestStreak}
              themeColor={settings.themeColor}
            />
          )}

          {/* TAB 4: LỊCH SỬ (HISTORY) */}
          {activeTab === 'history' && (
            <HistoryView sessions={progress.sessions} />
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR                                   */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-2 py-1.5 flex items-center justify-around z-40">
        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('room');
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === 'room' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Góc tôi</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('focus');
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === 'focus' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-500'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span>Tập trung</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setIsShopOpen(true);
          }}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Cửa hàng</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setIsCollectionOpen(true);
          }}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Bộ sưu tập</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('stats');
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === 'stats' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-500'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Thống kê</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('history');
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            activeTab === 'history' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-500'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>Lịch sử</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* MODALS                                                         */}
      {/* ============================================================== */}
      {/* 1. Shop Modal */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        currentPoints={progress.focusPoints}
        currentStreak={progress.currentStreak}
        ownedItemIds={progress.ownedItemIds}
        themeColor={settings.themeColor}
        onBuyItem={handleBuyItem}
      />

      {/* 2. Collection Modal */}
      <CollectionModal
        isOpen={isCollectionOpen}
        onClose={() => setIsCollectionOpen(false)}
        ownedItemIds={progress.ownedItemIds}
        roomSetup={progress.roomSetup}
        themeColor={settings.themeColor}
        onPlaceItem={handlePlaceItem}
        onRemoveItem={handleRemoveItem}
        onSelectTheme={(newTheme) => setSettings((s) => ({ ...s, themeColor: newTheme }))}
        onOpenShop={() => setIsShopOpen(true)}
      />

      {/* 3. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newPartial) => setSettings((prev) => ({ ...prev, ...newPartial }))}
        onResetProgress={handleResetProgress}
        onClearAllData={handleClearAllData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* 4. Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => {
          setIsWelcomeOpen(false);
          setSettings((s) => ({ ...s, hasSeenWelcome: true }));
          setCharacterState('idle');
        }}
        themeColor={settings.themeColor}
      />

      {/* 5. Streak Reward Modal */}
      {streakModalData && (
        <StreakRewardModal
          isOpen={true}
          onClose={() => setStreakModalData(null)}
          streakDays={streakModalData.streakDays}
          rewardTitle={streakModalData.rewardTitle}
          bonusPoints={streakModalData.bonusPoints}
          themeColor={settings.themeColor}
        />
      )}
    </div>
  );
}
