 "use client";
 import type { DailySummary } from "@/types";
 
 interface Props {
   summary: DailySummary;
 }
 
 export default function OutputCards({ summary }: Props) {
   return (
     <div className=" py-5 space-y-6">
       {/* 上行 4 张小卡 */}
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
         <MiniCard
           title="✓ 今日完成"
           color="blue"
           items={summary.todayTasks.map((t) =>
             t.techStack ? `${t.task}（${t.techStack}）` : t.task
           )}
         />
         <MiniCard
           title="📖 今日学习"
           color="blue"
           items={summary.todayLearnings.map(
             (l) => `${l.topic} · ${l.mastery}`
           )}
         />
         <MiniCard
           title="📈 成长点"
           color="green"
           items={summary.growth}
         />
         <MiniCard
           id="blocker-section" title="⚠ 阻碍点"
           color="amber"
           items={summary.blockers.map((b) =>
             b.resolved ? `✓ ${b.description}` : b.description
           )}
         />
       </div>
 
       {/* 下行 2 张大卡 */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <WideCard
           title="🎯 明日优先级"
           color="blue"
         >
           <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
             {summary.tomorrowPlan.map((p) => (
               <li key={p.priority}>{p.action}</li>
             ))}
           </ol>
         </WideCard>
         <WideCard
           title="📋 汇报版总结"
           color="green"
         >
           <p className="text-sm text-slate-600 leading-relaxed">
             {summary.reportSummary}
           </p>
         </WideCard>
       </div>
     </div>
   );
 }
 
 function MiniCard({
   id,
   title,
   color,
   items,
 }: {
   id?: string;
   title: string;
   color: "blue" | "green" | "amber";
   items: string[];
 }) {
   const borders = {
     blue: "border-l-blue-500",
     green: "border-l-green-500",
     amber: "border-l-amber-500",
   };
 
   return (
     <div id={id} className={`bg-white border border-slate-200 rounded-lg p-6 border-l-[3px] ${borders[color]}`}>
       <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
       {items.length > 0 ? (
         <ul className="space-y-1">
           {items.map((item, i) => (
             <li key={i} className="text-sm text-slate-500 leading-relaxed">
               {item}
             </li>
           ))}
         </ul>
       ) : (
         <p className="text-sm text-slate-300">—</p>
       )}
     </div>
   );
 }
 
 function WideCard({
   title,
   color,
   children,
 }: {
   title: string;
   color: "blue" | "green";
   children: React.ReactNode;
 }) {
   const bg = {
     blue: "bg-blue-50/50 border-blue-200",
     green: "bg-green-50/50 border-green-200",
   };
   const titleColor = {
     blue: "text-blue-700",
     green: "text-green-700",
   };
 
   return (
     <div className={`rounded-lg border p-6 ${bg[color]}`}>
       <h3 className={`text-sm font-semibold mb-2 ${titleColor[color]}`}>{title}</h3>
       {children}
     </div>
   );
 }
 





