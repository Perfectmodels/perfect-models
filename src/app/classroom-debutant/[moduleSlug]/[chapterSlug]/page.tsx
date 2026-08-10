import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ moduleSlug: string; chapterSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { moduleSlug, chapterSlug } = await params;
  redirect(`/formations/${encodeURIComponent(moduleSlug)}/${encodeURIComponent(chapterSlug)}`);
}
