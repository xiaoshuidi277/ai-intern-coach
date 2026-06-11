 // ============================================================
 // LocalStorage CRUD 封装
 // ============================================================
 
 import type { AppData, Project, Task, DailyEntry, Report, BlockerItem } from "@/types";
 
 const STORAGE_KEY = "ai-intern-coach";
 const APP_VERSION = 1;
 
 function getDefaultData(): AppData {
   return {
     projects: [],
     tasks: [],
     entries: [],
     unresolvedBlockers: [],
     reports: [],
     version: APP_VERSION,
   };
 }
 
 export function loadData(): AppData {
   if (typeof window === "undefined") return getDefaultData();
   try {
     const raw = localStorage.getItem(STORAGE_KEY);
     if (!raw) return getDefaultData();
     const data = JSON.parse(raw) as AppData;
     if (data.version !== APP_VERSION) {
       // 版本迁移可在未来扩展
       return getDefaultData();
     }
     return data;
   } catch {
     return getDefaultData();
   }
 }
 
 export function saveData(data: AppData): void {
   if (typeof window === "undefined") return;
   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
 }
 
 function genId(): string {
   return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
 }
 
 // ---- 项目操作 ----
 
 export function addProject(
   data: AppData,
   p: Omit<Project, "id" | "createdAt" | "updatedAt">
 ): AppData {
   const now = new Date().toISOString();
   const project: Project = { ...p, id: genId(), createdAt: now, updatedAt: now };
   return { ...data, projects: [...data.projects, project] };
 }
 
 export function updateProject(
   data: AppData,
   id: string,
   updates: Partial<Pick<Project, "status" | "description">>
 ): AppData {
   return {
     ...data,
     projects: data.projects.map((p) =>
       p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
     ),
   };
 }
 
 // ---- 任务操作 ----
 
 export function addTask(
   data: AppData,
   t: Omit<Task, "id" | "createdAt" | "completedAt">
 ): AppData {
   const task: Task = {
     ...t,
     id: genId(),
     createdAt: new Date().toISOString(),
     completedAt: null,
   };
   return { ...data, tasks: [...data.tasks, task] };
 }
 
 export function resolveTasks(data: AppData, taskIds: string[]): AppData {
   const now = new Date().toISOString();
   return {
     ...data,
     tasks: data.tasks.map((t) =>
       taskIds.includes(t.id) ? { ...t, status: "completed" as const, completedAt: now } : t
     ),
   };
 }
 
 // ---- 每日记录 ----
 
 export function addEntry(data: AppData, entry: DailyEntry): AppData {
   // 同一天覆盖
   const filtered = data.entries.filter((e) => e.date !== entry.date);
   return { ...data, entries: [...filtered, entry] };
 }
 
 // ---- 未解决阻碍 ----
 
 export function updateBlockers(data: AppData, blockers: BlockerItem[]): AppData {
   const unresolved = blockers.filter((b) => !b.resolved);
   return { ...data, unresolvedBlockers: unresolved };
 }
 
 // ---- 报告 ----
 
 export function addReport(data: AppData, report: Report): AppData {
   const filtered = data.reports.filter(
     (r) => !(r.type === report.type && r.dateRange.start === report.dateRange.start)
   );
   return { ...data, reports: [...filtered, report] };
 }
 
 // ---- 查询辅助 ----
 
 export function getYesterdayEntry(data: AppData, today: string): DailyEntry | undefined {
   const entries = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
   return entries.find((e) => e.date < today);
 }
 
 export function getRecentEntries(data: AppData, days: number): DailyEntry[] {
   const now = new Date();
   const cutoff = new Date(now);
   cutoff.setDate(cutoff.getDate() - days);
   const cutoffStr = cutoff.toISOString().slice(0, 10);
   return data.entries.filter((e) => e.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date));
 }
 
 export function getActiveTasks(data: AppData): Task[] {
   return data.tasks.filter((t) => t.status === "pending");
 }
 
 export function getActiveProjects(data: AppData): Project[] {
   return data.projects.filter((p) => p.status === "active");
 }
 
