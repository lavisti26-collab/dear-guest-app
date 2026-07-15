import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useWeddingData, CoupleCardConfig, DEFAULT_COUPLE_CARD_CONFIG } from '@/contexts/WeddingDataContext';
import ThemeSelector from '@/components/dashboard/ThemeSelector';
import VisualStylePicker from '@/components/dashboard/VisualStylePicker';
import ThemeStudio from '@/components/dashboard/theme-studio/ThemeStudio';
import ResetThemeButton from '@/components/dashboard/ResetThemeButton';
import { toast } from 'sonner';
import { uploadFile, deleteFileByUrl } from '@/lib/supabase-storage';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import CinematicTransition from '@/components/effects/CinematicTransition';
import GlowButton from '@/components/effects/GlowButton';
import RoleBasedSticker from '@/components/stickers/RoleBasedSticker';
import DashboardText from '@/components/typography/DashboardText';
import AdminCardGrid from '@/components/layouts/AdminCardGrid';
import NavIcon from '@/components/ui/NavIcon';

const spring = { type: "spring" as const, duration: 0.5, bounce: 0.1 };

type Tab = 'guests' | 'rsvp' | 'wishes' | 'photos' | 'wedding' | 'program' | 'map' | 'bank' | 'contacts' | 'music' | 'theme';

function ImageUpload({ onUpload, label, current, accept, bucket, maxSize }: {
  onUpload: (url: string) => void;
  label: string;
  current?: string;
  accept?: string;
  bucket: string;
  maxSize?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const limit = maxSize || 5 * 1024 * 1024;
    if (file.size > limit) {
      toast.error(`File too large (max ${Math.round(limit / 1024 / 1024)}MB)`);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(bucket, file);
      onUpload(url);
      toast.success('Uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUpload, bucket, maxSize]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${uploading ? 'border-accent/50 opacity-60 pointer-events-none' : dragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
        }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept || 'image/*'}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {uploading ? (
        <div className="space-y-2">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-foreground">Uploading...</p>
        </div>
      ) : current ? (
        <div className="space-y-3">
          <img src={current} alt="" className="w-32 h-32 object-cover mx-auto rounded-xl" />
          <p className="text-xs text-muted-foreground">Click or drag to replace</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-3xl">📷</div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Click or drag & drop • Max {Math.round((maxSize || 5 * 1024 * 1024) / 1024 / 1024)}MB</p>
        </div>
      )}
    </div>
  );
}

interface AdminDashboardProps {
  publicSlug?: string;
  isSuperAdmin?: boolean;
}

