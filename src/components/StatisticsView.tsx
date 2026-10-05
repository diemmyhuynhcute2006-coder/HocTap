import React from 'react';
import { FocusSession, ThemeColor } from '../types';
import { ACTIVITIES, THEME_CONFIGS } from '../data/items';
import { Clock, CheckCircle2, XCircle, Flame, Star, TrendingUp } from 'lucide-react';

interface StatisticsViewProps {
  sessions: FocusSession[];
  currentPoints: number;
  totalPointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  themeColor: ThemeColor;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  sessions,
  currentPoints,
  totalPointsEarned,
  currentStreak,
  longestStreak,
  themeColor,
}) => {
  const theme = THEME_CONFIGS[themeColor];

  // Total Focus Minutes calculation
  const totalFocusMinutes = sessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
  const totalHours = Math.floor(totalFocusMinutes / 60);
  const remainingMins = totalFocusMinutes % 60;

  // Completed & Abandoned counts
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const abandonedCount = sessions.filter((s) => s.status === 'abandoned').length;
  const totalCount = completedCount + abandonedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Today's focus minutes
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayMinutes = sessions
    .filter((s) => s.dateStr === todayStr)
    .reduce((acc, s) => acc + (s.actualMinutes || 0), 0);

  // This month's focus minutes
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const monthMinutes = sessions
    .filter((s) => s.dateStr && s.dateStr.startsWith(currentMonthPrefix))
    .reduce((acc, s) => acc + (s.actualMinutes || 0), 0);

  // 7 Days Chart Data Calculation (Last 7 days from today)
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-CA');
    const dayLabel = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dayMinutes = sessions
      .filter((s) => s.dateStr === dateStr)
      .reduce((acc, s) => acc + (s.actualMinutes || 0), 0);
    return { dateStr, dayLabel, minutes: dayMinutes };
  });

  const max7DayMins = Math.max(60, ...last7DaysData.map((d) => d.minutes));

  // Activity breakdown calculation
  const activityMap: Record<string, number> = {};
  sessions.forEach((s) => {
    activityMap[s.activityType] = (activityMap[s.activityType] || 0) + (s.actualMinutes || 0);
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60 dark:border-stone-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Thống kê tập trung</span>
            <span className="text-base font-normal text-stone-400">· My Alcove Insights</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Ghi nhận mọi nỗ lực và thời gian bạn đã cống hiến cho mục tiêu của mình.
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Time */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Tổng thời gian</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100">
              {totalHours}h {remainingMins}p
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Hôm nay: {todayMinutes} phút
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Streak hiện tại</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-orange-600 dark:text-orange-400">
              {currentStreak} ngày
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Kỷ lục: {longestStreak} ngày liên tiếp
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Tỷ lệ hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {completedCount} xong · {abandonedCount} từ bỏ
            </p>
          </div>
        </div>

        {/* Focus Points */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Focus Points</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {currentPoints}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Tổng đã kiếm: {totalPointsEarned} FP
            </p>
          </div>
        </div>
      </div>

      {/* 7 Days Bar Chart & Monthly Comparison */}
      <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Thời gian tập trung 7 ngày qua</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Tháng này bạn đã tập trung <span className="font-semibold text-stone-800 dark:text-stone-200">{Math.round(monthMinutes / 60)} giờ {monthMinutes % 60} phút</span>
            </p>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-stone-100 dark:border-stone-800">
          {last7DaysData.map((d, idx) => {
            const heightPercent = max7DayMins > 0 ? Math.max(6, Math.round((d.minutes / max7DayMins) * 100)) : 6;
            const isToday = d.dateStr === todayStr;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip Value */}
                <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                  {d.minutes}p
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                    isToday
                      ? `${theme.accentBg} shadow-sm`
                      : d.minutes > 0
                      ? 'bg-amber-200 dark:bg-amber-800/60 hover:bg-amber-300'
                      : 'bg-stone-100 dark:bg-stone-800'
                  }`}
                />

                {/* Day Label */}
                <span className={`text-[11px] font-medium mt-2 whitespace-nowrap ${isToday ? 'font-bold text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Phân bổ theo loại hoạt động
        </h3>

        {totalFocusMinutes === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            Chưa có dữ liệu hoạt động. Hãy bắt đầu phiên tập trung đầu tiên nhé!
          </p>
        ) : (
          <div className="space-y-3">
            {ACTIVITIES.map((act) => {
              const mins = activityMap[act.type] || 0;
              if (mins === 0) return null;
              const percent = Math.round((mins / totalFocusMinutes) * 100);

              return (
                <div key={act.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{act.label}</span>
                    <span className="font-mono text-stone-500 dark:text-stone-400">{mins} phút ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
