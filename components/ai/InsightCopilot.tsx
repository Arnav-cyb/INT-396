"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  processCopilotQuery,
  CopilotMessage,
  CopilotContext,
} from "@/lib/copilot";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  HelpCircle,
  Copy,
  CheckCircle2,
  Trash2,
  Tag,
  Users2,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export function InsightCopilot({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { result, rawTransactions, datasetName, config, selectedClusterId } = useAppStore();
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Copilot context for stateful conversations
  const [copilotContext, setCopilotContext] = useState<CopilotContext>({
    datasetName,
    rawTransactions,
    pipelineResult: result,
    activeClusterId: selectedClusterId,
  });

  // Keep context synced with store
  useEffect(() => {
    setCopilotContext((prev) => ({
      ...prev,
      datasetName,
      rawTransactions,
      pipelineResult: result,
      activeClusterId: selectedClusterId,
    }));
  }, [datasetName, rawTransactions, result, selectedClusterId]);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "init",
      sender: "copilot",
      text: `Hello! I am your SegmentMining AI Copilot. I have analyzed "${datasetName}" across ${result?.clustering.clusters.length || 4} customer segments and mined ${result?.globalRules.length || 0} association rules. How can I help you today?`,
      bullets: [
        "Ask me to recommend products for new customers with category or budget preferences.",
        "Compare customer segments and identify high-value cohorts.",
        "Uncover high-lift FP-Growth association rules and cross-selling bundles.",
      ],
      followUpSuggestions: [
        "Recommend products to a new customer",
        "Explain my customer segments",
        "Find the strongest association rules",
        "Give me a marketing strategy",
      ],
      timestamp: "Just now",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendPrompt = (query: string) => {
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Simulate natural AI thinking delay for smooth user experience
    setTimeout(() => {
      const response = processCopilotQuery(query, copilotContext);

      setCopilotContext((prev) => ({
        ...prev,
        ...response.updatedContext,
      }));

      setMessages((prev) => [...prev, response.message]);
      setIsTyping(false);
    }, 280);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "copilot",
        text: `Chat cleared. Ready for your next query on "${datasetName}".`,
        followUpSuggestions: [
          "Recommend products to a new customer",
          "Explain my customer segments",
          "Find the strongest association rules",
          "Give me a marketing strategy",
        ],
        timestamp: "Just now",
      },
    ]);
  };

  // Get current prompt suggestions from the last copilot message
  const lastCopilotMessage = [...messages].reverse().find((m) => m.sender === "copilot");
  const activeSuggestions =
    lastCopilotMessage?.followUpSuggestions && lastCopilotMessage.followUpSuggestions.length > 0
      ? lastCopilotMessage.followUpSuggestions
      : [
          "Recommend products to a new customer",
          "Explain my customer segments",
          "Find the strongest association rules",
        ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Copilot Drawer */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl z-10 flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Ask Copilot</span>
                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  AI Intelligence
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Context-Aware Analytics & Product Recommendation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "copilot" && (
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-4 space-y-3 leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white font-medium ml-12"
                    : "bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* Message Text */}
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Bullets List */}
                {msg.bullets && msg.bullets.length > 0 && (
                  <ul className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    {msg.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                        <ChevronRight className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* KPI Metrics Strip */}
                {msg.metrics && msg.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    {msg.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-center shadow-2xs"
                      >
                        <div className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-mono tracking-wider">
                          {m.label}
                        </div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5 truncate">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Structured Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                        <span>Recommended Products ({msg.recommendations.length})</span>
                      </span>
                      {msg.matchedSegment && (
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          {msg.matchedSegment.archetype}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {msg.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="h-5 w-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                                #{rec.rank}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                {rec.name}
                              </span>
                            </div>
                            {rec.price !== undefined && (
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                {formatCurrency(rec.price)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              {rec.category}
                            </span>
                            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              Score: {rec.score}/100
                            </span>
                            {rec.ruleLift && (
                              <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                Lift: {rec.ruleLift.toFixed(2)}x
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="h-7 w-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Loading Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
                <span
                  className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                  Analyzing clusters & rules...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Suggested Follow-Up Prompts */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
            Suggested Follow-Ups:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeSuggestions.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(qp)}
                disabled={isTyping}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs text-left cursor-pointer disabled:opacity-50"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Copilot about recommendations, budgets, or segments..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSendPrompt(inputQuery)}
            disabled={isTyping}
            className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendPrompt(inputQuery)}
            disabled={isTyping || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
