import { CheckCircle2, Circle } from "lucide-react";

export default function HabitCard({ habit, onToggle }: { habit: any, onToggle: any }) {
  return (
    <button
      onClick={() => onToggle(habit.id)}
      className={`group relative w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left
        ${habit.isCompleted 
          ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/80'
        }`}
    >
      <div className="flex justify-between items-center">
        <span className={`text-lg font-bold transition-colors ${habit.isCompleted ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {habit.title}
        </span>
        <div className={`transition-transform duration-300 ${habit.isCompleted ? 'scale-110 text-teal-400' : 'text-slate-600'}`}>
          {habit.isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
        </div>
      </div>
      
      {/* Decorative background glow for completed tasks */}
      {habit.isCompleted && (
        <div className="absolute inset-0 bg-teal-500/5 rounded-2xl blur-xl -z-10 animate-pulse" />
      )}
    </button>
  );
}