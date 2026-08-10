import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { moduleSlug } = await params;
  redirect(`/formation/module/${encodeURIComponent(moduleSlug)}`);
}
