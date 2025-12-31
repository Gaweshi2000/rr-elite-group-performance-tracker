export interface Habit {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface GroupUpdate {
  leaderName: string;
  habits: string[];
  timestamp: any;
  totalCompleted: number;
}
