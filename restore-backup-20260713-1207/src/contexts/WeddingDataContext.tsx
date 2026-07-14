import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { supabase, getSupabase } from '@/integrations/supabase/client';
import { getCachedAdminData, setCachedAdminData } from '@/lib/admin-data-cache';
import {
  coupleNamesFromProfile,
  giftInfoToDb,
  guestFromDb,
  guestToDb,
  guestUpdateToDb,
  photoToDb,
  programFromDb,
  programToDb,
  settingsFromDb,
  settingsUpdateToDb,
  wishFromDb,
  wishToDb,
  type DbProfile,
} from '@/lib/db-schema';

export interface Guest {
  id: string;
  name: string;
  rsvpStatus: 'pending' | 'attending' | 'not_attending';
  numberOfGuests: number;
  mealPreference?: string;
  note?: string;
}

export interface Wish {
  id: string;
  guestName: string;
  message: string;
  timestamp: number;
}

export interface ProgramItem {
  id?: string;
  time_en: string | null;
  time_km: string | null;
  title_en: string | null;
  title_km: string | null;
  order_index?: number;
}

export interface CoupleCardConfig {
  groomFont: string;
  brideFont: string;
  ambiance: 'bokeh' | 'flowers' | 'sparkles' | 'none' | 'hearts' | 'roses' | 'butterflies' | 'stars' | 'diamonds';
  ornament: 'kbach' | 'star' | 'minimal' | 'none';
  accentColor: string;
  fontSize: number;
  layout: 'vertical' | 'horizontal';
  connector: 'hearts' | 'ning' | 'ampersand' | 'pjuab';
  cardStyle?: 'dark-glass' | 'light-glass' | 'royal-gold' | 'romantic-blush' | 'emerald-luxury' | 'vintage-parchment' | 'minimal-clean';
  textEffect?: 'none' | 'gold-foil' | 'soft-glow' | 'letterpress' | 'embossed';
  ornamentOpacity?: number;
  ornamentScale?: number;
  stickers?: string[];
  stickerPosition?: 'top-corners' | 'center-floating' | 'bottom-accent';
  galleryLayout?: 'scroll' | 'grid' | 'masonry' | 'stack';
}

export const DEFAULT_COUPLE_CARD_CONFIG: CoupleCardConfig = {
  groomFont: 'Moul',
  brideFont: 'Moul',
  ambiance: 'flowers',
  ornament: 'kbach',
  accentColor: '#D4AF37',
  fontSize: 1.0,
  layout: 'vertical',
  connector: 'hearts',
  cardStyle: 'dark-glass',
  textEffect: 'none',
  ornamentOpacity: 0.9,
  ornamentScale: 1.0,
  stickers: [],
  stickerPosition: 'center-floating',
  galleryLayout: 'scroll',
};

export interface WeddingSettings {
  coupleNames: string;
  coupleNamesKm: string;
  weddingDate: string;
  weddingDateKm: string;
  weddingTime: string;
  weddingTimeKm: string;
  venueName: string;
  venueNameKm: string;
  weddingDateTime: string;
  calendarUrl: string;
  mapLat: string;
  mapLng: string;
  mapEmbedUrl: string;
  contactTelegram: string;
  contactPhone: string;
  contactFacebook: string;
  contactEmail: string;
  musicUrl: string;
  musicFile: string;
  heroImage: string;
  weddingDescription: string;
  weddingDescriptionKm: string;
  /** Hero subtitle — e.g. Wedding / Engagement (EN & KM) */
  eventTitleEn: string;
  eventTitleKm: string;
  layoutTemplate?: string;
  fontPair?: string;
  animationStyle?: string;
  /** Couple card visual customization saved from CoupleCardStudio */
  coupleCardConfig?: CoupleCardConfig;
}

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

