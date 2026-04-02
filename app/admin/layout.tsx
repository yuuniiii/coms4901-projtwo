'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, Image as ImageIcon, MessageSquare, Inbox,
  Smile, ListTree, MoreHorizontal, Book, Lightbulb,
  Cpu, Cloud, Link2, Zap,
  Globe, Mail, LogOut, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const navGroups = [
  {
    label: 'Overview',
    links: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/images', label: 'Images', icon: ImageIcon },
      { href: '/admin/captions', label: 'Captions', icon: MessageSquare },
      { href: '/admin/caption-requests', label: 'Requests', icon: Inbox },
    ]
  },
  {
    label: 'Content',
    links: [
      { href: '/admin/humor-flavors', label: 'Flavors', icon: Smile },
      { href: '/admin/humor-flavor-steps', label: 'Flavor Steps', icon: ListTree },
      { href: '/admin/humor-mix', label: 'Humor Mix', icon: MoreHorizontal },
      { href: '/admin/terms', label: 'Terms', icon: Book },
      { href: '/admin/caption-examples', label: 'Examples', icon: Lightbulb },
    ]
  },
  {
    label: 'AI & Models',
    links: [
      { href: '/admin/llm-models', label: 'Models', icon: Cpu },
      { href: '/admin/llm-providers', label: 'Providers', icon: Cloud },
      { href: '/admin/llm-prompt-chains', label: 'Prompt Chains', icon: Link2 },
      { href: '/admin/llm-responses', label: 'Responses', icon: Zap },
    ]
  },
  {
    label: 'Access',
    links: [
      { href: '/admin/allowed-signup-domains', label: 'Domains', icon: Globe },
      { href: '/admin/whitelisted-emails', label: 'Whitelist', icon: Mail },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#111434] font-mono flex text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0c0e2a] border-r border-white/5 flex flex-col fixed h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-1 rounded-lg flex items-center justify-center">
               <Zap className="w-5 h-5 text-[#111434] fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">ADMIN<span className="text-accent-1">CORE</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-8 pb-10">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="px-4 mb-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-accent-1/10 text-accent-1" 
                          : "text-white/50 hover:bg-white/[0.03] hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-4 h-4", isActive ? "text-accent-1" : "text-white/20 group-hover:text-white/40")} />
                        {link.label}
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent-1 shadow-[0_0_8px_rgba(219,153,90,0.8)]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/40 hover:text-accent-3 hover:bg-accent-3/5 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 flex flex-col">
        <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
