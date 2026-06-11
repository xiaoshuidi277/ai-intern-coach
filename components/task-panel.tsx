"use client";
import { useState } from "react";
import type { Task } from "@/types";

interface Props {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export default function TaskPanel({ tasks, onToggleTask }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pending = tasks.filter((t) => t.status === "pending").sort((a, b) => (a.dueDate || "z").localeCompare(b.dueDate || "z"));
  const completed = tasks.filter((t) => t.status === "completed").sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));

  if (pending.length === 0 && completed.length === 0) return null;

  const dueLabel = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (diff < 0) return { text: `已过期 ${Math.abs(diff)} 天`, color: "text-red-500" };
    if (diff === 0) return { text: "今天截止", color: "text-amber-500" };
    if (diff === 1) return { text: "明天截止", color: "text-amber-500" };
    if (diff <= 3) return { text: `${diff} 天后`, color: "text-blue-500" };
    return { text: date, color: "text-slate-400" };
  };

  return (
    <div id="task-section">
      <h2 className="text-base font-semibold text-slate-600 mb-3">
        {pending.length > 0 ? `📋 待办 (${pending.length})` : "📋 待办"}
      </h2>

      {pending.length > 0 ? (
        <div className="space-y-2 mb-4">
          {pending.map((task) => {
            const due = task.dueDate ? dueLabel(task.dueDate) : null;
            const isExpanded = expandedId === task.id;
            return (
              <div key={task.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                >
                  {/* 完成按钮 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                    className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 hover:border-green-400 hover:bg-green-50 transition-colors"
                    title="标记完成"
                  />
                  <span className="flex-1 text-sm text-slate-700">{task.title}</span>
                  {due && <span className={`text-xs flex-shrink-0 ${due.color}`}>{due.text}</span>}
                  <span className="text-xs text-slate-300 flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-3 pt-0 border-t border-slate-50 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">截止日期：</span><span className="text-slate-600">{task.dueDate || "未设定"}</span></div>
                      <div><span className="text-slate-400">创建时间：</span><span className="text-slate-600">{task.createdAt.slice(0, 10)}</span></div>
                      <div><span className="text-slate-400">关联项目：</span><span className="text-slate-600">{task.projectId || "无"}</span></div>
                      <div><span className="text-slate-400">状态：</span><span className="text-amber-600">待办</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-300 mb-4">暂无待办任务</p>
      )}

      {completed.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">已完成 ({completed.length})</h3>
          <div className="space-y-1.5">
            {completed.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </span>
                <span className="text-slate-400 line-through flex-1">{task.title}</span>
                {task.completedAt && <span className="text-xs text-slate-300 flex-shrink-0">{task.completedAt.slice(0, 10)}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
