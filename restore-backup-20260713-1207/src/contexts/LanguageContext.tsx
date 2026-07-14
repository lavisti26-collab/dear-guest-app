import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'km';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  formatDate: (value?: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatTime: (value?: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  dir: 'ltr' | 'rtl';
}

const STORAGE_KEY = 'dear_guest_language';

const translations: Record<string, Record<Lang, string>> = {
  'hero.names': { en: 'Dara & Sophea', km: 'តារា & សុភា' },
  'hero.date': { en: 'Saturday, 14 December 2025', km: 'ថ្ងៃសៅរ៍ ១៤ ខែធ្នូ ២០២៥' },
  'hero.open': { en: 'Open Invitation', km: 'បើកសំបុត្រអញ្ជើញ' },
  'greeting.dear': { en: 'Dear', km: 'ជូនចំពោះ' },
  'greeting.message': { en: 'You are warmly invited to celebrate our wedding.', km: 'សូមអញ្ជើញចូលរួមអបអរសាទរពិធីមង្គលការរបស់យើង។' },
  'greeting.guest': { en: 'Honored Guest', km: 'ភ្ញៀវកិត្តិយស' },
  'timeline.title': { en: 'Wedding Program', km: 'ដំណើរកម្មវិធី' },
  'gallery.title': { en: 'Our Moments', km: 'កម្រងរូបភាពរបស់យើង' },
  'details.title': { en: 'Wedding Details', km: 'ព័ត៌មានពិធីមង្គលការ' },
  'details.date': { en: 'Date', km: 'កាលបរិច្ឆេទ' },
  'details.time': { en: 'Time', km: 'ម៉ោង' },
  'details.time_value': { en: '11:30 AM', km: '១១:៣០ ព្រឹក' },
  'details.venue': { en: 'Venue', km: 'ទីកន្លែង' },
  'details.venue_name': { en: 'The Grand Palace Hotel', km: 'សណ្ឋាគារ ព្រះបរមរាជវាំង' },
  'details.calendar': { en: 'Save to Calendar', km: 'រក្សាទុកក្នុងប្រតិទិន' },
  'details.countdown': { en: 'Counting down to our big day', km: 'រាប់ថយក្រោយរហូតដល់ថ្ងៃពិសេស' },
  'details.days': { en: 'Days', km: 'ថ្ងៃ' },
  'details.hours': { en: 'Hours', km: 'ម៉ោង' },
  'details.minutes': { en: 'Minutes', km: 'នាទី' },
  'details.seconds': { en: 'Seconds', km: 'វិនាទី' },
  'map.title': { en: 'Location', km: 'ទីតាំង' },
  'map.open': { en: 'Open in Google Maps', km: 'បើកក្នុង Google Maps' },
  'rsvp.title': { en: 'RSVP', km: 'ការឆ្លើយតប' },
  'rsvp.attending': { en: 'Yes, I will attend', km: 'បាទ/ចាស ខ្ញុំនឹងចូលរួម' },
  'rsvp.not_attending': { en: 'Sorry, I cannot attend', km: 'សូមទោស ខ្ញុំមិនអាចចូលរួមបាន' },
  'rsvp.guests': { en: 'Number of guests', km: 'ចំនួនភ្ញៀវ' },
  'rsvp.submit': { en: 'Send RSVP', km: 'ផ្ញើការឆ្លើយតប' },
  'rsvp.success': { en: 'Thank you for your response!', km: 'សូមអរគុណសម្រាប់ការឆ្លើយតប!' },
  'gift.title': { en: 'Wedding Gift', km: 'អំណោយមង្គលការ' },
  'gift.bank': { en: 'Bank Transfer', km: 'ផ្ទេរប្រាក់តាមធនាគារ' },
  'gift.copy': { en: 'Copy Account Number', km: 'ចម្លងលេខគណនី' },
  'gift.copied': { en: 'Copied!', km: 'បានចម្លង!' },
  'contact.title': { en: 'Contact Us', km: 'ទំនាក់ទំនង' },
  'wishes.title': { en: 'Guest Wishes', km: 'ជូនពរដល់គូស្នេហ៍' },
  'wishes.search': { en: 'Search wishes', km: 'ស្វែងរកពាក្យជូនពរ' },
  'wishes.placeholder': { en: 'Write your wishes for the couple...', km: 'សរសេរពាក្យជូនពរជូនគូស្នេហ៍...' },
  'wishes.name': { en: 'Your name', km: 'ឈ្មោះរបស់អ្នក' },
  'wishes.send': { en: 'Send Wishes', km: 'ផ្ញើពាក្យជូនពរ' },
  'wishes.showing': { en: 'Showing', km: 'បង្ហាញ' },
  'wishes.of': { en: 'of', km: 'នៃ' },
  'lang.switch': { en: '🇰🇭 ខ្មែរ', km: '🇬🇧 English' },
  'music.on': { en: '🎵', km: '🎵' },
  'music.off': { en: '🔇', km: '🔇' },
  'admin.title': { en: 'Admin Dashboard', km: 'ផ្ទាំងគ្រប់គ្រង' },
  'admin.guests': { en: 'Guests', km: 'ភ្ញៀវ' },
  'admin.add_guest': { en: 'Add Guest', km: 'បន្ថែមភ្ញៀវ' },
  'admin.photos': { en: 'Photos', km: 'រូបថត' },
  'admin.settings': { en: 'Settings', km: 'ការកំណត់' },
  'admin.rsvp': { en: 'RSVP Responses', km: 'ការឆ្លើយតប' },
  'admin.wishes_tab': { en: 'Wishes', km: 'ពាក្យជូនពរ' },
  'admin.login': { en: 'Admin Login', km: 'ចូលគ្រប់គ្រង' },
  'admin.password': { en: 'Password', km: 'ពាក្យសម្ងាត់' },
  'admin.enter': { en: 'Login', km: 'ចូល' },
  'hub.welcome': { en: 'Welcome to your guest hub', km: 'សូមស្វាគមន៍ទៅកាន់ផតភ្ញៀវ' },
  'hub.welcome_desc': {
    en: 'Find your invitation, complete onboarding, or request team access.',
    km: 'ស្វែងរកសំបុត្រអញ្ជើញ បញ្ចប់ការណែនាំ ឬស្នើសុំសិទ្ធិក្រុម។',
  },
  'hub.request_access': { en: 'Request higher access', km: 'ស្នើសុំសិទ្ធិខ្ពស់ជាង' },
  'hub.find_invite': { en: 'Find your invitation', km: 'ស្វែងរកសំបុត្រអញ្ជើញ' },
  'hub.find_invite_desc': {
    en: 'Enter the code from your couple (e.g. dara-sophea-2025).',
    km: 'បញ្ចូលកូដពីគូស្នេហ៍ (ឧ. dara-sophea-2025)។',
  },
  'hub.slug_placeholder': { en: 'Invitation code / slug', km: 'កូដ ឬ slug សំបុត្រ' },
  'hub.open_invite': { en: 'Open invitation', km: 'បើកសំបុត្រ' },
  'hub.slug_required': { en: 'Please enter an invitation code', km: 'សូមបញ្ចូលកូដសំបុត្រ' },
  'hub.form_required': { en: 'Please complete all fields', km: 'សូមបំពេញព័ត៌មានឲ្យគ្រប់' },
  'hub.access_review': {
    en: 'Your request will be reviewed by administrators.',
    km: 'សំណើរបស់អ្នកនឹងត្រូវពិនិត្យដោយអ្នកគ្រប់គ្រង។',
  },
  'hub.slug_not_found': { en: 'Invitation not found', km: 'រកមិនឃើញសំបុត្រ' },
  'hub.access_submitted': { en: 'Request sent to admins', km: 'បានផ្ញើសំណើទៅអ្នកគ្រប់គ្រង' },
  'hub.atmosphere': { en: 'Atmosphere', km: 'បរិយាកាស' },
  'hub.show_atmosphere': { en: 'Show atmosphere', km: 'បង្ហាញបរិយាកាស' },
  'hub.hide_atmosphere': { en: 'Hide atmosphere', km: 'លាក់បរិយាកាស' },
  'envelope.to': { en: 'To', km: 'ជូនចំពោះ' },
  'error.upload_failed': { en: 'Upload failed', km: 'ការផ្ទុកបរាជ័យ' },
  'error.file_too_large': { en: 'File too large', km: 'ឯកសារធំពេក' },
  'error.mime_not_supported': { en: 'File type not supported', km: 'ប្រភេទឯកសារមិនត្រូវបានគាំទ្ន' },
  'error.save_failed': { en: 'Failed to save', km: 'ការរក្សាទុកបរាជ័យ' },
  'error.load_failed': { en: 'Failed to load', km: 'ការផ្ទុកបរាជ័យ' },
  'success.saved': { en: 'Saved!', km: 'បានរក្សាទុក!' },
  'success.uploaded': { en: 'Uploaded!', km: 'បានផ្ទុក!' },
  'success.added': { en: 'Added!', km: 'បានបន្ថែម!' },
  'success.deleted': { en: 'Deleted!', km: 'បានលុប!' },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const isValidLang = (value: unknown): value is Lang => value === 'en' || value === 'km';

function getDefaultLanguage(): Lang {
  if (typeof window === 'undefined') return 'km';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidLang(saved)) return saved;
  } catch {
    // ignore storage failures
  }
  // Default to Khmer ('km') for guest invitations regardless of browser default
  return 'km';
}

function getLocaleTag(lang: Lang) {
  return lang === 'km' ? 'km-KH' : 'en-US';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getDefaultLanguage);

  useEffect(() => {
    document.documentElement.lang = getLocaleTag(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore localStorage failure */
    }
  }, [lang]);

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  const formatDate = (value?: string | number | Date, options: Intl.DateTimeFormatOptions = {}) => {
    if (value === undefined || value === null || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(getLocaleTag(lang), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(date);
  };

  const formatTime = (value?: string | number | Date, options: Intl.DateTimeFormatOptions = {}) => {
    if (value === undefined || value === null || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(getLocaleTag(lang), {
      hour: 'numeric',
      minute: 'numeric',
      ...options,
    }).format(date);
  };

  const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}): string => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0';
    return new Intl.NumberFormat(getLocaleTag(lang), options).format(value);
  };

  const formatCurrency = (value: number, currency: string = 'KHR'): string => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '០';
    return new Intl.NumberFormat(getLocaleTag(lang), {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'KHR' ? 0 : 2,
      maximumFractionDigits: currency === 'KHR' ? 0 : 2,
    }).format(value);
  };

  const dir: 'ltr' | 'rtl' = 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatDate, formatNumber, formatCurrency, formatTime, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
