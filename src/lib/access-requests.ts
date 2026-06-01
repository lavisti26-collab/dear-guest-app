import { supabase } from '@/integrations/supabase/client';
import { approveProfileByEmail, hasApprovedAccessRequest } from '@/lib/account-approval';

export type AccessRequestStatus = 'pending' | 'approved' | 'declined';

export interface AccessRequestRow {
  id: string;
  full_name: string;
  email: string;
  requested_level: string;
  reason: string;
  status: AccessRequestStatus;
  created_at: string;
}

const PENDING_KEY = 'dear_guest_access_requests';

function localFallback(): AccessRequestRow[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') as Array<{
      id: string;
      name: string;
      email: string;
      level: string;
      reason: string;
      createdAt: string;
    }>;
    return raw.map((r) => ({
      id: r.id,
      full_name: r.name,
      email: r.email,
      requested_level: r.level,
      reason: r.reason,
      status: 'pending' as const,
      created_at: r.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function submitAccessRequest(input: {
  full_name: string;
  email: string;
  requested_level: string;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('access_requests').insert({
    full_name: input.full_name,
    email: input.email,
    requested_level: input.requested_level,
    reason: input.reason,
    status: 'pending',
  });

  if (!error) return { ok: true };

  if (error.message.includes('does not exist') || error.code === '42P01') {
    const list = localFallback();
    list.unshift({
      id: crypto.randomUUID(),
      full_name: input.full_name,
      email: input.email,
      requested_level: input.requested_level,
      reason: input.reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify(
        list.map((r) => ({
          id: r.id,
          name: r.full_name,
          email: r.email,
          level: r.requested_level,
          reason: r.reason,
          createdAt: r.created_at,
        }))
      )
    );
    return { ok: true };
  }

  return { ok: false, error: error.message };
}

export async function fetchAccessRequests(
  status?: AccessRequestStatus
): Promise<{ data: AccessRequestRow[]; error?: string }> {
  let query = supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (!error && data) {
    return { data: data as AccessRequestRow[] };
  }

  if (error?.message.includes('does not exist') || error?.code === '42P01') {
    const local = localFallback().filter((r) => !status || r.status === status);
    return { data: local };
  }

  return { data: [], error: error?.message };
}

export async function updateAccessRequestStatus(
  id: string,
  status: 'approved' | 'declined'
): Promise<{
  ok: boolean;
  error?: string;
  email?: string;
  profileFound?: boolean;
}> {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const { data: row, error: fetchErr } = await supabase
    .from('access_requests')
    .select('email')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: fetchErr.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('access_requests')
    .update({
      status,
      reviewed_by: user?.id ?? null,
    })
    .eq('id', id);

  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      const list = localFallback().filter((r) => r.id !== id);
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify(
          list.map((r) => ({
            id: r.id,
            name: r.full_name,
            email: r.email,
            level: r.requested_level,
            reason: r.reason,
            createdAt: r.created_at,
          }))
        )
      );
      return { ok: true, email: row?.email };
    }
    return { ok: false, error: error.message };
  }

  const email = row?.email;
  if (status === 'approved' && email) {
    const { ok, found, error: profileErr } = await approveProfileByEmail(email);
    if (!ok) return { ok: false, error: profileErr, email, profileFound: found };
    return { ok: true, email, profileFound: found };
  }

  return { ok: true, email };
}
