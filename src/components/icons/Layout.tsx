'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header, { Breadcrumb } from './Header';
import Footer from './Footer';
import { AnnouncementMarquee } from './Marquee';
import AdminLayout from '../admin/AdminLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname() || '/';

  if (pathname.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Authentication owns the full viewport and must not inherit the public site chrome.
  if (pathname.startsWith('/login') || pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-pm-dark font-montserrat flex flex-col">
      <AnnouncementMarquee />
      <Header />
      <main className="flex-grow">
        <Breadcrumb />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
