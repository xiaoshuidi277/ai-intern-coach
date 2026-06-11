"use client";
import { useState } from "react";
import type { DailyEntry } from "@/types";

interface Props {
  entries: DailyEntry[];
  activeDate: string | null;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function HistoryPanel({ entries, activeDate, onSelect }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const entryDates = new Set(entries.map((e) => e.date));
  const todayStr = today.toISOString().slice(0, 10);

  // 当月第一天和最后一天
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun

  // 生成日历格子
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-600 mb-4">📅 历史记录</h2>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-md">
        {/* 月份导航 */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <button onClick={prevMonth} className="text-slate-500 hover:text-slate-700 text-lg leading-none px-2">&lsaquo;</button>
          <span className="text-sm font-semibold text-slate-700">{viewYear} 年 {viewMonth + 1} 月</span>
          <button onClick={nextMonth} className="text-slate-500 hover:text-slate-700 text-lg leading-none px-2">&rsaquo;</button>
        </div>

        {/* 星期头 */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center py-2 text-xs font-medium text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasEntry = entryDates.has(dateStr);
            const isActive = dateStr === activeDate;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                onClick={() => hasEntry && onSelect(dateStr)}
                disabled={!hasEntry}
                className={`aspect-square flex flex-col items-center justify-center text-sm transition-colors relative
                  ${isActive ? "bg-blue-500 text-white font-bold rounded-lg m-0.5" : ""}
                  ${!isActive && hasEntry ? "hover:bg-slate-100 cursor-pointer" : ""}
                  ${!hasEntry ? "text-slate-300 cursor-default" : "text-slate-700"}
                `}
              >
                <span className={isToday && !isActive ? "font-bold text-blue-600" : ""}>
                  {day}
                </span>
                {hasEntry && !isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-400">
        蓝色圆点 = 有记录 · 点击跳转
        {entries.length > 0 && ` · 共 ${entries.length} 天记录`}
      </p>
    </div>
  );
}
