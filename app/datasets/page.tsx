"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import Papa from "papaparse";
import { RawTransaction } from "@/lib/types";
import { DatasetTable } from "@/components/tables/DatasetTable";
import { exportDatasetToCSV, DATASET_PRESETS } from "@/datasets/sampleData";
import { DataProfiler } from "@/components/eda/DataProfiler";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  Cpu,
  ShoppingBag,
  Gem,
  Store,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DatasetManagementPage() {
  const {
    rawTransactions,
    datasetName,
    activePresetId,
    loadPresetDataset,
    setUploadedDataset,
    resetToSampleData,
    result,
  } = useAppStore();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    totalRows: number;
    validRows: number;
    missingValues: number;
    duplicateRows: number;
  } | null>(null);

  const getPresetIcon = (id: string) => {
    switch (id) {
      case "electronics_gaming":
        return Cpu;
      case "supermarket_cpg":
        return ShoppingBag;
      case "luxury_fashion":
        return Gem;
      default:
        return Store;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data;
          if (rows.length === 0) {
            throw new Error("Uploaded CSV file is empty.");
          }

          let missing = 0;
          let dupes = 0;
          const seen = new Set<string>();
          const cleanedRows: RawTransaction[] = [];

          for (const row of rows) {
            const txId = row.transaction_id || row.Transaction_ID || row.TransactionId || row["Transaction ID"] || "";
            const custId = row.customer_id || row.Customer_ID || row.CustomerId || row["Customer ID"] || "";
            const cat = row.product_category || row.Product_Category || row.Category || row["Product Category"] || "";
            const qty = row.quantity || row.Quantity || row.qty || 1;
            const price = row.unit_price || row.Unit_Price || row.UnitPrice || row.price || row.Price || 0;

            if (!txId || !custId || !cat || !price) {
              missing++;
            }

            const dedupeKey = `${txId}|${custId}|${row.product_id}|${cat}|${qty}|${price}`;
            if (seen.has(dedupeKey)) {
              dupes++;
              continue;
            }
            seen.add(dedupeKey);

            cleanedRows.push({
              transaction_id: txId || `TX-UPLOAD-${cleanedRows.length + 1}`,
              customer_id: custId || `CUST-AUTO-${(cleanedRows.length % 50) + 1}`,
              product_id: row.product_id || row.ProductId || `P-${cleanedRows.length + 1}`,
              product_name: row.product_name || row.ProductName || `${cat} Item`,
              product_category: cat || "General",
              quantity: Number(qty) || 1,
              unit_price: Number(price) || 10,
              transaction_date: row.transaction_date || row.Date || "2024-05-01",
              customer_age_group: row.customer_age_group || row.AgeGroup || "25-34",
              region: row.region || row.Region || "Global",
            });
          }

          setUploadStats({
            totalRows: rows.length,
            validRows: cleanedRows.length,
            missingValues: missing,
            duplicateRows: dupes,
          });

          setUploadedDataset(cleanedRows, file.name);
          setIsUploading(false);
        } catch (err: any) {
          setUploadError(err.message || "Failed to parse CSV file.");
          setIsUploading(false);
        }
      },
      error: (err) => {
        setUploadError(`CSV Parse Error: ${err.message}`);
        setIsUploading(false);
      },
    });
  };

  const handleDownload = () => {
    const csvStr = exportDatasetToCSV(rawTransactions);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${datasetName.replace(/[^a-z0-9]/gi, "_")}_processed.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dataset Management & Ingestion</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload custom CSV files, switch between realistic industrial benchmark catalogs, inspect data integrity, and export clean transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToSampleData}>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload}>
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Preset Catalogs Selector Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Industry Benchmark Catalog Presets</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DATASET_PRESETS.map((preset) => {
            const Icon = getPresetIcon(preset.id);
            const isSelected = activePresetId === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => loadPresetDataset(preset.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 shadow-2xs ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{preset.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>{preset.targetRows.toLocaleString()} tx</span>
                  <span>{preset.categories.length} categories</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Zone & Ingestion Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Upload Custom Retail Transaction CSV
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
              Supports standard formats with headers: transaction_id, customer_id, product_name, product_category, quantity, unit_price, date, age_group, region.
            </p>
          </div>

          <label className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm transition-colors">
            <span>Select CSV File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {isUploading && (
            <p className="text-xs text-blue-600 dark:text-blue-400 animate-pulse font-medium">
              Parsing and preprocessing uploaded records...
            </p>
          )}

          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Validation & Ingestion Quality Metrics */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Dataset Integrity Check</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Active Dataset:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                {datasetName}
              </span>
            </div>

            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Total Rows:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {rawTransactions.length.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Valid Transactions:
              </span>
              <span className="font-mono font-bold">
                {result?.datasetMetadata.uniqueTransactions.toLocaleString() ?? rawTransactions.length}
              </span>
            </div>

            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Unique Customers:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {result?.datasetMetadata.uniqueCustomers ?? 0}
              </span>
            </div>

            <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Unique Categories:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {result?.datasetMetadata.uniqueCategories ?? 0}
              </span>
            </div>

            <div className="flex justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Missing Fields Handled:
              </span>
              <span className="font-mono font-semibold">
                {uploadStats?.missingValues ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exploratory Data Analysis & Volume Profiler */}
      <DataProfiler transactions={rawTransactions} />

      {/* Dataset Preview Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Transaction Records Preview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search and verify raw input data before feeding into customer clustering and association mining.
            </p>
          </div>
        </div>

        <DatasetTable transactions={rawTransactions} onDownloadCSV={handleDownload} />
      </div>
    </div>
  );
}
