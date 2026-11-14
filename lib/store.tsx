"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DATASET_PRESETS, generateDatasetFromPreset, PRELOADED_SAMPLE_DATASET } from "@/datasets/sampleData";
import { runAnalysisPipeline } from "@/ml/pipeline";
import { AnalysisPipelineResult, AssociationRule, RawTransaction } from "./types";
import { playChimeSound } from "./sound";
import { launchConfetti } from "./confetti";

export interface PipelineConfig {
  algorithm: "kmeans" | "dbscan";
  k: number;
  eps: number;
  minSamples: number;
  ruleAlgorithm: "fpgrowth" | "apriori";
  minSupport: number;
  minConfidence: number;
  minLift: number;
  usePythonService: boolean;
}

export type PipelineStep =
  | "idle"
  | "ingestion"
  | "scaling"
  | "clustering"
  | "pca"
  | "itemsets"
  | "rules"
  | "cross_cluster"
  | "completed";

interface AppContextType {
  rawTransactions: RawTransaction[];
  datasetName: string;
  activePresetId: string;
  config: PipelineConfig;
  result: AnalysisPipelineResult | null;
  isLoading: boolean;
  pipelineStep: PipelineStep;
  error: string | null;
  selectedClusterId: number | "all";
  selectedCategory: string | "all";
  selectedRuleForDrawer: AssociationRule | null;
  isCommandPaletteOpen: boolean;
  isCopilotOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsCopilotOpen: (open: boolean) => void;
  setSelectedRuleForDrawer: (rule: AssociationRule | null) => void;
  updateConfig: (newConfig: Partial<PipelineConfig>) => void;
  setSelectedClusterId: (id: number | "all") => void;
  setSelectedCategory: (cat: string | "all") => void;
  setUploadedDataset: (transactions: RawTransaction[], name: string) => void;
  loadPresetDataset: (presetId: string) => void;
  resetToSampleData: () => void;
  runAnalysis: () => Promise<void>;
}

const defaultConfig: PipelineConfig = {
  algorithm: "kmeans",
  k: 4,
  eps: 1.8,
  minSamples: 4,
  ruleAlgorithm: "fpgrowth",
  minSupport: 0.04,
  minConfidence: 0.2,
  minLift: 1.05,
  usePythonService: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [rawTransactions, setRawTransactions] = useState<RawTransaction[]>(PRELOADED_SAMPLE_DATASET);
  const [datasetName, setDatasetName] = useState<string>("Omnichannel Enterprise Retail");
  const [activePresetId, setActivePresetId] = useState<string>("omnichannel");
  const [config, setConfig] = useState<PipelineConfig>(defaultConfig);
  const [result, setResult] = useState<AnalysisPipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [selectedRuleForDrawer, setSelectedRuleForDrawer] = useState<AssociationRule | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const updateConfig = (newConfig: Partial<PipelineConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const executePipeline = async (
    data: RawTransaction[],
    name: string,
    cfg: PipelineConfig
  ) => {
    setIsLoading(true);
    setError(null);
    setPipelineStep("ingestion");

    try {
      const pipelineResult = runAnalysisPipeline(data, {
        datasetName: name,
        algorithm: cfg.algorithm,
        k: cfg.k,
        eps: cfg.eps,
        minSamples: cfg.minSamples,
        ruleAlgorithm: cfg.ruleAlgorithm,
        minSupport: cfg.minSupport,
        minConfidence: cfg.minConfidence,
        minLift: cfg.minLift,
      });

      setResult(pipelineResult);
      setPipelineStep("completed");
      playChimeSound();
      launchConfetti();
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setError(err.message || "An unexpected error occurred during ML analysis.");
      setPipelineStep("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    await executePipeline(rawTransactions, datasetName, config);
  };

  const loadPresetDataset = (presetId: string) => {
    const preset = DATASET_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const data = generateDatasetFromPreset(preset.id);
    setActivePresetId(preset.id);
    setRawTransactions(data);
    setDatasetName(preset.name);
    setSelectedClusterId("all");
    setSelectedCategory("all");
    executePipeline(data, preset.name, config);
  };

  const setUploadedDataset = (transactions: RawTransaction[], name: string) => {
    setActivePresetId("custom");
    setRawTransactions(transactions);
    setDatasetName(name);
    setSelectedClusterId("all");
    setSelectedCategory("all");
    executePipeline(transactions, name, config);
  };

  const resetToSampleData = () => {
    loadPresetDataset("omnichannel");
  };

  // Keyboard shortcut listener: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Initial computation on mount
  useEffect(() => {
    executePipeline(rawTransactions, datasetName, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        rawTransactions,
        datasetName,
        activePresetId,
        config,
        result,
        isLoading,
        pipelineStep,
        error,
        selectedClusterId,
        selectedCategory,
        selectedRuleForDrawer,
        isCommandPaletteOpen,
        isCopilotOpen,
        setIsCommandPaletteOpen,
        setIsCopilotOpen,
        setSelectedRuleForDrawer,
        updateConfig,
        setSelectedClusterId,
        setSelectedCategory,
        setUploadedDataset,
        loadPresetDataset,
        resetToSampleData,
        runAnalysis,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
