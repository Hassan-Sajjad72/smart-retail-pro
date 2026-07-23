"use client";

import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", brand: "", price: "", stock_qty: "", sku: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", { credentials: "include" });
      const data = await response.json();
      setProducts(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const createProduct = async () => {
    if (!form.name || !form.price) {
      setMessage("Name and price are required.");
      return;
    }
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), stock_qty: Number(form.stock_qty || 0) }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setProducts((current) => [data.item, ...current]);
        setForm({ name: "", category: "", brand: "", price: "", stock_qty: "", sku: "" });
        setMessage("Product created successfully.");
      } else {
        setMessage(data.error || "Unable to create product.");
      }
    } catch (error) {
      setMessage("Unable to create product.");
    }
  };

  const deleteProduct = async (product) => {
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE", credentials: "include" });
    setProducts(products.filter((item) => item.id !== product.id));
    setMessage("Product deleted.");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Product management</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage products</h1>
            <p className="mt-2 text-sm text-slate-600">Add, update, and remove products while preserving database integrity.</p>
          </div>
        </div>
      </section>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div>}

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Add new product</h2>
          <div className="mt-6 grid gap-4">
            {[["name","Product name"],["category","Category"],["brand","Brand"],["price","Price"],["stock_qty","Stock quantity"],["sku","SKU"]].map(([key,label]) => (
              <input key={key} value={form[key]} onChange={updateField(key)} placeholder={label} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
            ))}
            <button onClick={createProduct} className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Create product</button>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Product catalog</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-100" />)
            ) : products.length ? (
              products.map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category || product.brand}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span>${product.price?.toFixed?.(2) ?? 0}</span>
                      <button onClick={() => deleteProduct(product)} className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">No products available yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
