import { useState, useCallback, useRef, useEffect } from 'react';
import type { PlacedSticker } from '@/lib/sticker-persistence';

export type { PlacedSticker };

interface HistoryEntry {
  stickers: PlacedSticker[];
}

const MAX_HISTORY = 50;

export interface StickerCanvasState {
  stickers: PlacedSticker[];
  selectedId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  addSticker: (icon: string, name: string, tint?: string) => void;
  removeSticker: (id: string) => void;
  updateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  selectSticker: (id: string | null) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  duplicateSticker: (id: string) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;
  setStickers: (stickers: PlacedSticker[]) => void;
}

export function useStickerCanvas(initialStickers: PlacedSticker[] = []): StickerCanvasState {
  const [stickers, setStickersState] = useState<PlacedSticker[]>(initialStickers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const historyRef = useRef<HistoryEntry[]>([{ stickers: initialStickers }]);
  const historyIndexRef = useRef(0);
  const nextZRef = useRef(stickers.length + 1);

  // Sync initial stickers from parent (loaded from Supabase)
  useEffect(() => {
    if (initialStickers.length > 0) {
      setStickersState(initialStickers);
      historyRef.current = [{ stickers: initialStickers }];
      historyIndexRef.current = 0;
      nextZRef.current = Math.max(...initialStickers.map(s => s.zIndex), 0) + 1;
    }
  }, [initialStickers]); // eslint-disable-line

  const pushHistory = useCallback((newStickers: PlacedSticker[]) => {
    const newEntry: HistoryEntry = { stickers: newStickers };
    const current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current = [...current, newEntry].slice(-MAX_HISTORY);
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const setStickersWithHistory = useCallback((newStickers: PlacedSticker[]) => {
    setStickersState(newStickers);
    pushHistory(newStickers);
  }, [pushHistory]);

  const addSticker = useCallback((icon: string, name: string, tint?: string) => {
    const id = `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const z = nextZRef.current++;
    const newSticker: PlacedSticker = {
      id,
      icon,
      name,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      scale: 1.2,
      rotation: 0,
      zIndex: z,
      tint,
    };
    setStickersState(prev => {
      const next = [...prev, newSticker];
      pushHistory(next);
      return next;
    });
    setSelectedId(id);
  }, [pushHistory]);

  const removeSticker = useCallback((id: string) => {
    setStickersState(prev => {
      const next = prev.filter(s => s.id !== id);
      pushHistory(next);
      return next;
    });
    setSelectedId(sel => sel === id ? null : sel);
  }, [pushHistory]);

  const updateSticker = useCallback((id: string, updates: Partial<PlacedSticker>) => {
    setStickersState(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      return next;
    });
  }, []);

  const updateStickerAndHistory = useCallback((id: string, updates: Partial<PlacedSticker>) => {
    setStickersState(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const selectSticker = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const bringForward = useCallback((id: string) => {
    const z = nextZRef.current++;
    updateStickerAndHistory(id, { zIndex: z });
  }, [updateStickerAndHistory]);

  const sendBackward = useCallback((id: string) => {
    setStickersState(prev => {
      const minZ = Math.min(...prev.map(s => s.zIndex));
      const next = prev.map(s => s.id === id ? { ...s, zIndex: Math.max(0, minZ - 1) } : s);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const bringToFront = useCallback((id: string) => {
    const z = nextZRef.current++;
    updateStickerAndHistory(id, { zIndex: z });
  }, [updateStickerAndHistory]);

  const sendToBack = useCallback((id: string) => {
    setStickersState(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const lowest = sorted[0]?.zIndex ?? 0;
      const next = prev.map(s => s.id === id ? { ...s, zIndex: Math.max(0, lowest - 1) } : s);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const duplicateSticker = useCallback((id: string) => {
    setStickersState(prev => {
      const orig = prev.find(s => s.id === id);
      if (!orig) return prev;
      const z = nextZRef.current++;
      const copy: PlacedSticker = {
        ...orig,
        id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: Math.min(90, orig.x + 5),
        y: Math.min(90, orig.y + 5),
        zIndex: z,
      };
      const next = [...prev, copy];
      pushHistory(next);
      setSelectedId(copy.id);
      return next;
    });
  }, [pushHistory]);

  const clearAll = useCallback(() => {
    const next: PlacedSticker[] = [];
    setStickersState(next);
    pushHistory(next);
    setSelectedId(null);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const entry = historyRef.current[historyIndexRef.current];
    setStickersState(entry.stickers);
    setSelectedId(null);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const entry = historyRef.current[historyIndexRef.current];
    setStickersState(entry.stickers);
  }, []);

  const commitHistory = useCallback(() => {
    pushHistory(stickers);
  }, [pushHistory, stickers]);

  const setStickers = useCallback((newStickers: PlacedSticker[]) => {
    setStickersState(newStickers);
    historyRef.current = [{ stickers: newStickers }];
    historyIndexRef.current = 0;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return {
    stickers,
    selectedId,
    canUndo,
    canRedo,
    addSticker,
    removeSticker,
    updateSticker,
    selectSticker,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    duplicateSticker,
    clearAll,
    undo,
    redo,
    commitHistory,
    setStickers,
  };
}
