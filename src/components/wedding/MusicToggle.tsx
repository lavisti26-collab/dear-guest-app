import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { MUSIC_PLAY_EVENT } from '@/lib/wedding-music';

interface Track {
  name: string;
  url: string;
}

export default function MusicToggle() {
  const { t } = useLanguage();
  const { settings } = useWeddingData();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string>('');

  const track: Track = useMemo(
    () => ({
      name: 'Our Song',
      url: settings.musicFile || settings.musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-bells-2184.mp3',
    }),
    [settings.musicFile, settings.musicUrl]
  );

  const activeUrl = track.url;

  useEffect(() => {
    if (audioRef.current && currentUrlRef.current !== activeUrl) {
      const wasPlaying = playing;
      audioRef.current.pause();
      audioRef.current = new Audio(activeUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      currentUrlRef.current = activeUrl;
      if (wasPlaying) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }
  }, [activeUrl, playing, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!activeUrl) return;
    if (!audioRef.current || currentUrlRef.current !== activeUrl) {
      audioRef.current = new Audio(activeUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      currentUrlRef.current = activeUrl;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => {
      if (!activeUrl) return;
      if (!audioRef.current || currentUrlRef.current !== activeUrl) {
        audioRef.current = new Audio(activeUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
        currentUrlRef.current = activeUrl;
      }
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    };
    window.addEventListener(MUSIC_PLAY_EVENT, handler);
    return () => window.removeEventListener(MUSIC_PLAY_EVENT, handler);
  }, [activeUrl, volume]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end justify-end">
      <motion.div
        layout
        className="glass-strong shadow-luxury border border-accent/20 rounded-3xl overflow-hidden flex items-center gap-3 p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <motion.button
          layout
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md font-semibold text-base animate-pulse-subtle"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
        >
          {playing ? '⏸' : '▶'}
        </motion.button>

        <div className="min-w-[140px]">
          <p className="text-sm font-semibold">{track.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Only the wedding song plays here.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 h-1 rounded-lg bg-border accent-accent cursor-pointer"
          />
        </div>
      </motion.div>
    </div>
  );
}
