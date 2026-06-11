 import { NextRequest, NextResponse } from "next/server";
 import { generateReport } from "@/lib/ai";
 
 export async function POST(request: NextRequest) {
   try {
     const body = await request.json();
     const { type, entries } = body;
     if (!type || !["weekly", "monthly"].includes(type)) {
       return NextResponse.json({ error: "type must be weekly or monthly" }, { status: 400 });
     }
     if (!entries || !Array.isArray(entries)) {
       return NextResponse.json({ error: "entries cannot be empty" }, { status: 400 });
     }
     const content = await generateReport(type, JSON.stringify(entries, null, 2));
     return NextResponse.json({ content });
   } catch (error: unknown) {
     const msg = error instanceof Error ? error.message : "unknown error";
     console.error("Report API error:", msg);
     return NextResponse.json({ error: msg }, { status: 500 });
   }
 }
 
