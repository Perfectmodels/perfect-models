import { redirect } from 'next/navigation';

export default function LegacyAdminMagazineRoute() {
  redirect('/admin/blog');
}
