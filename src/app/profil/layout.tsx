import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-pm-ivory text-pm-ink">
      <div className="mx-auto grid min-h-screen w-full min-w-0 max-w-[1800px] lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
        <ProfileSidebar />
        <div className="min-w-0 overflow-x-clip">{children}</div>
      </div>
    </div>
  );
}
