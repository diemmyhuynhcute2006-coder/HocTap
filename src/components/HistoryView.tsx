import React, { useState } from 'react';
import { FocusSession, ActivityType, SessionStatus } from '../types';
import { ACTIVITIES } from '../data/items';
import { Search, Filter, CheckCircle2, XCircle, Calendar, Clock, Star } from 'lucide-react';

interface HistoryViewProps {
  sessions: FocusSession[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (activityFilter !== 'all' && s.activityType !== activityFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchGoal = s.goal.toLowerCase().includes(q);
      const matchAct = ACTIVITIES.find((a) => a.type === s.activityType)?.label.toLowerCase().includes(q);
      if (!matchGoal && !matchAct) return false;
    }
    return true;
  });

  const getActivityLabel = (type: ActivityType) => {
    return ACTIVITIES.find((a) => a.type === type)?.label || type;
  };

  const formatSessionTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatSessionDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60 dark:border-stone-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Lịch sử tập trung</span>
            <span className="text-base font-normal text-stone-400">· {sessions.length} phiên</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Nhật ký hành trình tích lũy từng phút giây của bạn.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl p-3.5 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mục tiêu hoặc hoạt động..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        {/* Activity Dropdown */}
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value as any)}
          className="w-full sm:w-auto px-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
        >
          <option value="all">Tất cả hoạt động</option>
          {ACTIVITIES.map((a) => (
            <option key={a.type} value={a.type}>{a.label}</option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-auto px-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">✅ Đã hoàn thành</option>
          <option value="abandoned">❌ Đã từ bỏ</option>
        </select>
      </div>

      {/* History Table / List */}
      <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
        {filteredSessions.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-3 max-w-sm mx-auto p-4">
            <div className="text-4xl">📜</div>
            <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
              {sessions.length === 0
                ? 'Chưa có lịch sử tập trung'
                : 'Không tìm thấy phiên nào phù hợp'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {sessions.length === 0
                ? 'Hãy bắt đầu phiên tập trung đầu tiên của bạn để ghi dấu hành trình.'
                : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Ngày & Giờ</th>
                  <th className="py-3.5 px-4">Hoạt động</th>
                  <th className="py-3.5 px-4">Mục tiêu</th>
                  <th className="py-3.5 px-4 text-center">Thời lượng</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Điểm nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {filteredSessions.map((session) => {
                  const isCompleted = session.status === 'completed';

                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-medium text-stone-900 dark:text-stone-100 font-mono">
                          {formatSessionDate(session.startTime)}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {formatSessionTime(session.startTime)}
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {getActivityLabel(session.activityType)}
                        </span>
                      </td>

                      {/* Goal */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate" title={session.goal}>
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          {session.goal || 'Phiên tập trung'}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono tabular-nums">
                        {session.actualMinutes} phút
                        {session.durationMinutes !== session.actualMinutes && (
                          <span className="text-[10px] text-stone-400 block">
                            /{session.durationMinutes}p
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full text-[11px]">
                            <XCircle className="w-3 h-3" /> Đã từ bỏ
                          </span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap font-mono font-bold">
                        {isCompleted ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            +{session.pointsEarned} FP
                          </span>
                        ) : (
                          <span className="text-stone-400">+0 FP</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
