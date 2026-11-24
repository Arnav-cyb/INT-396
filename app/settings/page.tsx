"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Settings, Save, Server, Database, Shield, CheckCircle2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { config, updateConfig, runAnalysis, isLoading, theme, setTheme } = useAppStore();
  const [pythonUrl, setPythonUrl] = useState("http://localhost:8000");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Platform Settings & ML Configuration</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure machine learning hyperparameters, external Python microservice endpoints, and platform defaults.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Configuration preferences updated and applied successfully.</span>
        </div>
      )}

      {/* Theme & Appearance */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
          <span>Appearance & Theme</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose between light and dark themes. The preference is automatically saved to local storage.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              theme === "light"
                ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              theme === "dark"
                ? "bg-blue-950/80 border-blue-500 text-blue-300 shadow-2xs"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Moon className="h-4 w-4 text-amber-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* 1. ML Algorithms & Hyperparameters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Machine Learning Hyperparameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Clustering Algorithm
            </label>
            <select
              value={config.algorithm}
              onChange={(e) => updateConfig({ algorithm: e.target.value as any })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kmeans">K-Means (with K-Means++ Initialization)</option>
              <option value="dbscan">DBSCAN (Density-Based Spatial Clustering)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rule Mining Algorithm
            </label>
            <select
              value={config.ruleAlgorithm}
              onChange={(e) => updateConfig({ ruleAlgorithm: e.target.value as any })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fpgrowth">FP-Growth (Frequent Pattern Tree)</option>
              <option value="apriori">Apriori (Candidate Generation)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Number of Clusters (k)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={config.k}
              onChange={(e) => updateConfig({ k: parseInt(e.target.value) || 4 })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Minimum Support Threshold (minSupp)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.5"
              value={config.minSupport}
              onChange={(e) => updateConfig({ minSupport: parseFloat(e.target.value) || 0.04 })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Minimum Confidence Threshold (minConf)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="1.0"
              value={config.minConfidence}
              onChange={(e) => updateConfig({ minConfidence: parseFloat(e.target.value) || 0.2 })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Minimum Lift Threshold (minLift)
            </label>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="5.0"
              value={config.minLift}
              onChange={(e) => updateConfig({ minLift: parseFloat(e.target.value) || 1.05 })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Hybrid Python Deployment Integration */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Server className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Standalone Python ML Processing Service (Optional)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The Next.js application executes K-Means, DBSCAN, PCA, and FP-Growth natively for zero-config Vercel hosting.
          If you have a dedicated Python FastAPI container running `ml/server.py`, you can route calculations there.
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="usePython"
              checked={config.usePythonService}
              onChange={(e) => updateConfig({ usePythonService: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="usePython" className="font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
              Enable Remote Python ML Engine routing (via PYTHON_ML_SERVICE_URL)
            </label>
          </div>

          {config.usePythonService && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Python Microservice Endpoint URL
              </label>
              <input
                type="text"
                value={pythonUrl}
                onChange={(e) => setPythonUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Database & Security */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Persistent Storage (Supabase / PostgreSQL)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Production database tables, foreign keys, and indexes are defined in `db/schema.sql`.
          Database connection strings are read securely from `process.env.DATABASE_URL` or `process.env.SUPABASE_URL`.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </Button>
      </div>
    </div>
  );
}
