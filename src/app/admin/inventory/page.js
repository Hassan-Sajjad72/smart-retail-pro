"use client";

import { useEffect, useState } from "react";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadInventory() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/inventory", { credentials: "include" });
      const data = await response.json();
      setInventory(data.items || []);
      setLowStock(data.lowStock || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const restock = async (productId) => {
    const quantity = Number(window.prompt("Enter restock quantity","10"));
    if (!quantity || quantity <= 0) return;
    try {
      await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      setMessage("Restock request submitted.");
      loadInventory();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Unable to restock product.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Inventory management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Stock overview</h1>
            <p className="mt-2 text-sm text-slate-600">Monitor inventory levels and restock products using the stored procedure workflow.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Low stock items: {lowStock}</div>
        </div>
      </section>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div>}

      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        ) : inventory.length ? (
          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.id} className="grid gap-4 rounded-3xl border border-slate-200 p-5 md:grid-cols-[1.5fr_0.9fr_1fr_0.9fr] md:items-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">SKU {item.sku} • {item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Stock</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{item.stock_qty ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Updated</p>
                  <p className="mt-1 text-sm text-slate-700">{item.updated_at?.slice(0,10) ?? "—"}</p>
                </div>
                <button onClick={() => restock(item.id)} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Restock</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">No inventory data available yet.</div>
        )}
      </section>
    </div>
  );
}