interface WeddingData {
  ownerUserId: string | null;
  ready: boolean;
  guests: Guest[];
  wishes: Wish[];
  photos: Photo[];
  bankName: string;
  bankAccount: string;
  bankQR: string;
  giftEnabled: boolean;
  settings: WeddingSettings;
  programSchedule: ProgramItem[];
  addGuest: (name: string) => Promise<void>;
  removeGuest: (id: string) => Promise<void>;
  updateRSVP: (name: string, status: 'attending' | 'not_attending', numGuests: number, meal?: string, note?: string, id?: string) => Promise<void>;
  addWish: (name: string, message: string) => Promise<void>;
  addPhoto: (url: string, caption?: string) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
  updatePhotoCaption: (id: string, caption: string | null) => Promise<void>;
  setBankInfo: (name: string, account: string, qr: string) => Promise<void>;
  setGiftEnabled: (v: boolean) => Promise<void>;
  updateSettings: (s: Partial<WeddingSettings>) => Promise<void>;
  addProgramItem: (item: Omit<ProgramItem, 'id'>) => Promise<void>;
  removeProgramItem: (id: string) => Promise<void>;
  updateProgramItem: (id: string, item: Partial<ProgramItem>) => Promise<void>;
}

const WeddingDataContext = createContext<WeddingData | null>(null);

const defaultSettings: WeddingSettings = {
  coupleNames: 'Bride & Groom',
  coupleNamesKm: 'កូនកំលោះ និង កូនក្រមុំ',
  weddingDate: 'TBA',
  weddingDateKm: '',
  weddingTime: '',
  weddingTimeKm: '',
  venueName: 'TBA',
  venueNameKm: '',
  weddingDateTime: '',
  calendarUrl: '',
  mapLat: '11.5564',
  mapLng: '104.9282',
  mapEmbedUrl: '',
  contactTelegram: '',
  contactPhone: '',
  contactFacebook: '',
  contactEmail: '',
  musicUrl: '',
  musicFile: '',
  heroImage: '',
  weddingDescription: 'We joyfully invite you to celebrate our special day.',
  weddingDescriptionKm: 'យើងខ្ញុំសូមគោរពអញ្ជើញអ្នកមកចូលរួមពិធីមង្គលការរបស់យើង។',
  eventTitleEn: '✦  The Wedding of  ✦',
  eventTitleKm: 'ពិធីមង្គលការ',
  layoutTemplate: 'classic-scroll',
  fontPair: 'elegant-serif',
  animationStyle: 'elegant',
};

interface ProviderProps {
  children: ReactNode;
  ownerUserId: string | null;
  publicProfile?: DbProfile | null;
}

