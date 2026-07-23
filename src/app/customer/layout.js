import Link from "next/link";
import "../globals.css";

export const metadata = {
  title: "Customer Portal | Smart Retail Pro",
};

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Smart Retail Pro</div>
            <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
              <Link href="/customer/dashboard" className="transition hover:text-slate-900">Dashboard</Link>
              <Link href="/customer/products" className="transition hover:text-slate-900">Products</Link>
              <Link href="/customer/cart" className="transition hover:text-slate-900">Cart</Link>
              <Link href="/customer/orders" className="transition hover:text-slate-900">Orders</Link>
              <Link href="/customer/wishlist" className="transition hover:text-slate-900">Wishlist</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span>Customer Portal</span>
            <Link href="/auth" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100">Sign Out</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
