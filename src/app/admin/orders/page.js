"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders", { credentials: "include" });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
      credentials: "include",
    });
    setMessage("Order status updated.");
    loadOrders();
    setTimeout(() => setMessage(""), 3000);
  };

  const cancelOrder = async (orderId) => {
    await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE", credentials: "include" });
    setMessage("Order cancellation requested.");
    loadOrders();
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Order management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage orders</h1>
            <p className="mt-2 text-sm text-slate-600">View all orders and update order statuses with the admin workflow.</p>
          </div>
          <button onClick={loadOrders} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Refresh</button>
        </div>
      </section>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div>}

      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.order_id || order.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Order #{order.order_id || order.id}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{order.customer_name || order.customer_email || order.customer_id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">{STATUS_OPTIONS.find((option) => option.value === order.status)?.label ?? order.status ?? "Pending"}</span>
                    <span className="text-sm text-slate-600">${order.total_price?.toFixed?.(2) ?? order.total_amount?.toFixed?.(2) ?? 0}</span>
                    <button onClick={() => cancelOrder(order.order_id || order.id)} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Cancel</button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">Status:
                    <select value={order.status || "PENDING"} onChange={(event) => updateStatus(order.order_id || order.id, event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                      {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">No orders found in the system yet.</div>
        )}
      </section>
    </div>
  );
}
