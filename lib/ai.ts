 // ============================================================
 // DeepSeek API 调用封装
 // ============================================================
 
 import OpenAI from "openai";
 import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
 import type { AnalyzeResponse } from "@/types";
 
 const client = new OpenAI({
   apiKey: process.env.DEEPSEEK_API_KEY || "",
   baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
 });
 
 /**
  * 双通道 AI 处理：知识提取 + 每日总结
  */
 export async function analyze(input: string, context: string): Promise<AnalyzeResponse> {
   const userPrompt = buildUserPrompt(input, context);
 
   const response = await client.chat.completions.create({
     model: "deepseek-chat",
     messages: [
       { role: "system", content: SYSTEM_PROMPT },
       { role: "user", content: userPrompt },
     ],
     temperature: 0.3,
     max_tokens: 4096,
     response_format: { type: "json_object" },
   });
 
   const content = response.choices[0]?.message?.content || "{}";
   // 清理可能的 markdown 代码块包裹
   const cleanJson = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
 
   try {
     return JSON.parse(cleanJson) as AnalyzeResponse;
   } catch (e) {
     console.error("Failed to parse AI response:", e);
     throw new Error("AI 返回格式异常，请重试");
   }
 }
 
 /**
  * 周报/月报生成
  */
 export async function generateReport(
   type: "weekly" | "monthly",
   entriesJson: string
 ): Promise<string> {
   const label = type === "weekly" ? "周报" : "月报";
 
   const response = await client.chat.completions.create({
     model: "deepseek-chat",
     messages: [
       {
         role: "system",
         content: `你是用户的 AI 实习成长教练。请根据用户这段时间的每日复盘记录，
 生成一份专业、结构化的${label}。语言简洁专业，适合工作场景。
 
 请按以下结构输出：
 1. 本周/本月核心工作成果
 2. 技术学习与成长
 3. 遇到的挑战及解决情况
 4. 下阶段重点`,
       },
       {
         role: "user",
         content: `以下是${label}对应的每日复盘记录：\n\n${entriesJson}`,
       },
     ],
     temperature: 0.3,
     max_tokens: 2048,
   });
 
   return response.choices[0]?.message?.content || "报告生成失败";
 }
 
