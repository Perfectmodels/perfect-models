import { redirect } from 'next/navigation';

export default function LegacyAdminNewsRoute() {
  redirect('/admin/blog');
}
