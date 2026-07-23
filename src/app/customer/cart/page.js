"use client";

import { useEffect, useMemo, useState } from "react";

export default function CustomerCartPage() {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem("sr_cart");
      setCart(storedCart ? JSON.parse(storedCart) : []);
    } catch {
      setCart([]);
    }
    setMounted(true);
  }, []);

  const [shipping, setShipping] = useState({ address: "", city: "", postalCode: "", country: "" });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateQuantity = (productId, quantity) => {
    const nextCart = cart.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    window.localStorage.setItem("sr_cart", JSON.stringify(nextCart));
    setCart(nextCart);
  };

  const removeItem = (productId) => {
    const nextCart = cart.filter((item) => item.id !== productId);
    window.localStorage.setItem("sr_cart", JSON.stringify(nextCart));
    setCart(nextCart);
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0), [cart]);
  const shippingCost = cart.length ? 5.0 : 0;
  const tax = Number((total * 0.06).toFixed(2));
  const totalDue = Number((total + shippingCost + tax).toFixed(2));

  const handleCheckout = async () => {
    if (!cart.length) {
      setMessage("Your cart is empty.");
      return;
    }
    setCheckoutLoading(true);
    setMessage("");

    try {
      const formattedItems = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: formattedItems, shipping, paymentMethod }),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to place the order.");
        return;
      }

      window.localStorage.removeItem("sr_cart");
      setCart([]);
      setMessage("Order placed successfully. Track it in My Orders.");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while checking out.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Shopping cart</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Ready for checkout</h1>
            <p className="mt-2 text-sm text-slate-600">Update quantities and complete your payment details securely.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{cart.length} item{cart.length === 1 ? "" : "s"}</div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <section className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          {!cart.length ? (
            <div className="rounded-[32px] border border-dashed border-slate-200 p-12 text-center text-slate-500">Your cart is empty. Browse products to start shopping.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="rounded-[32px] border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item.name}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">${Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-10 w-10 rounded-3xl border border-slate-200 text-slate-700 hover:bg-slate-100">−</button>
                    <span className="min-w-[40px] text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-10 w-10 rounded-3xl border border-slate-200 text-slate-700 hover:bg-slate-100">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Subtotal</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">${((Number(item.price) || 0) * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="mt-3 text-sm font-semibold text-rose-600 hover:text-rose-700">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order summary</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Sales tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
                <span>Total due</span>
                <span>${totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shipping address</p>
            <div className="mt-5 space-y-4">
              <input value={shipping.address} onChange={(event) => setShipping((prev) => ({ ...prev, address: event.target.value }))} placeholder="Street address" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
              <input value={shipping.city} onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))} placeholder="City" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
              <input value={shipping.postalCode} onChange={(event) => setShipping((prev) => ({ ...prev, postalCode: event.target.value }))} placeholder="Postal code" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
              <input value={shipping.country} onChange={(event) => setShipping((prev) => ({ ...prev, country: event.target.value }))} placeholder="Country" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Payment method</p>
            <div className="mt-5 space-y-3">
              {[
                ["card", "Credit card"],
                ["wallet", "Retail wallet"],
              ].map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-3xl border px-4 py-3 transition ${paymentMethod === value ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="h-4 w-4 accent-blue-600" />
                  <span className="text-sm font-semibold text-slate-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleCheckout} disabled={checkoutLoading || !cart.length} className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {checkoutLoading ? "Placing order..." : "Complete checkout"}
          </button>
        </aside>
      </div>
    </div>
  );
}
