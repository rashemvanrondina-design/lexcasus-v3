// ==========================================
// 🔒 LEX CASUS - Type Definitions
// ==========================================
import { LucideIcon } from 'lucide-react';

/** Firebase user profile stored in auth state */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  planTier?: 'free' | 'education' | 'ultra'; 
  trialExpired?: boolean;
}

/** Bar exam question fetched from backend */
export interface BarQuestion {
  id: string;
  question: string;
}

/** Chat message for AI legal assistant */
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

/** Analytics data from admin endpoint */
export interface AnalyticsData {
  // Use a 'stats' sub-object for dynamic subject keys to avoid index conflicts
  subjects: {
    [subject: string]: number;
  };
  total_answers_submitted: number;
  last_activity: { seconds: number; nanoseconds: number } | null;
}

/** Subject metadata for the dashboard */
export interface Subject {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon; 
  color: string;
  bgColor: string;
  borderColor: string; 
  textColor: string;
}

/** API error response */
export interface ApiError {
  success: false;
  message?: string;
  error?: string;
}

/** API success response for questions */
export interface QuestionsResponse {
  success: true;
  questions: BarQuestion[];
}

/** 🆕 API success response for V3 AI Grading */
export interface CheckAnswerResponse {
  success: true;
  score: number;          // Added for V3
  critique: string;       // Added for V3
  suggestedAnswer: string; // Renamed for clarity
}

/** API success response for AI chat */
export interface AiChatResponse {
  success: true;
  answer: string;
}

/** Practice session state */
export interface PracticeState {
  currentQuestion: BarQuestion | null;
  subject: string;
  answeredQuestions: string[];
  isLoading: boolean;
  isGrading: boolean;
  score: number | null;    // Added for V3 UI
  critique: string | null; // Added for V3 UI
  modelAnswer: string | null;
  error: string | null;
}