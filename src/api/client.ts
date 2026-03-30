// src/api/client.ts

// ==========================================
// 🔐 SECURE API CLIENT
// ==========================================

import { auth } from '../Config/firebase'; 
import { sanitizeText, ClientRateLimiter } from '../utils/security';
import type { 
  QuestionsResponse, 
  CheckAnswerResponse, 
  AiChatResponse, 
  AnalyticsData,
  ChatMessage 
} from '../types';

/** 🌍 API Base URL - Points to your Render backend */
const API_BASE = import.meta.env.VITE_API_URL || 'https://lexcasus.onrender.com';

/** 🛡️ Global Rate Limiter - Exported for UI components */
export const rateLimiter = new ClientRateLimiter(45, 60000);

/** 🔑 Fetches the current Firebase ID Token with automatic refresh */
async function getAuthToken(forceRefresh = false): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user. Please sign in.');
  }
  return await currentUser.getIdToken(forceRefresh);
}

/** 🚀 Wrapper for all secure API calls with token injection and retry logic */
async function secureFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  if (!rateLimiter.canProceed()) {
    throw new Error('Too many requests. Please wait a moment before trying again.');
  }

  const token = await getAuthToken(retryCount > 0);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  // Handle Token Expiry
  if (response.status === 401 && retryCount === 0) {
    return secureFetch<T>(endpoint, options, retryCount + 1);
  }

  // Handle Server-Side Rate Limiting
  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please slow down.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error.' }));
    throw new Error(errorData.message || `Request failed (${response.status}).`);
  }

  return response.json();
}

// ==========================================
// 📚 API ENDPOINTS
// ==========================================

/** Fetch questions filtered by Bar subject */
export async function fetchQuestions(subject: string): Promise<QuestionsResponse> {
  return secureFetch<QuestionsResponse>(
    '/api/get-questions',
    {
      method: 'POST',
      body: JSON.stringify({ subject: sanitizeText(subject) }),
    }
  );
}

/** 🆕 V3 AI Auto-Grader: Returns Score, Critique, and Model Answer */
export async function gradeAnswer(
  questionId: string, 
  studentAnswer: string
): Promise<CheckAnswerResponse> {
  return secureFetch<CheckAnswerResponse>(
    '/api/grade-answer',
    {
      method: 'POST',
      body: JSON.stringify({
        questionId: sanitizeText(questionId),
        studentAnswer: sanitizeText(studentAnswer),
      }),
    }
  );
}

/** 🏛️ Jurisprudence AI Chat: Sends sanitized history to Gemini */
export async function askLegalAI(
  query: string, 
  history: ChatMessage[]
): Promise<AiChatResponse> {
  return secureFetch<AiChatResponse>(
    '/api/ask-legal-ai',
    {
      method: 'POST',
      body: JSON.stringify({
        query: sanitizeText(query),
        // Map history to simple role/text objects for the AI
        history: history.map((msg) => ({
          role: msg.role,
          text: sanitizeText(msg.text),
        })),
      }),
    }
  );
}

/** Admin-only analytics fetch */
export async function fetchAdminAnalytics(): Promise<{ success: boolean; data: AnalyticsData }> {
  return secureFetch<{ success: boolean; data: AnalyticsData }>('/api/admin/analytics', {
    method: 'GET',
  });
}
/** 🆕 Admin: Sync a new Bar Exam question to Firestore */
export async function saveAdminQuestion(questionData: {
  mainSubject: string;
  subSubject: string;
  questionText: string;
  suggestedAnswer: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  return secureFetch<{ success: boolean; message: string; id?: string }>(
    '/api/save-question',
    {
      method: 'POST',
      body: JSON.stringify({
        mainSubject: sanitizeText(questionData.mainSubject),
        subSubject: sanitizeText(questionData.subSubject),
        questionText: sanitizeText(questionData.questionText),
        suggestedAnswer: sanitizeText(questionData.suggestedAnswer),
      }),
    }
  );
}