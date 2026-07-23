"use client";

import { useEffect, useMemo, useState } from "react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", { credentials: "include" });
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError("Unable to load order history.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const activeOrder = useMemo(
    () => orders.find((order) => ["Processing", "Shipped", "Pending", "Confirmed"].includes(order.status)) || orders[0] || null,
    [orders],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Order history</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">My orders</h1>
            <p className="mt-2 text-sm text-slate-600">Track your delivery status and recent purchase activity.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Current order</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeOrder ? `#${activeOrder.order_id || activeOrder.id}` : "No active order"}</h2>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${activeOrder?.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                {activeOrder?.status ?? "Waiting"}
              </span>
            </div>
            {activeOrder ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Order date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{activeOrder.created_at ? new Date(activeOrder.created_at).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Order total</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">${activeOrder.total_amount ?? activeOrder.total_price ?? 0}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No active orders to show. Explore the catalog to place your first order.</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent orders</p>
              <button onClick={() => window.location.reload()} className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Refresh</button>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-[28px] bg-slate-100" />
                ))
              ) : orders.length ? (
                orders.map((order) => (
                  <div key={order.order_id || order.id} className="rounded-[28px] border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Order #{order.order_id || order.id}</p>
                        <p className="mt-1 text-sm text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "Date unknown"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{order.status || "Pending"}</span>
                        <span className="text-sm font-semibold text-slate-900">${order.total_amount ?? order.total_price ?? 0}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button onClick={() => setExpanded(expanded === order.order_id ? null : order.order_id)} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{expanded === order.order_id ? "Hide details" : "View details"}</button>
                      <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Download invoice</button>
                      {order.status?.toLowerCase() === "delivered" && <button className="rounded-2xl border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Write review</button>}
                    </div>
                    {expanded === order.order_id && (
                      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Order details</p>
                        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words">{JSON.stringify(order, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">No orders have been placed yet.</div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="rounded-[32px] bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order timeline</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">Every order is tracked through the database and updated automatically when the status changes.</p>
          </div>
          <div className="rounded-[32px] border border-slate-200 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Need support?</p>
            <p className="mt-4 text-sm text-slate-600">If you have questions about an order, reach out to support or check order details for delivery updates.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
