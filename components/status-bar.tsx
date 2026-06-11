"use client";
import { useState } from "react";
import type { AppData } from "@/types";
import { getActiveProjects, getActiveTasks } from "@/lib/storage";

interface Props { data: AppData; }

export default function StatusBar({ data }: Props) {
  const projects = getActiveProjects(data);
  const tasks = getActiveTasks(data);
  const blockers = data.unresolvedBlockers;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={() => scrollTo("project-section")} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${projects.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer" : "bg-slate-50 border-slate-200 text-slate-400 cursor-default"}`}>
        <span>📁</span><span className="font-semibold">活跃项目</span><span className="tabular-nums">{projects.length}</span>
        {projects.length > 0 && <span className="hidden sm:inline text-slate-500">· {projects.map(p => p.name).join(" · ")}</span>}
      </button>
      <button onClick={() => scrollTo("task-section")} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${tasks.length > 0 ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 cursor-pointer" : "bg-slate-50 border-slate-200 text-slate-400 cursor-default"}`}>
        <span>⏳</span><span className="font-semibold">待办任务</span><span className="tabular-nums">{tasks.length}</span>
        {tasks.length > 0 && <span className="hidden sm:inline text-slate-500">· {tasks.slice(0,3).map(t => t.title).join(" · ")}</span>}
      </button>
      <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${blockers.length > 0 ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer" : "bg-slate-50 border-slate-200 text-slate-400 cursor-default"}`} onClick={() => blockers.length > 0 && scrollTo("blocker-section")}>
        <span>⚠</span><span className="font-semibold">卡住项</span><span className="tabular-nums">{blockers.length}</span>
        {blockers.length > 0 && <span className="hidden sm:inline text-slate-500">· {blockers.map(b => b.description).join(" · ")}</span>}
      </button>
    </div>
  );
}

