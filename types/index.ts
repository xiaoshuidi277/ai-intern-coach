 // ============================================================
 // AI实习教练助手 — 核心类型定义
 // ============================================================
 
 // 项目（AI 自动从对话中提取）
 export interface Project {
   id: string;
   name: string;
   description: string;
   status: "active" | "completed" | "paused";
   createdAt: string;
   updatedAt: string;
 }
 
 // 任务 + 截止日期（AI 自动提取）
 export interface Task {
   id: string;
   title: string;
   dueDate: string | null;
   projectId: string | null;
   status: "pending" | "completed";
   createdAt: string;
   completedAt: string | null;
 }
 
 // 六张卡片中的单项
 export interface TaskItem {
   task: string;
   techStack?: string;
 }
 
 export interface LearningItem {
   topic: string;
   mastery: string;
 }
 
 export interface BlockerItem {
   description: string;
   resolved: boolean;
 }
 
 export interface PlanItem {
   priority: number;
   action: string;
 }
 
 // 每日总结（六张卡片）
 export interface DailySummary {
   todayTasks: TaskItem[];
   todayLearnings: LearningItem[];
   growth: string[];
   blockers: BlockerItem[];
   tomorrowPlan: PlanItem[];
   reportSummary: string;
 }
 
 // 知识提取结果
 export interface Extractions {
   newProjects: Omit<Project, "id" | "createdAt" | "updatedAt">[];
   updatedProjects: { id: string; status?: Project["status"]; description?: string }[];
   newTasks: Omit<Task, "id" | "createdAt" | "completedAt">[];
   resolvedTasks: string[]; // task ids
   knowledgePoints: { topic: string; category: string }[];
 }
 
 // API 响应
 export interface AnalyzeResponse {
   summary: DailySummary;
   extractions: Extractions;
 }
 
 // 每日复盘记录
 export interface DailyEntry {
   date: string;
   input: string;
   summary: DailySummary;
   createdAt: string;
 }
 
 // 周报/月报
 export interface Report {
   id: string;
   type: "weekly" | "monthly";
   dateRange: { start: string; end: string };
   content: string;
   createdAt: string;
 }
 
 // LocalStorage 顶层结构
 export interface AppData {
   projects: Project[];
   tasks: Task[];
   entries: DailyEntry[];
   unresolvedBlockers: BlockerItem[];
   reports: Report[];
   version: number;
 }
 
