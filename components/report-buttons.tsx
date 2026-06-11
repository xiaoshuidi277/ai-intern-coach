"use client";
import { useState } from "react";
import type { DailyEntry, Report } from "@/types";

interface Props {
  entries: DailyEntry[];
  reports: Report[];
  onReportGenerated: (report: Report) => void;
}

function parseReport(content: string): { title: string; sections: { heading: string; body: string[] }[] } {
  const lines = content.split("\n");
  const sections: { heading: string; body: string[] }[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // 检测标题行（## 或 ** 或 数字加粗）
    if (trimmed.match(/^#{1,3}\s/) || trimmed.match(/^\d+\.\s*\*\*/) || trimmed.match(/^\*\*/)) {
      if (currentHeading) { sections.push({ heading: currentHeading, body: currentBody }); currentBody = []; }
      currentHeading = trimmed.replace(/^#{1,3}\s*/, "").replace(/\*\*/g, "");
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("· ")) {
      currentBody.push(trimmed.replace(/^[-·]\s*/, ""));
    } else {
      currentBody.push(trimmed);
    }
  }
  if (currentHeading) sections.push({ heading: currentHeading, body: currentBody });
  return { title: sections[0]?.heading || "报告", sections: sections.slice(1) };
}

export default function ReportButtons({ entries, reports, onReportGenerated }: Props) {
  const [loading, setLoading] = useState<"weekly" | "monthly" | null>(null);
  const [showReport, setShowReport] = useState<{ content: string; type: string } | null>(null);

  const today = new Date();
  const getWeekStart = () => { const d = new Date(today); const dow = d.getDay() || 7; d.setDate(d.getDate() - dow + 1); return d.toISOString().slice(0, 10); };
  const getMonthStart = () => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const generate = async (type: "weekly" | "monthly") => {
    setLoading(type);
    const start = type === "weekly" ? getWeekStart() : getMonthStart();
    const end = today.toISOString().slice(0, 10);
    const relevant = entries.filter((e) => e.date >= start && e.date <= end);
    if (relevant.length === 0) { alert("该时段暂无复盘记录"); setLoading(null); return; }
    try {
      const res = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, entries: relevant }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const report: Report = { id: Date.now().toString(36), type, dateRange: { start, end }, content: data.content, createdAt: new Date().toISOString() };
      onReportGenerated(report);
      setShowReport({ content: data.content, type: type === "weekly" ? "周报" : "月报" });
    } catch (e: unknown) { alert("生成失败：" + ((e as Error).message || "")); }
    finally { setLoading(null); }
  };

  const label = (type: "weekly" | "monthly") => {
    const start = type === "weekly" ? getWeekStart() : getMonthStart();
    const existing = reports.find((r) => r.type === type && r.dateRange.start === start);
    const prefix = loading === type ? "生成中…" : existing ? "重新生成" : "生成";
    return type === "weekly" ? `📊 ${prefix}周报` : `📈 ${prefix}月报`;
  };

  return (
    <div id="report-section" className="py-4">
      <div className="flex gap-3 justify-center flex-wrap mb-3">
        <button onClick={() => generate("weekly")} disabled={loading !== null}
          className="px-6 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          {label("weekly")}
        </button>
        <button onClick={() => generate("monthly")} disabled={loading !== null}
          className="px-6 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
          {label("monthly")}
        </button>
      </div>

      {showReport && (() => {
        const parsed = parseReport(showReport.content);
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-700">📋 {parsed.title}</h3>
              <button onClick={() => setShowReport(null)} className="text-sm text-slate-400 hover:text-slate-600">关闭</button>
            </div>
            <div className="space-y-4">
              {parsed.sections.map((sec, i) => (
                <div key={i}>
                  <h4 className="text-sm font-semibold text-slate-600 mb-1.5">{sec.heading}</h4>
                  <ul className="space-y-1">
                    {sec.body.map((line, j) => (
                      <li key={j} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                        <span className="text-slate-300 flex-shrink-0">·</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
