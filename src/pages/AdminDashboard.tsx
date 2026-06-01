import React, { useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { useTheme, THEME_INFO } from '@/contexts/ThemeContext';
import InvitationThemePicker from '@/components/dashboard/InvitationThemePicker';
import VisualStylePicker from '@/components/dashboard/VisualStylePicker';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/supabase-storage';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import CinematicTransition from '@/components/effects/CinematicTransition';
import GlowButton from '@/components/effects/GlowButton';
import RoleBasedSticker from '@/components/stickers/RoleBasedSticker';
import DashboardText from '@/components/typography/DashboardText';
import AdminCardGrid from '@/components/layouts/AdminCardGrid';
import ThemeAwareParticles from '@/components/effects/ThemeAwareParticles';

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
      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
        uploading ? 'border-accent/50 opacity-60 pointer-events-none' : dragOver ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
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
          <div className="text-3xl animate-pulse">⏳</div>
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
  const [tab, setTab] = useState<Tab>('guests');
  const data = useWeddingData();
  const { theme, setTheme } = useTheme();
  const [newGuest, setNewGuest] = useState('');
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [musicUploading, setMusicUploading] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedInviteGuest, setSelectedInviteGuest] = useState<{ id: string; name: string } | null>(null);
  const [inviteTemplate, setInviteTemplate] = useState(() => {
    return localStorage.getItem('wedding_invite_template') || 'Hi [Name]! We would love to invite you to our wedding. Please view our invitation and RSVP here: [Link]';
  });

  const baseUrl = window.location.origin;
  const publicUrl = publicSlug ? `${baseUrl}/invite/${publicSlug}` : '';
  const guestUrl = (name: string) => `${publicUrl}?guest=${encodeURIComponent(name)}`;

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

  const mealData = useMemo(() => {
    const mealCounts: { [key: string]: number } = {};
    data.guests.forEach(g => {
      if (g.rsvpStatus === 'attending' && g.mealPreference) {
        const meal = g.mealPreference.trim();
        if (meal) {
          mealCounts[meal] = (mealCounts[meal] || 0) + (g.numberOfGuests || 1);
        }
      }
    });
    return Object.entries(mealCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [data.guests]);

  const getPersonalizedMessage = useCallback((guestName: string) => {
    return inviteTemplate
      .replace(/\[Name\]/g, guestName)
      .replace(/\[Link\]/g, guestUrl(guestName));
  }, [inviteTemplate, publicUrl]);

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

  const downloadQR = (guestName: string) => {
    const svg = document.getElementById(`qr-${guestName}`);
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
      a.download = `invitation-${guestName}.png`;
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
        {/* Premium Header with Role-Based Styling */}
        <header className="glass-strong border-b border-border/30 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <RoleBasedSticker 
              role={isSuperAdmin ? 'super-admin' : 'admin'} 
              variant="primary" 
              size="sm" 
              animated={false}
            />
            <div>
              <DashboardText variant="title" className="font-semibold">
                💍 Wedding Admin
              </DashboardText>
              {isSuperAdmin && (
                <DashboardText variant="label" className="text-xs text-accent">
                  🔒 Super Admin Mode
                </DashboardText>
              )}
            </div>
          </div>
          {isSuperAdmin && (
            <a href="/admin/super" className="text-sm bg-primary/30 rounded-full px-4 py-2 hover:bg-primary/50 transition-colors">👑 Super</a>
          )}
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-accent-foreground bg-accent/20 rounded-full px-4 py-2 hover:bg-accent/30 transition-colors">← View Site</a>
          )}
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Logout
          </button>
        </header>

        {/* Premium Tabs with Glow Effects */}
        <div className="border-b border-border/30 bg-muted/20 px-6 py-4 overflow-x-auto sticky top-[65px] z-20 shadow-sm backdrop-blur-md">
          <div className="tabs tabs-box p-1 bg-background border border-border/30 rounded-2xl flex gap-1 w-max mx-auto shadow-surface">
            {tabs.map(t => (
              <ThemeAwareParticles effect="glow" key={t.key}>
                <button
                  onClick={() => setTab(t.key)}
                  className={`tab tab-md rounded-xl flex flex-col items-center justify-center min-h-[52px] min-w-[70px] px-4 font-bold text-xs whitespace-nowrap transition-all ${
                    tab === t.key 
                      ? 'tab-active bg-accent text-accent-foreground shadow-glow animate-pulse-glow' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                  }`}
                >
                  <span className="text-lg mb-0.5">{t.icon}</span>
                  <span className="text-[10px] uppercase tracking-wider">{t.label}</span>
                </button>
              </ThemeAwareParticles>
            ))}
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

        {/* GUESTS TAB */}
        {tab === 'guests' && (
          <div className="space-y-6">
            {publicUrl && (
              <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
                <div className="bg-card rounded-xl p-3">
                  <QRCodeSVG id="qr-main" value={publicUrl} size={140} fgColor="hsl(30, 10%, 30%)" bgColor="transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your public invitation link</p>
                  <p className="font-medium text-foreground break-all mb-3">{publicUrl}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Link copied!'); }} className="text-xs bg-accent/20 rounded-full px-3 py-1.5 hover:bg-accent/30">📋 Copy link</button>
                    <button onClick={() => downloadQR('main')} className="text-xs bg-accent text-accent-foreground rounded-full px-3 py-1.5">📥 Download QR</button>
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs bg-primary/30 rounded-full px-3 py-1.5">↗ Open</a>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground text-sm">👥 Manage Guest Entry</h3>
                <button
                  type="button"
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                >
                  {showBulkImport ? '⚡ Single Guest Form' : '📦 Paste Bulk Names'}
                </button>
              </div>

              {!showBulkImport ? (
                <form onSubmit={addGuest} className="flex gap-3">
                  <input
                    type="text"
                    value={newGuest}
                    onChange={e => setNewGuest(e.target.value)}
                    placeholder="Guest name..."
                    maxLength={100}
                    className={`flex-1 ${inputClass}`}
                  />
                  <motion.button
                    type="submit"
                    className={saveBtn}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    + Add
                  </motion.button>
                </form>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    placeholder="Enter guest names, one per line (e.g. John Doe, Jane Smith)..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-ring text-sm"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => { setBulkText(''); setShowBulkImport(false); }}
                      className="bg-muted text-muted-foreground rounded-full px-4 py-2 text-xs"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleBulkImport}
                      className="bg-accent text-accent-foreground rounded-full px-5 py-2 text-xs font-semibold"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ⚡ Import List
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Template Editor Collapsible */}
            <div className="glass-card rounded-2xl p-4">
              <details className="group">
                <summary className="list-none flex items-center justify-between cursor-pointer font-display font-semibold text-foreground text-sm">
                  <span>💬 Customize Message Invite Template</span>
                  <span className="text-xs text-accent transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="mt-3 space-y-3">
                  <textarea
                    value={inviteTemplate}
                    onChange={e => {
                      setInviteTemplate(e.target.value);
                      localStorage.setItem('wedding_invite_template', e.target.value);
                    }}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-ring text-xs"
                    placeholder="Use [Name] and [Link] placeholders"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Use <code>[Name]</code> for guest name and <code>[Link]</code> for their personalized invitation link.
                  </p>
                </div>
              </details>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{data.guests.length} guests</span>
              <button onClick={exportCSV} className="text-sm text-accent-foreground bg-accent/20 rounded-full px-4 py-2 hover:bg-accent/30 transition-colors">
                📥 Export CSV
              </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Link</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.guests.map(g => (
                    <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{g.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          g.rsvpStatus === 'attending' ? 'bg-green-100 text-green-800' :
                          g.rsvpStatus === 'not_attending' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {g.rsvpStatus === 'attending' ? '✅ Attending' : g.rsvpStatus === 'not_attending' ? '❌ Not attending' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(guestUrl(g.name));
                            toast.success('Link copied!');
                          }}
                          className="text-accent hover:underline text-xs"
                        >
                          📋 Copy
                        </button>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => setSelectedInviteGuest({ id: g.id, name: g.name })}
                          className="text-xs bg-accent/20 text-accent-foreground rounded-full px-3 py-1.5 hover:bg-accent/30 transition-colors"
                        >
                          💬 Invite
                        </button>
                        <button
                          onClick={() => setSelectedQR(selectedQR === g.name ? null : g.name)}
                          className="text-xs bg-primary/30 rounded-full px-3 py-1.5 hover:bg-primary/50 transition-colors"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => { data.removeGuest(g.id).catch(err => toast.error(err.message || 'Failed to remove guest')); toast.success('Guest removed'); }}
                          className="text-xs text-destructive hover:bg-destructive/10 rounded-full px-3 py-1.5 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.guests.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No guests yet. Add one above!</p>
              )}
            </div>

            {/* QR Modal */}
            <AnimatePresence>
            {selectedQR && (
              <motion.div
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedQR(null)}
              >
                <motion.div
                  className="glass-strong rounded-3xl p-8 text-center max-w-sm w-full"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    Invitation for {selectedQR}
                  </h3>
                  <div className="flex justify-center mb-4 bg-card rounded-2xl p-4">
                    <QRCodeSVG
                      id={`qr-${selectedQR}`}
                      value={guestUrl(selectedQR)}
                      size={256}
                      fgColor="hsl(30, 10%, 30%)"
                      bgColor="transparent"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 break-all">
                    {guestUrl(selectedQR)}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      onClick={() => downloadQR(selectedQR)}
                      className={saveBtn}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      📥 Download
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedQR(null)}
                      className="bg-muted text-muted-foreground rounded-full px-4 py-2 text-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
            {selectedInviteGuest && (
              <motion.div
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedInviteGuest(null)}
              >
                <motion.div
                  className="glass-strong rounded-3xl p-6 text-left max-w-md w-full space-y-4"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Send Invitation to {selectedInviteGuest.name}
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Message Preview</label>
                    <textarea
                      value={getPersonalizedMessage(selectedInviteGuest.name)}
                      readOnly
                      rows={4}
                      className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-foreground resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const msg = encodeURIComponent(getPersonalizedMessage(selectedInviteGuest.name));
                        window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        const msg = encodeURIComponent(getPersonalizedMessage(selectedInviteGuest.name));
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(guestUrl(selectedInviteGuest.name))}&text=${msg}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 bg-[#0088cc] text-white rounded-full py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Telegram
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getPersonalizedMessage(selectedInviteGuest.name));
                        toast.success('Message copied!');
                      }}
                      className="flex-1 bg-accent text-accent-foreground rounded-full py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      📋 Copy Text
                    </button>
                    <button
                      onClick={() => setSelectedInviteGuest(null)}
                      className="bg-muted text-muted-foreground rounded-full px-4 py-2 text-xs"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}

        {/* RSVP TAB */}
        {tab === 'rsvp' && (
          <div className="space-y-6">
            {/* FlyonUI Stats Grid */}
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

            {/* Recharts Analytics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RSVP status Donut Chart */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
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

              {/* Meal Preferences Bar Chart */}
              <div className="glass-card rounded-3xl p-5 space-y-4">
                <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
                  🍽️ Meal Preferences
                </h4>
                <div className="h-64 w-full flex items-center justify-center">
                  {mealData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mealData}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]}>
                          {mealData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-xs">No meal preferences recorded yet</p>
                  )}
                </div>
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Meal</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.guests.map(g => (
                    <tr key={g.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-foreground font-medium">{g.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          g.rsvpStatus === 'attending' ? 'bg-green-100 text-green-800' :
                          g.rsvpStatus === 'not_attending' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {g.rsvpStatus === 'attending' ? '✅ Yes' : g.rsvpStatus === 'not_attending' ? '❌ No' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{g.numberOfGuests}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{g.mealPreference || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate" title={g.note}>{g.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WISHES TAB */}
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
                <p className="text-sm text-muted-foreground">— {w.guestName} · {new Date(w.timestamp).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* PHOTOS TAB */}
        {tab === 'photos' && (
          <div className="space-y-6">
            <div className={sectionCard}>
              <h3 className="font-display text-lg font-semibold text-foreground">📸 Upload Gallery Photos</h3>
              <p className="text-sm text-muted-foreground">Upload photos directly or paste URLs. Photos appear on the invitation page.</p>
              
              {/* Upload area */}
              <ImageUpload
                label="Click to upload a photo"
                bucket="photos"
                onUpload={(url) => { data.addPhoto(url); }}
              />

              {/* URL input */}
              <form onSubmit={e => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem('url') as HTMLInputElement;
                if (input.value.trim()) {
                  data.addPhoto(input.value.trim());
                  input.value = '';
                  toast.success('Photo added!');
                }
              }} className="flex gap-3">
                <input
                  name="url"
                  type="url"
                  placeholder="Or paste image URL..."
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
            </div>

            {data.photos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{data.photos.length} photos uploaded</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.photos.map((p, i) => (
                    <motion.div
                      key={i}
                      className="relative group glass-card rounded-2xl overflow-hidden"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <img src={p} alt="" className="w-full h-40 object-cover" />
                      <button
                        onClick={() => { data.removePhoto(p).catch(err => toast.error(err.message || 'Failed to remove photo')); toast.success('Photo removed'); }}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                      >
                        ✕
                      </button>
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
                  onUpload={(url) => data.updateSettings({ heroImage: url })}
                />
                {data.settings.heroImage && (
                  <button
                    onClick={() => data.updateSettings({ heroImage: '' })}
                    className="text-xs text-destructive mt-2 hover:underline"
                  >
                    Remove & use default
                  </button>
                )}
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                data.updateSettings({
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
                  weddingDescription: fd.get('weddingDescription') as string,
                  weddingDescriptionKm: fd.get('weddingDescriptionKm') as string,
                  eventTitleEn: fd.get('eventTitleEn') as string,
                  eventTitleKm: fd.get('eventTitleKm') as string,
                });
                toast.success('Wedding info saved!');
              }} className="space-y-4">
                <div className="glass-card rounded-2xl p-4 border border-accent/20 space-y-3">
                  <p className="text-sm font-medium text-foreground">Event title (hero & envelope)</p>
                  <p className="text-xs text-muted-foreground">
                    Use for wedding, engagement, or other ceremonies — shown above couple names.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Title (English)</label>
                      <input
                        name="eventTitleEn"
                        defaultValue={data.settings.eventTitleEn}
                        className={inputClass}
                        placeholder="✦  The Wedding of  ✦"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Title (Khmer)</label>
                      <input
                        name="eventTitleKm"
                        defaultValue={data.settings.eventTitleKm}
                        className={inputClass}
                        placeholder="ពិធីមង្គលការ"
                      />
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
                  💾 Save Wedding Info
                </motion.button>
              </form>
            </div>
          </div>
        )}

        {/* PROGRAM SCHEDULE TAB */}
        {tab === 'program' && (
          <div className="space-y-6">
            <div className={sectionCard}>
              <h3 className="font-display text-lg font-semibold text-foreground">📋 Wedding Program Schedule</h3>
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
                    <input name="time_km" className={inputClass} placeholder="07:00 ព្រឹក" required />
                  </div>
                  <div>
                    <label className={labelClass}>Title (EN)</label>
                    <input name="title_en" className={inputClass} placeholder="Guest Reception" required />
                  </div>
                  <div>
                    <label className={labelClass}>Title (KM)</label>
                    <input name="title_km" className={inputClass} placeholder="ពិធីទទួលភ្ញៀវ" required />
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
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              data.updateSettings({
                mapLat: fd.get('mapLat') as string,
                mapLng: fd.get('mapLng') as string,
                mapEmbedUrl: fd.get('mapEmbedUrl') as string,
              });
              toast.success('Map settings saved!');
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
                  Google Maps → Share → Embed → Copy the src="..." URL
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
                💾 Save Map Settings
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
                onUpload={(url) => data.setBankInfo(data.bankName, data.bankAccount, url)}
              />
              {data.bankQR && (
                <button
                  onClick={() => data.setBankInfo(data.bankName, data.bankAccount, '')}
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
              <motion.button
                type="submit"
                className={saveBtn}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                💾 Save Bank Info
              </motion.button>
            </form>
          </div>
        )}

        {/* CONTACTS TAB */}
        {tab === 'contacts' && (
          <div className={sectionCard}>
            <h3 className="font-display text-lg font-semibold text-foreground">📱 Contact Links</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              data.updateSettings({
                contactTelegram: fd.get('contactTelegram') as string,
                contactPhone: fd.get('contactPhone') as string,
                contactFacebook: fd.get('contactFacebook') as string,
                contactEmail: fd.get('contactEmail') as string,
              });
              toast.success('Contact info saved!');
            }} className="space-y-4">
              <div>
                <label className={labelClass}>📱 Telegram URL</label>
                <input name="contactTelegram" defaultValue={data.settings.contactTelegram} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>📞 Phone Number</label>
                <input name="contactPhone" defaultValue={data.settings.contactPhone} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>📘 Facebook URL</label>
                <input name="contactFacebook" defaultValue={data.settings.contactFacebook} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>✉️ Email</label>
                <input name="contactEmail" defaultValue={data.settings.contactEmail} className={inputClass} />
              </div>
              <motion.button
                type="submit"
                className={saveBtn}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                💾 Save Contacts
              </motion.button>
            </form>
          </div>
        )}

        {/* THEME TAB */}
        {tab === 'theme' && (
          <div className="space-y-6">
            <div className={sectionCard}>
              <h3 className="font-display text-lg font-semibold text-foreground">🎨 Invitation Theme</h3>
              <p className="text-sm text-muted-foreground">Choose a romantic theme for your wedding invitation. This changes the color palette and visual mood for all guests.</p>

              <InvitationThemePicker />
            </div>

            <div className={sectionCard}>
              <h3 className="font-display text-lg font-semibold text-foreground">🧩 Visual layout style</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a structural look (borders, shadows, glass, neon) on top of your color theme. Existing palettes are unchanged.
              </p>
              <VisualStylePicker />
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
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  musicUploading
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
                    <div className="text-3xl">🎵</div>
                    <p className="text-sm font-medium text-foreground">Music file uploaded</p>
                    <audio controls src={data.settings.musicFile} className="w-full rounded-xl" />
                    <button
                      onClick={(e) => { e.stopPropagation(); data.updateSettings({ musicFile: '' }); toast.success('Removed uploaded music'); }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove uploaded file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl">🎶</div>
                    <p className="text-sm font-medium text-foreground">Click to upload MP3</p>
                    <p className="text-xs text-muted-foreground">Max 10MB • MP3, WAV, M4A</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">— or —</div>

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
