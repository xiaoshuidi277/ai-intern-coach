import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/ai";
import { buildContext } from "@/lib/context";
import { loadData, saveData, addEntry, addProject, updateProject, addTask, resolveTasks, updateBlockers } from "@/lib/server-storage";
import type { DailyEntry } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;
    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "输入内容不能为空" }, { status: 400 });
    }
    let data = await loadData();
    const context = buildContext(data);
    const result = await analyze(input, context);
    const today = new Date().toISOString().slice(0, 10);
    const entry: DailyEntry = { date: today, input, summary: result.summary, createdAt: new Date().toISOString() };
    data = addEntry(data, entry);
    for (const p of result.extractions.newProjects) data = addProject(data, p);
    for (const up of result.extractions.updatedProjects) data = updateProject(data, up.id, { status: up.status, description: up.description });
    for (const t of result.extractions.newTasks) data = addTask(data, t);
    if (result.extractions.resolvedTasks.length > 0) {
      const ids = data.tasks.filter(t => result.extractions.resolvedTasks.includes(t.title)).map(t => t.id);
      data = resolveTasks(data, ids);
    }
    data = updateBlockers(data, result.summary.blockers);
    await saveData(data);
    return NextResponse.json({ summary: result.summary, extractions: result.extractions, appData: data });
  } catch (error: unknown) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: (error as Error).message || "未知错误" }, { status: 500 });
  }
}
