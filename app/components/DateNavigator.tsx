import { format, subDays, isSameDay } from "date-fns";
import { CalendarDays, History } from "lucide-react";

interface DateNavigatorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function DateNavigator({
  selectedDate,
  onSelectDate,
}: DateNavigatorProps) {
  const today = new Date();

  const quickDates = Array.from({ length: 5 }).map((_, i) => subDays(today, i));

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex gap-1">
          {quickDates.reverse().map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={date.toString()}
                onClick={() => onSelectDate(date)}
                className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all duration-300 border
                  ${
                    isSelected
                      ? "bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/50 translate-y-[-2px]"
                      : "bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                  }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {isToday ? "Today" : format(date, "EEE")}
                </span>
                <span
                  className={`text-lg font-bold ${
                    isSelected ? "text-white" : "text-slate-400"
                  }`}
                >
                  {format(date, "d")}
                </span>

                {isSelected && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        <div className="relative group">
          <input
            type="date"
            max={today.toISOString().split("T")[0]}
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) => onSelectDate(new Date(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <button
            className={`w-12 h-14 flex items-center justify-center rounded-xl transition-all border border-transparent
             ${
               !quickDates.some((d) => isSameDay(d, selectedDate))
                 ? "bg-teal-600 text-white shadow-lg border-teal-400"
                 : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-200"
             }`}
          >
            <CalendarDays className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isSameDay(selectedDate, today) && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <History className="w-3 h-3" />
          Time Travel Mode: {format(selectedDate, "MMMM do, yyyy")}
        </div>
      )}
    </div>
  );
}
