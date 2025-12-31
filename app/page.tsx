"use client";
import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import HabitCard from "./components/HabitCard";
import { Loader2, Zap } from "lucide-react";
import { fetchMonthlyData } from "./lib/analytics";
import Leaderboard from "./components/DailyTracker";
import Link from "next/link";
import DailyTracker from "./components/DailyTracker";

const ELITE_HABITS = [
  { id: "1", title: "Morning Priming", isCompleted: false },
  { id: "2", title: "Meditation", isCompleted: false },
  { id: "3", title: "Journaling", isCompleted: false },
  {
    id: "4",
    title: "Drink Enough Water (Min 2litre or more)",
    isCompleted: false,
  },
  { id: "5", title: "Sleep Enough (Min 7 hours)", isCompleted: false },
  { id: "6", title: "Healthy food", isCompleted: false },
  { id: "7", title: "Exercise", isCompleted: false },
  {
    id: "8",
    title: "Apply Tools in daily life or revisit them",
    isCompleted: false,
  },
];

export default function Home() {
  const [habits, setHabits] = useState(ELITE_HABITS);
  const [leaderName, setLeaderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<any[]>([]);

  const loadAnalysis = async () => {
    const data = await fetchMonthlyData();
    setGroupData(data);
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, isCompleted: !h.isCompleted } : h
      )
    );
  };

  const completedCount = habits.filter((h) => h.isCompleted).length;
  const progressPercentage = (completedCount / habits.length) * 100;

  const shareWithGroup = async () => {
    const completed = habits.filter((h) => h.isCompleted).map((h) => h.title);
    if (!leaderName.trim())
      return setError("Please enter your name to stay mission-aligned.");
    if (completed.length === 0)
      return setError("You must complete at least one habit before updating.");

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "updates"), {
        leaderName,
        habits: completed,
        count: completed.length,
        timestamp: serverTimestamp(),
      });

      setShowSuccess(true);

      setHabits(ELITE_HABITS);

      await loadAnalysis();
    } catch (e) {
      console.error("Submission error:", e);
      setError("Connection error. Could not reach the group cloud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-12 font-sans selection:bg-teal-500">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Elite <span className="text-teal-400">Tracker</span>
          </h1>
          <p className="text-slate-400 italic mb-8">
            "Enthusiasm is common. Endurance is rare."
          </p>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-teal-700 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-teal-500 font-mono uppercase tracking-widest">
            Mission Progress: {completedCount} / {habits.length}
          </p>
        </header>

        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            placeholder="Enter Name..."
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} onToggle={toggleHabit} />
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <button
            onClick={shareWithGroup}
            disabled={isSubmitting}
            className="group cursor-pointer w-full py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-teal-900/40 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting...
              </>
            ) : (
              "Update Group Mission"
            )}
          </button>
          <Link
            href="/analysis"
            className="block text-center mt-6 text-teal-500 hover:text-teal-400 font-bold transition-all underline decoration-teal-500/30 underline-offset-8"
          >
            View Comprehensive Monthly Analysis →
          </Link>
          {showSuccess && (
            <SuccessPopup
              name={leaderName}
              onClose={() => setShowSuccess(false)}
            />
          )}

          {error && (
            <ErrorPopup message={error} onClose={() => setError(null)} />
          )}
        </div>
        {groupData.length > 0 && <DailyTracker updates={groupData} />}
      </div>
    </main>
  );
}
function SuccessPopup({
  onClose,
  name,
}: {
  onClose: () => void;
  name: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border border-teal-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl shadow-teal-500/10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -z-10" />

        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-teal-500/10">
          <Zap className="w-10 h-10 text-teal-400 animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">
          Mission Logged!
        </h2>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Excellent discipline,{" "}
          <span className="text-teal-400 font-bold">{name}</span>. Your progress
          has been shared with the group.
        </p>

        <button
          onClick={onClose}
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-900/40 active:scale-95"
        >
          Continue Mission
        </button>
      </div>
    </div>
  );
}

function ErrorPopup({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl shadow-amber-500/5 relative overflow-hidden">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-10 h-10 text-amber-500 rotate-180" />{" "}
          {/* Rotated zap for warning sign */}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">
          Attention, Leader
        </h2>

        <p className="text-slate-400 mb-8 leading-relaxed">{message}</p>

        <button
          onClick={onClose}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-xl font-bold transition-all border border-amber-500/20 active:scale-95"
        >
          Fix Mission
        </button>
      </div>
    </div>
  );
}
