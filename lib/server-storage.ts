import fs from "fs";
import path from "path";
import type { AppData, Project, Task, DailyEntry, Report, BlockerItem } from "@/types";

const DATA_FILE = path.join(process.cwd(), "data", "app-data.json");
const APP_VERSION = 1;

// Vercel KV 可用时才加载
let kvModule: typeof import("@vercel/kv") | null = null;
async function getKV() {
  if (kvModule) return kvModule;
  try {
    kvModule = await import("@vercel/kv");
    return kvModule;
  } catch { return null; }
}

export function getDefaultData(): AppData {
  return { projects: [], tasks: [], entries: [], unresolvedBlockers: [], reports: [], version: APP_VERSION };
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 加载数据：Vercel KV 优先，本地文件兜底 */
export async function loadData(): Promise<AppData> {
  const kv = await getKV();
  if (kv && process.env.KV_REST_API_URL) {
    try {
      const raw = await kv.get<string>("app-data");
      if (raw) {
        const data = JSON.parse(raw) as AppData;
        if (data.version === APP_VERSION) return data;
      }
    } catch { /* KV 不可用，降级到文件 */ }
  }
  // 本地文件
  try {
    if (!fs.existsSync(DATA_FILE)) return getDefaultData();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as AppData;
    return data.version === APP_VERSION ? data : getDefaultData();
  } catch { return getDefaultData(); }
}

/** 保存数据 */
export async function saveData(data: AppData): Promise<void> {
  const kv = await getKV();
  if (kv && process.env.KV_REST_API_URL) {
    try {
      await kv.set("app-data", JSON.stringify(data));
    } catch { /* 降级 */ }
  }
  // 始终写本地备份
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---- 项目 ----
export function addProject(data: AppData, p: Omit<Project, "id" | "createdAt" | "updatedAt">): AppData {
  const now = new Date().toISOString();
  return { ...data, projects: [...data.projects, { ...p, id: genId(), createdAt: now, updatedAt: now }] };
}
export function updateProject(data: AppData, id: string, updates: Partial<Pick<Project, "status" | "description">>): AppData {
  return { ...data, projects: data.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) };
}

// ---- 任务（含去重）----
export function addTask(data: AppData, t: Omit<Task, "id" | "createdAt" | "completedAt">): AppData {
  if (data.tasks.some(ex => ex.title === t.title && ex.status === "pending")) return data;
  return { ...data, tasks: [...data.tasks, { ...t, id: genId(), createdAt: new Date().toISOString(), completedAt: null }] };
}
export function resolveTasks(data: AppData, taskIds: string[]): AppData {
  const now = new Date().toISOString();
  return { ...data, tasks: data.tasks.map(t => taskIds.includes(t.id) ? { ...t, status: "completed" as const, completedAt: now } : t) };
}

// ---- 每日记录 ----
export function addEntry(data: AppData, entry: DailyEntry): AppData {
  return { ...data, entries: [...data.entries.filter(e => e.date !== entry.date), entry] };
}

// ---- 阻碍 ----
export function updateBlockers(data: AppData, blockers: BlockerItem[]): AppData {
  return { ...data, unresolvedBlockers: blockers.filter(b => !b.resolved) };
}

// ---- 报告 ----
export function addReport(data: AppData, report: Report): AppData {
  return { ...data, reports: [...data.reports.filter(r => !(r.type === report.type && r.dateRange.start === report.dateRange.start)), report] };
}

// ---- 查询辅助 ----
export function getYesterdayEntry(data: AppData, today: string): DailyEntry | undefined {
  return [...data.entries].sort((a, b) => b.date.localeCompare(a.date)).find(e => e.date < today);
}
export function getRecentEntries(data: AppData, days: number): DailyEntry[] {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  return data.entries.filter(e => e.date >= cutoff.toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date));
}
export function getActiveTasks(data: AppData): Task[] { return data.tasks.filter(t => t.status === "pending"); }
export function getActiveProjects(data: AppData): Project[] { return data.projects.filter(p => p.status === "active"); }
