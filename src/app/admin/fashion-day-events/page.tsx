import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import AdminFashionDayEventsPage from '@/features/fashion-day/AdminFashionDayEventsPage';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'admin') redirect('/login');
  return <AdminFashionDayEventsPage />;
}
