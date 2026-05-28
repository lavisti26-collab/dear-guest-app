import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  settings: WeddingSettings;
  programSchedule: ProgramItem[];
  addGuest: (name: string) => void;
  removeGuest: (id: string) => void;
  updateRSVP: (name: string, status: 'attending' | 'not_attending', numGuests: number, meal?: string, note?: string) => void;
  addWish: (name: string, message: string) => void;
  addPhoto: (url: string) => void;
  removePhoto: (url: string) => void;
  setBankInfo: (name: string, account: string, qr: string) => void;
  updateSettings: (s: Partial<WeddingSettings>) => void;
  addProgramItem: (item: Omit<ProgramItem, 'id'>) => void;
  removeProgramItem: (id: string) => void;
  updateProgramItem: (id: string, item: Partial<ProgramItem>) => void;
  giftEnabled: boolean;
  setGiftEnabled: (v: boolean) => void;
}

const WeddingDataContext = createContext<WeddingData | null>(null);

const defaultSettings: WeddingSettings = {
  coupleNames: 'Dara & Sophea',
  coupleNamesKm: 'តារា & សុភា',
  weddingDate: 'Saturday, 20 December 2026',
  weddingDateKm: 'ថ្ងៃសៅរ៍ ២០ ខែធ្នូ ២០២៦',
  weddingTime: '11:30 AM',
  weddingTimeKm: '១១:៣០ ព្រឹក',
  venueName: 'The Grand Palace Hotel',
  venueNameKm: 'សណ្ឋាគារ ព្រះបរមរាជវាំង',
  weddingDateTime: '2026-12-20T11:30:00',
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
  weddingDescription: 'We joyfully invite you to celebrate the beginning of our new journey together.',
  weddingDescriptionKm: 'យើងខ្ញុំសូមគោរពអញ្ជើញអ្នកមកចូលរួមពិធីមង្គលការរបស់យើង។',
};

// Map DB row to app Guest
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

// Map DB row to app Wish
function dbToWish(row: any): Wish {
  return {
    id: row.id,
    guestName: row.guest_name,
    message: row.message || '',
    timestamp: new Date(row.created_at).getTime(),
  };
}

// Map DB settings row to app WeddingSettings + bank info
function dbToSettings(row: any): { settings: WeddingSettings; bankName: string; bankAccount: string; bankQR: string } {
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
      contactTelegram: row.contact_telegram || defaultSettings.contactTelegram,
      contactPhone: row.contact_phone || defaultSettings.contactPhone,
      contactFacebook: row.contact_facebook || defaultSettings.contactFacebook,
      contactEmail: row.contact_email || defaultSettings.contactEmail,
      musicUrl: row.music_url || defaultSettings.musicUrl,
      musicFile: row.music_file || defaultSettings.musicFile,
      heroImage: row.hero_image || defaultSettings.heroImage,
      weddingDescription: row.wedding_description || defaultSettings.weddingDescription,
      weddingDescriptionKm: row.wedding_description_km || defaultSettings.weddingDescriptionKm,
    },
    bankName: row.gift_bank_name || 'ABA Bank',
    bankAccount: row.gift_bank_account || '001 234 567',
    bankQR: row.gift_qr_code || '',
  };
}

