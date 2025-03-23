export interface Card {
  id: number;
  value: string;
  isMatched: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  moves: number;
  time: string;
  timeInSeconds: number;
  difficulty: string;
  theme: string;
  timestamp: number;
} 