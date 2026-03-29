// src/utils/security.ts
import DOMPurify from 'dompurify';

// ==========================================
// 🔒 CORE SANITIZATION
// ==========================================

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'sup', 'sub', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/** 🛡️ Strips all HTML - Used for API payloads */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// ==========================================
// ✅ VALIDATION UTILITIES
// ==========================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return { valid: errors.length === 0, errors };
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==========================================
// ⏱️ RATE LIMITING
// ==========================================

export class ClientRateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 45, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    if (this.timestamps.length > 0 && this.timestamps[0] > cutoff) return;
    this.timestamps = this.timestamps.filter((t) => t > cutoff);
  }

  canProceed(): boolean {
    this.cleanup();
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(Date.now());
    return true;
  }

  getRemainingRequests(): number {
    this.cleanup();
    return Math.max(0, this.maxRequests - this.timestamps.length);
  }

  reset(): void {
    this.timestamps = [];
  }
}

// ==========================================
// 🛠️ MISC UTILITIES
// ==========================================

export function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function formatDateSafe(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** ⚖️ Legal Rulings Formatter */
export function formatLegalText(text: string): string {
  if (!text) return '';

  let formatted = text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>') 
    .replace(/\n/g, '<br />');

  formatted = formatted.replace(/"([^"]{60,})"/g, (match, p1) => {
    return `<blockquote class="border-l-4 border-amber-500/50 pl-4 py-3 my-4 bg-amber-500/5 italic text-slate-400 rounded-r-xl">"${p1}"</blockquote>`;
  });

  return sanitizeHtml(`<p>${formatted}</p>`);
}