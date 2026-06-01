/**
 * Single mapping layer between Supabase column names and app field names.
 * All reads/writes should use these helpers or DB column names directly.
 */

import type { Guest, ProgramItem, WeddingSettings, Wish } from '@/contexts/WeddingDataContext';

export type DbProfile = {
  id?: string;
  user_id?: string;
  slug?: string;
  groom_name?: string | null;
  bride_name?: string | null;
  wedding_date?: string | null;
  background_music_url?: string | null;
  bank_qr_url?: string | null;
  theme?: string | null;
  visual_style?: string | null;
};

export function guestFromDb(row: Record<string, unknown>): Guest {
  const status = String(row.attendance_status ?? 'pending');
  return {
    id: String(row.id),
    name: String(row.guest_name ?? ''),
    rsvpStatus: (status === 'attending' || status === 'not_attending' ? status : 'pending') as Guest['rsvpStatus'],
    numberOfGuests: Number(row.total_guests ?? 1),
    mealPreference: String(row.meal_preference ?? row.dietary_notes ?? ''),
    note: String(row.note ?? ''),
  };
}

export function guestToDb(
  uid: string,
  name: string,
  extra?: Partial<{ rsvpStatus: Guest['rsvpStatus']; numberOfGuests: number; mealPreference?: string; note?: string }>
): Record<string, unknown> {
  return {
    id: crypto.randomUUID(),
    user_id: uid,
    guest_name: name,
    attendance_status: extra?.rsvpStatus ?? 'pending',
    total_guests: extra?.numberOfGuests ?? 1,
    meal_preference: extra?.mealPreference ?? null,
    note: extra?.note ?? null,
  };
}

export function guestUpdateToDb(
  status: 'attending' | 'not_attending',
  numGuests: number,
  meal?: string,
  note?: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    attendance_status: status,
    total_guests: numGuests,
  };
  if (meal !== undefined) payload.meal_preference = meal;
  if (note !== undefined) payload.note = note;
  return payload;
}

