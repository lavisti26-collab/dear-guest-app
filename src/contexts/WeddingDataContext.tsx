import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/lovable-cloud';

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
};

function dbToGuest(row: any): Guest {
  return {
    id: row.id,
    name: row.name,
    rsvpStatus: (row.rsvp_status || 'pending') as Guest['rsvpStatus'],
    numberOfGuests: row.number_of_guests ?? 1,
    mealPreference: row.meal_preference || '',
    note: row.note || '',
  };
}

function dbToWish(row: any): Wish {
  return {
    id: row.id,
    guestName: row.guest_name,
    message: row.message || '',
    timestamp: new Date(row.created_at).getTime(),
  };
}

function dbToSettings(row: any) {
  return {
    settings: {
      coupleNames: row.couple_names || defaultSettings.coupleNames,
      coupleNamesKm: row.couple_names_km || defaultSettings.coupleNamesKm,
      weddingDate: row.wedding_date || defaultSettings.weddingDate,
      weddingDateKm: row.wedding_date_km || defaultSettings.weddingDateKm,
      weddingTime: row.wedding_time || defaultSettings.weddingTime,
      weddingTimeKm: row.wedding_time_km || defaultSettings.weddingTimeKm,
      venueName: row.venue || defaultSettings.venueName,
      venueNameKm: row.venue_km || defaultSettings.venueNameKm,
      weddingDateTime: row.wedding_date_time || defaultSettings.weddingDateTime,
      calendarUrl: row.calendar_url || defaultSettings.calendarUrl,
      mapLat: row.map_lat || defaultSettings.mapLat,
      mapLng: row.map_lng || defaultSettings.mapLng,
      mapEmbedUrl: row.map_embed_url || defaultSettings.mapEmbedUrl,
      contactTelegram: row.contact_telegram || '',
      contactPhone: row.contact_phone || '',
      contactFacebook: row.contact_facebook || '',
      contactEmail: row.contact_email || '',
      musicUrl: row.music_url || '',
      musicFile: row.music_file || '',
      heroImage: row.hero_image || '',
      weddingDescription: row.wedding_description || defaultSettings.weddingDescription,
      weddingDescriptionKm: row.wedding_description_km || defaultSettings.weddingDescriptionKm,
    } as WeddingSettings,
    bankName: row.gift_bank_name || '',
    bankAccount: row.gift_bank_account || '',
    bankQR: row.gift_qr_code || '',
    giftEnabled: row.gift_enabled !== false,
  };
}

interface ProviderProps {
  children: ReactNode;
  ownerUserId: string | null;
}

