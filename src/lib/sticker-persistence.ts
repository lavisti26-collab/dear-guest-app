/**
 * Sticker persistence — saves/loads placed sticker overlays to Supabase settings JSONB.
 * Uses debounced auto-save and optimistic local state.
 * 
 * NOTE: Requires sticker_overlays (jsonb) column in the settings table.
 * Run this SQL in Supabase dashboard if not yet created:
 *   ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS sticker_overlays jsonb DEFAULT NULL;
 */
import { supabase } from '@/integrations/supabase/client';

export interface PlacedSticker {
  id: string;
  icon: string;
  name: string;
  x: number;         // percent of container width
  y: number;         // percent of container height
  scale: number;
  rotation: number;
  zIndex: number;
  tint?: string;     // optional CSS color tint
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Load sticker overlays for a user from Supabase settings */
export async function loadStickerOverlays(userId: string): Promise<PlacedSticker[]> {
  try {
    const { data } = await supabase
      ?.from('settings')
      .select('sticker_overlays')
      .eq('user_id', userId)
      .maybeSingle() ?? { data: null };

    if (!data) return [];
    const raw = data.sticker_overlays;
    if (!raw || !Array.isArray(raw)) return [];
    return raw as unknown as PlacedSticker[];
  } catch (err) {
    console.error('[StickerPersistence] Load failed:', err);
    return [];
  }
}

/** Save sticker overlays with 600ms debounce */
export function saveStickerOverlays(userId: string, stickers: PlacedSticker[]): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const { data: existing } = await supabase
        ?.from('settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle() ?? { data: null };

      if (existing?.id) {
        await supabase
          ?.from('settings')
          .update({ sticker_overlays: stickers as unknown as any })
          .eq('user_id', userId);
      } else {
        await supabase
          ?.from('settings')
          .insert({ user_id: userId, sticker_overlays: stickers as unknown as any });
      }
    } catch (err) {
      console.error('[StickerPersistence] Save failed:', err);
    }
  }, 600);
}
