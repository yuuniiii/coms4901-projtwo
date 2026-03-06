import Link from 'next/link';
import { adminCheck } from '@/lib/adminCheck';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce admin check on all /admin routes
  await adminCheck();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-zinc-900">Admin Panel</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className="border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Users
                </Link>
                <Link
                  href="/admin/images"
                  className="border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Images
                </Link>
                <Link
                  href="/admin/captions"
                  className="border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Captions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
