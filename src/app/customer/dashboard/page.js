"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function CustomerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/dashboard", { credentials: "include" });
        const data = await res.json();
        setDashboard(data);
      } catch (err) {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addToCart = (item) => {
    const current = JSON.parse(window.localStorage.getItem("sr_cart") || "[]");
    const existing = current.find((product) => product.id === item.product_id || product.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ id: item.product_id || item.id, name: item.name || item.product_name, price: item.price || item.amount, quantity: 1 });
    }
    window.localStorage.setItem("sr_cart", JSON.stringify(current));
  };

  const counts = useMemo(() => ({
    orders: dashboard?.stats?.total_orders ?? 0,
    spent: dashboard?.stats?.total_spent ?? 0,
    wishlist: dashboard?.wishlist?.wishlist_items ?? 0,
  }), [dashboard]);

  const latestRecommended = dashboard?.recommended?.slice(0, 3) ?? [];
  const discountItems = dashboard?.discounts?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-900 via-blue-800 to-sky-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Customer dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold">Welcome back.</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-100/90">Your retail storefront is ready. Manage your orders, wishlist, and personalized recommendations all in one place.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-200/80">Orders</p>
              <p className="mt-4 text-3xl font-semibold">{counts.orders}</p>
            </div>
            <div className="rounded-[28px] bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-200/80">Total spent</p>
              <p className="mt-4 text-3xl font-semibold">${counts.spent}</p>
            </div>
            <div className="rounded-[28px] bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-200/80">Wishlist</p>
              <p className="mt-4 text-3xl font-semibold">{counts.wishlist}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Recommended for you</h2>
              <p className="mt-2 text-sm text-slate-600">Products selected from your browsing and order history.</p>
            </div>
            <Link href="/customer/products" className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Browse products</Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
              ))
            ) : latestRecommended.length ? (
              latestRecommended.map((item) => (
                <article key={item.product_id || item.id} className="rounded-[28px] border border-slate-200 p-5">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{item.category || item.brand || "Product"}</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.name || item.product_name}</h3>
                  <p className="mt-3 text-sm text-slate-600">{item.description || "Popular product chosen for you."}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="text-xl font-semibold text-slate-900">${item.price ?? item.discount_price ?? 0}</span>
                    <button onClick={() => addToCart(item)} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add cart</button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-slate-200 p-8 text-center text-sm text-slate-500">No recommendations available yet.</div>
            )}
          </div>
        </div>

        <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="rounded-[32px] bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Discounts</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Active offers</h2>
            <div className="mt-6 space-y-4">
              {discountItems.length ? (
                discountItems.map((item) => (
                  <div key={item.product_id || item.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name || item.product_name}</p>
                        <p className="text-sm text-slate-500">{item.brand || item.category || "Retail"}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Save</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                      <span>${item.discount_price ?? item.price ?? 0}</span>
                      <button onClick={() => addToCart(item)} className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Buy</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No active discounts are available at the moment.</p>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Wishlist snapshot</p>
            <p className="mt-4 text-sm text-slate-600">Saved items and restock alerts appear here once your wishlist is populated.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
