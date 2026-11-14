"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CommandPalette } from "../ui/CommandPalette";
import { RuleDetailDrawer } from "../drawers/RuleDetailDrawer";
import { InsightCopilot } from "../ai/InsightCopilot";
import { useAppStore } from "@/lib/store";
import { Sparkles } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isCopilotOpen, setIsCopilotOpen } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Floating AI Copilot Trigger Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-white/20 cursor-pointer group"
      >
        <Sparkles className="h-4 w-4 animate-spin-slow" />
        <span>Ask Copilot</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 group-hover:animate-ping" />
      </button>

      {/* Global Modals & Drawers */}
      <CommandPalette />
      <RuleDetailDrawer />
      <InsightCopilot isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
