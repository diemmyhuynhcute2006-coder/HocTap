import React, { useState } from 'react';
import {
  Settings,
  X,
  Moon,
  Sun,
  Volume2,
  Bell,
  User,
  Heart,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { ThemeColor, UserSettings } from '../types';
import { THEME_CONFIGS } from '../data/items';
import { audioService } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetProgress: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
  onClearAllData,
  onExportData,
  onImportData,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const themes: { key: ThemeColor; label: string; emoji: string }[] = [
    { key: 'green', label: 'Xanh lá - Thiên nhiên', emoji: '🌿' },
    { key: 'blue', label: 'Xanh dương - Yên tĩnh', emoji: '🌊' },
    { key: 'pink', label: 'Hồng - Nhẹ nhàng', emoji: '🌸' },
    { key: 'purple', label: 'Tím - Thư giãn', emoji: '🪻' },
    { key: 'brown', label: 'Nâu - Ấm áp', emoji: '☕' },
    { key: 'white', label: 'Trắng - Tối giản', emoji: '⚪' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportData(text);
        setImportStatus('Khôi phục dữ liệu thành công!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus('File dữ liệu không hợp lệ!');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Cài đặt My Alcove
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tùy chỉnh không gian và trải nghiệm cá nhân của bạn.
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

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. Theme Color Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              1. Màu sắc giao diện
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {themes.map((t) => {
                const isSelected = settings.themeColor === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      onUpdateSettings({ themeColor: t.key });
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <span className="text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Light / Dark Mode Toggle */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.darkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Chế độ giao diện</div>
                <div className="text-[11px] text-stone-400">Chuyển đổi giao diện Sáng hoặc Tối</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                onUpdateSettings({ darkMode: !settings.darkMode });
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              {settings.darkMode ? '🌙 Chế độ Tối' : '☀️ Chế độ Sáng'}
            </button>
          </div>

          {/* 3. Audio & Timer Chime */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              2. Âm thanh & Thông báo
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">Chuông thiền khi hết giờ</div>
                  <div className="text-[11px] text-stone-400">Phát âm thanh chuông thanh tịnh khi kết thúc phiên</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.timerChime}
                onChange={(e) => onUpdateSettings({ timerChime: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
            </div>

            {/* Volume Slider */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-stone-500" />
                <span className="text-xs text-stone-700 dark:text-stone-300">Âm lượng</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  onUpdateSettings({ soundVolume: vol });
                  audioService.setVolume(vol);
                }}
                className="w-32 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Display Characters & Pets */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              3. Hiển thị nhân vật & thú cưng
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-stone-800 dark:text-stone-200">Hiển thị nhân vật Chibi</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showCharacter}
                onChange={(e) => onUpdateSettings({ showCharacter: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-stone-800 dark:text-stone-200">Hiển thị thú cưng ảo</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showPet}
                onChange={(e) => onUpdateSettings({ showPet: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
            </div>
          </div>

          {/* 5. Backup & Restore Data */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              4. Dữ liệu & Sao lưu
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Dữ liệu được lưu an toàn trong trình duyệt của bạn. Bạn có thể xuất file sao lưu để chuyển sang máy tính hoặc điện thoại khác bất cứ lúc nào.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất dữ liệu (.json)</span>
              </button>

              <label className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập dữ liệu</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {importStatus && (
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs text-center font-medium">
                {importStatus}
              </div>
            )}
          </div>

          {/* 6. Dangerous Actions: Reset Progress / Clear Data */}
          <div className="pt-4 border-t border-rose-100 dark:border-rose-950/50 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              5. Vùng quản trị dữ liệu
            </div>

            {/* Reset Progress */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">Đặt lại tiến trình (Reset Streak & Điểm)</div>
                <div className="text-[11px] text-amber-700/80 dark:text-amber-400">Giữ lại vật phẩm đã mua nhưng đặt lại Streak và Focus Points về 0.</div>
              </div>
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                  >
                    Xác nhận đặt lại
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                >
                  Đặt lại
                </button>
              )}
            </div>

            {/* Clear All Data */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-900 dark:text-rose-300">Xóa toàn bộ dữ liệu</div>
                <div className="text-[11px] text-rose-700/80 dark:text-rose-400">Xóa vĩnh viễn mọi phiên lịch sử, vật phẩm và phòng alcove.</div>
              </div>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearAllData();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
                  >
                    Xác nhận xóa hết
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
