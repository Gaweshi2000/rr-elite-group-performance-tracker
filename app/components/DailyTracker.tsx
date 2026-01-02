import { Zap, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function DailyTracker({ updates }: { updates: any[] }) {

  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    const userDate = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setTodayDate(userDate);
  }, []);

  const stats = updates.reduce((acc, curr) => {
    if (!acc[curr.leaderName]) {
      acc[curr.leaderName] = new Set<string>();
    }
    curr.habits?.forEach((habit: string) => acc[curr.leaderName].add(habit));
    return acc;
  }, {} as Record<string, Set<string>>);

  return (
    <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
      
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-3">
          <Activity className="text-teal-400 w-6 h-6" />
          <h2 className="text-2xl font-bold text-white font-sans">
            Today's Alignment
          </h2>
        </div>
        
        {todayDate && (
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest ml-9 border-l-2 border-slate-800 pl-3">
            {todayDate}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(stats).length > 0 ? (
          Object.entries(stats).map(([name, habitSet]) => (
            <div
              key={name}
              className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50"
            >
              <span className="text-slate-200 font-bold font-sans tracking-tight">
                {name}
              </span>
              <div className="flex items-center gap-3 bg-teal-500/10 px-4 py-2 rounded-xl border border-teal-500/20">
                <span className="text-teal-400 font-black text-xl">
                  {(habitSet as Set<string>).size}
                </span>
                <Zap className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 italic mb-2">
              No missions logged yet for {todayDate || "today"}.
            </p>
            <p className="text-teal-500/50 text-xs uppercase font-bold tracking-widest">
              Be the First
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
