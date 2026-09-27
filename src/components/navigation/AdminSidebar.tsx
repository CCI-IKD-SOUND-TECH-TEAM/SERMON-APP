'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  Tag as TagIcon,
  Users,
  Inbox,
  LogOut,
  Menu,
  UserCircle,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

export interface AdminSidebarItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminSidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { key: 'sermons', label: 'Sermons', href: '/admin/sermons', icon: Film },
  { key: 'series', label: 'Series', href: '/admin/series', icon: TagIcon },
  { key: 'albums', label: 'Albums', href: '/admin/albums', icon: ImageIcon },
  { key: 'inbox', label: 'Inbox', href: '/admin/imports', icon: Inbox },
  { key: 'users', label: 'Users', href: '/admin/users', icon: Users },
];

export interface AdminSidebarProps {
  items?: AdminSidebarItem[];
  active?: string;
  collapsed?: boolean;
}

/**
 * AdminSidebar — left sidebar nav for the admin panel. Collapsible to an
 * icon-only rail (collapsed prop). On mobile (≤768px) it becomes a hamburger
 * menu with a slide-out overlay.
 */
export function AdminSidebar({ items = ADMIN_NAV_ITEMS, active = 'dashboard', collapsed = false }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();

  // Close the mobile drawer on route changes (link clicks).
  const handleNavClick = () => setMobileOpen(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  // Lock body scroll when mobile drawer is open.
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-[10px] py-[9px] px-[10px] rounded-sm font-semibold text-[14px] leading-none font-body no-underline ${isActive ? 'bg-primary-light text-primary-dark' : 'bg-transparent text-ink'
    } ${collapsed ? 'justify-center' : 'justify-start'}`;

  /* ── Shared nav link renderer ── */
  const renderNavLinks = (closeFn?: () => void) =>
    items.map((it) => {
      const Icon = it.icon;
      return (
        <Link key={it.key} href={it.href} onClick={closeFn} className={navLinkClass(it.key === active)}>
          <Icon width={18} height={18} className="shrink-0" />
          {!collapsed && it.label}
        </Link>
      );
    });

  return (
    <>
      {/* ── Mobile top bar with hamburger ── */}
      <div className="fixed top-0 inset-x-0 h-14 bg-surface border-b border-border flex md:hidden items-center justify-between px-4 z-[1000]">
        <Link
          href="/admin"
          className="font-display font-semibold text-[18px] leading-none text-ink no-underline"
        >
          Overflow
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="bg-transparent border-none p-2 cursor-pointer text-ink flex items-center justify-center"
          >
            <Menu width={24} height={24} />
          </button>
        </div>
      </div>

      {/* ── Mobile overlay drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1001] flex md:hidden flex-col">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />
          {/* Drawer panel */}
          <div
            className="relative w-[80%] max-w-[300px] h-full bg-surface shadow-[4px_0_24px_rgba(0,0,0,0.15)] flex flex-col py-4 px-2 animate-[adminDrawerSlide_0.25s_ease-out]"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between pt-1 px-[10px] pb-4">
              <Link
                href="/admin"
                onClick={handleNavClick}
                className="font-display font-semibold text-[18px] leading-none text-ink no-underline"
              >
                Overflow
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="bg-transparent border-none p-1 cursor-pointer text-ink flex items-center justify-center"
              >
                <X width={22} height={22} />
              </button>
            </div>
            <div className="flex flex-col flex-1">{renderNavLinks(handleNavClick)}</div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 8 }}>
              <Link href="/admin/profile" onClick={handleNavClick} className={navLinkClass(active === 'profile')}>
                <UserCircle width={18} height={18} className="shrink-0" />
                Profile
              </Link>
              <button
                onClick={() => {
                  handleNavClick();
                  handleLogout();
                }}
                className="flex items-center gap-[10px] py-[9px] px-[10px] rounded-sm font-semibold text-[14px] leading-none font-body no-underline bg-transparent border-none cursor-pointer text-ink justify-start w-full"
              >
                <LogOut width={18} height={18} className="shrink-0" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe for drawer slide animation */}
      <style>{`
        @keyframes adminDrawerSlide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      {/* ── Desktop sidebar (original) ── */}
      <nav
        className="hidden md:flex flex-col shrink-0 bg-surface border-r border-border py-4 px-2 gap-0.5 sticky top-0 h-screen overflow-y-auto transition-[width] duration-300"
        style={{ width: collapsed ? 64 : 220 }}
      >
        {!collapsed && (
          <Link
            href="/admin"
            className="font-display font-semibold text-[18px] leading-none text-ink pt-1 px-[10px] pb-4 no-underline"
          >
            Overflow
          </Link>
        )}
        {renderNavLinks()}
        
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <Link href="/admin/profile" className={navLinkClass(active === 'profile')}>
            <UserCircle width={18} height={18} className="shrink-0" />
            {!collapsed && 'Profile'}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-[10px] py-[9px] px-[10px] rounded-sm font-semibold text-[14px] leading-none font-body no-underline bg-transparent border-none cursor-pointer text-ink w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
          >
            <LogOut width={18} height={18} className="shrink-0" />
            {!collapsed && 'Log out'}
          </button>
        </div>
      </nav>

      {/* ── Desktop-only fixed theme toggle (mobile keeps its own in the top bar) ── */}
      <div className="hidden md:block fixed top-4 right-4 z-[1000]">
        <ThemeToggle />
      </div>
    </>
  );
}

