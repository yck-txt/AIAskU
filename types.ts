export interface Badge {
  level: number;
  name: string;
  svg: string;
}

export interface User {
  username: string;
  password: string; // This would be hashed in a real app
  avatar: string; // SVG string for the avatar
  level: number;
  xp: number;
  badges: Badge[];
  isAdmin: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  context: string; // Will be used as the explanation for the correct answer
}

export interface Feedback {
  isCorrect: boolean;
  explanation: string;
}

export interface QuizStat {
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
  questions: QuizQuestion[];
  userAnswers: string[];
  difficulty: Difficulty;
}

export interface SavedQuiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  createdBy: string;
  visibility: 'public' | 'private';
}

export interface TourStep {
  target: string;
  title: string;
  content: string;
  action?: () => void;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SupportMessage {
    sender: 'user' | 'admin';
    text: string;
    timestamp: string;
    isRead: boolean;
}

export interface SupportTicket {
    username: string;
    messages: SupportMessage[];
    lastMessageFrom: 'user' | 'admin' | null;
    userHasUnread: boolean;
    adminHasUnread: boolean;
}