/**
 * FontLibraryPickerInline - Wrapper that connects FontLibraryPicker to Supabase settings.
 * Used directly in AdminDashboard Theme tab.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FONT_PAIRS, type FontPairDef } from '@/config/fontPairs';
import injectFontFaces from '@/lib/font-loader';
import FontLibraryPicker from './FontLibraryPicker';

interface Props {
  ownerUserId?: string | null;
}

export default function FontLibraryPickerInline({ ownerUserId }: Props) {
  const [selectedFontPair, setSelectedFontPair] = useState<string>('elegant-serif');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from settings on mount
  useEffect(() => {
    if (!ownerUserId) return;
    (async () => {
      const { data } = await supabase
        .from('settings')
        .select('font_pair')
        .eq('user_id', ownerUserId)
        .maybeSingle();
      
      if (data?.font_pair) {
        setSelectedFontPair(data.font_pair);
        const pair = FONT_PAIRS[data.font_pair];
        if (pair) injectFontFaces(pair, data.font_pair);
      }
    })();
  }, [ownerUserId]);

  const handleChange = useCallback(async (pairKey: string) => {
    const pair = FONT_PAIRS[pairKey];
    if (!pair) return;
    setSelectedFontPair(pairKey);

    // Apply fonts immediately for realtime preview
    injectFontFaces(pair, pairKey);

    if (!ownerUserId) return;

    try {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', ownerUserId)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('settings')
          .update({ font_pair: pairKey })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({ user_id: ownerUserId, font_pair: pairKey });
        if (error) throw error;
      }

      toast.success(`📝 Font applied: ${pair.display} + ${pair.body}`);
      setLastSaved(new Date());
    } catch (err: any) {
      console.error('Error saving font pair:', err);
      toast.error(err?.message || 'Failed to save');
    }
  }, [ownerUserId]);

  return (
    <div className="space-y-3">
      <FontLibraryPicker
        currentPairKey={selectedFontPair}
        onChange={handleChange}
      />
      {lastSaved && (
        <p className="text-[10px] text-accent">
          ✓ Saved {lastSaved.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}