export default function AdminDashboard({ publicSlug = '', isSuperAdmin = false }: AdminDashboardProps) {
  const data = useWeddingData();
  const [tab, setTab] = useState<Tab>(() => {
    try {
      const storedTab = localStorage.getItem('dear_guest_admin_last_tab') as Tab | null;
      return storedTab || 'guests';
    } catch {
      return 'guests';
    }
  });
  const [newGuest, setNewGuest] = useState('');

  const [eventTitleOpacityState, setEventTitleOpacityState] = useState(() => data.settings.eventTitleOpacity ?? 0.8);
  useEffect(() => {
    if (data.settings.eventTitleOpacity !== undefined) {
      setEventTitleOpacityState(data.settings.eventTitleOpacity);
    }
  }, [data.settings.eventTitleOpacity]);

  const [heroImageOpacityState, setHeroImageOpacityState] = useState(() => data.settings.heroImageOpacity ?? 1.0);
  useEffect(() => {
    if (data.settings.heroImageOpacity !== undefined) {
      setHeroImageOpacityState(data.settings.heroImageOpacity);
    }
  }, [data.settings.heroImageOpacity]);

  const [selectedQR, setSelectedQR] = useState<{ id: string; name: string } | null>(null);
  const [musicUploading, setMusicUploading] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedInviteGuest, setSelectedInviteGuest] = useState<{ id: string; name: string } | null>(null);
  const [inviteTemplate, setInviteTemplate] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Pre-Wedding' | 'Engagement' | 'Wedding Day' | 'Others'>('Others');

  useEffect(() => {
    if (data.ready) {
      setInviteTemplate(
        data.settings.coupleCardConfig?.inviteTemplate ||
          'Hi [Name]! We would love to invite you to our wedding. Please view our invitation and RSVP here: [Link]'
      );
    }
  }, [data.ready, data.settings.coupleCardConfig?.inviteTemplate]);

  const baseUrl = window.location.origin;
  const publicUrl = publicSlug ? `${baseUrl}/invite/${publicSlug}` : '';
  const guestUrl = useCallback((name: string, id?: string) => {
    return `${publicUrl}/to/${encodeURIComponent(name)}`;
  }, [publicUrl]);

  const attendingParties = useMemo(() => data.guests.filter(g => g.rsvpStatus === 'attending').length, [data.guests]);
  const declinedParties = useMemo(() => data.guests.filter(g => g.rsvpStatus === 'not_attending').length, [data.guests]);
  const pendingParties = useMemo(() => data.guests.filter(g => g.rsvpStatus === 'pending').length, [data.guests]);

  const attendingGuestsCount = useMemo(() =>
    data.guests.filter(g => g.rsvpStatus === 'attending').reduce((acc, g) => acc + (g.numberOfGuests || 1), 0),
    [data.guests]
  );

  const declinedGuestsCount = useMemo(() =>
    data.guests.filter(g => g.rsvpStatus === 'not_attending').reduce((acc, g) => acc + (g.numberOfGuests || 1), 0),
    [data.guests]
  );


  const getPersonalizedMessage = useCallback((guestName: string, guestId?: string) => {
    return inviteTemplate
      .replace(/\[Name\]/g, guestName)
      .replace(/\[Link\]/g, guestUrl(guestName, guestId));
  }, [inviteTemplate, guestUrl]);

  if (!data.ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-dashboard">Loading wedding data...</p>
      </div>
    );
  }

  const handleBulkImport = async () => {
    const names = bulkText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      toast.error('Please enter at least one guest name');
      return;
    }

    const toastId = toast.loading(`Importing ${names.length} guests...`);
    let successCount = 0;
    let failCount = 0;

    for (const name of names) {
      try {
        await data.addGuest(name);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    toast.dismiss(toastId);
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} guests!`);
      setBulkText('');
      setShowBulkImport(false);
    }
    if (failCount > 0) {
      toast.error(`Failed to import ${failCount} guests.`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.trim()) return;
    try {
      await data.addGuest(newGuest.trim());
      setNewGuest('');
      toast.success('Guest added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add guest');
    }
  };

  const exportCSV = () => {
    const header = 'Name,RSVP Status,Number of Guests\n';
    const rows = data.guests.map(g => `${g.name},${g.rsvpStatus},${g.numberOfGuests}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadQR = (guestId: string, filename = 'invitation') => {
    const domId = guestId === 'main' ? 'qr-main' : `qr-${guestId.replace(/[^\w-]/g, '_')}`;
    const svg = document.getElementById(domId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.download = `${filename}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'guests', label: 'Guests', icon: '👥' },
    { key: 'rsvp', label: 'RSVP', icon: '📋' },
    { key: 'wishes', label: 'Wishes', icon: '💌' },
    { key: 'photos', label: 'Photos', icon: '📸' },
    { key: 'wedding', label: 'Info', icon: '💍' },
    { key: 'program', label: 'Program', icon: '🗓️' },
    { key: 'map', label: 'Map', icon: '📍' },
    { key: 'bank', label: 'Bank', icon: '🏦' },
    { key: 'contacts', label: 'Contact', icon: '📱' },
    { key: 'music', label: 'Music', icon: '🎵' },
    { key: 'theme', label: 'Theme', icon: '🎨' },
  ];

  const inputClass = "w-full min-h-[48px] rounded-xl border border-border bg-background px-4 text-foreground focus:ring-2 focus:ring-ring";
  const labelClass = "text-sm text-muted-foreground block mb-1 font-medium";
  const sectionCard = "glass-card rounded-3xl p-6 space-y-5";
  const saveBtn = "bg-accent text-accent-foreground rounded-full min-h-[48px] px-6 py-3 shadow-surface font-medium";

  return (
    <CinematicTransition>
      <div className="min-h-screen bg-background">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        <header className="glass-strong border-b border-border/30 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <RoleBasedSticker
              role={isSuperAdmin ? 'super-admin' : 'admin'}
              variant="primary"
              size="sm"
              animated={false}
            />
            <div>
              <h1 className="text-sm sm:text-base font-semibold font-display text-foreground leading-tight">
                💒 Wedding Admin
              </h1>
              {isSuperAdmin && (
                <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                  ⭐ Super Admin Mode
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
            {isSuperAdmin && (
              <a href="/admin/super" className="text-xs sm:text-sm bg-primary/20 rounded-xl px-3 py-1.5 hover:bg-primary/35 transition-colors font-semibold">⭐ Super</a>
            )}
            {publicUrl && (
              <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-accent-foreground bg-accent/15 rounded-xl px-3 py-1.5 hover:bg-accent/25 transition-colors font-semibold">👁 View Site</a>
            )}
            <button onClick={handleLogout} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors font-semibold">
              Logout
            </button>
          </div>
        </header>

        <div className="relative">
          {/* Right-side fade hint — signals more tabs are scrollable on mobile */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background/80 to-transparent z-30" />
        <div
          className="border-b border-border/30 bg-muted/20 px-4 py-3 overflow-x-auto sticky top-[65px] sm:top-[73px] z-20 shadow-sm backdrop-blur-md no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="tabs tabs-box p-1 bg-background border border-border/30 rounded-2xl flex gap-1 w-max mx-auto shadow-surface">
            {tabs.map(t => {
              const navIconStyle = data.settings.coupleCardConfig?.navIconStyle || 'outline';
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    try {
                      localStorage.setItem('dear_guest_admin_last_tab', t.key);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className={`tab tab-md rounded-xl flex flex-col items-center justify-center min-h-[48px] min-w-[65px] sm:min-h-[52px] sm:min-w-[70px] px-3 sm:px-4 font-bold text-xs whitespace-nowrap transition-all duration-150 ${tab === t.key
                      ? 'bg-accent text-accent-foreground shadow-sm scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                    }`}
                >
                  {navIconStyle === 'emoji' ? (
                    <span className="text-lg mb-0.5 filter drop-shadow select-none">{t.icon}</span>
                  ) : (
                    <NavIcon name={t.key} className="mb-0.5" size={20} />
                  )}
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div>

        <main className="max-w-4xl mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

              {tab === 'guests' && (
                <div className="space-y-5">

                  {publicUrl && (
                    <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-white/60 to-amber-50/40 p-5 flex flex-col sm:flex-row gap-5 items-center shadow-lg">
                      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 60%)' }} />
                      <div className="relative z-10 flex-shrink-0 bg-white rounded-2xl p-3 shadow-md border border-amber-100">
                        <QRCodeSVG id="qr-main" value={publicUrl} size={110} fgColor="hsl(30, 20%, 25%)" bgColor="transparent" />
                      </div>
                      <div className="relative z-10 flex-1 min-w-0 space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1">🔗 Your Wedding Invitation Link</p>
                          <p className="text-xs font-mono text-foreground/70 bg-white/60 rounded-lg px-3 py-1.5 border border-amber-100/60 break-all">{publicUrl}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Link copied!'); }}
                            className="flex items-center gap-1.5 text-xs bg-white border border-amber-200 text-amber-700 rounded-full px-3.5 py-2 font-semibold hover:bg-amber-50 transition-colors shadow-sm"
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          >📋 Copy Link</motion.button>
                          <motion.button
                            onClick={() => downloadQR('main', 'wedding-invitation-qr')}
                            className="flex items-center gap-1.5 text-xs bg-amber-500 text-white rounded-full px-3.5 py-2 font-semibold hover:bg-amber-600 transition-colors shadow-sm"
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          >📷 QR Card</motion.button>
                          <a
                            href={publicUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-white/70 border border-border/40 text-foreground rounded-full px-3.5 py-2 font-semibold hover:bg-white transition-colors shadow-sm"
                          >👁 Preview</a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-sm">👥 Guest List</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Add guests to generate personalized invitation links</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBulkImport(!showBulkImport)}
                        className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                      >
                        {showBulkImport ? '← Single' : '📋 Bulk Import'}
                      </button>
                    </div>

                    {!showBulkImport ? (
                      <form onSubmit={addGuest} className="flex gap-3">
                        <input
                          type="text"
                          value={newGuest}
                          onChange={e => setNewGuest(e.target.value)}
                          placeholder="Enter guest full name..."
                          maxLength={100}
                          className={`flex-1 ${inputClass}`}
                        />
                        <motion.button type="submit" className={saveBtn} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          + Add
                        </motion.button>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={bulkText}
                          onChange={e => setBulkText(e.target.value)}
                          placeholder="One name per line, e.g.&#10;Sophea Chan&#10;Dara Pich&#10;Kunthea Mao"
                          rows={5}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-ring text-sm"
                        />
                        <div className="flex gap-3 justify-end">
                          <button type="button" onClick={() => { setBulkText(''); setShowBulkImport(false); }} className="bg-muted text-muted-foreground rounded-full px-4 py-2 text-xs">Cancel</button>
                          <motion.button onClick={handleBulkImport} className="bg-accent text-accent-foreground rounded-full px-5 py-2 text-xs font-semibold" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>💾 Import List</motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="glass-card rounded-2xl p-4">
                    <details className="group">
                      <summary className="list-none flex items-center justify-between cursor-pointer font-display font-semibold text-foreground text-sm">
                        <span>✉️ Invitation Message Template</span>
                        <span className="text-xs text-accent transition-transform group-open:rotate-180">▼</span>
                      </summary>
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={inviteTemplate}
                          onChange={e => setInviteTemplate(e.target.value)}
                          onBlur={() => {
                            data.updateSettings({
                              coupleCardConfig: {
                                ...data.settings.coupleCardConfig,
                                inviteTemplate
                              } as any
                            });
                          }}
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-ring text-xs"
                          placeholder="Use [Name] and [Link] placeholders"
                        />
                        <p className="text-[10px] text-muted-foreground">Use <code>[Name]</code> for guest name and <code>[Link]</code> for their personalized link.</p>
                      </div>
                    </details>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{data.guests.length} guests invited</span>
                    <button onClick={exportCSV} className="text-xs text-accent-foreground bg-accent/20 rounded-full px-4 py-2 hover:bg-accent/30 transition-colors font-semibold">📥 Export CSV</button>
                  </div>

                  <div className="space-y-3">
                    {data.guests.length === 0 && (
                      <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="text-4xl mb-3">👋</div>
                        <p className="text-muted-foreground text-sm">No guests yet. Add the first one above!</p>
                      </div>
                    )}
                    {data.guests.map((g, idx) => {
                      const initials = g.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                      const colors = ['#D4AF37', '#C9627D', '#5B8FA8', '#7B9E6B', '#9B6BAE', '#C97B4B'];
                      const color = colors[idx % colors.length];
                      const link = guestUrl(g.name, g.id);
                      return (
                        <motion.div
                          key={g.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-amber-200/60 hover:shadow-md transition-all duration-200 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm"
                              style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
                            >
                              {initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-foreground">{g.name}</span>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${g.rsvpStatus === 'attending' ? 'bg-emerald-100 text-emerald-700' :
                                    g.rsvpStatus === 'not_attending' ? 'bg-red-100 text-red-600' :
                                      'bg-amber-100 text-amber-600'
                                  }`}>
                                  {g.rsvpStatus === 'attending' ? '✅ Attending' : g.rsvpStatus === 'not_attending' ? '❌ Declined' : '⏳ Pending'}
                                </span>
                                {g.numberOfGuests > 1 && (
                                  <span className="text-[10px] text-muted-foreground">+{g.numberOfGuests - 1} more</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 min-w-0 bg-muted/40 border border-border/30 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                                  <span className="text-[10px] text-amber-500 flex-shrink-0">🔗</span>
                                  <span className="text-[10px] font-mono text-muted-foreground truncate">{link}</span>
                                </div>
                                <motion.button
                                  onClick={() => { navigator.clipboard.writeText(link); toast.success(`${g.name}'s link copied!`); }}
                                  className="flex-shrink-0 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 hover:bg-amber-100 transition-colors"
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                >Copy</motion.button>
                              </div>
                            </div>

                            <div className="flex-shrink-0 flex items-center gap-1.5">
                              <motion.button
                                onClick={() => setSelectedInviteGuest({ id: g.id, name: g.name })}
                                className="text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-2.5 py-1.5 hover:bg-amber-100 transition-colors"
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              >📤 Send</motion.button>
                              <motion.button
                                onClick={() => setSelectedQR(selectedQR?.id === g.id ? null : { id: g.id, name: g.name })}
                                className="text-[10px] font-semibold bg-muted/60 border border-border/40 text-foreground/70 rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors"
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              >📷 QR</motion.button>
                              <motion.button
                                onClick={() => {
                                  if (confirm(`Remove "${g.name}" from the guest list?`)) {
                                    data.removeGuest(g.id).catch(err => toast.error(err.message || 'Failed to remove guest'));
                                  }
                                }}
                                aria-label={`Remove ${g.name} from guest list`}
                                className="text-[10px] font-semibold text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg px-2.5 py-1.5 transition-colors"
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              >❌</motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedQR && (() => {
                      const qrUrl = guestUrl(selectedQR.name, selectedQR.id);
                      return (
                        <motion.div
                          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedQR(null)}
                        >
                          <motion.div
                            className="relative bg-white rounded-3xl overflow-hidden max-w-xs w-full shadow-2xl"
                            initial={{ scale: 0.85, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 20 }}
                            transition={{ type: 'spring', bounce: 0.15 }}
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="relative px-6 pt-8 pb-5 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-center">
                              <div className="absolute top-3 right-3">
                                <button onClick={() => setSelectedQR(null)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-sm">×</button>
                              </div>
                              <p className="text-xs uppercase tracking-widest font-semibold text-amber-100 mb-1">Personalized Invite</p>
                              <h3 className="font-display text-xl font-bold">{selectedQR.name}</h3>
                            </div>
                            <div className="p-6 text-center space-y-4">
                              <div className="inline-flex justify-center bg-white border-4 border-amber-100 rounded-2xl p-3 shadow-sm">
                                <QRCodeSVG
                                  id={`qr-${selectedQR.id}`}
                                  value={qrUrl}
                                  size={200}
                                  fgColor="hsl(30, 20%, 20%)"
                                  bgColor="transparent"
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono break-all bg-muted/30 rounded-lg px-3 py-2">{qrUrl}</p>
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => { navigator.clipboard.writeText(qrUrl); toast.success('Link copied!'); }}
                                  className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl py-2.5 text-xs font-semibold hover:bg-amber-100 transition-colors"
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                >📋 Copy Link</motion.button>
                                <motion.button
                                  onClick={() => downloadQR(selectedQR.id, `invitation-${selectedQR.name}`)}
                                  className="flex-1 bg-amber-500 text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-amber-600 transition-colors"
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                >⬇️ Download</motion.button>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>

                  <AnimatePresence>
                    {selectedInviteGuest && (
                      <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedInviteGuest(null)}
                      >
                        <motion.div
                          className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
                          initial={{ scale: 0.88, y: 20, opacity: 0 }}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          exit={{ scale: 0.88, y: 20, opacity: 0 }}
                          transition={{ type: 'spring', bounce: 0.12 }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-400 to-amber-600">
                            <button onClick={() => setSelectedInviteGuest(null)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-sm">×</button>
                            <p className="text-xs text-amber-100 uppercase tracking-widest font-semibold mb-0.5">Invitation for</p>
                            <h3 className="font-display text-xl font-bold text-white">{selectedInviteGuest.name}</h3>
                          </div>

                          <div className="p-5 space-y-4">
                            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">🔗 Personalized Link</p>
                              <p className="text-[10px] font-mono text-muted-foreground break-all">{decodeURIComponent(guestUrl(selectedInviteGuest.name, selectedInviteGuest.id))}</p>
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => { navigator.clipboard.writeText(guestUrl(selectedInviteGuest.name, selectedInviteGuest.id)); toast.success('Link copied!'); }}
                                  className="text-[10px] font-semibold bg-white border border-amber-200 text-amber-700 rounded-lg px-2.5 py-1.5 hover:bg-amber-50"
                                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                >📋 Copy Link</motion.button>
                                <a href={guestUrl(selectedInviteGuest.name, selectedInviteGuest.id)} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-foreground/60 border border-border/40 rounded-lg px-2.5 py-1.5 hover:bg-muted/30">👁 Preview</a>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Message Preview</label>
                              <textarea
                                value={getPersonalizedMessage(selectedInviteGuest.name, selectedInviteGuest.id)}
                                readOnly
                                rows={4}
                                className="w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-xs text-foreground resize-none focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <motion.button
                                onClick={() => { const msg = encodeURIComponent(getPersonalizedMessage(selectedInviteGuest.name, selectedInviteGuest.id)); window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank'); }}
                                className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-3 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              >💬 WhatsApp</motion.button>
                              <motion.button
                                onClick={() => { const msg = encodeURIComponent(getPersonalizedMessage(selectedInviteGuest.name, selectedInviteGuest.id)); window.open(`https://t.me/share/url?url=${encodeURIComponent(guestUrl(selectedInviteGuest.name, selectedInviteGuest.id))}&text=${msg}`, '_blank'); }}
                                className="flex items-center justify-center gap-2 bg-[#0088cc] text-white rounded-xl py-3 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              >💬 Telegram</motion.button>
                            </div>

                            <motion.button
                              onClick={() => { navigator.clipboard.writeText(getPersonalizedMessage(selectedInviteGuest.name, selectedInviteGuest.id)); toast.success('Message copied!'); }}
                              className="w-full bg-amber-500 text-white rounded-xl py-3 text-xs font-bold hover:bg-amber-600 transition-colors"
                              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                            >📋 Copy Full Message</motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {tab === 'rsvp' && (
                <div className="space-y-6">
                  {data.guests.length === 0 && (
                    <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center gap-3">
                      <div className="text-5xl">📋</div>
                      <h3 className="font-display font-semibold text-foreground">No RSVP data yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Add guests in the <button onClick={() => setTab('guests')} className="text-accent underline hover:opacity-80 transition-opacity font-semibold">Guests tab</button> first,
                        then share their personal invitation links so they can RSVP.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 border border-border/40 p-4 rounded-3xl shadow-surface">
                    <div className="stat p-4 text-center border-r border-border/30 last:border-0 flex flex-col justify-center">
                      <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        👥 Invited
                      </div>
                      <div className="stat-value text-3xl font-extrabold text-foreground">{data.guests.length}</div>
                      <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">Total invited parties</div>
                    </div>

                    <div className="stat p-4 text-center border-r border-border/30 last:border-0 flex flex-col justify-center">
                      <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                        ✅ Attending
                      </div>
                      <div className="stat-value text-3xl font-extrabold text-green-600 dark:text-green-400">{attendingGuestsCount}</div>
                      <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">({attendingParties} parties)</div>
                    </div>

                    <div className="stat p-4 text-center border-r border-border/30 last:border-0 flex flex-col justify-center">
                      <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                        ❌ Declined
                      </div>
                      <div className="stat-value text-3xl font-extrabold text-red-600 dark:text-red-400">{declinedGuestsCount}</div>
                      <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">({declinedParties} parties)</div>
                    </div>

                    <div className="stat p-4 text-center flex flex-col justify-center">
                      <div className="stat-title text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400">
                        ⏳ Pending
                      </div>
                      <div className="stat-value text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">{pendingParties}</div>
                      <div className="stat-desc text-[10px] text-muted-foreground mt-0.5">Awaiting response</div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-5 space-y-4 max-w-lg mx-auto">
                    <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
                      📊 RSVP Distribution
                    </h4>
                    <div className="h-64 w-full flex items-center justify-center">
                      {data.guests.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Attending', value: attendingParties, color: '#10B981' },
                                { name: 'Declined', value: declinedParties, color: '#EF4444' },
                                { name: 'Pending', value: pendingParties, color: '#F59E0B' },
                              ].filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {[
                                { name: 'Attending', value: attendingParties, color: '#10B981' },
                                { name: 'Declined', value: declinedParties, color: '#EF4444' },
                                { name: 'Pending', value: pendingParties, color: '#F59E0B' },
                              ].filter(d => d.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-muted-foreground text-xs">No RSVPs yet to display</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="p-4 bg-muted/30 flex justify-between items-center border-b border-border/30">
                      <span className="font-medium text-foreground">📋 RSVP Responses</span>
                      <div className="flex gap-3 text-sm">
                        <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs">
                          ✅ {data.guests.filter(g => g.rsvpStatus === 'attending').length}
                        </span>
                        <span className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs">
                          ❌ {data.guests.filter(g => g.rsvpStatus === 'not_attending').length}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs">
                          ⏳ {data.guests.filter(g => g.rsvpStatus === 'pending').length}
                        </span>
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground"># Guests</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {data.guests.map(g => (
                          <tr key={g.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3 text-foreground font-medium">{g.name}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${g.rsvpStatus === 'attending' ? 'bg-green-100 text-green-800' :
                                  g.rsvpStatus === 'not_attending' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {g.rsvpStatus === 'attending' ? '✅ Yes' : g.rsvpStatus === 'not_attending' ? '❌ No' : '⏳ Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-foreground">{g.numberOfGuests}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate" title={g.note}>{g.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'wishes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-display text-lg font-semibold text-foreground">💌 Guest Wishes ({data.wishes.length})</h3>
                  </div>
                  {data.wishes.length === 0 && <p className="text-muted-foreground text-center py-8">No wishes yet.</p>}
                  {data.wishes.map(w => (
                    <motion.div
                      key={w.id}
                      className="glass-card rounded-2xl p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-foreground mb-2">"{w.message}"</p>
                      <p className="text-sm text-muted-foreground">👤 {w.guestName} • 📅 {new Date(w.timestamp).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* PHOTOS TAB */}
              {tab === 'photos' && (
                <div className="space-y-6">
                  <div className={sectionCard}>
                    <h3 className="font-display text-lg font-semibold text-foreground">📸 Upload Gallery Photos</h3>
                    
                    {/* Upload area with Category Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
                      <div className="sm:col-span-1">
                        <label className={labelClass}>Upload Category</label>
                        <select
                          value={uploadCategory}
                          onChange={e => setUploadCategory(e.target.value as any)}
                          className={inputClass}
                        >
                          <option value="Pre-Wedding">Pre-Wedding</option>
                          <option value="Engagement">Engagement</option>
                          <option value="Wedding Day">Wedding Day</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <ImageUpload
                          label={`Click to upload to "${uploadCategory}"`}
                          bucket="photos"
                          onUpload={(url) => {
                            data.addPhoto(url, uploadCategory)
                              .then(() => toast.success(`Photo uploaded to ${uploadCategory}!`))
                              .catch(err => toast.error(err.message || 'Upload failed'));
                          }}
                        />
                      </div>
                    </div>

                    {/* URL input */}
                    <form onSubmit={e => {
                      e.preventDefault();
                      const input = (e.target as HTMLFormElement).elements.namedItem('url') as HTMLInputElement;
                      if (input.value.trim()) {
                        data.addPhoto(input.value.trim(), uploadCategory)
                          .then(() => {
                            toast.success(`Photo added to ${uploadCategory}!`);
                            input.value = '';
                          })
                          .catch(err => toast.error(err.message || 'Failed to add'));
                      }
                    }} className="flex gap-3">
                      <input
                        name="url"
                        type="url"
                        placeholder={`Or paste image URL to add to "${uploadCategory}"...`}
                        className={`flex-1 ${inputClass}`}
                      />
                      <motion.button
                        type="submit"
                        className={saveBtn}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        + URL
                      </motion.button>
                    </form>

                    {/* Gallery Layout Style Selector */}
                    <div className="mt-6 pt-6 border-t border-[#E6DFD3]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Gallery Layout Style</h4>
                        <p className="text-xs text-muted-foreground font-sans">Choose how your photo gallery is displayed to guests.</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([
                          { id: 'scroll', label: '↔️ Horizontal Scroll' },
                          { id: 'grid', label: '🎚️ Vertical Grid' },
                          { id: 'masonry', label: '🧱 Asymmetrical Masonry' },
                          { id: 'stack', label: '🃏 3D Card Stack' },
                        ] as const).map((styleOption) => {
                          const cfg = (data.settings.coupleCardConfig as CoupleCardConfig) || ({} as CoupleCardConfig);
                          const currentStyle = cfg.galleryLayout || 'scroll';
                          const isSelected = currentStyle === styleOption.id;
                          const friendlyNames: Record<string, string> = {
                            scroll: 'Scroll',
                            grid: 'Grid',
                            masonry: 'Masonry',
                            stack: '3D Card Stack',
                          };
                          return (
                            <button
                              key={styleOption.id}
                              type="button"
                              onClick={() => {
                                data.updateSettings({
                                  coupleCardConfig: {
                                    ...cfg,
                                    galleryLayout: styleOption.id
                                  }
                                }).then(() => toast.success(`Gallery layout updated to ${friendlyNames[styleOption.id]}!`))
                                  .catch(err => toast.error(err.message || 'Failed to update layout'));
                              }}
                              className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${isSelected
                                  ? 'bg-accent text-accent-foreground border-accent shadow-sm scale-105 font-medium'
                                  : 'bg-white border-[#E6DFD3] text-muted-foreground hover:border-accent hover:text-accent'
                                }`}
                            >
                              <span className="text-xs font-semibold">{styleOption.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {data.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">{data.photos.length} photos uploaded</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {data.photos.map((p, i) => (
                          <motion.div
                            key={p.id}
                            className="relative group glass-card rounded-2xl overflow-hidden border border-[#E6DFD3] flex flex-col justify-between"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="relative overflow-hidden">
                              <img src={p.url} alt="" className="w-full h-40 object-cover" />
                              <button
                                onClick={() => { data.removePhoto(p.id).then(() => toast.success('Photo removed')).catch(err => toast.error(err.message || 'Failed to remove photo')); }}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                              >
                                🗑️
                              </button>
                            </div>

                            {/* Photo Category Picker */}
                            <div className="p-3 bg-card border-t border-[#E6DFD3]/40 flex flex-col gap-2">
                              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category</label>
                              <div className="flex flex-wrap gap-1">
                                {['Pre-Wedding', 'Engagement', 'Wedding Day', 'Others'].map((cat) => {
                                  const isSelected = (p.caption || 'Others') === cat;
                                  return (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        data.updatePhotoCaption(p.id, cat)
                                          .then(() => toast.success('Category updated!'))
                                          .catch(err => toast.error(err.message || 'Failed to update'));
                                      }}
                                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${isSelected
                                          ? 'bg-accent text-accent-foreground border-accent font-medium'
                                          : 'bg-white border-[#E6DFD3] text-muted-foreground hover:border-accent hover:text-accent'
                                        }`}
                                    >
                                      {cat}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.photos.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No photos yet. Default placeholders will be shown.</p>
                  )}
                </div>
              )}

              {/* WEDDING INFO TAB */}
              {tab === 'wedding' && (
                <div className="space-y-6">
                  <div className={sectionCard}>
                    <h3 className="font-display text-lg font-semibold text-foreground">💍 Wedding Details</h3>

                    {/* Hero Image Upload */}
                    <div>
                      <label className={labelClass}>Hero Background Image</label>
                      <ImageUpload
                        label="Upload hero background photo"
                        current={data.settings.heroImage || undefined}
                        bucket="photos"
                        onUpload={async (url) => {
                          if (data.settings.heroImage) {
                            await deleteFileByUrl('photos', data.settings.heroImage).catch(e => console.warn(e));
                          }
                          data.updateSettings({ heroImage: url });
                        }}
                      />
                      {data.settings.heroImage && (
                        <button
                          onClick={async () => {
                            if (data.settings.heroImage) {
                              await deleteFileByUrl('photos', data.settings.heroImage).catch(e => console.warn(e));
                            }
                            data.updateSettings({ heroImage: '' });
                          }}
                          className="text-xs text-destructive mt-2 hover:underline"
                        >
                          Remove & use default
                        </button>
                      )}
                    </div>

                    {/* Link Preview Image Upload */}
                    <div className="mt-4">
                      <label className={labelClass}>Link Preview Image (Social Share)</label>
                      <ImageUpload
                        label="Upload link preview photo"
                        current={data.settings.shareImage || undefined}
                        bucket="photos"
                        onUpload={async (url) => {
                          if (data.settings.shareImage) {
                            await deleteFileByUrl('photos', data.settings.shareImage).catch(e => console.warn(e));
                          }
                          data.updateSettings({ shareImage: url });
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This image appears when sharing your invitation link on Telegram, Facebook, or WhatsApp. (If empty, it falls back to the Hero Background photo).
                      </p>
                      {data.settings.shareImage && (
                        <button
                          onClick={async () => {
                            if (data.settings.shareImage) {
                              await deleteFileByUrl('photos', data.settings.shareImage).catch(e => console.warn(e));
                            }
                            data.updateSettings({ shareImage: '' });
                          }}
                          className="text-xs text-destructive mt-2 hover:underline"
                        >
                          Remove & use fallback
                        </button>
                      )}
                    </div>

                    <form onSubmit={async e => {
                      e.preventDefault();
                      const fd = new FormData(e.target as HTMLFormElement);
                      const promise = data.updateSettings({
                        coupleNames: fd.get('coupleNames') as string,
                        coupleNamesKm: fd.get('coupleNamesKm') as string,
                        weddingDate: fd.get('weddingDate') as string,
                        weddingDateKm: fd.get('weddingDateKm') as string,
                        weddingTime: fd.get('weddingTime') as string,
                        weddingTimeKm: fd.get('weddingTimeKm') as string,
                        venueName: fd.get('venueName') as string,
                        venueNameKm: fd.get('venueNameKm') as string,
                        weddingDateTime: fd.get('weddingDateTime') as string,
                        calendarUrl: fd.get('calendarUrl') as string,
                        heroImageOpacity: parseFloat(fd.get('heroImageOpacity') as string) ?? 1.0,
                        weddingDescription: fd.get('weddingDescription') as string,
                        weddingDescriptionKm: fd.get('weddingDescriptionKm') as string,
                        eventTitleEn: fd.get('eventTitleEn') as string,
                        eventTitleKm: fd.get('eventTitleKm') as string,
                        eventTitleFont: fd.get('eventTitleFont') as string,
                        eventTitleSize: fd.get('eventTitleSize') as string,
                        eventTitleAnimation: fd.get('eventTitleAnimation') as string,
                        eventTitleOpacity: parseFloat(fd.get('eventTitleOpacity') as string) || 0.8,
                        detailsTitleEn: fd.get('detailsTitleEn') as string,
                        detailsTitleKm: fd.get('detailsTitleKm') as string,
                        giftTitleEn: fd.get('giftTitleEn') as string,
                        giftTitleKm: fd.get('giftTitleKm') as string,
                        greetingTitleEn: fd.get('greetingTitleEn') as string,
                        greetingTitleKm: fd.get('greetingTitleKm') as string,
                        timelineTitleEn: fd.get('timelineTitleEn') as string,
                        timelineTitleKm: fd.get('timelineTitleKm') as string,
                        galleryTitleEn: fd.get('galleryTitleEn') as string,
                        galleryTitleKm: fd.get('galleryTitleKm') as string,
                        rsvpTitleEn: fd.get('rsvpTitleEn') as string,
                        rsvpTitleKm: fd.get('rsvpTitleKm') as string,
                        wishesTitleEn: fd.get('wishesTitleEn') as string,
                        wishesTitleKm: fd.get('wishesTitleKm') as string,
                        contactTitleEn: fd.get('contactTitleEn') as string,
                        contactTitleKm: fd.get('contactTitleKm') as string,
                      });
                      toast.promise(promise, {
                        loading: 'Saving wedding info...',
                        success: 'Wedding info saved!',
                        error: (err: any) => `Failed to save: ${err.message || err}`,
                      });
                    }} className="space-y-4">
                      <div className="glass-card rounded-2xl p-4 border border-accent/20 space-y-3">
                        <p className="text-sm font-medium text-foreground">Hero Background Image Opacity</p>
                        <p className="text-xs text-muted-foreground">
                          Control the visibility and brightness of the hero section's background photo.
                        </p>
                        <div>
                          <label className={labelClass}>Hero Background Opacity ({Math.round(heroImageOpacityState * 100)}%)</label>
                          <div className="flex items-center gap-3 min-h-[48px]">
                            <input
                              type="range"
                              name="heroImageOpacity"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={heroImageOpacityState}
                              onChange={(e) => setHeroImageOpacityState(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="glass-card rounded-2xl p-4 border border-accent/20 space-y-3">
                        <p className="text-sm font-medium text-foreground">Event title (hero & envelope)</p>
                        <p className="text-xs text-muted-foreground">
                          Use for wedding, engagement, or other ceremonies • shown above couple names.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Title (English)</label>
                            <input
                              name="eventTitleEn"
                              defaultValue={data.settings.eventTitleEn}
                              className={inputClass}
                              placeholder="✨ The Wedding of ✨"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Title (Khmer)</label>
                            <input
                              name="eventTitleKm"
                              defaultValue={data.settings.eventTitleKm}
                              className={inputClass}
                              placeholder="សំបុត្រមង្គលការ"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-accent/10">
                          <div>
                            <label className={labelClass}>Title Font Style</label>
                            <select
                              name="eventTitleFont"
                              defaultValue={data.settings.eventTitleFont || 'Moul'}
                              className={inputClass}
                            >
                              <optgroup label="Traditional / Header Khmer">
                                <option value="Moul">Moul (Traditional Default)</option>
                                <option value="Koulen">Koulen (Bold Header)</option>
                                <option value="Moulpali">Moulpali</option>
                              </optgroup>
                              <optgroup label="Serif / Classic Khmer">
                                <option value="Hanuman">Hanuman</option>
                                <option value="Noto Serif Khmer">Noto Serif Khmer</option>
                                <option value="Koh Santepheap">Koh Santepheap</option>
                                <option value="Angkor">Angkor</option>
                                <option value="Bayon">Bayon</option>
                                <option value="Chenla">Chenla</option>
                                <option value="Preahvihear">Preahvihear</option>
                              </optgroup>
                              <optgroup label="Sans-Serif / Modern Khmer">
                                <option value="Kantumruy Pro">Kantumruy Pro</option>
                                <option value="Noto Sans Khmer">Noto Sans Khmer</option>
                                <option value="Siemreap">Siemreap</option>
                              </optgroup>
                              <optgroup label="Decorative / Art Khmer">
                                <option value="AKbalthom">AKbalthom KhmerLer</option>
                                <option value="Kh BL LazyOutline">Kh BL LazyOutline</option>
                              </optgroup>
                              <optgroup label="English Elegant Fonts">
                                <option value="Playfair Display">Playfair Display (Serif)</option>
                                <option value="Great Vibes">Great Vibes (Cursive)</option>
                                <option value="Cinzel">Cinzel (Roman)</option>
                                <option value="Inter">Inter (Sans)</option>
                              </optgroup>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Title Font Size</label>
                            <select
                              name="eventTitleSize"
                              defaultValue={data.settings.eventTitleSize || 'text-3xl'}
                              className={inputClass}
                            >
                              <option value="text-xl">Small (text-xl)</option>
                              <option value="text-2xl">Medium (text-2xl)</option>
                              <option value="text-3xl">Large (text-3xl)</option>
                              <option value="text-4xl">Extra Large (text-4xl)</option>
                              <option value="text-5xl">Double XL (text-5xl)</option>
                              <option value="text-6xl">Triple XL (text-6xl)</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Title Animation</label>
                            <select
                              name="eventTitleAnimation"
                              defaultValue={data.settings.eventTitleAnimation || 'fade-up'}
                              className={inputClass}
                            >
                              <option value="none">None (Static)</option>
                              <option value="fade">Fade In</option>
                              <option value="zoom">Zoom In</option>
                              <option value="bounce">Bounce Slide</option>
                              <option value="fade-up">Fade Slide Up</option>
                              <option value="shimmer">Shimmer Pulse</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Title Opacity ({Math.round(eventTitleOpacityState * 100)}%)</label>
                            <div className="flex items-center gap-3 min-h-[48px]">
                              <input
                                type="range"
                                name="eventTitleOpacity"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={eventTitleOpacityState}
                                onChange={(e) => setEventTitleOpacityState(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card rounded-2xl p-4 border border-accent/20 space-y-3">
                        <p className="text-sm font-medium text-foreground">Custom Section Titles (Optional)</p>
                        <p className="text-xs text-muted-foreground">
                          Customize titles for different invitation sections (leaves default if empty).
                        </p>
                        <div className="space-y-4">
                          {/* Details Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Details Title (EN)</label>
                              <input
                                name="detailsTitleEn"
                                defaultValue={data.settings.detailsTitleEn}
                                className={inputClass}
                                placeholder="Wedding Details"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Details Title (KM)</label>
                              <input
                                name="detailsTitleKm"
                                defaultValue={data.settings.detailsTitleKm}
                                className={inputClass}
                                placeholder="ព័ត៌មានសិរីសួស្ដី"
                              />
                            </div>
                          </div>
                          {/* Gift Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Gift Title (EN)</label>
                              <input
                                name="giftTitleEn"
                                defaultValue={data.settings.giftTitleEn}
                                className={inputClass}
                                placeholder="Wedding Gift"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Gift Title (KM)</label>
                              <input
                                name="giftTitleKm"
                                defaultValue={data.settings.giftTitleKm}
                                className={inputClass}
                                placeholder="អំណោយសិរីសួស្ដី"
                              />
                            </div>
                          </div>
                          {/* Timeline Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Timeline Title (EN)</label>
                              <input
                                name="timelineTitleEn"
                                defaultValue={data.settings.timelineTitleEn}
                                className={inputClass}
                                placeholder="Event Timeline"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Timeline Title (KM)</label>
                              <input
                                name="timelineTitleKm"
                                defaultValue={data.settings.timelineTitleKm}
                                className={inputClass}
                                placeholder="កម្មវិធីសិរីសួស្ដី"
                              />
                            </div>
                          </div>
                          {/* Gallery Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Gallery Title (EN)</label>
                              <input
                                name="galleryTitleEn"
                                defaultValue={data.settings.galleryTitleEn}
                                className={inputClass}
                                placeholder="Sweet Moments"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Gallery Title (KM)</label>
                              <input
                                name="galleryTitleKm"
                                defaultValue={data.settings.galleryTitleKm}
                                className={inputClass}
                                placeholder="រូបភាពអនុស្សាវរីយ៍"
                              />
                            </div>
                          </div>
                          {/* RSVP Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>RSVP Title (EN)</label>
                              <input
                                name="rsvpTitleEn"
                                defaultValue={data.settings.rsvpTitleEn}
                                className={inputClass}
                                placeholder="Join Our Day"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>RSVP Title (KM)</label>
                              <input
                                name="rsvpTitleKm"
                                defaultValue={data.settings.rsvpTitleKm}
                                className={inputClass}
                                placeholder="បញ្ជាក់ការចូលរួម"
                              />
                            </div>
                          </div>
                          {/* Wishes Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Wishes Title (EN)</label>
                              <input
                                name="wishesTitleEn"
                                defaultValue={data.settings.wishesTitleEn}
                                className={inputClass}
                                placeholder="Wedding Wishes"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Wishes Title (KM)</label>
                              <input
                                name="wishesTitleKm"
                                defaultValue={data.settings.wishesTitleKm}
                                className={inputClass}
                                placeholder="ប្រសិទ្ធពរជ័យ"
                              />
                            </div>
                          </div>
                          {/* Contact Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Contact Title (EN)</label>
                              <input
                                name="contactTitleEn"
                                defaultValue={data.settings.contactTitleEn}
                                className={inputClass}
                                placeholder="Contact Us"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Contact Title (KM)</label>
                              <input
                                name="contactTitleKm"
                                defaultValue={data.settings.contactTitleKm}
                                className={inputClass}
                                placeholder="ទំនាក់ទំនង"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Couple Names (EN)</label>
                          <input name="coupleNames" defaultValue={data.settings.coupleNames} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Couple Names (KM)</label>
                          <input name="coupleNamesKm" defaultValue={data.settings.coupleNamesKm} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Wedding Date (EN)</label>
                          <input name="weddingDate" defaultValue={data.settings.weddingDate} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Wedding Date (KM)</label>
                          <input name="weddingDateKm" defaultValue={data.settings.weddingDateKm} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Time (EN)</label>
                          <input name="weddingTime" defaultValue={data.settings.weddingTime} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Time (KM)</label>
                          <input name="weddingTimeKm" defaultValue={data.settings.weddingTimeKm} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Venue (EN)</label>
                          <input name="venueName" defaultValue={data.settings.venueName} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Venue (KM)</label>
                          <input name="venueNameKm" defaultValue={data.settings.venueNameKm} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Description (EN)</label>
                        <textarea name="weddingDescription" defaultValue={data.settings.weddingDescription} rows={2} className={`${inputClass} py-3`} />
                      </div>
                      <div>
                        <label className={labelClass}>Description (KM)</label>
                        <textarea name="weddingDescriptionKm" defaultValue={data.settings.weddingDescriptionKm} rows={2} className={`${inputClass} py-3`} />
                      </div>
                      <div>
                        <label className={labelClass}>Wedding Date/Time (countdown)</label>
                        <input name="weddingDateTime" type="datetime-local" defaultValue={(data.settings.weddingDateTime || '').slice(0, 16)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Google Calendar URL</label>
                        <input name="calendarUrl" defaultValue={data.settings.calendarUrl} className={inputClass} />
                      </div>
                      <motion.button
                        type="submit"
                        className={saveBtn}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        ✅ Save Wedding Info
                      </motion.button>
                    </form>
                  </div>

                </div>
              )}

              {/* PROGRAM SCHEDULE TAB */}
              {tab === 'program' && (
                <div className="space-y-6">
                  <div className={sectionCard}>
                    <h3 className="font-display text-lg font-semibold text-foreground">🗓️ Wedding Program Schedule</h3>
                    <p className="text-sm text-muted-foreground">Add and manage the ceremony schedule items shown on the invitation.</p>

                    <form onSubmit={async e => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const fd = new FormData(form);

                      const payload = {
                        time_en: (fd.get('time_en') as string)?.trim(),
                        time_km: (fd.get('time_km') as string)?.trim(),
                        title_en: (fd.get('title_en') as string)?.trim(),
                        title_km: (fd.get('title_km') as string)?.trim(),
                      };

                      if (!payload.time_en || !payload.time_km || !payload.title_en || !payload.title_km) {
                        toast.error('Please fill all program fields.');
                        return;
                      }

                      try {
                        await data.addProgramItem({
                          ...payload,
                          order_index: data.programSchedule.length,
                        });
                        form.reset();
                        toast.success('Program item added to backend!');
                      } catch (err: any) {
                        toast.error('Failed to add: ' + (err.message || 'Unknown error'));
                      }
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Time (EN)</label>
                          <input name="time_en" className={inputClass} placeholder="07:00 AM" required />
                        </div>
                        <div>
                          <label className={labelClass}>Time (KM)</label>
                          <input name="time_km" className={inputClass} placeholder="07:00 ?????" required />
                        </div>
                        <div>
                          <label className={labelClass}>Title (EN)</label>
                          <input name="title_en" className={inputClass} placeholder="Guest Reception" required />
                        </div>
                        <div>
                          <label className={labelClass}>Title (KM)</label>
                          <input name="title_km" className={inputClass} placeholder="?????????????" required />
                        </div>
                      </div>
                      <motion.button
                        type="submit"
                        className={saveBtn}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        + Add Item
                      </motion.button>
                    </form>
                  </div>

                  {data.programSchedule.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">{data.programSchedule.length} items</h4>
                      {data.programSchedule.map((item, i) => (
                        <motion.div
                          key={item.id || i}
                          className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{item.time_en} / {item.time_km}</p>
                            <p className="text-sm text-muted-foreground">{item.title_en} / {item.title_km}</p>
                          </div>
                          {item.id && (
                            <button
                              onClick={async () => {
                                try {
                                  await data.removeProgramItem(item.id!);
                                  toast.success('Item removed');
                                } catch (err: any) {
                                  toast.error('Failed to remove: ' + (err.message || 'Unknown error'));
                                }
                              }}
                              className="text-xs text-destructive hover:bg-destructive/10 rounded-full px-3 py-1.5 transition-colors flex-shrink-0"
                            >
                              Delete
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {data.programSchedule.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No backend program items yet. Add at least one item so guest links show your real schedule.</p>
                  )}
                </div>
              )}

              {/* MAP TAB */}
              {tab === 'map' && (
                <div className={sectionCard}>
                  <h3 className="font-display text-lg font-semibold text-foreground">📍 Map & Location</h3>
                  <p className="text-sm text-muted-foreground">Set the Google Maps embed URL and coordinates.</p>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    const fd = new FormData(e.target as HTMLFormElement);
                    const promise = data.updateSettings({
                      mapLat: fd.get('mapLat') as string,
                      mapLng: fd.get('mapLng') as string,
                      mapEmbedUrl: fd.get('mapEmbedUrl') as string,
                    });
                    toast.promise(promise, {
                      loading: 'Saving map settings...',
                      success: 'Map settings saved!',
                      error: (err: any) => `Failed to save: ${err.message || err}`,
                    });
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Latitude</label>
                        <input name="mapLat" defaultValue={data.settings.mapLat} className={inputClass} placeholder="11.5564" />
                      </div>
                      <div>
                        <label className={labelClass}>Longitude</label>
                        <input name="mapLng" defaultValue={data.settings.mapLng} className={inputClass} placeholder="104.9282" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Google Maps Embed URL</label>
                      <textarea
                        name="mapEmbedUrl"
                        defaultValue={data.settings.mapEmbedUrl}
                        rows={3}
                        className={`${inputClass} py-3 text-sm`}
                        placeholder="Paste the src URL from Google Maps embed..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Google Maps ? Share ? Embed ? Copy the src="..." URL
                      </p>
                    </div>
                    {data.settings.mapEmbedUrl && (
                      <div className="rounded-xl overflow-hidden border border-border/30">
                        <iframe
                          src={data.settings.mapEmbedUrl}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          title="Map preview"
                        />
                      </div>
                    )}
                    <motion.button
                      type="submit"
                      className={saveBtn}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ✅ Save Map Settings
                    </motion.button>
                  </form>
                </div>
              )}

              {/* BANK/GIFT TAB */}
              {tab === 'bank' && (
                <div className={sectionCard}>
                  <h3 className="font-display text-lg font-semibold text-foreground">🏦 Bank & Gift Settings</h3>
                  <p className="text-sm text-muted-foreground">Upload your bank QR code and set account details.</p>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-muted/30">
                    <input type="checkbox" checked={data.giftEnabled} onChange={e => data.setGiftEnabled(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm font-medium">Show gift section on public invitation</span>
                  </label>

                  {/* QR Upload */}
                  <div>
                    <label className={labelClass}>Bank QR Code Image</label>
                    <ImageUpload
                      label="Upload bank QR code"
                      current={data.bankQR || undefined}
                      bucket="photos"
                      onUpload={async (url) => {
                        if (data.bankQR) {
                          await deleteFileByUrl('photos', data.bankQR).catch(e => console.warn(e));
                        }
                        data.setBankInfo(data.bankName, data.bankAccount, url);
                      }}
                    />
                    {data.bankQR && (
                      <button
                        onClick={async () => {
                          if (data.bankQR) {
                            await deleteFileByUrl('photos', data.bankQR).catch(e => console.warn(e));
                          }
                          data.setBankInfo(data.bankName, data.bankAccount, '');
                        }}
                        className="text-xs text-destructive mt-2 hover:underline"
                      >
                        Remove QR image
                      </button>
                    )}
                  </div>

                  <form onSubmit={e => {
                    e.preventDefault();
                    const fd = new FormData(e.target as HTMLFormElement);
                    data.setBankInfo(
                      fd.get('bankName') as string,
                      fd.get('bankAccount') as string,
                      data.bankQR,
                    );
                    toast.success('Bank info saved!');
                  }} className="space-y-4">
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input name="bankName" defaultValue={data.bankName} className={inputClass} placeholder="ABA Bank" />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number</label>
                      <input name="bankAccount" defaultValue={data.bankAccount} className={inputClass} placeholder="001 234 567" />
                    </div>
                    <div>
                      <label className={labelClass}>Envelope Cover Style</label>
                      <select
                        value={data.settings.coupleCardConfig?.giftEnvelopeCover || 'red'}
                        onChange={e => {
                          const cfg = (data.settings.coupleCardConfig || {}) as any;
                          data.updateSettings({
                            coupleCardConfig: {
                              ...cfg,
                              giftEnvelopeCover: e.target.value as any
                            }
                          });
                          toast.success('Envelope cover style updated!');
                        }}
                        className={inputClass}
                      >
                        <option value="red">❤️ Red Romance</option>
                        <option value="khmer">⚜️ Khmer Traditional (Kbach Gold)</option>
                        <option value="dark">🖤 Dark Gold Luxury</option>
                        <option value="blue">💙 Royal Blue</option>
                      </select>
                    </div>
                    <motion.button
                      type="submit"
                      className={saveBtn}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ✅ Save Bank Info
                    </motion.button>
                  </form>
                </div>
              )}

              {/* CONTACTS TAB */}
              {tab === 'contacts' && (
                <div className={sectionCard}>
                  <h3 className="font-display text-lg font-semibold text-foreground">📱 Contact Links</h3>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    const fd = new FormData(e.target as HTMLFormElement);
                    const promise = data.updateSettings({
                      contactTelegram: fd.get('contactTelegram') as string,
                      contactPhone: fd.get('contactPhone') as string,
                      contactFacebook: fd.get('contactFacebook') as string,
                      contactEmail: fd.get('contactEmail') as string,
                    });
                    toast.promise(promise, {
                      loading: 'Saving contacts...',
                      success: 'Contact info saved!',
                      error: (err: any) => `Failed to save: ${err.message || err}`,
                    });
                  }} className="space-y-4">
                    <div>
                      <label className={labelClass}>📩 Telegram URL</label>
                      <input name="contactTelegram" defaultValue={data.settings.contactTelegram} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>📱 Phone Number</label>
                      <input name="contactPhone" defaultValue={data.settings.contactPhone} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>🌐 Facebook URL</label>
                      <input name="contactFacebook" defaultValue={data.settings.contactFacebook} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>📧 Email</label>
                      <input name="contactEmail" defaultValue={data.settings.contactEmail} className={inputClass} />
                    </div>
                    <motion.button
                      type="submit"
                      className={saveBtn}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ✅ Save Contacts
                    </motion.button>
                  </form>
                </div>
              )}

              {/* THEME TAB */}
              {tab === 'theme' && (
                <div className="space-y-5">

                  {/* -- Live Preview Banner --------------------------- */}
                  {publicUrl && (
                    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 animate-pulse">🌟</span>
                        <p className="text-xs font-semibold text-amber-700">Theme changes are live for your guests immediately</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ResetThemeButton />
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs bg-amber-500 text-white rounded-full px-3 py-1.5 font-semibold hover:bg-amber-600 transition-colors">👁 Preview</a>
                      </div>
                    </div>
                  )}
                  {!publicUrl && (
                    <div className="flex items-center justify-between rounded-2xl border border-amber-300/40 bg-amber-50/30 px-5 py-3">
                      <p className="text-sm font-semibold text-foreground">🎨 Theme stuck or not responding?</p>
                      <ResetThemeButton />
                    </div>
                  )}

                  {/* -- Invitation Layout Template -------------------- */}
                  <div className="rounded-3xl border border-border/40 bg-card/60 p-6 space-y-4 shadow-sm">
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">🖱️ Invitation Layout</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose how your invitation pages are arranged for guests</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {([
                        { id: 'classic-scroll', emoji: '🇯️', name: 'Classic Scroll', desc: 'Traditional sections' },
                        { id: 'cinematic', emoji: '🎦', name: 'Cinematic', desc: 'Full-screen snap-scroll' },
                        { id: 'minimal-editorial', emoji: '📰', name: 'Editorial', desc: 'Magazine-style' },
                        { id: 'romantic-bloom', emoji: '🌸', name: 'Romantic Bloom', desc: 'Floral focused' },
                        { id: 'khmer-traditional', emoji: '🏛️', name: 'Khmer Traditional', desc: 'Ornamental panels' },
                        { id: 'card-stack', emoji: '🃏', name: 'Card Stack', desc: '3D stacked cards' },
                        { id: 'newspaper', emoji: '📜', name: 'Newspaper', desc: 'Vintage columns' },
                        { id: 'apple-product', emoji: '✨', name: 'Apple Product', desc: 'Minimal launch style' },
                        { id: 'newspaper-editorial', emoji: '🗞️', name: 'Newspaper Ed.', desc: 'Broadsheet print style' },
                      ] as const).map((layout) => {
                        const current = data.settings.layoutTemplate || 'classic-scroll';
                        const isSelected = current === layout.id;
                        return (
                          <button
                            key={layout.id}
                            type="button"
                            onClick={() => {
                              data.updateSettings({ layoutTemplate: layout.id })
                                .then(() => toast.success(`Layout changed to ${layout.name}!`))
                                .catch(err => toast.error(err.message || 'Failed to update layout'));
                            }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${isSelected
                                ? 'bg-accent text-accent-foreground border-accent shadow-sm scale-[1.03] font-medium'
                                : 'bg-card border-border/40 text-muted-foreground hover:border-accent/60 hover:text-foreground hover:bg-accent/5'
                              }`}
                          >
                            <span className="text-2xl">{layout.emoji}</span>
                            <span className="text-[11px] font-semibold leading-tight">{layout.name}</span>
                            <span className="text-[9px] opacity-70 leading-tight">{layout.desc}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wider">Active</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* -- Color Theme Selector --------------------------- */}
                  <div className="rounded-3xl border border-border/40 bg-card/60 p-6 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">🎨 Color Theme</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Sets the color palette and mood for your entire invitation</p>
                      </div>
                    </div>
                    <ThemeSelector
                      onPersistTheme={(themeId) => {
                        supabase
                          .from('profiles')
                          .update({ theme: themeId })
                          .eq('user_id', data.ownerUserId)
                          .then(({ error }) => {
                            if (error) toast.error('Failed to save theme: ' + error.message);
                            else toast.success('🎨 Theme updated!');
                          });
                      }}
                    />
                  </div>

                  {/* -- Visual Layout Style (VisualStylePicker) --------- */}
                  <div className="rounded-3xl border border-border/40 bg-card/60 p-6 space-y-4 shadow-sm">
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">🌟 Visual Style</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Apply a structural effect on top of your color theme — glass, minimal, romantic, etc.</p>
                    </div>
                    <VisualStylePicker />
                  </div>

                  {/* -- Font & Couple Card Studio ---------------------- */}
                  <div className="rounded-3xl border border-border/40 bg-card/60 p-6 shadow-sm">
                    <ThemeStudio ownerUserId={data.ownerUserId} />
                  </div>

                </div>
              )}

              {/* MUSIC TAB */}
              {tab === 'music' && (
                <div className={sectionCard}>
                  <h3 className="font-display text-lg font-semibold text-foreground">🎵 Background Music</h3>
                  <p className="text-sm text-muted-foreground">Upload an MP3 from your device or paste a URL.</p>

                  {/* Upload from device */}
                  <div>
                    <label className={labelClass}>Upload MP3 from device</label>
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${musicUploading
                          ? 'border-accent/50 opacity-60 pointer-events-none'
                          : 'cursor-pointer border-border hover:border-accent/50'
                        }`}
                      onClick={() => !musicUploading && document.getElementById('music-upload')?.click()}
                    >
                      <input
                        id="music-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('File too large (max 10MB)');
                            return;
                          }
                          setMusicUploading(true);
                          try {
                            if (data.settings.musicFile) {
                              await deleteFileByUrl('music', data.settings.musicFile).catch(e => console.warn(e));
                            }
                            const url = await uploadFile('music', file);
                            data.updateSettings({ musicFile: url });
                            toast.success('Music uploaded! 🎵');
                          } catch (err: any) {
                            toast.error(err.message || 'Upload failed');
                          } finally {
                            setMusicUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                      {musicUploading ? (
                        <div className="space-y-2">
                          <div className="text-3xl animate-pulse">⏳</div>
                          <p className="text-sm font-medium text-foreground">Uploading music...</p>
                        </div>
                      ) : data.settings.musicFile ? (
                        <div className="space-y-3">
                          <div className="text-3xl">🎶</div>
                          <p className="text-sm font-medium text-foreground">Music file uploaded</p>
                          <audio controls src={data.settings.musicFile} className="w-full rounded-xl" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (data.settings.musicFile) {
                                await deleteFileByUrl('music', data.settings.musicFile).catch(e => console.warn(e));
                              }
                              data.updateSettings({ musicFile: '' });
                              toast.success('Removed uploaded music');
                            }}
                            className="text-xs text-destructive hover:underline"
                          >
                            Remove uploaded file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-3xl">🎵</div>
                          <p className="text-sm font-medium text-foreground">Click to upload MP3</p>
                          <p className="text-xs text-muted-foreground">Max 10MB — MP3, WAV, M4A</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">─ or ─</div>

                  <form onSubmit={e => {
                    e.preventDefault();
                    const fd = new FormData(e.target as HTMLFormElement);
                    data.updateSettings({ musicUrl: fd.get('musicUrl') as string });
                    toast.success('Music URL saved!');
                  }} className="space-y-4">
                    <div>
                      <label className={labelClass}>Music URL (MP3)</label>
                      <input name="musicUrl" defaultValue={data.settings.musicUrl} className={inputClass} placeholder="https://example.com/romantic-song.mp3" />
                      <p className="text-xs text-muted-foreground mt-1">Uploaded file takes priority over URL.</p>
                    </div>
                    {data.settings.musicUrl && !data.settings.musicFile && (
                      <div>
                        <label className={labelClass}>Preview</label>
                        <audio controls src={data.settings.musicUrl} className="w-full rounded-xl" />
                      </div>
                    )}
                    <motion.button
                      type="submit"
                      className={saveBtn}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      💾 Save Music
                    </motion.button>
                  </form>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </CinematicTransition>
  );
}
