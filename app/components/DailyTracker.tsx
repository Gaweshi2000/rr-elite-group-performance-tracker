import { Zap, Activity } from "lucide-react";

export default function DailyTracker({ updates }: { updates: any[] }) {
  const stats = updates.reduce((acc, curr) => {
    if (!acc[curr.leaderName]) {
      acc[curr.leaderName] = curr.count;
    }
    return acc;
  }, {});
  return (
    <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-teal-400 w-6 h-6" />
        <h2 className="text-2xl font-bold text-white font-sans">
          Today's Alignment
        </h2>
      </div>

      <div className="space-y-4">
        {Object.entries(stats).length > 0 ? (
          Object.entries(stats).map(([name, total]: [string, any]) => (
            <div
              key={name}
              className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <span className="text-slate-200 font-bold font-sans tracking-tight">
                {name}
              </span>
              <div className="flex items-center gap-3 bg-teal-500/10 px-4 py-2 rounded-xl border border-teal-500/20">
                <span className="text-teal-400 font-black text-xl">
                  {total}
                </span>
                <Zap className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-center py-4">
            No missions logged yet today. Lead the way!
          </p>
        )}
      </div>
    </div>
  );
}
