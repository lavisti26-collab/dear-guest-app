import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { MUSIC_PLAY_EVENT } from '@/lib/wedding-music';

interface Track {
  name: string;
  url: string;
}

export default function MusicToggle() {
  const { settings } = useWeddingData();
  const [playing, setPlaying] = useState(false);
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
    if (!activeUrl) return;

    if (!audioRef.current || currentUrlRef.current !== activeUrl) {
      audioRef.current?.pause();
      audioRef.current = new Audio(activeUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
      currentUrlRef.current = activeUrl;
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [activeUrl]);

  const togglePlay = () => {
    if (!activeUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(activeUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
      currentUrlRef.current = activeUrl;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  useEffect(() => {
    const handler = () => {
      if (!activeUrl) return;
      if (!audioRef.current || currentUrlRef.current !== activeUrl) {
        audioRef.current?.pause();
        audioRef.current = new Audio(activeUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.25;
        currentUrlRef.current = activeUrl;
      }
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };

    window.addEventListener(MUSIC_PLAY_EVENT, handler);
    return () => window.removeEventListener(MUSIC_PLAY_EVENT, handler);
  }, [activeUrl]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-2xl border border-white/20 flex items-center justify-center text-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        aria-label={playing ? 'Pause music' : 'Play music'}
      >
        {playing ? '⏸' : '▶'}
      </motion.button>
    </div>
  );
}
