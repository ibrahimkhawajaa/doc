'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([
    {
      role: 'bot',
      content:
        'Hello! I am MediCare Assistant. Ask me about booking appointments, finding Pakistani doctors, or general health guidance.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'online' | 'basic'>('basic');
  const sessionIdRef = useRef(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = await response.json();

      if (data.aiPowered) setAiStatus('online');

      const botReply =
        data.response ||
        data.error ||
        'Sorry, I could not process that. Try asking about booking or finding a doctor.';

      setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Connection error. Please check your internet and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl text-2xl transition hover:scale-105"
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[min(100vw-2rem,24rem)] flex flex-col border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">MediCare Assistant</h3>
              <p className="text-xs text-emerald-100">
                {aiStatus === 'online' ? 'Gemini AI active' : 'Smart assistant active'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-lg cursor-pointer hover:bg-white/20 rounded-lg px-2 py-1 transition"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-slate-500 text-sm animate-pulse">Thinking...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about booking, doctors..."
                className="flex-1 px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-50 text-sm font-semibold transition"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
