"use client";

import { useEffect, useState } from "react";

export default function AdminRecommendationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/recommendations", { credentials: "include" });
        const json = await response.json();
        setData(json);
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
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Recommendation center</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Product intelligence</h1>
            <p className="mt-2 text-sm text-slate-600">Review trending products and collaborative recommendation signals from the database.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {[
            { title: "Trending Products", list: data?.trending },
            { title: "Bought Together", list: data?.boughtTogether },
            { title: "Personalized Recommendations", list: data?.personalized },
          ].map((section) => (
            <div key={section.title} className="rounded-[32px] bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.list?.length ? section.list.map((item) => (
                  <div key={item.product_id || item.id} className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-base font-semibold text-slate-900">{item.name || item.product_name}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.category || item.brand || "Product"}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">${item.price ?? 0}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.rating ? `${item.rating}★` : "Top"}</span>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No recommendations available.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
