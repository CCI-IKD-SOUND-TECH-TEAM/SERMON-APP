'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar, ADMIN_NAV_ITEMS } from '@/components/navigation/AdminSidebar';
import { Toaster } from 'sonner';

function activeKey(pathname: string): string {
  // Longest matching href wins (so /admin/sermons beats /admin).
  const match = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((it) => pathname === it.href || pathname.startsWith(`${it.href}/`));
  if (match) return match.key;
  if (pathname === '/admin/profile' || pathname.startsWith('/admin/profile/')) return 'profile';
  return 'dashboard';
}

// Auth-flow pages render their own full-screen layout — no sidebar/nav chrome.
const NO_CHROME_ROUTES = ['/admin/login'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_CHROME_ROUTES.includes(pathname)) {
    return (
      <>
        <Toaster position="top-right" richColors />
        {children}
      </>
    );
  }

  return (
    <div className="flex bg-bg min-h-screen">
      <AdminSidebar active={activeKey(pathname)} />
      <main className="flex-1 min-w-0 p-8 max-md:pt-[calc(56px+var(--space-8))]">
        <Toaster position="top-right" richColors />
        {children}
      </main>
    </div>
  );
}