export function WeddingDataProvider({ children, ownerUserId }: ProviderProps) {
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ownerUserId) { setReady(false); return; }
    let cancelled = false;
    setReady(false);
    const fetchAll = async () => {
      const [guestsRes, wishesRes, photosRes, settingsRes, programRes] = await Promise.all([
        supabase.from('guests').select('*').eq('user_id', ownerUserId).order('created_at', { ascending: true }),
        supabase.from('wishes').select('*').eq('user_id', ownerUserId).order('created_at', { ascending: false }),
        supabase.from('photos').select('*').eq('user_id', ownerUserId).order('created_at', { ascending: true }),
        supabase.from('settings').select('*').eq('user_id', ownerUserId).maybeSingle(),
        supabase.from('program_schedule').select('*').eq('user_id', ownerUserId).order('order_index', { ascending: true }),
      ]);
      if (cancelled) return;
      setGuests(guestsRes.data?.map(dbToGuest) || []);
      setWishes(wishesRes.data?.map(dbToWish) || []);
      setPhotos(photosRes.data?.map((p: any) => p.url) || []);
      setProgramSchedule((programRes.data as ProgramItem[]) || []);
      if (settingsRes.data) {
        const m = dbToSettings(settingsRes.data);
        setSettings(m.settings);
        setBankName(m.bankName);
        setBankAccount(m.bankAccount);
        setBankQR(m.bankQR);
        setGiftEnabledState(m.giftEnabled);
        setSettingsId(settingsRes.data.id);
      } else {
        setSettings(defaultSettings);
        setSettingsId(null);
      }
      setReady(true);
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [ownerUserId]);

  useEffect(() => {
    if (!ownerUserId) return;
    const channel = supabase
      .channel(`wedding-${ownerUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setGuests(p => p.find(g => g.id === payload.new.id) ? p : [...p, dbToGuest(payload.new)]);
        else if (payload.eventType === 'UPDATE') setGuests(p => p.map(g => g.id === payload.new.id ? dbToGuest(payload.new) : g));
        else if (payload.eventType === 'DELETE') setGuests(p => p.filter(g => g.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setWishes(p => p.find(w => w.id === payload.new.id) ? p : [dbToWish(payload.new), ...p]);
        else if (payload.eventType === 'DELETE') setWishes(p => p.filter(w => w.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setPhotos(p => p.includes(payload.new.url) ? p : [...p, payload.new.url]);
        else if (payload.eventType === 'DELETE') setPhotos(p => p.filter(u => u !== payload.old.url));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        const m = dbToSettings(payload.new);
        setSettings(m.settings); setBankName(m.bankName); setBankAccount(m.bankAccount); setBankQR(m.bankQR); setGiftEnabledState(m.giftEnabled);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'program_schedule', filter: `user_id=eq.${ownerUserId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setProgramSchedule(p => p.find(x => x.id === payload.new.id) ? p : [...p, payload.new as ProgramItem].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        else if (payload.eventType === 'UPDATE') setProgramSchedule(p => p.map(x => x.id === payload.new.id ? payload.new as ProgramItem : x).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
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
    await supabase.from('guests').insert({ user_id: uid, name, rsvp_status: 'pending', number_of_guests: 1 } as any);
  }, [ownerUserId]);

  const removeGuest = useCallback(async (id: string) => {
    await supabase.from('guests').delete().eq('id', id);
  }, []);

  const updateRSVP = useCallback(async (name: string, status: 'attending' | 'not_attending', numGuests: number, meal?: string, note?: string) => {
    const uid = requireOwner();
    const { data } = await supabase.from('guests').select('id').eq('user_id', uid).ilike('name', name).limit(1).maybeSingle();
    const payload: any = { rsvp_status: status, number_of_guests: numGuests };
    if (meal !== undefined) payload.meal_preference = meal;
    if (note !== undefined) payload.note = note;
    if (data) {
      await supabase.from('guests').update(payload).eq('id', data.id);
    } else {
      await supabase.from('guests').insert({ user_id: uid, name, ...payload } as any);
    }
  }, [ownerUserId]);

  const addWish = useCallback(async (guestName: string, message: string) => {
    const uid = requireOwner();
    await supabase.from('wishes').insert({ user_id: uid, guest_name: guestName, message } as any);
  }, [ownerUserId]);

  const addPhoto = useCallback(async (url: string) => {
    const uid = requireOwner();
    await supabase.from('photos').insert({ user_id: uid, url } as any);
  }, [ownerUserId]);

  const removePhoto = useCallback(async (url: string) => {
    await supabase.from('photos').delete().eq('url', url);
  }, []);

  const ensureSettingsRow = async () => {
    const uid = requireOwner();
    if (settingsId) return settingsId;
    const { data } = await supabase.from('settings').insert({ user_id: uid } as any).select('id').single();
    if (data) { setSettingsId(data.id); return data.id; }
    throw new Error('Failed to create settings');
  };

  const setBankInfo = useCallback(async (name: string, account: string, qr: string) => {
    const id = await ensureSettingsRow();
    await supabase.from('settings').update({ gift_bank_name: name, gift_bank_account: account, gift_qr_code: qr }).eq('id', id);
    setBankName(name); setBankAccount(account); setBankQR(qr);
  }, [settingsId, ownerUserId]);

  const setGiftEnabled = useCallback(async (v: boolean) => {
    const id = await ensureSettingsRow();
    await supabase.from('settings').update({ gift_enabled: v }).eq('id', id);
    setGiftEnabledState(v);
  }, [settingsId, ownerUserId]);

  const updateSettings = useCallback(async (s: Partial<WeddingSettings>) => {
    const id = await ensureSettingsRow();
    const dbUpdate: any = {};
    const m: Record<string, string> = {
      coupleNames: 'couple_names', coupleNamesKm: 'couple_names_km', weddingDate: 'wedding_date', weddingDateKm: 'wedding_date_km',
      weddingTime: 'wedding_time', weddingTimeKm: 'wedding_time_km', venueName: 'venue', venueNameKm: 'venue_km',
      weddingDateTime: 'wedding_date_time', calendarUrl: 'calendar_url', mapLat: 'map_lat', mapLng: 'map_lng', mapEmbedUrl: 'map_embed_url',
      contactTelegram: 'contact_telegram', contactPhone: 'contact_phone', contactFacebook: 'contact_facebook', contactEmail: 'contact_email',
      musicUrl: 'music_url', musicFile: 'music_file', heroImage: 'hero_image',
      weddingDescription: 'wedding_description', weddingDescriptionKm: 'wedding_description_km',
    };
    for (const [k, v] of Object.entries(s)) {
      if (v !== undefined && m[k]) dbUpdate[m[k]] = v;
    }
    if (Object.keys(dbUpdate).length === 0) return;
    await supabase.from('settings').update(dbUpdate).eq('id', id);
    setSettings(prev => ({ ...prev, ...s }));
  }, [settingsId, ownerUserId]);

  const addProgramItem = useCallback(async (item: Omit<ProgramItem, 'id'>) => {
    const uid = requireOwner();
    const { error } = await supabase.from('program_schedule').insert({
      user_id: uid,
      time_en: item.time_en, time_km: item.time_km,
      title_en: item.title_en, title_km: item.title_km,
      order_index: item.order_index ?? programSchedule.length,
    } as any);
    if (error) throw error;
  }, [programSchedule.length, ownerUserId]);

  const removeProgramItem = useCallback(async (id: string) => {
    await supabase.from('program_schedule').delete().eq('id', id);
  }, []);

  const updateProgramItem = useCallback(async (id: string, item: Partial<ProgramItem>) => {
    const dbUpdate: any = {};
    for (const k of ['time_en', 'time_km', 'title_en', 'title_km', 'order_index'] as const) {
      if (item[k] !== undefined) dbUpdate[k] = item[k];
    }
    if (Object.keys(dbUpdate).length > 0) await supabase.from('program_schedule').update(dbUpdate).eq('id', id);
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