export function wishFromDb(row: Record<string, unknown>): Wish {
  return {
    id: String(row.id),
    guestName: String(row.guest_name ?? ''),
    message: String(row.wish_message ?? ''),
    timestamp: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

export function wishToDb(uid: string, guestName: string, message: string): Record<string, unknown> {
  return {
    id: crypto.randomUUID(),
    user_id: uid,
    guest_name: guestName,
    wish_message: message,
  };
}

export function programFromDb(row: Record<string, unknown>): ProgramItem {
  const timeEn = (row.time_en ?? row.event_time ?? '') as string;
  const titleEn = (row.title_en ?? row.event_title ?? '') as string;
  return {
    id: row.id as string | undefined,
    time_en: timeEn || null,
    time_km: (row.time_km as string) || timeEn || null,
    title_en: titleEn || null,
    title_km: (row.title_km as string) || titleEn || null,
    order_index: row.order_index as number | undefined,
  };
}

export function programToDb(uid: string, item: Omit<ProgramItem, 'id'>, orderIndex: number): Record<string, unknown> {
  const time = item.time_en || item.time_km || 'TBA';
  const title = item.title_en || item.title_km || 'Event';
  return {
    id: crypto.randomUUID(),
    user_id: uid,
    event_time: time,
    event_title: title,
    time_en: item.time_en,
    time_km: item.time_km,
    title_en: item.title_en,
    title_km: item.title_km,
    order_index: item.order_index ?? orderIndex,
  };
}

export function formatWeddingDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function coupleNamesFromProfile(profile?: DbProfile | null): { en: string; km: string } | null {
  if (!profile?.groom_name && !profile?.bride_name) return null;
  const en = [profile.groom_name, profile.bride_name].filter(Boolean).join(' & ');
  return { en, km: en };
}

/** Map settings row + optional profile → app WeddingSettings + gift fields */
export function settingsFromDb(
  row: Record<string, unknown> | null | undefined,
  profile?: (DbProfile & { display_name?: string | null }) | null,
  defaults: WeddingSettings
): {
  settings: WeddingSettings;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  bankQR: string;
  giftEnabled: boolean;
} {
  const fromProfile = coupleNamesFromProfile(profile);
  const displayFallback = profile?.display_name
    ? String(profile.display_name).replace(/[-_]/g, ' ')
    : null;
  const rawCoupleNames = String(row?.couple_names ?? '');
  const coupleNames =
    rawCoupleNames && rawCoupleNames !== 'Bride & Groom'
      ? rawCoupleNames
      : fromProfile?.en || displayFallback || defaults.coupleNames;
  return {
    settings: {
      coupleNames,
      coupleNamesKm: String(row?.couple_names_km ?? fromProfile?.km ?? defaults.coupleNamesKm),
      weddingDate: formatWeddingDate(row?.wedding_date) || formatWeddingDate(profile?.wedding_date) || defaults.weddingDate,
      weddingDateKm: String(row?.wedding_date_km ?? defaults.weddingDateKm),
      weddingTime: String(row?.wedding_time ?? defaults.weddingTime),
      weddingTimeKm: String(row?.wedding_time_km ?? defaults.weddingTimeKm),
      venueName: String(row?.venue ?? defaults.venueName),
      venueNameKm: String(row?.venue_km ?? defaults.venueNameKm),
      weddingDateTime: row?.wedding_date ? String(row.wedding_date) : defaults.weddingDateTime,
      calendarUrl: defaults.calendarUrl,
      mapLat: defaults.mapLat,
      mapLng: defaults.mapLng,
      mapEmbedUrl: String(row?.venue_maps ?? defaults.mapEmbedUrl),
      contactTelegram: String(row?.contact_telegram ?? defaults.contactTelegram),
      contactPhone: String(row?.contact_phone ?? defaults.contactPhone),
      contactFacebook: String(row?.contact_facebook ?? defaults.contactFacebook),
      contactEmail: String(row?.contact_email ?? defaults.contactEmail),
      musicUrl: String(row?.music_url ?? profile?.background_music_url ?? defaults.musicUrl),
      musicFile: String(row?.music_file ?? profile?.background_music_url ?? defaults.musicFile),
      heroImage: String(row?.hero_image ?? defaults.heroImage),
      weddingDescription: String(row?.wedding_description ?? defaults.weddingDescription),
      weddingDescriptionKm: String(row?.wedding_description_km ?? defaults.weddingDescriptionKm),
      eventTitleEn: String(row?.event_title_en ?? defaults.eventTitleEn),
      eventTitleKm: String(row?.event_title_km ?? defaults.eventTitleKm),
    },
    bankName: String(row?.gift_bank_name ?? ''),
    bankAccount: String(row?.gift_account_number ?? ''),
    bankAccountName: String(row?.gift_account_name ?? ''),
    bankQR: String(row?.gift_qr_url ?? profile?.bank_qr_url ?? ''),
    giftEnabled: row?.gift_enabled !== false,
  };
}

/** App settings partial → DB columns (canonical only) */
export const SETTINGS_APP_TO_DB: Partial<Record<keyof WeddingSettings, string>> = {
  coupleNames: 'couple_names',
  coupleNamesKm: 'couple_names_km',
  weddingDate: 'wedding_date',
  weddingDateKm: 'wedding_date_km',
  weddingDateTime: 'wedding_date',
  weddingTime: 'wedding_time',
  weddingTimeKm: 'wedding_time_km',
  venueName: 'venue',
  venueNameKm: 'venue_km',
  weddingDescription: 'wedding_description',
  weddingDescriptionKm: 'wedding_description_km',
  eventTitleEn: 'event_title_en',
  eventTitleKm: 'event_title_km',
  mapEmbedUrl: 'venue_maps',
  musicUrl: 'music_url',
  musicFile: 'music_file',
  heroImage: 'hero_image',
  contactTelegram: 'contact_telegram',
  contactPhone: 'contact_phone',
  contactFacebook: 'contact_facebook',
  contactEmail: 'contact_email',
};

export function settingsUpdateToDb(s: Partial<WeddingSettings>): Record<string, unknown> {
  const dbUpdate: Record<string, unknown> = {};
  for (const [k, col] of Object.entries(SETTINGS_APP_TO_DB)) {
    const v = s[k as keyof WeddingSettings];
    if (v !== undefined && col) dbUpdate[col] = v;
  }
  return dbUpdate;
}

export function giftInfoToDb(name: string, accountNumber: string, accountName: string, qrUrl: string) {
  return {
    gift_bank_name: name,
    gift_account_number: accountNumber,
    gift_account_name: accountName,
    gift_qr_url: qrUrl,
  };
}

export function photoToDb(uid: string, url: string, caption?: string) {
  return {
    id: crypto.randomUUID(),
    user_id: uid,
    created_by: uid,
    url,
    caption: caption ?? null,
  };
}
