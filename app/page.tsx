"use client";
import { useEffect, useState, useRef } from "react";
import { db } from "./lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import HabitCard from "./components/HabitCard";
import { Loader2, Zap, Trophy, ChevronDown, Check } from "lucide-react";
import { fetchMonthlyData } from "./lib/analytics";
import Link from "next/link";
import DailyTracker from "./components/DailyTracker";
import DateNavigator from "./components/DateNavigator";
import { fetchDateLog } from "./lib/analytics";
import { getHabitsForDate } from "./lib/habits";

export default function Home() {
  const [habits, setHabits] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [perfectDay, setPerfectDay] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [allMembers, setAllMembers] = useState<string[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [leaderName, setLeaderName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elite_leader_name") || "";
    }
    return "";
  });

  useEffect(() => {
    localStorage.setItem("elite_leader_name", leaderName);
  }, [leaderName]);

  useEffect(() => {
    const currentHabits = getHabitsForDate(viewDate);
    const habitsWithState = currentHabits.map((h) => ({
      ...h,
      isCompleted: false,
    }));

    setHabits(habitsWithState);

    loadDailyContext();
  }, [viewDate]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(collection(db, "members"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const names = snapshot.docs.map((doc) => doc.data().name);
        setAllMembers(names);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (leaderName.trim() === "") {
      setFilteredMembers([]);
      setShowDropdown(false);
      return;
    }

    const matches = allMembers.filter(
      (name) =>
        name.toLowerCase().includes(leaderName.toLowerCase()) &&
        name.toLowerCase() !== leaderName.toLowerCase(),
    );

    setFilteredMembers(matches);
    setShowDropdown(matches.length > 0);
  }, [leaderName, allMembers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAnalysis = async () => {
    const data = await fetchMonthlyData();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayData = data.filter((update) => {
      const updateDate = update.timestamp?.toDate
        ? update.timestamp.toDate()
        : new Date(update.timestamp);
      return updateDate >= startOfToday;
    });

    setGroupData(todayData);
  };

  // useEffect(() => {
  //   const fetchHabits = async () => {
  //     const q = query(collection(db, "habits"), orderBy("order", "asc"));
  //     const querySnapshot = await getDocs(q);
  //     const habitList = querySnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       title: doc.data().title,
  //       isCompleted: false,
  //     }));
  //     setHabits(habitList);
  //     setLoading(false);
  //   };
  //   fetchHabits();
  //   loadAnalysis();
  // }, []);

  useEffect(() => {
    loadAnalysis();
    setLoading(false);
  }, []);

  const loadDailyContext = async () => {
    try {
      const dayLogs = await fetchDateLog(viewDate);
      setGroupData(dayLogs);
    } catch (err) {
      console.error("Time travel failed:", err);
    }
  };

  useEffect(() => {
    loadDailyContext();
  }, [viewDate]);

  useEffect(() => {
    if (!leaderName.trim()) return;

    const syncHabits = () => {
      const userLogs = groupData.filter(
        (u: any) => u.leaderName?.toLowerCase() === leaderName.toLowerCase(),
      );

      const completedSet = new Set(userLogs.flatMap((u: any) => u.habits));

      setHabits((prev) =>
        prev.map((h) => ({
          ...h,
          isCompleted: completedSet.has(h.title),
        })),
      );
    };

    syncHabits();
  }, [groupData, leaderName]);

  useEffect(() => {
    if (!leaderName.trim() || groupData.length === 0) return;

    const syncTodayProgress = () => {
      const userTodayUpdates = groupData.filter(
        (u) => u.leaderName.toLowerCase() === leaderName.toLowerCase(),
      );
      const completedToday = new Set(userTodayUpdates.flatMap((u) => u.habits));
      setHabits((prevHabits) =>
        prevHabits.map((h) => ({
          ...h,
          isCompleted: completedToday.has(h.title),
        })),
      );
    };
    syncTodayProgress();
  }, [leaderName, groupData]);

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, isCompleted: !h.isCompleted } : h,
      ),
    );
  };

  const selectName = (name: string) => {
    setLeaderName(name);
    setShowDropdown(false);
  };

  const completedCount = habits.filter((h) => h.isCompleted).length;
  const progressPercentage = (completedCount / habits.length) * 100;

  const shareWithGroup = async () => {
    const completed = habits.filter((h) => h.isCompleted).map((h) => h.title);

    if (!leaderName.trim())
      return setError("Please enter your name to stay mission-aligned.");

    if (!allMembers.includes(leaderName)) {
      return setError(
        "Access Denied: You must select a valid member name from the list.",
      );
    }

    if (completed.length === 0)
      return setError("You must complete at least one habit before updating.");

    const isPerfect = completed.length === habits.length;
    setPerfectDay(isPerfect);

    setIsSubmitting(true);

    try {
      const isToday = new Date().toDateString() === viewDate.toDateString();

      let timestamp;

      if (isToday) {
        timestamp = serverTimestamp();
      } else {
        const pastDate = new Date(viewDate);
        pastDate.setHours(12, 0, 0, 0);
        timestamp = Timestamp.fromDate(pastDate);
      }

      await addDoc(collection(db, "updates"), {
        leaderName,
        habits: completed,
        count: completed.length,
        timestamp: timestamp,
      });

      setShowSuccess(true);
      await loadDailyContext();
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
        <DateNavigator selectedDate={viewDate} onSelectDate={setViewDate} />

        <div className="max-w-md mx-auto mb-10 relative" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Start typing your name..."
              value={leaderName}
              onChange={(e) => {
                setLeaderName(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-600"
            />
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-5 h-5" />
          </div>

          {showDropdown && filteredMembers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
              {filteredMembers.map((name) => (
                <button
                  key={name}
                  onClick={() => selectName(name)}
                  className="w-full text-left px-6 py-3 text-slate-200 hover:bg-teal-500/10 hover:text-teal-400 transition-colors border-b border-slate-700/50 last:border-0 flex items-center justify-between group"
                >
                  {name}
                  <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-500" />
                </button>
              ))}
            </div>
          )}
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
              isElite={perfectDay}
              onClose={() => setShowSuccess(false)}
            />
          )}

          {error && (
            <ErrorPopup message={error} onClose={() => setError(null)} />
          )}
        </div>
        {groupData.length > 0 && (
          <DailyTracker
            updates={groupData}
            dateLabel={viewDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          />
        )}
      </div>
    </main>
  );
}
function SuccessPopup({
  onClose,
  name,
  isElite,
}: {
  onClose: () => void;
  name: string;
  isElite: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div
        className={`bg-slate-900 border p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden
        ${
          isElite
            ? "border-amber-500/50 shadow-amber-500/20"
            : "border-teal-500/30 shadow-teal-500/10"
        }`}
      >
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl -z-10
          ${isElite ? "bg-amber-500/20" : "bg-teal-500/10"}`}
        />

        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 
          ${
            isElite
              ? "bg-amber-500/10 ring-amber-500/20"
              : "bg-teal-500/20 ring-teal-500/10"
          }`}
        >
          {isElite ? (
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
          ) : (
            <Zap className="w-10 h-10 text-teal-400 animate-pulse" />
          )}
        </div>

        {/* Dynamic Title */}
        <h2 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">
          {isElite ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              ELITE STATUS
            </span>
          ) : (
            "Mission Logged"
          )}
        </h2>

        {/* Dynamic Message */}
        <p className="text-slate-400 mb-8 leading-relaxed">
          {isElite ? (
            <>
              Maximum discipline achieved,{" "}
              <span className="text-amber-400 font-bold">{name}</span>. You have
              conquered every objective today.
            </>
          ) : (
            <>
              Excellent progress,{" "}
              <span className="text-teal-400 font-bold">{name}</span>. Your
              mission has been synced with the group.
            </>
          )}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-4 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95
          ${
            isElite
              ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:to-amber-400 shadow-amber-900/40 border border-amber-400/20"
              : "bg-teal-600 hover:bg-teal-500 shadow-teal-900/40"
          }`}
        >
          {isElite ? "Claim Victory" : "Continue Mission"}
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
