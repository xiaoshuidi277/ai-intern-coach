 // ============================================================
 // 上下文组装 — 三层记忆注入
 // ============================================================
 
 import type { AppData, DailyEntry, Project, Task } from "@/types";
 import {
   getYesterdayEntry,
   getRecentEntries,
   getActiveProjects,
   getActiveTasks,
 } from "./storage";
 
 /**
  * 组装注入给 AI 的上下文文本
  */
 export function buildContext(data: AppData): string {
   const parts: string[] = [];
   const today = new Date().toISOString().slice(0, 10);
 
   // 第一层：活跃项目背景
   const activeProjects = getActiveProjects(data);
   if (activeProjects.length > 0) {
     const projLines = activeProjects.map(
       (p: Project) => `- ${p.name}：${p.description}`
     );
     parts.push(`🏗️ 当前活跃项目（长期记忆）：\n${projLines.join("\n")}`);
   }
 
   // 第二层：活跃任务
   const activeTasks = getActiveTasks(data);
   if (activeTasks.length > 0) {
     const taskLines = activeTasks.map((t: Task) => {
       const due = t.dueDate ? `（截止：${t.dueDate}）` : "";
       return `- ${t.title}${due}`;
     });
     parts.push(`📋 当前待办任务：\n${taskLines.join("\n")}`);
   }
 
   // 第三层：昨日回顾
   const yesterday = getYesterdayEntry(data, today);
   if (yesterday) {
     const s = yesterday.summary;
     parts.push(
       `📅 昨日回顾：\n` +
         `- 完成：${s.todayTasks.map((t) => t.task).join("；")}\n` +
         `- 学习：${s.todayLearnings.map((l) => l.topic).join("；")}\n` +
         `- 计划：${s.tomorrowPlan.map((p) => p.action).join("；")}\n` +
         `- 阻碍：${s.blockers
           .filter((b) => !b.resolved)
           .map((b) => b.description)
           .join("；") || "无"}`
     );
   }
 
   // 第四层：近 7 日摘要
   const recent = getRecentEntries(data, 7);
   if (recent.length > 1) {
     const summaryLines = recent
       .filter((e: DailyEntry) => e.date !== today)
       .map((e: DailyEntry) => {
         const tasks = e.summary.todayTasks.map((t) => t.task).join("、");
         return `- ${e.date}：${tasks || "无记录"}`;
       });
     parts.push(`📊 近 7 日摘要：\n${summaryLines.join("\n")}`);
   }
 
   // 第五层：未解决阻碍
   if (data.unresolvedBlockers.length > 0) {
     const blockerLines = data.unresolvedBlockers.map(
       (b) => `- ⚠ ${b.description}`
     );
     parts.push(`🚧 未解决的阻碍（跨天累积）：\n${blockerLines.join("\n")}`);
   }
 
   return parts.join("\n\n");
 }
 
