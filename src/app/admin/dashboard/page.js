"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const MOCK_MONTHLY = [
  { month: "Jan", value: 18400 }, { month: "Feb", value: 22100 },
  { month: "Mar", value: 19800 }, { month: "Apr", value: 31200 },
  { month: "May", value: 27600 }, { month: "Jun", value: 35900 },
  { month: "Jul", value: 41200 }, { month: "Aug", value: 38700 },
  { month: "Sep", value: 44100 }, { month: "Oct", value: 39500 },
  { month: "Nov", value: 52300 }, { month: "Dec", value: 61800 },
];

const MOCK_CUSTOMERS = [
  { month: "Jan", new: 34, returning: 88 }, { month: "Feb", new: 41, returning: 102 },
  { month: "Mar", new: 38, returning: 97 }, { month: "Apr", new: 57, returning: 131 },
  { month: "May", new: 52, returning: 118 }, { month: "Jun", new: 68, returning: 149 },
  { month: "Jul", new: 74, returning: 162 }, { month: "Aug", new: 71, returning: 157 },
  { month: "Sep", new: 83, returning: 178 }, { month: "Oct", new: 78, returning: 169 },
  { month: "Nov", new: 95, returning: 201 }, { month: "Dec", new: 112, returning: 238 },
];

const MOCK_ORDER_STATUS = [
  { name: "Delivered",  value: 58, color: "#2563eb" },
  { name: "Processing", value: 22, color: "#60a5fa" },
  { name: "Shipped",    value: 14, color: "#93c5fd" },
  { name: "Cancelled",  value: 6,  color: "#f87171" },
];

const ChartTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg text-sm">
      {label && <p className="text-slate-500 mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#2563eb" }} className="font-semibold">
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState({});
  const [totals, setTotals] = useState({ orders: 0, products: 0, customers: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState(MOCK_MONTHLY);

  useEffect(() => {
    async function loadData() {
      try {
        const [reportRes, ordersRes, productsRes, customersRes] = await Promise.all([
          fetch("/api/admin/reports", { credentials: "include" }),
          fetch("/api/admin/orders", { credentials: "include" }),
          fetch("/api/admin/products", { credentials: "include" }),
          fetch("/api/admin/customers", { credentials: "include" }),
        ]);

        const reportData = reportRes.ok ? await reportRes.json() : {};
        const ordersData = ordersRes.ok ? await ordersRes.json() : {};
        const productsData = productsRes.ok ? await productsRes.json() : {};
        const customersData = customersRes.ok ? await customersRes.json() : {};

        setSummary(reportData.reports?.[0] || {});
        setTotals({
          orders: ordersData.total_orders ?? ordersData.orders?.length ?? 0,
          products: productsData.items?.length ?? 0,
          customers: customersData.customers?.length ?? 0,
          lowStock: productsData.items?.filter((item) => item.stock_qty <= 10).length ?? 0,
        });

        if (reportData.reports?.[0]?.revenue_trend?.length) {
          setMonthlyData(reportData.reports[0].revenue_trend);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">

      {/* ── ORIGINAL: header ── */}
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Operations dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Admin overview</h1>
            <p className="mt-2 text-sm text-slate-600">Monitor revenue, KPIs, and inventory health from the database layer.</p>
          </div>
          <Link href="/admin/reports" className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Explore Reports</Link>
        </div>
      </section>

      {/* ── ORIGINAL: stat cards ── */}
      <section className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total Revenue", value: `$${Number(summary.total_revenue || 0).toLocaleString()}` },
          { label: "Total Orders", value: totals.orders },
          { label: "Total Customers", value: totals.customers },
          { label: "Total Products", value: totals.products },
          { label: "Low Stock", value: totals.lowStock, badge: true },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${card.badge ? "text-red-600" : "text-slate-900"}`}>{card.value}</p>
          </div>
        ))}
      </section>

      {/* ── ORIGINAL: monthly revenue + category performance ── */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Monthly revenue</h2>
              <p className="mt-1 text-sm text-slate-600">Sales trend by reporting period.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Live</span>
          </div>
          <div className="mt-8 space-y-3">
            {summary.revenue_trend?.map((entry, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="w-20 text-sm text-slate-500">{entry.month}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, entry.percent || 0)}%` }} />
                </div>
                <span className="w-24 text-right text-sm text-slate-700">${entry.value?.toLocaleString()}</span>
              </div>
            )) || <div className="mt-6 text-sm text-slate-500">Revenue trend unavailable.</div>}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Category performance</h2>
          <p className="mt-1 text-sm text-slate-600">Top revenue categories from recent reports.</p>
          <div className="mt-6 space-y-4">
            {summary.category_breakdown?.map((category) => (
              <div key={category.name} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                  <span>{category.name}</span>
                  <span>${category.revenue?.toLocaleString()}</span>
                </div>
              </div>
            )) || <div className="text-sm text-slate-500">No category data available.</div>}
          </div>
        </div>
      </section>

      {/* ── NEW: Revenue area chart + Order status donut ── */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Revenue chart</h2>
              <p className="mt-1 text-sm text-slate-600">Full-year revenue area view.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 font-medium">12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<ChartTooltip prefix="$" />}/>
              <Area type="monotone" dataKey="value" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#2563eb" }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Order status</h2>
          <p className="mt-1 text-sm text-slate-600">Breakdown by fulfilment status.</p>
          <div className="mt-2 flex items-center gap-4">
            <ResponsiveContainer width="55%" height={190}>
              <PieChart>
                <Pie data={MOCK_ORDER_STATUS} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {MOCK_ORDER_STATUS.map((s, i) => <Cell key={i} fill={s.color}/>)}
                </Pie>
                <Tooltip content={<ChartTooltip />}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {MOCK_ORDER_STATUS.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span style={{ background: s.color }} className="w-2.5 h-2.5 rounded-full shrink-0"/>
                  <span className="text-sm text-slate-600 flex-1">{s.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: Customer acquisition bar chart ── */}
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Customer acquisition</h2>
            <p className="mt-1 text-sm text-slate-600">New vs returning customers per month.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MOCK_CUSTOMERS} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTooltip />}/>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }}/>
            <Bar dataKey="new"       name="New Customers"       radius={[4,4,0,0]} fill="#2563eb"/>
            <Bar dataKey="returning" name="Returning Customers" radius={[4,4,0,0]} fill="#93c5fd"/>
          </BarChart>
        </ResponsiveContainer>
      </section>

    </div>
  );
}