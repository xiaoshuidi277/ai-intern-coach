 "use client";
 
 export default function Header() {
   const today = new Date();
   const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
   const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} 星期${weekdays[today.getDay()]}`;
 
   return (
     <header className="flex items-center justify-between py-5 border-b border-slate-200 bg-white">
       <h1 className="text-xl font-bold text-slate-800 tracking-tight">
         <span className="text-blue-600">AI</span> 实习教练
       </h1>
       <span className="text-sm text-slate-400">{dateStr}</span>
     </header>
   );
 }
 


