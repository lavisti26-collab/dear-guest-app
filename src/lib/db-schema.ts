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
  defaults?: WeddingSettings
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
      heroImageOpacity: row?.hero_image_opacity != null ? Number(row.hero_image_opacity) : defaults.heroImageOpacity,
      shareImage: String(row?.share_image ?? defaults.shareImage),
      weddingDescription: String(row?.wedding_description ?? defaults.weddingDescription),
      weddingDescriptionKm: String(row?.wedding_description_km ?? defaults.weddingDescriptionKm),
      eventTitleEn: String(row?.event_title_en ?? defaults.eventTitleEn),
      eventTitleKm: String(row?.event_title_km ?? defaults.eventTitleKm),
      eventTitleFont: row?.event_title_font ? String(row.event_title_font) : defaults.eventTitleFont,
      eventTitleSize: row?.event_title_size ? String(row.event_title_size) : defaults.eventTitleSize,
      eventTitleAnimation: row?.event_title_animation ? String(row.event_title_animation) : defaults.eventTitleAnimation,
      eventTitleOpacity: row?.event_title_opacity != null ? Number(row.event_title_opacity) : defaults.eventTitleOpacity,
      detailsTitleEn: row?.details_title_en ? String(row.details_title_en) : defaults.detailsTitleEn,
      detailsTitleKm: row?.details_title_km ? String(row.details_title_km) : defaults.detailsTitleKm,
      giftTitleEn: row?.gift_title_en ? String(row.gift_title_en) : defaults.giftTitleEn,
      giftTitleKm: row?.gift_title_km ? String(row.gift_title_km) : defaults.giftTitleKm,
      greetingTitleEn: row?.greeting_title_en ? String(row.greeting_title_en) : defaults.greetingTitleEn,
      greetingTitleKm: row?.greeting_title_km ? String(row.greeting_title_km) : defaults.greetingTitleKm,
      timelineTitleEn: row?.timeline_title_en ? String(row.timeline_title_en) : defaults.timelineTitleEn,
      timelineTitleKm: row?.timeline_title_km ? String(row.timeline_title_km) : defaults.timelineTitleKm,
      galleryTitleEn: row?.gallery_title_en ? String(row.gallery_title_en) : defaults.galleryTitleEn,
      galleryTitleKm: row?.gallery_title_km ? String(row.gallery_title_km) : defaults.galleryTitleKm,
      rsvpTitleEn: row?.rsvp_title_en ? String(row.rsvp_title_en) : defaults.rsvpTitleEn,
      rsvpTitleKm: row?.rsvp_title_km ? String(row.rsvp_title_km) : defaults.rsvpTitleKm,
      wishesTitleEn: row?.wishes_title_en ? String(row.wishes_title_en) : defaults.wishesTitleEn,
      wishesTitleKm: row?.wishes_title_km ? String(row.wishes_title_km) : defaults.wishesTitleKm,
      contactTitleEn: row?.contact_title_en ? String(row.contact_title_en) : defaults.contactTitleEn,
      contactTitleKm: row?.contact_title_km ? String(row.contact_title_km) : defaults.contactTitleKm,
      layoutTemplate: String(row?.layout_template ?? defaults.layoutTemplate),
      fontPair: String(row?.font_pair ?? defaults.fontPair),
      animationStyle: String(row?.animation_style ?? defaults.animationStyle),
      coupleCardConfig: row?.couple_card_config ? (row.couple_card_config as any) : defaults.coupleCardConfig,
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
  eventTitleFont: 'event_title_font',
  eventTitleSize: 'event_title_size',
  eventTitleAnimation: 'event_title_animation',
  eventTitleOpacity: 'event_title_opacity',
  detailsTitleEn: 'details_title_en',
  detailsTitleKm: 'details_title_km',
  giftTitleEn: 'gift_title_en',
  giftTitleKm: 'gift_title_km',
  greetingTitleEn: 'greeting_title_en',
  greetingTitleKm: 'greeting_title_km',
  timelineTitleEn: 'timeline_title_en',
  timelineTitleKm: 'timeline_title_km',
  galleryTitleEn: 'gallery_title_en',
  galleryTitleKm: 'gallery_title_km',
  rsvpTitleEn: 'rsvp_title_en',
  rsvpTitleKm: 'rsvp_title_km',
  wishesTitleEn: 'wishes_title_en',
  wishesTitleKm: 'wishes_title_km',
  contactTitleEn: 'contact_title_en',
  contactTitleKm: 'contact_title_km',
  mapEmbedUrl: 'venue_maps',
  musicUrl: 'music_url',
  musicFile: 'music_file',
  heroImage: 'hero_image',
  heroImageOpacity: 'hero_image_opacity',
  shareImage: 'share_image',
  layoutTemplate: 'layout_template',
  fontPair: 'font_pair',
  animationStyle: 'animation_style',
  contactTelegram: 'contact_telegram',
  contactPhone: 'contact_phone',
  contactFacebook: 'contact_facebook',
  contactEmail: 'contact_email',
  coupleCardConfig: 'couple_card_config',
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
