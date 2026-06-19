import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-6 max-w-2xl">
        <Link
          href="/admin/cases"
          className="block p-6 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#e94560] transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Case Management</h2>
          <p className="text-neutral-400">
            Review, resolve, and manage reported cases in bulk.
          </p>
        </Link>
        <Link
          href="/admin/companies"
          className="block p-6 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#e94560] transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Company Directory</h2>
          <p className="text-neutral-400">
            Manage companies, contact emails, and scrape status.
          </p>
        </Link>
      </div>
    </div>
  );
}
