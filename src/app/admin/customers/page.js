"use client";

import { useEffect, useState } from "react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/customers", { credentials: "include" });
        const data = await response.json();
        setCustomers(data.customers || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Customer management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage customers</h1>
            <p className="mt-2 text-sm text-slate-600">Track customer value, order counts, and loyalty insights.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        ) : customers.length ? (
          <div className="overflow-hidden rounded-[28px] border border-slate-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Spending</th>
                  <th className="px-6 py-4">Member since</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.email || customer.customer_id} className="border-t border-slate-200">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{customer.name || customer.customer_name || customer.email}</p>
                      <p className="text-sm text-slate-500">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4">{customer.order_count ?? 0}</td>
                    <td className="px-6 py-4">${Number(customer.total_spent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{customer.member_since ? new Date(customer.member_since).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{customer.status || "Active"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">No customers found yet.</div>
        )}
      </section>
    </div>
  );
}