export function WeddingDataProvider({ children, ownerUserId, publicProfile }: ProviderProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankQR, setBankQR] = useState('');
  const [giftEnabled, setGiftEnabledState] = useState(true);
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [programSchedule, setProgramSchedule] = useState<ProgramItem[]>([]);
  const isPublicInvite = Boolean(publicProfile);
  const publicProfileRef = useRef(publicProfile);
  publicProfileRef.current = publicProfile;
  // Refs for tracking current state values (needed for cache)
  const guestsRef = useRef(guests);
  const wishesRef = useRef(wishes);
  const photosRef = useRef(photos);
  const settingsRef = useRef(settings);
  const bankNameRef = useRef(bankName);
  const bankAccountRef = useRef(bankAccount);
  const bankQRRef = useRef(bankQR);
  const giftEnabledRef = useRef(giftEnabled);
  const settingsIdRef = useRef(settingsId);
  const programScheduleRef = useRef(programSchedule);
  // Keep refs in sync with state
  useEffect(() => { guestsRef.current = guests; }, [guests]);
  useEffect(() => { wishesRef.current = wishes; }, [wishes]);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { bankNameRef.current = bankName; }, [bankName]);
  useEffect(() => { bankAccountRef.current = bankAccount; }, [bankAccount]);
  useEffect(() => { bankQRRef.current = bankQR; }, [bankQR]);
  useEffect(() => { giftEnabledRef.current = giftEnabled; }, [giftEnabled]);
  useEffect(() => { settingsIdRef.current = settingsId; }, [settingsId]);
  useEffect(() => { programScheduleRef.current = programSchedule; }, [programSchedule]);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const pendingSettingsRef = useRef<Record<string, unknown>>({});
  const pendingSettingsQueueRef = useRef<Partial<WeddingSettings>[]>([]);

  // For admin routes (non-public), bootstrap from cache instantly so returning from another page doesn't flash a loader
  const cachedInitial = !isPublicInvite && ownerUserId ? getCachedAdminData(ownerUserId) : null;
  const [ready, setReady] = useState(() => Boolean(cachedInitial) || Boolean(ownerUserId && isPublicInvite));

  // Apply cached data immediately on first render
  useEffect(() => {
    if (cachedInitial) {
      setGuests(cachedInitial.guests);
      setWishes(cachedInitial.wishes);
      setPhotos(cachedInitial.photos);
      setProgramSchedule(cachedInitial.programSchedule);
      setBankName(cachedInitial.bankName);
      setBankAccount(cachedInitial.bankAccount);
      setBankQR(cachedInitial.bankQR);
      setGiftEnabledState(cachedInitial.giftEnabled);
      setSettingsId(cachedInitial.settingsId);
      setSettings(cachedInitial.settings);
    }
  }, []); // only on mount

  const applyRemoteSettings = useCallback((row: Record<string, unknown> | null) => {
    if (!row) return;
    const m = settingsFromDb(row, publicProfileRef.current, defaultSettings);
    setSettings((current) => {
      // B7: Preserve local pending updates to avoid overwriting concurrent edits
      const filteredRemoteSettings = { ...m.settings };
      Object.keys(pendingSettingsRef.current).forEach((key) => {
        delete (filteredRemoteSettings as any)[key];
      });
      const merged = { ...current, ...filteredRemoteSettings };
      const changed = Object.keys(merged).some((key) => merged[key as keyof WeddingSettings] !== current[key as keyof WeddingSettings]);
      return changed ? merged : current;
    });
    setBankName(m.bankName);
    setBankAccount(m.bankAccount);
    setBankQR(m.bankQR);
    setGiftEnabledState(m.giftEnabled);
  }, []);

  useEffect(() => {
    if (!ownerUserId) { setReady(false); return; }
    let cancelled = false;
    // Only show a loading spinner when there is NO cached data at all.
    // If we already have cached data (cachedInitial != null), the UI stays
    // visible and the Supabase fetch runs silently in the background.
    if (!isPublicInvite && !cachedInitial) setReady(false);
    const fetchAll = async () => {
      if (!supabase) {
        // If Supabase is not configured, set ready to true so the fallback layout displays
        setReady(true);
        return;
      }
      try {
        const [guestsRes, wishesRes, photosRes, settingsRes, programRes, profileRes] = await Promise.all([
          supabase.from('guests').select('*').eq('user_id', ownerUserId),
          supabase.from('wishes').select('*').eq('user_id', ownerUserId).order('created_at', { ascending: false }),
          supabase.from('photos').select('*').eq('user_id', ownerUserId).order('created_at', { ascending: true }),
          supabase.from('settings').select('*').eq('user_id', ownerUserId).maybeSingle(),
          supabase.from('program_schedule').select('*').eq('user_id', ownerUserId).order('order_index', { ascending: true }),
          publicProfileRef.current
            ? Promise.resolve({ data: publicProfileRef.current, error: null })
            : supabase.from('profiles').select('groom_name, bride_name, wedding_date, background_music_url, bank_qr_url, display_name').eq('user_id', ownerUserId).maybeSingle(),
        ]);
        if (cancelled) return;

        const profile = (publicProfileRef.current ?? profileRes.data) as (DbProfile & { display_name?: string | null }) | null;

        if (isPublicInvite) {
          const bootstrap = settingsFromDb(null, profile, defaultSettings);
          setSettings(bootstrap.settings);
          setBankName(bootstrap.bankName);
          setBankAccount(bootstrap.bankAccount);
          setBankQR(bootstrap.bankQR);
          setGiftEnabledState(bootstrap.giftEnabled);
        }

        if (guestsRes.error) {
          console.warn('guests load:', guestsRes.error.message);
          setGuests([]);
        } else {
          setGuests((guestsRes.data || []).map((r) => guestFromDb(r as Record<string, unknown>)));
        }
        if (!wishesRes.error) setWishes((wishesRes.data || []).map((r) => wishFromDb(r as Record<string, unknown>)));
        if (!photosRes.error) {
          setPhotos((photosRes.data || []).map((p: any) => ({
            id: p.id,
            url: p.url,
            caption: p.caption ?? null
          })));
        }
        if (!programRes.error) {
          setProgramSchedule((programRes.data || []).map((r) => programFromDb(r as Record<string, unknown>)));
        }

        const applySettings = (row: Record<string, unknown> | null) => {
          const m = settingsFromDb(row, profile, defaultSettings);
          setSettings(m.settings);
          setBankName(m.bankName);
          setBankAccount(m.bankAccount);
          setBankQR(m.bankQR);
          setGiftEnabledState(m.giftEnabled);
          if (row?.id) setSettingsId(String(row.id));
        };

        if (settingsRes.data) {
          applySettings(settingsRes.data as Record<string, unknown>);
        } else if (isPublicInvite) {
          applySettings(null);
        } else {
          const names = coupleNamesFromProfile(profile);
          const { data: created } = await supabase
            .from('settings')
            .insert({
              id: crypto.randomUUID(),
              user_id: ownerUserId,
              created_by: ownerUserId,
              couple_names: names?.en || defaultSettings.coupleNames,
              couple_names_km: names?.km || defaultSettings.coupleNamesKm,
              venue: defaultSettings.venueName,
              gift_enabled: true,
            } as any)
            .select('*')
            .maybeSingle();
          applySettings(created as Record<string, unknown> | null);
        }
      } catch (e) {
        console.error('WeddingDataProvider fetch:', e);
      } finally {
        if (!cancelled) {
          // Store fetched data in cache so returning to admin page is instant
          if (!isPublicInvite && ownerUserId) {
            setCachedAdminData(ownerUserId, {
              guests: guestsRef.current,
              wishes: wishesRef.current,
              photos: photosRef.current,
              programSchedule: programScheduleRef.current,
              settings: settingsRef.current,
              bankName: bankNameRef.current,
              bankAccount: bankAccountRef.current,
              bankQR: bankQRRef.current,
              giftEnabled: giftEnabledRef.current,
              settingsId: settingsIdRef.current,
            });
          }
          setReady(true);
        }
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [ownerUserId, isPublicInvite]);

  useEffect(() => {
    if (!ownerUserId || !supabase) return;
    const channel = supabase
      .channel(`wedding-${ownerUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setGuests(p => p.find(g => g.id === payload.new.id) ? p : [...p, guestFromDb(payload.new as Record<string, unknown>)]);
        else if (payload.eventType === 'UPDATE') setGuests(p => p.map(g => g.id === payload.new.id ? guestFromDb(payload.new as Record<string, unknown>) : g));
        else if (payload.eventType === 'DELETE') setGuests(p => p.filter(g => g.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setWishes(p => p.find(w => w.id === payload.new.id) ? p : [wishFromDb(payload.new as Record<string, unknown>), ...p]);
        else if (payload.eventType === 'UPDATE') setWishes(p => p.map(w => w.id === payload.new.id ? wishFromDb(payload.new as Record<string, unknown>) : w));
        else if (payload.eventType === 'DELETE') setWishes(p => p.filter(w => w.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPhotos(p => p.find(ph => ph.id === payload.new.id) ? p : [...p, { id: payload.new.id, url: payload.new.url, caption: payload.new.caption ?? null }]);
        else if (payload.eventType === 'DELETE') setPhotos(p => p.filter(ph => ph.id !== payload.old.id));
        else if (payload.eventType === 'UPDATE') setPhotos(p => p.map(ph => ph.id === payload.new.id ? { id: payload.new.id, url: payload.new.url, caption: payload.new.caption ?? null } : ph));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const row = payload.new as Record<string, unknown> | null;
          if (!row) return;
          const pendingKeys = Object.keys(pendingSettingsRef.current);
          const remoteSettings = settingsFromDb(row, publicProfileRef.current, defaultSettings).settings;
          const hasConflict = pendingKeys.some((key) => remoteSettings[key as keyof WeddingSettings] !== pendingSettingsRef.current[key]);
          if (hasConflict) {
            console.warn('Realtime settings conflict detected, applying server values for stable sync');
          }
          applyRemoteSettings(row);
          // Only remove keys from pendingSettingsRef if they match the server state (i.e. successfully synced)
          pendingKeys.forEach((key) => {
            if (remoteSettings[key as keyof WeddingSettings] === pendingSettingsRef.current[key]) {
              delete pendingSettingsRef.current[key];
            }
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'program_schedule', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const item = programFromDb(payload.new as Record<string, unknown>);
          setProgramSchedule(p => p.find(x => x.id === item.id) ? p : [...p, item].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        } else if (payload.eventType === 'UPDATE') {
          const item = programFromDb(payload.new as Record<string, unknown>);
          setProgramSchedule(p => p.map(x => x.id === item.id ? item : x).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        }
        else if (payload.eventType === 'DELETE') setProgramSchedule(p => p.filter(x => x.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ownerUserId]);

  const requireOwner = () => {
    if (!ownerUserId) throw new Error('No wedding owner set');
    return ownerUserId;
  };

  const addGuest = useCallback(async (name: string) => {
    const uid = requireOwner();
    // Optimistic: create a temp ID and add immediately
    const tempId = crypto.randomUUID();
    const optimisticGuest: Guest = { id: tempId, name, rsvpStatus: 'pending', numberOfGuests: 1 };
    setGuests(p => [{ ...optimisticGuest }, ...p]);

    const client = getSupabase();
    const { data, error } = await client
      .from('guests')
      .insert(guestToDb(uid, name) as any)
      .select('*')
      .single();
    if (error) {
      // Rollback on failure
      setGuests(p => p.filter(g => g.id !== tempId));
      throw new Error(error.message);
    }
    // Replace optimistic with server data
    if (data) {
      setGuests(p => p.map(g => g.id === tempId ? guestFromDb(data as Record<string, unknown>) : g));
    }
  }, [ownerUserId]);

  const removeGuest = useCallback(async (id: string) => {
    // Optimistic: remove immediately
    const guestToRemove = guests.find(g => g.id === id);
    if (!guestToRemove) return;
    setGuests(p => p.filter(g => g.id !== id));

    const client = getSupabase();
    const { error } = await client.from('guests').delete().eq('id', id);
    if (error) {
      // Rollback on failure
      setGuests(p => [guestToRemove, ...p]);
      throw new Error(error.message);
    }
  }, [guests]);

  const updateRSVP = useCallback(async (name: string, status: 'attending' | 'not_attending', numGuests: number, meal?: string, note?: string, id?: string) => {
    const uid = requireOwner();
    const client = getSupabase();
    const payload = guestUpdateToDb(status, numGuests, meal, note);
    
    let existingId: string | null = null;
    
    if (id) {
      const { data } = await client.from('guests').select('id').eq('id', id).eq('user_id', uid).limit(1).maybeSingle();
      if (data) {
        existingId = data.id;
      }
    } else {
      const { data } = await client.from('guests').select('id').eq('user_id', uid).eq('guest_name', name).limit(1).maybeSingle();
      if (data) {
        existingId = data.id;
      }
    }

    if (existingId) {
      await client.from('guests').update(payload as any).eq('id', existingId);
    } else {
      await client.from('guests').insert(guestToDb(uid, name, { rsvpStatus: status, numberOfGuests: numGuests, mealPreference: meal, note }) as any);
    }
  }, [ownerUserId]);

  const addWish = useCallback(async (guestName: string, message: string) => {
    const uid = requireOwner();
    // Optimistic: add wish immediately
    const tempId = crypto.randomUUID();
    const optimisticWish: Wish = { id: tempId, guestName, message, timestamp: Date.now() };
    setWishes(p => [optimisticWish, ...p]);

    const client = getSupabase();
    const { data, error } = await client.from('wishes').insert(wishToDb(uid, guestName, message) as any).select('*').single();
    if (error) {
      // Rollback on failure
      setWishes(p => p.filter(w => w.id !== tempId));
      throw new Error(error.message);
    }
    // Replace optimistic with server data
    if (data) {
      setWishes(p => p.map(w => w.id === tempId ? wishFromDb(data as Record<string, unknown>) : w));
    }
  }, [ownerUserId]);

  const addPhoto = useCallback(async (url: string, caption?: string) => {
    const uid = requireOwner();
    const client = getSupabase();
    const { error } = await client.from('photos').insert(photoToDb(uid, url, caption) as any);
    if (error) throw new Error(error.message);
  }, [ownerUserId]);

  const removePhoto = useCallback(async (id: string) => {
    // Delete by primary key (id) to avoid accidentally removing a photo with a duplicate URL
    const client = getSupabase();
    const { error } = await client.from('photos').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  const updatePhotoCaption = useCallback(async (id: string, caption: string | null) => {
    const client = getSupabase();
    const { error } = await client.from('photos').update({ caption }).eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  const ensureSettingsRow = useCallback(async () => {
    const uid = requireOwner();
    if (settingsId) return settingsId;
    const client = getSupabase();
    const { data } = await client.from('settings').insert({ id: crypto.randomUUID(), user_id: uid, created_by: uid } as any).select('id').single();
    if (data) { setSettingsId(data.id); return data.id; }
    throw new Error('Failed to create settings');
  }, [settingsId, ownerUserId]);

  const setBankInfo = useCallback(async (name: string, account: string, qr: string) => {
    const id = await ensureSettingsRow();
    const client = getSupabase();
    const { error } = await client.from('settings').update(giftInfoToDb(name, account, '', qr) as any).eq('id', id);
    if (error) throw new Error(error.message);
    setBankName(name); setBankAccount(account); setBankQR(qr);
  }, [settingsId, ownerUserId, ensureSettingsRow]);

  const setGiftEnabled = useCallback(async (v: boolean) => {
    const id = await ensureSettingsRow();
    const client = getSupabase();
    const { error } = await client.from('settings').update({ gift_enabled: v } as any).eq('id', id);
    if (error) throw new Error(error.message);
    setGiftEnabledState(v);
  }, [settingsId, ownerUserId, ensureSettingsRow]);

  const updateSettings = useCallback(async (s: Partial<WeddingSettings>) => {
    const dbUpdate = settingsUpdateToDb(s);
    if (Object.keys(dbUpdate).length === 0) return;

    setSettings((prev) => ({ ...prev, ...s }));
    Object.entries(s).forEach(([key, value]) => {
      if (value !== undefined) pendingSettingsRef.current[key] = value;
    });

    if (!isOnline) {
      pendingSettingsQueueRef.current.push(s);
      return;
    }

    const id = await ensureSettingsRow();
    const client = getSupabase();
    const { error } = await client.from('settings').update(dbUpdate as any).eq('id', id);
    if (error) {
      console.warn('Settings update failed, queueing for retry', error.message);
      pendingSettingsQueueRef.current.push(s);
      return;
    }

    Object.keys(s).forEach((key) => {
      delete pendingSettingsRef.current[key];
    });
  }, [ensureSettingsRow, isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const pending = pendingSettingsQueueRef.current.splice(0, pendingSettingsQueueRef.current.length);
      if (pending.length > 0) {
        // Collapse all pending updates into a single merged update object
        const merged = pending.reduce((acc, curr) => ({ ...acc, ...curr }), {} as Partial<WeddingSettings>);
        updateSettings(merged).catch((error) => {
          console.warn('Flushing pending settings failed', error);
        });
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateSettings]);

  const addProgramItem = useCallback(async (item: Omit<ProgramItem, 'id'>) => {
    const uid = requireOwner();
    const client = getSupabase();
    const { error } = await client.from('program_schedule').insert(
      programToDb(uid, item, programSchedule.length) as any
    );
    if (error) throw error;
  }, [programSchedule.length, ownerUserId]);

  const removeProgramItem = useCallback(async (id: string) => {
    const client = getSupabase();
    const { error } = await client.from('program_schedule').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  const updateProgramItem = useCallback(async (id: string, item: Partial<ProgramItem>) => {
    const dbUpdate: any = {};
    for (const k of ['time_en', 'time_km', 'title_en', 'title_km', 'order_index'] as const) {
      if (item[k] !== undefined) dbUpdate[k] = item[k];
    }
    if (Object.keys(dbUpdate).length > 0) {
      const client = getSupabase();
      const { error } = await client.from('program_schedule').update(dbUpdate).eq('id', id);
      if (error) throw new Error(error.message);
    }
  }, []);

  return (
    <WeddingDataContext.Provider value={{
      ownerUserId, ready,
      guests, wishes, photos, bankName, bankAccount, bankQR, giftEnabled, settings, programSchedule,
      addGuest, removeGuest, updateRSVP, addWish, addPhoto, removePhoto, updatePhotoCaption,
      setBankInfo, setGiftEnabled, updateSettings,
      addProgramItem, removeProgramItem, updateProgramItem,
    }}>
      {children}
    </WeddingDataContext.Provider>
  );
}

export function useWeddingData() {
  const ctx = useContext(WeddingDataContext);
  if (!ctx) throw new Error('useWeddingData must be inside WeddingDataProvider');
  return ctx;
}
