"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMonthlyData } from "../lib/analytics"; // Ensure path is correct
import { Trophy, ArrowLeft, Calendar, BarChart3, TrendingUp } from "lucide-react";

export default function AnalysisPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const result = await fetchMonthlyData();
      setData(result);
      setLoading(false);
    };
    loadStats();
  }, []);

  
  // 1. Group total habits by Leader Name
  const leaderTotals = data.reduce((acc: any, curr: any) => {
    acc[curr.leaderName] = (acc[curr.leaderName] || 0) + curr.count;
    return acc;
  }, {});

  // 2. Calculate "Consistency" (How many days each leader logged in)
  const consistency = data.reduce((acc: any, curr: any) => {
    acc[curr.leaderName] = (acc[curr.leaderName] || 0) + 1;
    return acc;
  }, {});

  // 3. Find the "Top Habit" of the month
  const habitFrequency = data.flatMap(d => d.habits).reduce((acc: any, habit: string) => {
    acc[habit] = (acc[habit] || 0) + 1;
    return acc;
  }, {});
  
  const topHabit = Object.entries(habitFrequency).sort((a: any, b: any) => b[1] - a[1])[0];

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-teal-400 font-sans">
      Loading Elite Intelligence...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <Link href="/" className="flex items-center gap-2 text-teal-500 hover:text-teal-400 transition-colors font-bold">
            <ArrowLeft size={20} /> Back to Daily Tracker
          </Link>
          <div className="text-right">
            <h1 className="text-4xl font-bold text-white mb-2">Monthly <span className="text-teal-400">Endurance</span></h1>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-mono">Performance Dashboard</p>
          </div>
        </div>

        {/* Top Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
            <TrendingUp className="text-teal-400 mb-4" />
            <p className="text-slate-500 text-sm mb-1">Total Group Habits</p>
            <h3 className="text-3xl font-bold text-white">{data.reduce((a, b) => a + b.count, 0)}</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
            <Trophy className="text-teal-400 mb-4" />
            <p className="text-slate-500 text-sm mb-1">Leading Habit</p>
            <h3 className="text-xl font-bold text-white truncate">{topHabit ? topHabit[0] : "N/A"}</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
            <Calendar className="text-teal-400 mb-4" />
            <p className="text-slate-500 text-sm mb-1">Unique Leaders Active</p>
            <h3 className="text-3xl font-bold text-white">{Object.keys(leaderTotals).length}</h3>
          </div>
        </div>

        {/* Detailed Leaderboard Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/80">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-teal-400" /> Leader Performance Rankings
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-tighter border-b border-slate-800/50">
                  <th className="px-8 py-4">Leader Name</th>
                  <th className="px-8 py-4">Consistency (Days)</th>
                  <th className="px-8 py-4">Total Habits</th>
                  <th className="px-8 py-4">Endurance Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {Object.entries(leaderTotals).sort((a: any, b: any) => b[1] - a[1]).map(([name, total]: [string, any]) => (
                  <tr key={name} className="hover:bg-teal-500/5 transition-colors group">
                    <td className="px-8 py-6 font-bold text-white group-hover:text-teal-400 transition-colors">{name}</td>
                    <td className="px-8 py-6">{consistency[name]} Days</td>
                    <td className="px-8 py-6">{total} Habits</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, (total / 240) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono text-teal-500">{total}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}