const BASE_HABITS = [
  { id: "1", title: "Morning Priming" },
  { id: "2", title: "Meditation" },
  { id: "3", title: "Journaling" },
  { id: "4", title: "Drink Enough Water (Min 2litre or more)" },
  { id: "5", title: "Sleep Enough (Min 7 hours)" },
  { id: "6", title: "Healthy food" },
  { id: "7", title: "Exercise" },
  { id: "8", title: "Apply Tools in daily life or revisit them" },
];

const READING_START_DATE = new Date("2026-01-27");

export const getHabitsForDate = (date: Date) => {
  const dailyHabits = [...BASE_HABITS];
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  // LOGIC A: The "Reading" Habit
  // Only add it if the viewed date is ON or AFTER the start date
  const readingStart = new Date(READING_START_DATE);
  readingStart.setHours(0, 0, 0, 0);
  
  if (checkDate >= readingStart) {
    dailyHabits.push({ id: "9", title: "Reading" });
  }

  // LOGIC B: The "Money Saving" Habit
  // Only add it if the day is exactly the 27th
  if (date.getDate() === 27) {
    dailyHabits.push({ 
      id: "money_saving", 
      title: "Money Saving for the Month" 
    });
  }

  return dailyHabits;
};