"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, MessageCircle, Bot } from "lucide-react";
import { askAI, type ChatMessage } from "@/lib/ai";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askAI(trimmed, conversationHistory);

      const assistantMsg: DisplayMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-500 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Chat Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[100] w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 flex flex-col overflow-hidden"
            style={{ maxHeight: "min(520px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Carrom AI
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Rules • Strategy • Tournament Help
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-3">
                    <MessageCircle className="h-6 w-6 text-indigo-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    Ask me anything about carrom!
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
                    Rules, scoring, strategy tips, or tournament format questions.
                  </p>
                  {/* Quick prompts */}
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                    {[
                      "What are bucks in carrom?",
                      "How does queen scoring work?",
                      "Tips for doubles play",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setInput(prompt);
                          setTimeout(() => handleSend(), 50);
                        }}
                        className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md shadow-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-medium">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-slate-100 px-3 py-2.5 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about carrom rules, scoring…"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all font-medium"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:shadow-md hover:brightness-110 disabled:opacity-40 disabled:hover:shadow-sm disabled:hover:brightness-100 transition-all cursor-pointer active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
