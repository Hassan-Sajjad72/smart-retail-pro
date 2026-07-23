"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const filterOptions = {
  sort: [
    { value: "popularity", label: "Popularity" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Rating" },
  ],
};

export default function CustomerProductsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("popularity");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      if (sort) params.set("sort", sort);
      if (minPrice > 0) params.set("min", String(minPrice));
      if (maxPrice > 0) params.set("max", String(maxPrice));
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, sort, minPrice, maxPrice]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(handle);
  }, [fetchProducts]);

  const addToCart = (product) => {
    const cart = JSON.parse(window.localStorage.getItem("sr_cart") || "[]");
    const id = product.product_id || product.id;
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name: product.name || product.product_name, price: product.price || 0, quantity: 1 });
    }
    window.localStorage.setItem("sr_cart", JSON.stringify(cart));
    setMessage("Added to cart.");
    setTimeout(() => setMessage(""), 2000);
  };

  const addWishlist = async (product) => {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.product_id || product.id }),
        credentials: "include",
      });
      setMessage("Added to wishlist.");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const summary = useMemo(() => {
    if (!items.length) {
      return { count: 0, lowestPrice: 0, highestPrice: 0 };
    }
    return {
      count: items.length,
      lowestPrice: items.reduce((min, item) => Math.min(min, item.price ?? 0), Number.MAX_SAFE_INTEGER),
      highestPrice: items.reduce((max, item) => Math.max(max, item.price ?? 0), 0),
    };
  }, [items]);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Product catalog</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Browse and shop inventory</h1>
            <p className="mt-2 text-sm text-slate-600">Filter across categories, brands, pricing, and trending retail favorites.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-50 px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Visible</p>
              <p className="text-sm font-semibold text-slate-900">{summary.count}</p>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Range</p>
              <p className="text-sm font-semibold text-slate-900">${summary.lowestPrice} - ${summary.highestPrice}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Filters</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Refine your search</h2>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or SKU"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category name"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Brand</span>
              <input
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Brand name"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Min price</span>
                <input
                  value={minPrice || ""}
                  onChange={(event) => setMinPrice(Number(event.target.value) || 0)}
                  type="number"
                  placeholder="0"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Max price</span>
                <input
                  value={maxPrice || ""}
                  onChange={(event) => setMaxPrice(Number(event.target.value) || 0)}
                  type="number"
                  placeholder="0"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              >
                {filterOptions.sort.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-3 inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apply filters
            </button>
          </div>
        </aside>

        <section className="space-y-6">
          {message && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

          <div className="grid gap-6 xl:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-[32px] bg-slate-100" />
              ))
            ) : items.length ? (
              items.map((item) => (
                <article key={item.product_id || item.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{item.category || item.brand || "Product"}</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-900">{item.name || item.product_name}</h2>
                    </div>
                    <span className={`rounded-full px-3 py-2 text-sm font-semibold ${item.stock_qty > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {item.stock_status || (item.stock_qty > 0 ? "In stock" : "Out of stock")}
                    </span>
                  </div>
                  <p className="mt-4 min-h-[56px] text-sm leading-6 text-slate-600">{item.description || item.product_description || "High-quality retail item with advanced features."}</p>
                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Price</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900">${item.discount_price ?? item.price ?? 0}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => addWishlist(item)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Wishlist</button>
                      <button onClick={() => addToCart(item)} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add to cart</button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-slate-500">No products found. Try adjusting your filters.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
