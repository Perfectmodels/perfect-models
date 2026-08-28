import { redirect } from 'next/navigation';

type Props = { params: Promise<{ moduleId: string }> };
export default async function Page({ params }: Props) { const { moduleId } = await params; redirect(`/formations/module/${encodeURIComponent(moduleId)}`); }
