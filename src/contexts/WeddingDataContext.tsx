import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
}

interface WeddingData {
  ownerUserId: string | null;
  ready: boolean;
  guests: Guest[];
  wishes: Wish[];
  photos: string[];
  bankName: string;
  bankAccount: string;
  bankQR: string;
  giftEnabled: boolean;
  settings: WeddingSettings;
  programSchedule: ProgramItem[];
  addGuest: (name: string) => Promise<void>;
  removeGuest: (id: string) => Promise<void>;
  updateRSVP: (name: string, status: 'attending' | 'not_attending', numGuests: number, meal?: string, note?: string) => Promise<void>;
  addWish: (name: string, message: string) => Promise<void>;
  addPhoto: (url: string) => Promise<void>;
  removePhoto: (url: string) => Promise<void>;
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
};

interface ProviderProps {
  children: ReactNode;
  ownerUserId: string | null;
  publicProfile?: DbProfile | null;
}

export function WeddingDataProvider({ children, ownerUserId, publicProfile }: ProviderProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
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

  const [ready, setReady] = useState(() => Boolean(ownerUserId && isPublicInvite));

  useEffect(() => {
    if (!ownerUserId) { setReady(false); return; }
    let cancelled = false;
    if (!isPublicInvite) setReady(false);
    const fetchAll = async () => {
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
        if (!photosRes.error) setPhotos(photosRes.data?.map((p: { url: string }) => p.url) || []);
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
        if (!cancelled) setReady(true);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [ownerUserId, isPublicInvite]);

  useEffect(() => {
    if (!ownerUserId) return;
    const channel = supabase
      .channel(`wedding-${ownerUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setGuests(p => p.find(g => g.id === payload.new.id) ? p : [...p, guestFromDb(payload.new as Record<string, unknown>)]);
        else if (payload.eventType === 'UPDATE') setGuests(p => p.map(g => g.id === payload.new.id ? guestFromDb(payload.new as Record<string, unknown>) : g));
        else if (payload.eventType === 'DELETE') setGuests(p => p.filter(g => g.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setWishes(p => p.find(w => w.id === payload.new.id) ? p : [wishFromDb(payload.new as Record<string, unknown>), ...p]);
        else if (payload.eventType === 'DELETE') setWishes(p => p.filter(w => w.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPhotos(p => p.includes(payload.new.url) ? p : [...p, payload.new.url]);
        else if (payload.eventType === 'DELETE') setPhotos(p => p.filter(u => u !== payload.old.url));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        const m = settingsFromDb(payload.new as Record<string, unknown>, publicProfileRef.current, defaultSettings);
        setSettings(m.settings); setBankName(m.bankName); setBankAccount(m.bankAccount); setBankQR(m.bankQR); setGiftEnabledState(m.giftEnabled);
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
    const { data, error } = await supabase
      .from('guests')
      .insert(guestToDb(uid, name) as any)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    if (data) setGuests(p => (p.find(g => g.id === data.id) ? p : [...p, guestFromDb(data as Record<string, unknown>)]));
  }, [ownerUserId]);

  const removeGuest = useCallback(async (id: string) => {
    const { error } = await supabase.from('guests').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  const updateRSVP = useCallback(async (name: string, status: 'attending' | 'not_attending', numGuests: number, meal?: string, note?: string) => {
    const uid = requireOwner();
    const { data } = await supabase.from('guests').select('id').eq('user_id', uid).ilike('guest_name', name).limit(1).maybeSingle();
    const payload = guestUpdateToDb(status, numGuests, meal, note);
    if (data) {
      await supabase.from('guests').update(payload as any).eq('id', data.id);
    } else {
      await supabase.from('guests').insert(guestToDb(uid, name, { rsvpStatus: status, numberOfGuests: numGuests, mealPreference: meal, note }) as any);
    }
  }, [ownerUserId]);

  const addWish = useCallback(async (guestName: string, message: string) => {
    const uid = requireOwner();
    const { error } = await supabase.from('wishes').insert(wishToDb(uid, guestName, message) as any);
    if (error) throw new Error(error.message);
  }, [ownerUserId]);

  const addPhoto = useCallback(async (url: string) => {
    const uid = requireOwner();
    const { error } = await supabase.from('photos').insert(photoToDb(uid, url) as any);
    if (error) throw new Error(error.message);
  }, [ownerUserId]);

  const removePhoto = useCallback(async (url: string) => {
    const { error } = await supabase.from('photos').delete().eq('url', url);
    if (error) throw new Error(error.message);
  }, []);

  const ensureSettingsRow = async () => {
    const uid = requireOwner();
    if (settingsId) return settingsId;
    const { data } = await supabase.from('settings').insert({ id: crypto.randomUUID(), user_id: uid, created_by: uid } as any).select('id').single();
    if (data) { setSettingsId(data.id); return data.id; }
    throw new Error('Failed to create settings');
  };

  const setBankInfo = useCallback(async (name: string, account: string, qr: string) => {
    const id = await ensureSettingsRow();
    const { error } = await supabase.from('settings').update(giftInfoToDb(name, account, '', qr) as any).eq('id', id);
    if (error) throw new Error(error.message);
    setBankName(name); setBankAccount(account); setBankQR(qr);
  }, [settingsId, ownerUserId]);

  const setGiftEnabled = useCallback(async (v: boolean) => {
    const id = await ensureSettingsRow();
    const { error } = await supabase.from('settings').update({ gift_enabled: v }).eq('id', id);
    if (error) throw new Error(error.message);
    setGiftEnabledState(v);
  }, [settingsId, ownerUserId]);

  const updateSettings = useCallback(async (s: Partial<WeddingSettings>) => {
    const id = await ensureSettingsRow();
    const dbUpdate = settingsUpdateToDb(s);
    if (Object.keys(dbUpdate).length === 0) return;
    const { error } = await supabase.from('settings').update(dbUpdate).eq('id', id);
    if (error) throw new Error(error.message);
    setSettings(prev => ({ ...prev, ...s }));
  }, [settingsId, ownerUserId]);

  const addProgramItem = useCallback(async (item: Omit<ProgramItem, 'id'>) => {
    const uid = requireOwner();
    const { error } = await supabase.from('program_schedule').insert(
      programToDb(uid, item, programSchedule.length) as any
    );
    if (error) throw error;
  }, [programSchedule.length, ownerUserId]);

  const removeProgramItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('program_schedule').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }, []);

  const updateProgramItem = useCallback(async (id: string, item: Partial<ProgramItem>) => {
    const dbUpdate: any = {};
    for (const k of ['time_en', 'time_km', 'title_en', 'title_km', 'order_index'] as const) {
      if (item[k] !== undefined) dbUpdate[k] = item[k];
    }
    if (Object.keys(dbUpdate).length > 0) {
      const { error } = await supabase.from('program_schedule').update(dbUpdate).eq('id', id);
      if (error) throw new Error(error.message);
    }
  }, []);

  return (
    <WeddingDataContext.Provider value={{
      ownerUserId, ready,
      guests, wishes, photos, bankName, bankAccount, bankQR, giftEnabled, settings, programSchedule,
      addGuest, removeGuest, updateRSVP, addWish, addPhoto, removePhoto,
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
