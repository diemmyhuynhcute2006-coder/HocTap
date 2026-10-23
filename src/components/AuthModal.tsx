import React, { useEffect } from 'react';
import { X, LogIn, AlertCircle, ShieldCheck, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { audioService } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  errorCode: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignInWithGoogle,
  isLoading,
  errorMessage,
  errorCode,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on ESC
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

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyDomain = () => {
    if (currentDomain) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audioService.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <LogIn className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Đăng nhập My Alcove
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 mx-auto flex items-center justify-center shadow-inner">
            <span className="text-3xl">☕</span>
          </div>

          <div>
            <h4 className="text-lg font-bold text-stone-800 dark:text-stone-100">
              Chào mừng bạn đến với My Alcove
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Đăng nhập bằng tài khoản Google chính thức để tự động đồng bộ hóa góc học tập, chuỗi Streak và thành tích cá nhân lên điện toán đám mây.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-left space-y-2">
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>

              {errorCode === 'auth/unauthorized-domain' && currentDomain && (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30 text-[11px] text-stone-600 dark:text-stone-300 space-y-1.5">
                  <p className="font-medium text-rose-800 dark:text-rose-300">
                    💡 Hướng dẫn cấu hình tên miền:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-[10px] break-all">
                    <span>{currentDomain}</span>
                    <button
                      type="button"
                      onClick={copyDomain}
                      className="ml-2 px-2 py-1 bg-stone-100 dark:bg-stone-700 rounded hover:bg-stone-200 transition-colors flex items-center gap-1 shrink-0"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Thêm vào: Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              audioService.playClick();
              onSignInWithGoogle();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-100 font-semibold text-xs border border-stone-300 dark:border-stone-700 shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoading ? 'Đang mở đăng nhập Google...' : 'Đăng nhập với Google'}</span>
          </button>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Xác thực an toàn qua Google OAuth 2.0 &amp; Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
};
