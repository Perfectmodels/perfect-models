'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const TRANSACTION_TYPES = new Set([
  'membership_package',
  'registration',
  'membership_fee',
  'agency_commission',
  'other',
]);

const PAYMENT_METHODS = new Set([
  'cash',
  'airtel_money',
  'moov_money',
  'bank_transfer',
  'other',
]);

function value(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

function errorRedirect(code: string): never {
  redirect(`/profil/paiements?error=${encodeURIComponent(code)}`);
}

export async function submitModelPayment(formData: FormData) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/paiements');
  if (profile.role !== 'student') redirect('/profil');

  const transactionType = value(formData, 'transaction_type');
  const paymentMethod = value(formData, 'payment_method');
  const reference = value(formData, 'reference').slice(0, 160);
  const proofUrl = value(formData, 'proof_url').slice(0, 1000);
  const note = value(formData, 'note').slice(0, 1200);
  const paymentDate = value(formData, 'payment_date');
  const amount = Number(value(formData, 'amount'));

  if (!TRANSACTION_TYPES.has(transactionType)) errorRedirect('type');
  if (!PAYMENT_METHODS.has(paymentMethod)) errorRedirect('method');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) errorRedirect('amount');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) errorRedirect('date');
  if (reference.length < 3) errorRedirect('reference');

  if (proofUrl) {
    try {
      const parsed = new URL(proofUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) errorRedirect('proof');
    } catch {
      errorRedirect('proof');
    }
  }

  const parsedDate = new Date(`${paymentDate}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime())) errorRedirect('date');
  const period = `${paymentDate.slice(0, 7)}-01`;

  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error: modelError } = await supabase
    .from('models')
    .select('id')
    .eq('id', profile.profileId)
    .maybeSingle();

  if (modelError || !model?.id) errorRedirect('profile');

  const { error } = await supabase.from('monthly_payments').insert({
    model_id: model.id,
    period,
    amount,
    currency: 'XAF',
    status: 'pending',
    transaction_type: transactionType,
    payment_method: paymentMethod,
    reference,
    proof_url: proofUrl || null,
    paid_at: parsedDate.toISOString(),
    submitted_by_user_id: profile.userId,
    submitted_at: new Date().toISOString(),
    raw_data: {
      source: 'model_dashboard',
      note: note || null,
      submitted_name: profile.name,
    },
  });

  if (error) errorRedirect('save');

  revalidatePath('/profil');
  revalidatePath('/profil/paiements');
  revalidatePath('/admin/payments');
  redirect('/profil/paiements?submitted=1');
}
