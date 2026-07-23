"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
  email: "",
  password: "",
  name: "",
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to authenticate. Please check your input.");
        setLoading(false);
        return;
      }

      if (data.token) {
        window.localStorage.setItem("sr_token", data.token);
      }

      const nextPath = data.user?.role === "ADMIN" ? "/admin/dashboard" : "/customer/dashboard";
      router.push(nextPath);
    } catch (err) {
      setError("Server error while authenticating.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl sm:grid-cols-[0.9fr_0.9fr]">
        <section className="hidden flex-col justify-between gap-10 bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800 px-10 py-12 text-white sm:flex">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-100">Smart Retail Pro</span>
            <h1 className="mt-10 text-4xl font-semibold leading-tight">Retail analytics, stock automation, and role-based portals for modern stores.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200/90">Access the customer storefront or admin operations with one login flow. Every page is wired to PostgreSQL views, triggers, and stored procedures for production-grade automation.</p>
          </div>

          <div className="grid gap-4 rounded-[32px] bg-white/10 p-6 text-slate-100 shadow-inner shadow-slate-900/10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-100/80">Built for</p>
              <p className="mt-2 text-lg font-semibold">Retail teams that need true inventory and order control.</p>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-100/85">
              <li>• Live product catalog with dynamic filters</li>
              <li>• Cart, checkout, wishlist, and order tracking</li>
              <li>• Admin dashboards, inventory, reports, and ADBMS demo</li>
            </ul>
          </div>
        </section>

        <main className="px-8 py-10 sm:px-12 sm:py-14">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">{mode === "login" ? "Sign in to your account" : "Create a new account"}</h2>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
              >
                Register
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  value={form.name}
                  onChange={updateField("name")}
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email address</span>
              <input
                value={form.email}
                onChange={updateField("email")}
                type="email"
                required
                placeholder="name@company.com"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                value={form.password}
                onChange={updateField("password")}
                type="password"
                required
                placeholder="••••••••"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Processing..." : mode === "login" ? "Continue to Dashboard" : "Create Account"}
            </button>
          </form>

          <div className="mt-10 rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Why this portal?</p>
            <p className="mt-3 leading-7">This application uses existing tables and database automation to deliver a fully integrated retail experience. No hard-coded inventory, no mock datasets — just real product, order, and analytics flows.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
