"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/header";
import StatusBar from "@/components/status-bar";
import InputArea from "@/components/input-area";
import OutputCards from "@/components/output-cards";
import ProjectCards from "@/components/project-cards";
import TaskPanel from "@/components/task-panel";
import HistoryPanel from "@/components/history-panel";
import ReportButtons from "@/components/report-buttons";
import type { AppData, DailyEntry, Report, AnalyzeResponse, DailySummary } from "@/types";
import { addReport, resolveTasks } from "@/lib/storage";

function getCacheKey() { return "ai-intern-coach-cache"; }
function getToday() { return new Date().toISOString().slice(0, 10); }

function SkeletonCards() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-28 bg-slate-100 rounded-lg" />
        <div className="h-28 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [isToday, setIsToday] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && typeof serverData.version === "number") {
            setData(serverData);
            localStorage.setItem(getCacheKey(), JSON.stringify(serverData));
            const todayEntry = serverData.entries.find((e: DailyEntry) => e.date === getToday());
            if (todayEntry) setCurrentDate(getToday());
            return;
          }
        }
      } catch {}
      try { const cached = localStorage.getItem(getCacheKey()); if (cached) setData(JSON.parse(cached)); } catch { setData(null); }
    })();
  }, []);

  const syncBoth = useCallback((newData: AppData) => {
    setData(newData);
    localStorage.setItem(getCacheKey(), JSON.stringify(newData));
    fetch("/api/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newData) }).catch(() => {});
  }, []);

  const handleSubmit = async (input: string) => {
    if (!data) return;
    setLoading(true);
    try {
      const today = getToday();
      const existingEntry = data.entries.find((e) => e.date === today);
      const mergedInput = existingEntry
        ? `【之前记录】${existingEntry.input}\n\n【新增补充】${input}\n\n请基于以上所有信息，重新生成完整的今日复盘。`
        : input;
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: mergedInput }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "请求失败"); }
      const result: AnalyzeResponse & { appData: AppData } = await res.json();
      syncBoth(result.appData);
      setCurrentDate(today); setIsToday(true);
    } catch (e: unknown) { alert("分析失败：" + ((e as Error).message || "未知错误")); }
    finally { setLoading(false); }
  };

  const handleDateSelect = (date: string) => {
    setCurrentDate(date); setIsToday(date === getToday());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleTask = (taskId: string) => {
    if (!data) return;
    syncBoth(resolveTasks(data, [taskId]));
  };

  const handleReportGenerated = (report: Report) => {
    if (!data) return;
    syncBoth(addReport(data, report));
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ai-coach-backup-${getToday()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!data) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><p className="text-slate-400 text-lg">加载中…</p></div>;

  const activeEntry = currentDate ? data.entries.find((e) => e.date === currentDate) : null;
  const todayEntry = data.entries.find((e) => e.date === getToday());

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto bg-white shadow-sm min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col gap-8 px-8 py-8">
          <StatusBar data={data} />
          <InputArea onSubmit={handleSubmit} loading={loading} />
          {todayEntry && !loading && <p className="text-sm text-slate-400 -mt-6">今天已有记录，新提交将合并更新</p>}

          {/* 骨架屏 / 实际内容 */}
          {loading ? (
            <SkeletonCards />
          ) : activeEntry ? (
            <>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-700">{isToday ? "📅 今日复盘" : `📅 ${activeEntry.date}`}</h2>
                {!isToday && <button onClick={() => handleDateSelect(getToday())} className="text-sm text-blue-600 hover:underline">回到今天</button>}
              </div>
              <OutputCards summary={activeEntry.summary} />
              <ProjectCards projects={data.projects} />
              <TaskPanel tasks={data.tasks} onToggleTask={handleToggleTask} />
            </>
          ) : null}

          <HistoryPanel entries={data.entries} activeDate={currentDate} onSelect={handleDateSelect} />
          <ReportButtons entries={data.entries} reports={data.reports} onReportGenerated={handleReportGenerated} />
        </main>
        <footer className="flex items-center justify-between px-8 py-6 border-t border-slate-100 mt-auto">
          <span className="text-sm text-slate-300">AI 实习教练</span>
          <button onClick={handleExport} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ⬇ 导出数据备份
          </button>
        </footer>
      </div>
    </div>
  );
}
