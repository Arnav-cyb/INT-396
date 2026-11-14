"use client";

import React, { useState, useMemo } from "react";
import { RawTransaction } from "@/lib/types";
import { Search, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DatasetTableProps {
  data: RawTransaction[];
  onDownloadCSV: () => void;
}

export function DatasetTable({ data, onDownloadCSV }: DatasetTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const categories = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.product_category).filter(Boolean))).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchCat = categoryFilter === "all" || row.product_category === categoryFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.transaction_id?.toLowerCase().includes(q) ||
        row.customer_id?.toLowerCase().includes(q) ||
        row.product_name?.toLowerCase().includes(q) ||
        row.product_category?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [data, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
    <div className="flex flex-col space-y-3">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tx ID, customer, product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60 shadow-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {filtered.length.toLocaleString()} matching records
          </span>
          <button
            onClick={onDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 font-semibold text-slate-700">
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
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? (
              paginated.map((row, idx) => {
                const qty = Number(row.quantity) || 1;
                const price = Number(row.unit_price) || 0;
                const total = qty * price;
                const isValid = row.transaction_id && row.customer_id && qty > 0 && price > 0;

                return (
                  <tr key={`${row.transaction_id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-800">{row.transaction_id}</td>
                    <td className="px-3 py-2.5 font-mono text-blue-600">{row.customer_id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900 max-w-[200px] truncate" title={row.product_name}>
                      {row.product_name}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {row.product_category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">{qty}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">{formatCurrency(price)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900">{formatCurrency(total)}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-500">{row.transaction_date}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.customer_age_group}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.region}</td>
                    <td className="px-3 py-2.5 text-center">
                      {isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-500 inline" />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                  No records match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
        <span>
          Showing {(currentPage - 1) * pageSize + 1} -{" "}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} rows
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-2 font-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
