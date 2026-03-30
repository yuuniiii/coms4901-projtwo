import Link from 'next/link';
import { adminCheck } from '@/lib/adminCheck';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce admin check on all /admin routes
  await adminCheck();

  const navGroups = [
    {
      label: 'Main',
      links: [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/images', label: 'Images' },
        { href: '/admin/captions', label: 'Captions' },
        { href: '/admin/caption-requests', label: 'Requests' },
      ]
    },
    {
      label: 'Humor & Content',
      links: [
        { href: '/admin/humor-flavors', label: 'Flavors' },
        { href: '/admin/humor-flavor-steps', label: 'Flavor Steps' },
        { href: '/admin/humor-mix', label: 'Humor Mix' },
        { href: '/admin/terms', label: 'Terms' },
        { href: '/admin/caption-examples', label: 'Examples' },
      ]
    },
    {
      label: 'LLM Config',
      links: [
        { href: '/admin/llm-models', label: 'Models' },
        { href: '/admin/llm-providers', label: 'Providers' },
        { href: '/admin/llm-prompt-chains', label: 'Prompt Chains' },
        { href: '/admin/llm-responses', label: 'Responses' },
      ]
    },
    {
      label: 'Access Control',
      links: [
        { href: '/admin/allowed-signup-domains', label: 'Domains' },
        { href: '/admin/whitelisted-emails', label: 'Whitelisted Emails' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 overflow-y-auto hidden md:block">
        <div className="p-6">
          <span className="text-xl font-bold text-zinc-900">Admin Panel</span>
        </div>
        <nav className="px-4 pb-10">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-8">
              <h3 className="px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Mobile header (optional, keeping it simple for now) */}
        <header className="bg-white border-b border-zinc-200 md:hidden h-16 flex items-center px-4">
           <span className="text-lg font-bold text-zinc-900">Admin Panel</span>
        </header>

        <main className="max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
