'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header, { Breadcrumb } from './Header';
import Footer from './Footer';
import { AnnouncementMarquee } from './Marquee';
import AdminLayout from '../admin/AdminLayout';
import PublicPageHero from '../public/PublicPageHero';

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
    <div className="flex min-h-screen flex-col bg-pm-ivory font-montserrat">
      <AnnouncementMarquee />
      <Header />
      <main className="flex-grow">
        <PublicPageHero pathname={pathname} />
        <Breadcrumb />
        {children}
      </main>
      <Footer runtimeData={runtimeData} />
    </div>
  );
};

export default Layout;
