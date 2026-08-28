'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header, { Breadcrumb } from './Header';
import Footer from './Footer';
import { AnnouncementMarquee } from './Marquee';
import AdminLayout from '../admin/AdminLayout';

type RuntimeData = {
  navLinks?: Array<{ path: string; label: string; inFooter?: boolean; footerLabel?: string }>;
  socialLinks?: Record<string, string>;
  contactInfo?: { email?: string; phone?: string; address?: string };
};

const Layout: React.FC<{ children: React.ReactNode; runtimeData?: RuntimeData | null }> = ({ children, runtimeData }) => {
  const pathname = usePathname() || '/';

  if (pathname.startsWith('/admin') || pathname.startsWith('/manager')) return <AdminLayout>{children}</AdminLayout>;
  if (pathname.startsWith('/login') || pathname.startsWith('/auth/')) return <>{children}</>;

  return (
    <div className="min-h-screen bg-pm-ivory font-montserrat flex flex-col">
      <AnnouncementMarquee />
      <Header />
      <main className="flex-grow">
        <Breadcrumb />
        {children}
      </main>
      <Footer runtimeData={runtimeData} />
    </div>
  );
};

export default Layout;
