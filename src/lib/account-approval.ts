import { supabase } from '@/integrations/supabase/client';

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface PendingAccountRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  slug: string;
  account_status: AccountStatus;
  created_at: string;
}

function slugFromUser(userId: string, email?: string | null) {
  const base = (email || 'couple').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${base}-${userId.slice(0, 6)}`;
}

function profileStatus(row: {
  account_status?: string | null;
  is_super_admin?: boolean | null;
}): { status: AccountStatus; isSuperAdmin: boolean } {
  const isSuperAdmin = Boolean(row.is_super_admin);
  const raw = row.account_status as AccountStatus | undefined;
  const status: AccountStatus =
    raw === 'approved' || raw === 'rejected' || raw === 'pending' ? raw : 'pending';
  return { status, isSuperAdmin };
}

export async function fetchPendingAccounts(): Promise<{
  data: PendingAccountRow[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, email, display_name, slug, account_status, created_at')
    .eq('account_status', 'pending')
    .eq('is_super_admin', false)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.message.includes('account_status') || error.code === '42703') {
      return { data: [], error: 'Run ADD-ACCOUNT-APPROVAL.sql in Supabase first.' };
    }
    return { data: [], error: error.message };
  }

  return { data: (data || []) as PendingAccountRow[] };
}

export async function updateAccountStatus(
  userId: string,
  status: 'approved' | 'rejected'
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ account_status: status })
    .eq('user_id', userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Match email case-insensitively */
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hasApprovedAccessRequest(email: string): Promise<boolean> {
  if (!supabase || !email.trim()) return false;
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from('access_requests')
    .select('id')
    .ilike('email', normalized)
    .eq('status', 'approved')
    .limit(1);

  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') return false;
    return false;
  }
  return (data?.length ?? 0) > 0;
}

/** After hub access approval — unlock profile login if they already signed up at /admin */
export async function approveProfileByEmail(
  email: string
): Promise<{ ok: boolean; found: boolean; error?: string }> {
  if (!supabase) return { ok: false, found: false, error: 'Supabase not configured' };

  const normalized = normalizeEmail(email);
  const { data: profile, error: findErr } = await supabase
    .from('profiles')
    .select('user_id')
    .ilike('email', normalized)
    .maybeSingle();

  if (findErr) return { ok: false, found: false, error: findErr.message };
  if (!profile?.user_id) return { ok: true, found: false };

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ account_status: 'approved' })
    .eq('user_id', profile.user_id);

  if (upErr) {
    if (upErr.message.includes('account_status') || upErr.code === '42703') {
      return { ok: true, found: true };
    }
    return { ok: false, found: true, error: upErr.message };
  }
  return { ok: true, found: true };
}

/** Create profiles row if missing (signup trigger may not have run). */
export async function ensureUserProfile(user: {
  id: string;
  email?: string | null;
}): Promise<{
  status: AccountStatus | null;
  isSuperAdmin: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { status: 'approved', isSuperAdmin: false };
  }

  const { data: existing, error: selectErr } = await supabase
    .from('profiles')
    .select('account_status, is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  if (selectErr) {
    if (selectErr.message.includes('account_status') || selectErr.code === '42703') {
      const { data: legacy } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      if (legacy) {
        return { status: 'approved', isSuperAdmin: Boolean(legacy.is_super_admin) };
      }
    } else if (!selectErr.message.includes('does not exist')) {
      return { status: null, isSuperAdmin: false, error: selectErr.message };
    }
  }

  if (existing) {
    const parsed = profileStatus(existing);
    if (
      parsed.status === 'pending' &&
      user.email &&
      (await hasApprovedAccessRequest(user.email))
    ) {
      await supabase
        .from('profiles')
        .update({ account_status: 'approved' })
        .eq('user_id', user.id);
      return { status: 'approved', isSuperAdmin: parsed.isSuperAdmin };
    }
    return { status: parsed.status, isSuperAdmin: parsed.isSuperAdmin };
  }

  const base = (user.email || 'couple').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const preApproved = user.email ? await hasApprovedAccessRequest(user.email) : false;
  const payload: Record<string, unknown> = {
    id: crypto.randomUUID(),
    user_id: user.id,
    email: user.email ?? null,
    display_name: base,
    slug: slugFromUser(user.id, user.email),
    theme: 'gold',
    is_super_admin: false,
    account_status: preApproved ? 'approved' : 'pending',
  };

  let { data: inserted, error: insertErr } = await supabase
    .from('profiles')
    .insert(payload)
    .select('account_status, is_super_admin')
    .maybeSingle();

  if (insertErr?.message.includes('account_status') || insertErr?.code === '42703') {
    delete payload.account_status;
    const retry = await supabase
      .from('profiles')
      .insert(payload)
      .select('is_super_admin')
      .maybeSingle();
    inserted = retry.data;
    insertErr = retry.error;
    if (!insertErr && inserted) {
      return { status: 'approved', isSuperAdmin: Boolean(inserted.is_super_admin) };
    }
  }

  if (insertErr) {
    if (insertErr.code === '23505') {
      const { data: again } = await supabase
        .from('profiles')
        .select('account_status, is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      if (again) {
        const parsed = profileStatus(again);
        return { status: parsed.status, isSuperAdmin: parsed.isSuperAdmin };
      }
    }
    return { status: null, isSuperAdmin: false, error: insertErr.message };
  }

  if (!inserted) return { status: 'pending', isSuperAdmin: false };

  const parsed = profileStatus(inserted);
  return { status: parsed.status, isSuperAdmin: parsed.isSuperAdmin };
}

export async function getMyAccountStatus(): Promise<{
  status: AccountStatus | null;
  isSuperAdmin: boolean;
  error?: string;
}> {
  if (!supabase) return { status: null, isSuperAdmin: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: null, isSuperAdmin: false };

  return ensureUserProfile(user);
}
