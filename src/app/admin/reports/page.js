"use client";

import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ top_products: [], category_breakdown: [], revenue_trend: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadReports() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reports", { credentials: "include" });
      const data = await response.json();
      setReports(data.reports || []);
      setSummary({
        top_products: data.top_products || [],
        category_breakdown: data.category_breakdown || [],
        revenue_trend: data.revenue_trend || [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reports", { method: "POST", credentials: "include" });
      const data = await response.json();
      setReports(data.reports || []);
      setSummary({
        top_products: data.top_products || [],
        category_breakdown: data.category_breakdown || [],
        revenue_trend: data.revenue_trend || [],
      });
      setMessage("Report generation completed.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to generate report.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const latest = reports[0] || {};

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Reports & analytics</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Generate retail reports</h1>
            <p className="mt-2 text-sm text-slate-600">Use the stored procedure to create sales and profit reports from PostgreSQL.</p>
          </div>
          <button onClick={generateReport} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Generate Report</button>
        </div>
      </section>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div>}

      <section className="grid gap-4 xl:grid-cols-4">
        {[
          { label: "Revenue", value: `$${Number(latest.total_revenue || 0).toLocaleString()}` },
          { label: "Avg order value", value: `$${Number(latest.avg_order_value || latest.average_order_value || 0).toFixed(2)}` },
          { label: "Gross margin", value: `${Number(latest.gross_profit_margin || 0).toFixed(1)}%` },
          { label: "Customer growth", value: `${Number(latest.customer_growth || 0).toFixed(1)}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Top products</h2>
          <div className="mt-6 space-y-4">
            {(summary.top_products || []).map((item, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name || item.product_name}</p>
                    <p className="text-sm text-slate-500">{item.category || "Category"}</p>
                  </div>
                  <span className="text-sm text-slate-700">${item.revenue?.toLocaleString?.() ?? 0}</span>
                </div>
              </div>
            ))}
            {!summary.top_products?.length && <p className="text-sm text-slate-500">No top product data available.</p>}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Profit analysis</h2>
          <p className="mt-2 text-sm text-slate-600">Review margin details for the latest report.</p>
          <div className="mt-6 space-y-4">
            {(latest.profit_breakdown || ['product_revenue', 'service_revenue']).map((item) => {
              const label = typeof item === 'string' ? item : item.label;
              const value = typeof item === 'string' ? latest[item] : item.value;
              return (
                <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>{label.replace("_", " ")}</span>
                    <span>${Number(value || 0).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
