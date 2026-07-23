"use client";

import { useEffect, useState } from "react";

export default function AdminAdbmsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const response = await fetch("/api/admin/adbms", { credentials: "include" });
        const data = response.ok ? await response.json() : null;
        setInsights(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">ADBMS insights</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Database automation demo</h1>
            <p className="mt-2 text-sm text-slate-600">Show live views, triggers, stored procedures, explain plans, and ranking functions.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">DB Views</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {(insights?.views || []).map((view) => <li key={view.table_name}>• {view.table_name}</li>)}
              </ul>
            </div>
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Stored procedures</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {(insights?.procedures || []).map((proc) => <li key={proc.routine_name}>• {proc.routine_name}</li>)}
              </ul>
            </div>
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Triggers</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {(insights?.triggers || []).map((trigger) => <li key={trigger.trigger_name}>• {trigger.trigger_name} (@{trigger.table_name})</li>)}
              </ul>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[32px] bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Query optimization</h2>
              <p className="mt-2 text-sm text-slate-600">Explain analyze output for database performance insights.</p>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
                {insights?.explain?.length ? insights.explain.map((row, index) => <pre key={index} className="whitespace-pre-wrap">{row["QUERY PLAN"] || JSON.stringify(row)}</pre>) : <p>No explain plan available.</p>}
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Window rankings</h2>
              <p className="mt-2 text-sm text-slate-600">Customer ranking by total spending.</p>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                {(insights?.rankings || []).map((row, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">Customer ID: {row.customer_id}</p>
                    <p>Rank: {row.customer_rank}</p>
                    <p>Spent: ${Number(row.total_spent || 0).toLocaleString()}</p>
                  </div>
                )) || <p>No rankings available.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
