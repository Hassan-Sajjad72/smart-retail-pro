import Link from "next/link";
import "../globals.css";

export const metadata = {
  title: "Admin Portal | Smart Retail Pro",
};

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/adbms", label: "ADBMS" },
  { href: "/admin/recommendation", label: "Recommendations" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-10">
            <h1 className="text-xl font-semibold text-slate-900">Admin Portal</h1>
            <p className="mt-2 text-sm text-slate-500">Operational control and database insights.</p>
          </div>
          <nav className="space-y-2 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold">Secure access</p>
            <p className="mt-2">All admin operations require JWT role validation and database procedures.</p>
            <Link href="/auth" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Sign Out
            </Link>
          </div>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
