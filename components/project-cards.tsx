"use client";
import type { Project } from "@/types";

interface Props { projects: Project[]; }

export default function ProjectCards({ projects }: Props) {
  const active = projects.filter((p) => p.status === "active");

  if (active.length === 0) return null;

  return (
    <div id="project-section">
      <h2 className="text-base font-semibold text-slate-600 mb-3">📁 活跃项目 ({active.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {active.map((p) => (
          <div key={p.id} className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <h3 className="text-sm font-semibold text-slate-700">{p.name}</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
            <p className="text-xs text-slate-400 mt-2">创建于 {p.createdAt.slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
