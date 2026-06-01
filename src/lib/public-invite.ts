import { supabase } from '@/integrations/supabase/client';
import type { DbProfile } from '@/lib/db-schema';
import { normalizeTheme } from '@/lib/theme';
import type { ThemeName } from '@/contexts/ThemeContext';
import { normalizeVisualStyle, type VisualStyleId } from '@/lib/visual-styles';

export type PublicInviteProfile = DbProfile & {
  user_id: string;
  theme: ThemeName;
  visual_style?: VisualStyleId | null;
  slug?: string;
  display_name?: string | null;
};

function rowFromRpc(data: unknown): Record<string, unknown> | null {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as Record<string, unknown>) ?? null;
  if (typeof data === 'object') return data as Record<string, unknown>;
  return null;
}

export async function fetchPublicProfileBySlug(
  slug: string
): Promise<{ profile: PublicInviteProfile | null; error: string | null }> {
  if (!supabase) {
    return { profile: null, error: 'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_profile_by_slug', {
    p_slug: slug,
  });

  const rpcRow = rowFromRpc(rpcData);
  if (!rpcError && rpcRow?.user_id) {
    const theme = normalizeTheme(rpcRow.theme as string);
    return {
      profile: {
        user_id: String(rpcRow.user_id),
        theme,
        visual_style: normalizeVisualStyle(rpcRow.visual_style as string | undefined),
        slug: rpcRow.slug as string | undefined,
        display_name: rpcRow.display_name as string | null,
        groom_name: rpcRow.groom_name as string | null,
        bride_name: rpcRow.bride_name as string | null,
        wedding_date: rpcRow.wedding_date as string | null,
        background_music_url: rpcRow.background_music_url as string | null,
        bank_qr_url: rpcRow.bank_qr_url as string | null,
      },
      error: null,
    };
  }

  const { data: viewRow, error: viewError } = await supabase
    .from('profiles_public')
    .select(
      'id, user_id, slug, display_name, groom_name, bride_name, wedding_date, theme, visual_style, background_music_url, bank_qr_url'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!viewError && viewRow?.user_id) {
    return {
      profile: {
        user_id: viewRow.user_id,
        theme: normalizeTheme(viewRow.theme),
        visual_style: normalizeVisualStyle(
          (viewRow as { visual_style?: string | null }).visual_style
        ),
        slug: viewRow.slug ?? undefined,
        display_name: viewRow.display_name,
        groom_name: viewRow.groom_name,
        bride_name: viewRow.bride_name,
        wedding_date: viewRow.wedding_date,
        background_music_url: viewRow.background_music_url,
        bank_qr_url: viewRow.bank_qr_url,
      },
      error: null,
    };
  }

  return {
    profile: null,
    error: rpcError?.message || viewError?.message || 'Invitation not found',
  };
}
