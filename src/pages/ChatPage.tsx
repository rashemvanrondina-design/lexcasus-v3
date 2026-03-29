// pages/ChatPage.tsx

import { useState, useRef, useEffect } from 'react';
import { askLegalAI, rateLimiter } from '../api/client';
import { formatLegalText, generateSessionId } from '../utils/security'; // 👈 Swapped sanitizeHtml for formatLegalText
import type { ChatMessage } from '../types';
import { Send, Loader2, Scale, AlertCircle, ShieldCheck, Trash2, Copy, Check } from 'lucide-react'; // 👈 Added Copy and Check icons

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null); // 🆕 State for the copy button
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🆕 Function to handle copying text to clipboard
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    if (!rateLimiter.canProceed()) {
      setError('You\'re sending messages too quickly. Please wait a moment.');
      return;
    }

    const userMessage: ChatMessage = {
      id: generateSessionId(),
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // Just send the raw messages; the client will handle the sanitization and mapping
const history = [...messages, userMessage].slice(-20); 

const res = await askLegalAI(query, history);

      if (res.success && res.answer) {
        const aiMessage: ChatMessage = {
          id: generateSessionId(),
          role: 'model',
          text: res.answer,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Handle case where success is false or answer is undefined
        setError(res.answer || 'The AI could not process your request.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError('');
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Chat Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Jurisprudence AI</h1>
              <p className="text-xs text-slate-500">Philippine Legal Research</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-xs font-medium">Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Philippine Legal AI</h2>
              <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                Ask about Supreme Court cases, laws, jurisprudence, or any Philippine legal topic.
                The AI uses real-time search to find verified legal sources.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  'What is the doctrine of stare decisis in Philippine jurisprudence?',
                  'Explain the elements of estafa under the Revised Penal Code.',
                  'What are the grounds for annulment of marriage in the Family Code?',
                  'Summarize the rule on the right against self-incrimination.',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="p-3 rounded-xl text-left text-xs text-slate-400 border border-slate-800/60 hover:border-amber-400/30 hover:text-amber-400 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-amber-400/10 border border-amber-400/20 rounded-2xl rounded-br-md'
                      : 'bg-slate-900/50 border border-slate-800/60 rounded-2xl rounded-bl-md group' // 👈 Added group class for hover effect
                  } px-5 py-4 relative`} // 👈 Added relative positioning for the copy button
                >
                  {msg.role === 'model' && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400">Lex Casus AI</span>
                      </div>
                      {/* 🆕 The Copy Button */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* 👈 Now using formatLegalText! */}
                  <div
                    className="text-sm leading-relaxed text-slate-200"
                    dangerouslySetInnerHTML={{ __html: formatLegalText(msg.text) }}
                  />

                  <p className="text-[10px] text-slate-600 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-sm text-slate-400">
                    Researching Philippine jurisprudence...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm resize-none"
                placeholder="Ask about Philippine laws, cases, or jurisprudence..."
                style={{ maxHeight: '200px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            AI responses are for educational purposes. Always verify with official legal sources.
          </p>
        </div>
      </div>
    </div>
  );
}