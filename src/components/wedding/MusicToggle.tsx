import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { MUSIC_PLAY_EVENT } from '@/lib/wedding-music';

export default function MusicToggle() {
  const { t } = useLanguage();
  const { settings } = useWeddingData();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string>('');

  const getMusicSource = () => settings.musicFile || settings.musicUrl;

  useEffect(() => {
    const src = getMusicSource();
    if (audioRef.current && currentUrlRef.current !== src) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
    }
  }, [settings.musicUrl, settings.musicFile]);

  const toggle = () => {
    const src = getMusicSource();
    if (!src) return;
    if (!audioRef.current || currentUrlRef.current !== src) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
      currentUrlRef.current = src;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      return;
    }
  };

  // Auto-start music when envelope is opened (user-gesture event satisfies autoplay)
  useEffect(() => {
    const handler = () => {
      const src = getMusicSource();
      if (!src) return;
      if (!audioRef.current || currentUrlRef.current !== src) {
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.25;
        currentUrlRef.current = src;
      }
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    };
    window.addEventListener(MUSIC_PLAY_EVENT, handler);
    return () => window.removeEventListener(MUSIC_PLAY_EVENT, handler);
  }, [settings.musicUrl, settings.musicFile]);

  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center text-base shadow-luxury gold-border"
      style={{
        background: playing
          ? 'linear-gradient(135deg, hsl(38 55% 58%), hsl(38 60% 48%))'
          : 'rgba(255,253,248,.85)',
        color: playing ? 'white' : 'hsl(25 15% 18%)',
        backdropFilter: 'blur(20px)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={playing ? { rotate: [0, 5, -5, 0] } : {}}
      transition={playing ? { duration: 2, repeat: Infinity } : {}}
      aria-label="Toggle music"
    >
      {playing ? '♫' : '♪'}
    </motion.button>
  );
}
