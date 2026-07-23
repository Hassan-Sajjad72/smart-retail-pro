"use client";

import { useEffect, useState } from "react";

export default function CustomerWishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadWishlist() {
      try {
        const response = await fetch("/api/wishlist", { credentials: "include" });
        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error(error);
        setMessage("Unable to load wishlist.");
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const removeWishlist = async (productId) => {
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE", credentials: "include" });
    setItems((current) => current.filter((item) => (item.product_id || item.id) !== productId));
    setMessage("Removed from wishlist.");
    setTimeout(() => setMessage(""), 2000);
  };

  const moveToCart = (item) => {
    const cart = JSON.parse(window.localStorage.getItem("sr_cart") || "[]");
    const id = item.product_id || item.id;
    const existing = cart.find((entry) => entry.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name: item.name || item.product_name, price: item.price || 0, quantity: 1 });
    }
    window.localStorage.setItem("sr_cart", JSON.stringify(cart));
    setMessage("Moved item to cart.");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Wishlist</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Saved for Later</h1>
            <p className="mt-2 text-sm text-slate-600">Your favorite products are stored here for quick checkout later.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{items.length} item{items.length === 1 ? "" : "s"}</div>
        </div>
      </section>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div>}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[32px] bg-slate-100" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.product_id || item.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{item.category || item.brand || "Favorite"}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{item.name || item.product_name}</h2>
                </div>
                <button onClick={() => removeWishlist(item.product_id || item.id)} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Remove</button>
              </div>
              <p className="mt-4 min-h-[64px] text-sm leading-6 text-slate-600">{item.description || item.product_description || "A saved product from your wishlist."}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="text-2xl font-semibold text-slate-900">${item.price ?? 0}</p>
                </div>
                <button onClick={() => moveToCart(item)} className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Move to cart</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">Your wishlist is empty. Save items from the product catalog to revisit them later.</div>
      )}
    </div>
  );
}
