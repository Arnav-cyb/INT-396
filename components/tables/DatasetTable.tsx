"use client";

import React, { useState, useMemo } from "react";
import { RawTransaction } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface DatasetTableProps {
  transactions: RawTransaction[];
  onDownloadCSV: () => void;
}

export function DatasetTable({ transactions, onDownloadCSV }: DatasetTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.product_category) set.add(tx.product_category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filter
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchCat =
        selectedCategory === "all" || tx.product_category === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        tx.transaction_id.toLowerCase().includes(q) ||
        tx.customer_id.toLowerCase().includes(q) ||
        tx.product_name.toLowerCase().includes(q) ||
        tx.product_category.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [transactions, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, SKU, customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-2xs"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs pr-8 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export & Record Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filtered.length.toLocaleString()} matching records
          </span>
          <button
            onClick={onDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-3 py-3">Customer ID</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3 text-right">Qty</th>
              <th className="px-3 py-3 text-right">Unit Price</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Age Group</th>
              <th className="px-3 py-3">Region</th>
              <th className="px-3 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginated.length > 0 ? (
              paginated.map((row, idx) => {
                const qty = Number(row.quantity) || 1;
                const price = Number(row.unit_price) || 0;
                const total = qty * price;
                const isValid = row.transaction_id && row.customer_id && qty > 0 && price > 0;

                return (
                  <tr key={`${row.transaction_id}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-800 dark:text-slate-200">{row.transaction_id}</td>
                    <td className="px-3 py-2.5 font-mono text-blue-600 dark:text-blue-400">{row.customer_id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate" title={row.product_name}>
                      {row.product_name}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {row.product_category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">{qty}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(price)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(total)}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400">{row.transaction_date}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.customer_age_group}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.region}</td>
                    <td className="px-3 py-2.5 text-center">
                      {isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-500 inline" />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                  No transaction records found matching the active query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <span>
          Showing {paginated.length} of {filtered.length.toLocaleString()} records (Page {currentPage} of {totalPages})
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-2 font-mono">{currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
