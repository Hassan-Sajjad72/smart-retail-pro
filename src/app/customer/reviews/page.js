"use client";

import { useEffect, useState } from "react";

const initialForm = {
  productId: "",
  orderId: "",
  rating: 5,
  comment: "",
};

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews", { credentials: "include" });
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error(error);
        setMessage("Unable to load reviews.");
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const updateField = (key) => (event) => {
    const value = key === "rating" ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitReview = async () => {
    if (!form.productId || !form.comment) {
      setMessage("Product ID and review comment are required.");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Unable to submit review.");
        return;
      }
      setReviews((current) => [data.review, ...current]);
      setForm(initialForm);
      setMessage("Review submitted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to submit review.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Reviews</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Customer reviews</h1>
            <p className="mt-2 text-sm text-slate-600">Leave feedback on products and reference orders for faster review creation.</p>
          </div>
        </div>
      </section>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Recent reviews</h2>
              <p className="mt-1 text-sm text-slate-600">Manage all of your submitted product reviews in one place.</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-[28px] bg-slate-100" />
              ))}
            </div>
          ) : reviews.length ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id || review.product_id} className="rounded-[28px] border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product ID {review.product_id}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{review.product_name || "Unnamed product"}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700">{review.rating} ★</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                  <p className="mt-4 text-sm text-slate-500">{review.created_at ? new Date(review.created_at).toLocaleDateString() : "Submitted recently"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 p-10 text-center text-slate-500">No reviews have been submitted yet.</div>
          )}
        </section>

        <aside className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Write a review</h2>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Product ID</span>
              <input value={form.productId} onChange={updateField("productId")} placeholder="123" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Order ID (optional)</span>
              <input value={form.orderId} onChange={updateField("orderId")} placeholder="456" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Rating</span>
              <select value={form.rating} onChange={updateField("rating")} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} stars</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Review</span>
              <textarea value={form.comment} onChange={updateField("comment")} rows={5} placeholder="Share your experience with this product..." className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </label>
            <button onClick={submitReview} className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Submit review</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
