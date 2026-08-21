import { redirect } from 'next/navigation';

export default function LegacyMagazineRoute() {
  redirect('/blog');
}