export function WeddingDataProvider({ children }: { children: ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [bankName, setBankName] = useState('ABA Bank');
  const [bankAccount, setBankAccount] = useState('001 234 567');
  const [bankQR, setBankQR] = useState('');
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [programSchedule, setProgramSchedule] = useState<ProgramItem[]>([]);

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchAll = async () => {
      const [guestsRes, wishesRes, photosRes, settingsRes, programRes] = await Promise.all([
        supabase.from('guests').select('*').order('created_at', { ascending: true }),
        supabase.from('wishes').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').order('created_at', { ascending: true }),
        supabase.from('settings').select('*').limit(1).single(),
        supabase.from('program_schedule').select('*').order('order_index', { ascending: true }),
      ]);

      if (guestsRes.data) setGuests(guestsRes.data.map(dbToGuest));
      if (wishesRes.data) setWishes(wishesRes.data.map(dbToWish));
      if (photosRes.data) setPhotos(photosRes.data.map((p: any) => p.url));
      if (programRes.data) setProgramSchedule(programRes.data as ProgramItem[]);

      if (settingsRes.data) {
        const mapped = dbToSettings(settingsRes.data);
        setSettings(mapped.settings);
        setBankName(mapped.bankName);
        setBankAccount(mapped.bankAccount);
        setBankQR(mapped.bankQR);
        setSettingsId(settingsRes.data.id);
      }
    };
    fetchAll();
  }, []);

  // --- Real-time subscriptions ---
  useEffect(() => {
    const channel = supabase
      .channel('wedding-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setGuests(prev => {
            if (prev.find(g => g.id === payload.new.id)) return prev;
            return [...prev, dbToGuest(payload.new)];
          });
        } else if (payload.eventType === 'UPDATE') {
          setGuests(prev => prev.map(g => g.id === payload.new.id ? dbToGuest(payload.new) : g));
        } else if (payload.eventType === 'DELETE') {
          setGuests(prev => prev.filter(g => g.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWishes(prev => {
            if (prev.find(w => w.id === payload.new.id)) return prev;
            return [dbToWish(payload.new), ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setWishes(prev => prev.filter(w => w.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPhotos(prev => {
            if (prev.includes(payload.new.url)) return prev;
            return [...prev, payload.new.url];
          });
        } else if (payload.eventType === 'DELETE') {
          setPhotos(prev => prev.filter(p => p !== payload.old.url));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        const mapped = dbToSettings(payload.new);
        setSettings(mapped.settings);
        setBankName(mapped.bankName);
        setBankAccount(mapped.bankAccount);
        setBankQR(mapped.bankQR);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'program_schedule' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProgramSchedule(prev => {
            if (prev.find(p => p.id === payload.new.id)) return prev;
            return [...prev, payload.new as ProgramItem].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          });
        } else if (payload.eventType === 'UPDATE') {
          setProgramSchedule(prev => prev.map(p => p.id === payload.new.id ? payload.new as ProgramItem : p).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        } else if (payload.eventType === 'DELETE') {
          setProgramSchedule(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Mutations ---
  const addGuest = useCallback(async (name: string) => {
    await supabase.from('guests').insert({ name, rsvp_status: 'pending', number_of_guests: 1 });
  }, []);

  const removeGuest = useCallback(async (id: string) => {
    await supabase.from('guests').delete().eq('id', id);
  }, []);

  const updateRSVP = useCallback(async (name: string, status: 'attending' | 'not_attending', numGuests: number) => {
    const { data } = await supabase.from('guests').select('id').ilike('name', name).limit(1).single();
    if (data) {
      await supabase.from('guests').update({ rsvp_status: status, number_of_guests: numGuests }).eq('id', data.id);
    } else {
      await supabase.from('guests').insert({ name, rsvp_status: status, number_of_guests: numGuests });
    }
  }, []);

  const addWish = useCallback(async (guestName: string, message: string) => {
    await supabase.from('wishes').insert({ guest_name: guestName, message });
  }, []);

  const addPhoto = useCallback(async (url: string) => {
    await supabase.from('photos').insert({ url });
  }, []);

  const removePhoto = useCallback(async (url: string) => {
    await supabase.from('photos').delete().eq('url', url);
  }, []);

  const setBankInfo = useCallback(async (name: string, account: string, qr: string) => {
    const update = { gift_bank_name: name, gift_bank_account: account, gift_qr_code: qr };
    if (settingsId) {
      await supabase.from('settings').update(update).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('settings').insert(update as any).select('id').single();
      if (data) setSettingsId(data.id);
    }
    setBankName(name);
    setBankAccount(account);
    setBankQR(qr);
  }, [settingsId]);

  const updateSettings = useCallback(async (s: Partial<WeddingSettings>) => {
    const dbUpdate: Record<string, any> = {};
    if (s.coupleNames !== undefined) dbUpdate.couple_names = s.coupleNames;
    if (s.coupleNamesKm !== undefined) dbUpdate.couple_names_km = s.coupleNamesKm;
    if (s.weddingDate !== undefined) dbUpdate.wedding_date = s.weddingDate;
    if (s.weddingDateKm !== undefined) dbUpdate.wedding_date_km = s.weddingDateKm;
    if (s.weddingTime !== undefined) dbUpdate.wedding_time = s.weddingTime;
    if (s.weddingTimeKm !== undefined) dbUpdate.wedding_time_km = s.weddingTimeKm;
    if (s.venueName !== undefined) dbUpdate.venue = s.venueName;
    if (s.venueNameKm !== undefined) dbUpdate.venue_km = s.venueNameKm;
    if (s.weddingDateTime !== undefined) dbUpdate.wedding_date_time = s.weddingDateTime;
    if (s.calendarUrl !== undefined) dbUpdate.calendar_url = s.calendarUrl;
    if (s.mapLat !== undefined) dbUpdate.map_lat = s.mapLat;
    if (s.mapLng !== undefined) dbUpdate.map_lng = s.mapLng;
    if (s.mapEmbedUrl !== undefined) dbUpdate.map_embed_url = s.mapEmbedUrl;
    if (s.contactTelegram !== undefined) dbUpdate.contact_telegram = s.contactTelegram;
    if (s.contactPhone !== undefined) dbUpdate.contact_phone = s.contactPhone;
    if (s.contactFacebook !== undefined) dbUpdate.contact_facebook = s.contactFacebook;
    if (s.contactEmail !== undefined) dbUpdate.contact_email = s.contactEmail;
    if (s.musicUrl !== undefined) dbUpdate.music_url = s.musicUrl;
    if (s.musicFile !== undefined) dbUpdate.music_file = s.musicFile;
    if (s.heroImage !== undefined) dbUpdate.hero_image = s.heroImage;
    if (s.weddingDescription !== undefined) dbUpdate.wedding_description = s.weddingDescription;
    if (s.weddingDescriptionKm !== undefined) dbUpdate.wedding_description_km = s.weddingDescriptionKm;

    if (Object.keys(dbUpdate).length === 0) return;

    if (settingsId) {
      await supabase.from('settings').update(dbUpdate).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('settings').insert(dbUpdate).select('id').single();
      if (data) setSettingsId(data.id);
    }
    setSettings(prev => ({ ...prev, ...s }));
  }, [settingsId]);

  const addProgramItem = useCallback(async (item: Omit<ProgramItem, 'id'>) => {
    const { error } = await supabase.from('program_schedule').insert({
      time_en: item.time_en,
      time_km: item.time_km,
      title_en: item.title_en,
      title_km: item.title_km,
      order_index: item.order_index || programSchedule.length,
    });
    if (error) throw error;
  }, [programSchedule.length]);

  const removeProgramItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('program_schedule').delete().eq('id', id);
    if (error) throw error;
  }, []);

  const updateProgramItem = useCallback(async (id: string, item: Partial<ProgramItem>) => {
    const dbUpdate: Record<string, any> = {};
    if (item.time_en !== undefined) dbUpdate.time_en = item.time_en;
    if (item.time_km !== undefined) dbUpdate.time_km = item.time_km;
    if (item.title_en !== undefined) dbUpdate.title_en = item.title_en;
    if (item.title_km !== undefined) dbUpdate.title_km = item.title_km;
    if (item.order_index !== undefined) dbUpdate.order_index = item.order_index;
    if (Object.keys(dbUpdate).length > 0) {
      await supabase.from('program_schedule').update(dbUpdate).eq('id', id);
    }
  }, []);

  return (
    <WeddingDataContext.Provider value={{
      guests, wishes, photos, bankName, bankAccount, bankQR, settings, programSchedule,
      addGuest, removeGuest, updateRSVP, addWish, addPhoto, removePhoto, setBankInfo, updateSettings,
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
