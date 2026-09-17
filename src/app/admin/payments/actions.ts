'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

async function requirePaymentAdmin() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/payments');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'payments')) redirect(profile.role === 'manager' ? '/manager' : '/admin');
  return profile;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

async function updateStatus(formData: FormData, status: 'validated' | 'rejected') {
  const profile = await requirePaymentAdmin();
  const id = value(formData, 'id');
  const validationNotes = value(formData, 'validation_notes').slice(0, 1200);
  if (!id) redirect('/admin/payments?error=id');

  const supabase = createSupabaseAdminClient() as any;
  const { data: current, error: readError } = await supabase
    .from('monthly_payments')
    .select('id,status')
    .eq('id', id)
    .maybeSingle();

  if (readError || !current?.id) redirect('/admin/payments?error=missing');
  if (current.status !== 'pending') redirect('/admin/payments?error=already-reviewed');

  const { data: updated, error } = await supabase
    .from('monthly_payments')
    .update({
      status,
      validation_notes: validationNotes || null,
      validated_at: new Date().toISOString(),
      validated_by_user_id: profile.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (error) redirect('/admin/payments?error=save');
  if (!updated?.id) redirect('/admin/payments?error=already-reviewed');

  revalidatePath('/admin/payments');
  revalidatePath('/manager');
  revalidatePath('/profil');
  revalidatePath('/profil/paiements');
  redirect(`/admin/payments?updated=${status}`);
}

export async function validateModelTransaction(formData: FormData) {
  return updateStatus(formData, 'validated');
}

export async function rejectModelTransaction(formData: FormData) {
  return updateStatus(formData, 'rejected');
}
