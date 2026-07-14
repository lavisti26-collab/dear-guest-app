import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeddingData } from '@/contexts/WeddingDataContext';
import { MUSIC_PLAY_EVENT } from '@/lib/wedding-music';
import { useTheme } from '@/theme/ThemeEngine';

interface NoteParticle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  emoji: string;
}

export default function MusicToggle() {
  const { settings } = useWeddingData();
  const { isDark } = useTheme();
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string>('');
  const [particles, setParticles] = useState<NoteParticle[]>([]);
  const particleIdRef = useRef(0);

  // Audio track logic
  const track = useMemo(
    () => ({
      name: 'Our Song',
      url: settings.musicFile || settings.musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }),
    [settings.musicFile, settings.musicUrl]
  );

  const activeUrl = track.url;

  useEffect(() => {
    if (!activeUrl) return;

    let localAudio = audioRef.current;
    if (!localAudio || currentUrlRef.current !== activeUrl) {
      localAudio?.pause();
      localAudio = new Audio(activeUrl);
      localAudio.loop = true;
      localAudio.volume = 0.25;
      audioRef.current = localAudio;
      currentUrlRef.current = activeUrl;
    }

    const startPlay = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setPlaying(true);
          })
          .catch(() => {
            // Autoplay blocked by browser. Setup interaction fallback listeners.
            const handleInteraction = () => {
              cleanup();
              if (audioRef.current) {
                audioRef.current.play()
                  .then(() => {
                    setPlaying(true);
                  })
                  .catch(() => {});
              }
            };

            const cleanup = () => {
              window.removeEventListener('click', handleInteraction);
              window.removeEventListener('touchstart', handleInteraction);
            };

            window.addEventListener('click', handleInteraction);
            window.addEventListener('touchstart', handleInteraction);
          });
      }
    };

    startPlay();

    return () => {
      localAudio?.pause();
      if (audioRef.current === localAudio) {
        audioRef.current = null;
      }
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

  // Floating music notes effect
  useEffect(() => {
    if (!playing) {
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      const emojis = ['🎶', '🎵', '♩', '♪', '♫', '♬', '✨'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const id = particleIdRef.current++;
      
      const newParticle: NoteParticle = {
        id,
        x: (Math.random() - 0.5) * 45,
        y: 0,
        rotate: (Math.random() - 0.5) * 60,
        scale: 0.65 + Math.random() * 0.45,
        emoji,
      };

      setParticles((prev) => [...prev.slice(-8), newParticle]);
    }, 1600);

    return () => clearInterval(interval);
  }, [playing]);

  // Waveform visualization logic
  const bars = 5;
  const getRandomHeights = () => {
    return Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
  };

  // Paused baseline wave shapes: [0.2, 0.55, 0.9, 0.55, 0.2]
  const [heights, setHeights] = useState<number[]>([0.2, 0.55, 0.9, 0.55, 0.2]);

  useEffect(() => {
    if (playing) {
      const waveformIntervalId = setInterval(() => {
        setHeights(getRandomHeights());
      }, 100);

      return () => {
        clearInterval(waveformIntervalId);
      };
    }
    // Static beautiful symmetry when paused
    setHeights([0.2, 0.55, 0.9, 0.55, 0.2]);
  }, [playing]);

  const accentColor = settings?.coupleCardConfig?.accentColor || '#D4AF37';

  return (
    <div 
      className="fixed bottom-[84px] sm:bottom-6 right-6 z-40 flex items-center gap-3 justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tiny Hover Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 4, scale: 0.95 }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-sans font-semibold tracking-wider uppercase border shadow-md select-none pointer-events-none ${
              isDark 
                ? 'bg-neutral-900/95 border-white/10 text-white' 
                : 'bg-white/95 border-[#E6DFD3] text-neutral-800'
            }`}
          >
            {playing ? 'Pause Song' : 'Play Song'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating rising notes */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute text-xs font-bold pointer-events-none select-none"
              style={{ 
                left: '50%', 
                bottom: '100%', 
                color: accentColor,
                textShadow: '0 2px 4px rgba(0,0,0,0.06)'
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: p.scale, rotate: p.rotate }}
              animate={{ opacity: [0, 0.85, 0], x: p.x, y: -90, rotate: p.rotate * 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.2, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        initial={{ padding: '14px 14px' }}
        whileHover={{ padding: '16px 22px' }}
        whileTap={{ padding: '16px 22px' }}
        transition={{ duration: 0.8, bounce: 0.55, type: 'spring' }}
        className={`cursor-pointer rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center relative overflow-hidden border ${
          isDark 
            ? 'bg-neutral-950 border-white/10' 
            : 'bg-white border-[#E6DFD3]'
        }`}
        style={{
          borderWidth: '1.5px',
        }}
        type="button"
        aria-label={playing ? 'Pause music' : 'Play music'}
      >
        {/* Pulsing ring when active */}
        {playing && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1.5px solid ${accentColor}40` }}
            animate={{ scale: [1, 1.45], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
          />
        )}

        {/* Skiper25 Micro-Interaction Waveform Container */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          className="flex h-[18px] items-center gap-1 rounded-full relative z-10"
        >
          {heights.map((height, index) => (
            <motion.div
              key={index}
              className={`w-[2.2px] rounded-full ${
                isDark ? 'bg-white' : 'bg-neutral-950'
              }`}
              style={{
                backgroundColor: playing ? accentColor : undefined
              }}
              initial={{ height: 1 }}
              animate={{
                height: Math.max(4, height * 14),
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
              }}
            />
          ))}
        </motion.div>
      </motion.button>
    </div>
  );
}
