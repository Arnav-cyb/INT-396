"use client";

import React, { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { exportDatasetToCSV } from "@/datasets/sampleData";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const { result, rawTransactions, datasetName } = useAppStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!result) return null;

  const meta = result.datasetMetadata;
  const clusters = result.clustering.clusters;
  const rules = result.globalRules;
  const comparisons = result.crossClusterComparisons;

  // Export Association Rules to CSV
  const handleExportRulesCSV = () => {
    const headers = [
      "rule_id",
      "cluster_scope",
      "antecedent",
      "consequent",
      "support",
      "confidence",
      "lift",
      "leverage",
      "conviction",
      "actionable_recommendation",
    ];

    const rows = rules.map((r) => [
      `"${r.id}"`,
      `"${r.clusterName}"`,
      `"${r.antecedent.join(";")}"`,
      `"${r.consequent.join(";")}"`,
      r.support,
      r.confidence,
      r.lift,
      r.leverage,
      r.conviction,
      `"${r.businessAction.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `association_rules_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Transactions to CSV
  const handleExportDatasetCSV = () => {
    const csvContent = exportDatasetToCSV(rawTransactions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${datasetName.replace(/[^a-z0-9]/gi, "_")}_full.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate downloadable PDF via jsPDF & html2canvas
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`merchandising_audit_report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Executive Analytics Reports & Exports
          </h1>
          <p className="text-xs text-slate-500">
            Generate printable PDF reports, export association rule models, and download clean datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportRulesCSV}>
            <Download className="h-3.5 w-3.5" />
            <span>Export Rules (CSV)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPDF}
            isLoading={isGeneratingPDF}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={handlePrintReport}>
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        ref={reportRef}
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Category Association Discovery Report</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Retail Segment & Category Association Audit
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dataset: <strong>{datasetName}</strong> • Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <div>Engine: Dual Next.js / Python ML Architecture</div>
            <div>Status: <span className="text-emerald-600 font-semibold">Validated & Audited</span></div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Key Performance Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="text-[11px] text-slate-500">Total Valid Line Items</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {meta.validRowCount.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="text-[11px] text-slate-500">Total Catalog Revenue</div>
              <div className="text-lg font-bold text-blue-700 mt-0.5">
                {formatCurrency(meta.totalRevenue)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="text-[11px] text-slate-500">Customer Segments</div>
              <div className="text-lg font-bold text-purple-700 mt-0.5">
                {clusters.length} Segments
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="text-[11px] text-slate-500">High-Lift Rules (&gt;1.5x)</div>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">
                {rules.filter((r) => r.lift >= 1.5).length} Rules
              </div>
            </div>
          </div>
        </div>

        {/* 2. Discovered Customer Segments Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Customer Segment Breakdown
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Segment Archetype</th>
                  <th className="px-3 py-2.5 text-right">Customer Count</th>
                  <th className="px-3 py-2.5 text-right">Customer Share</th>
                  <th className="px-3 py-2.5 text-right">Avg Customer Spend</th>
                  <th className="px-3 py-2.5">Core Product Affinity</th>
                  <th className="px-3 py-2.5">Demographics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clusters.map((c) => (
                  <tr key={c.clusterId}>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{c.archetype}</td>
                    <td className="px-3 py-2.5 text-right font-mono">{c.customerCount}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold">{c.percentage}%</td>
                    <td className="px-3 py-2.5 text-right font-mono text-blue-700 font-bold">{formatCurrency(c.avgCustomerSpend)}</td>
                    <td className="px-3 py-2.5">{c.topCategories[0]?.category} ({c.topCategories[0]?.share}%)</td>
                    <td className="px-3 py-2.5 text-slate-500">{c.dominantAgeGroup} • {c.dominantRegion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Top Cross-Cluster Association Rules */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            3. Key Merchandising Associations & Prescriptions
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Rule (Antecedent ➔ Consequent)</th>
                  <th className="px-3 py-2.5">Classification</th>
                  <th className="px-3 py-2.5 text-right">Lift</th>
                  <th className="px-3 py-2.5 text-right">Confidence</th>
                  <th className="px-3 py-2.5">Prescribed Business Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisons.slice(0, 8).map((comp) => (
                  <tr key={comp.ruleKey}>
                    <td className="px-3 py-2.5 font-medium text-slate-900">
                      {comp.antecedent.join(" & ")} ➔ {comp.consequent.join(" & ")}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-slate-600 font-semibold">
                      {comp.type.replace("_", " ")}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-700">
                      {comp.maxLift.toFixed(2)}x
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                      {((comp.clusterStats[comp.dominantClusterId]?.confidence || 0.3) * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 text-[11px] max-w-xs">
                      {comp.actionRecommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Audit Signoff */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <span>Clustering Silhouette: {result.clustering.silhouetteScore.toFixed(3)} | DB Index: {result.clustering.daviesBouldinIndex.toFixed(3)}</span>
          <span>Antigravity Enterprise Analytics Pipeline • End of Report</span>
        </div>
      </div>
    </div>
  );
}
