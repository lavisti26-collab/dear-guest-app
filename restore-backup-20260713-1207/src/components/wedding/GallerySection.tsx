import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData, type Photo } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

const defaultPhotos: Photo[] = [
  { id: 'd1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop', caption: 'Pre-Wedding' },
  { id: 'd2', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&h=300&fit=crop', caption: 'Engagement' },
  { id: 'd3', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=500&fit=crop', caption: 'Wedding Day' },
  { id: 'd4', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop', caption: 'Pre-Wedding' },
  { id: 'd5', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=500&fit=crop', caption: 'Wedding Day' },
  { id: 'd6', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop', caption: 'Engagement' },
];

export default function GallerySection() {
  const { t, lang } = useLanguage();
  const { photos, settings } = useWeddingData();
  const galleryLayout = settings?.coupleCardConfig?.galleryLayout || 'scroll';
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [stackIndex, setStackIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const fontClass = lang === 'km' ? 'font-khmer' : '';
  
  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;

  // Filter display photos based on selected category tab
  const filteredPhotos = displayPhotos.filter(p => {
    if (activeCategory === 'All') return true;
    const cat = p.caption || 'Others';
    return cat === activeCategory;
  });

  const hasMoreThanLimit = filteredPhotos.length > 6;
  const visiblePhotos = (galleryLayout === 'grid' || galleryLayout === 'masonry') && !isExpanded
    ? filteredPhotos.slice(0, 6)
    : filteredPhotos;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [filteredPhotos]);

  // Reset scroll position and scroll buttons when active tab changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      checkScroll();
    }
  }, [activeCategory]);

  // Reset stack index and expanded state when category changes
  useEffect(() => {
    setStackIndex(0);
    setIsExpanded(false);
  }, [activeCategory, filteredPhotos.length]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const navigateLightbox = (dir: number) => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + dir + filteredPhotos.length) % filteredPhotos.length);
  };

  return (
    <motion.section
      id="gallery"
      className="py-14 sm:py-20 px-4 sm:px-5 relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={spring}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('gallery.title')}
        </h2>
        <div className="section-divider mb-6" />

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8">
          {['All', 'Pre-Wedding', 'Engagement', 'Wedding Day', 'Others'].map((cat) => {
            const isActive = activeCategory === cat;
            const hasPhotosOfCat = displayPhotos.some(p => (p.caption || 'Others') === cat || cat === 'All');
            if (!hasPhotosOfCat) return null; // Only show category tab if it has photos

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  lang === 'km' ? 'tracking-normal' : 'tracking-wide'
                } ${
                  isActive
                    ? 'bg-accent text-accent-foreground border-accent shadow-md scale-105'
                    : 'bg-white/40 border-[#E6DFD3]/40 text-muted-foreground backdrop-blur-sm hover:border-accent hover:text-accent'
                }`}
              >
                {lang === 'km'
                  ? cat === 'All' ? 'ទាំងអស់'
                    : cat === 'Pre-Wedding' ? 'មុនថ្ងៃការ'
                    : cat === 'Engagement' ? 'ពិធីភ្ជាប់ពាក្យ'
                    : cat === 'Wedding Day' ? 'ថ្ងៃមង្គលការ'
                    : 'ផ្សេងៗ'
                  : cat
                }
              </button>
            );
          })}
        </div>

        {/* Dynamic Gallery Layout: Grid, Masonry, Stack or Scroll */}
        {galleryLayout === 'grid' ? (
          <div className="relative group">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {visiblePhotos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    className="cursor-pointer group/card relative"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={spring}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <div className="relative overflow-hidden rounded-2xl gold-border shadow-lg transition-all duration-300 hover:shadow-xl aspect-[4/5] sm:aspect-square md:aspect-[3/4]">
                      <img
                        src={photo.url}
                        alt={`Wedding photo ${i + 1}`}
                        className="w-full h-full object-cover transition-all duration-700 group-hover/card:scale-105 group-hover/card:brightness-105"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                        <span className="text-xs font-semibold text-white/80">{photo.caption || 'Others'}</span>
                      </div>
                      
                      {/* Photo category badge */}
                      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-medium group-hover/card:opacity-0 transition-opacity duration-300">
                        {photo.caption || 'Others'}
                      </div>

                      {/* Photo number badge */}
                      <div className="absolute bottom-3 right-3 bg-white/25 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        {i + 1} / {filteredPhotos.length}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : galleryLayout === 'masonry' ? (
          <div className="relative group">
            <div className="columns-2 md:columns-3 gap-3 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {visiblePhotos.map((photo, i) => {
                  const aspectClass = i % 3 === 0 
                    ? 'aspect-[3/4]' 
                    : i % 3 === 1 
                      ? 'aspect-square' 
                      : 'aspect-[4/5]';
                  
                  return (
                    <motion.div
                      key={photo.id}
                      className="break-inside-avoid mb-3 sm:mb-6 relative"
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={spring}
                      onClick={() => setLightboxIndex(i)}
                    >
                      <div className={`relative overflow-hidden rounded-2xl gold-border shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer group/card ${aspectClass}`}>
                        <img
                          src={photo.url}
                          alt={`Wedding photo ${i + 1}`}
                          className="w-full h-full object-cover transition-all duration-700 group-hover/card:scale-105 group-hover/card:brightness-105"
                          loading="lazy"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                          <span className="text-xs font-semibold text-white/80">{photo.caption || 'Others'}</span>
                        </div>
                        
                        {/* Photo category badge */}
                        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-medium group-hover/card:opacity-0 transition-opacity duration-300">
                          {photo.caption || 'Others'}
                        </div>

                        {/* Photo number badge */}
                        <div className="absolute bottom-3 right-3 bg-white/25 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                          {i + 1} / {filteredPhotos.length}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : galleryLayout === 'stack' && filteredPhotos.length > 0 ? (
          <div className="relative flex flex-col items-center justify-center min-h-[440px] py-2">
            <div className="relative w-[280px] sm:w-[320px] aspect-[3/4] h-[370px] sm:h-[420px]">
              <AnimatePresence mode="popLayout">
                {filteredPhotos.map((photo, index) => {
                  let pos = index - stackIndex;
                  if (pos < 0) pos += filteredPhotos.length;

                  const isVisible = pos < 3;
                  if (!isVisible) return null;

                  return (
                    <motion.div
                      key={photo.id}
                      style={{
                        zIndex: 10 - pos,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                      initial={{ scale: 0.9, y: 30, opacity: 0 }}
                      animate={{
                        scale: 1 - pos * 0.05,
                        y: pos * 15,
                        opacity: 1 - pos * 0.3,
                      }}
                      exit={{ scale: 0.8, y: -20, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 80) {
                          setStackIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
                        } else if (info.offset.x < -80) {
                          setStackIndex(prev => (prev + 1) % filteredPhotos.length);
                        }
                      }}
                      onClick={() => {
                        const realIndex = filteredPhotos.findIndex(p => p.id === photo.id);
                        if (realIndex !== -1) setLightboxIndex(realIndex);
                      }}
                      className="cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden shadow-luxury border-b-[3px] border-b-gold bg-card select-none group/stack-card"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4 text-left pointer-events-none">
                        <span className="text-xs font-semibold text-white/80">{photo.caption || 'Others'}</span>
                        <span className="text-[10px] text-white/50">{index + 1} / {filteredPhotos.length}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <button
                type="button"
                onClick={() => setStackIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length)}
                className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-foreground hover:scale-110 active:scale-95 transition-all shadow-md border border-border/30"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest min-w-[60px]">
                {stackIndex + 1} / {filteredPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => setStackIndex(prev => (prev + 1) % filteredPhotos.length)}
                className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-foreground hover:scale-110 active:scale-95 transition-all shadow-md border border-border/30"
                aria-label="Next photo"
              >
                ›
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            {/* Left scroll button */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => scrollBy(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-foreground text-xl shadow-lg hidden md:flex hover:scale-110 transition-transform"
                  aria-label="Scroll left"
                >
                  ‹
                </motion.button>
              )}
            </AnimatePresence>

            {/* Photos strip */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {filteredPhotos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    className="snap-start shrink-0 w-[75vw] sm:w-[320px] md:w-[360px] cursor-pointer group/card relative"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={spring}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <div className="relative overflow-hidden rounded-2xl gold-border shadow-lg transition-shadow duration-300 hover:shadow-xl">
                      <img
                        src={photo.url}
                        alt={`Wedding photo ${i + 1}`}
                        className="w-full h-[50vh] sm:h-[380px] object-cover transition-all duration-700 group-hover/card:scale-110 group-hover/card:brightness-110"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left" />
                      
                      {/* Photo category badge */}
                      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-medium">
                        {photo.caption || 'Others'}
                      </div>

                      {/* Photo number badge */}
                      <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        {i + 1} / {filteredPhotos.length}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right scroll button */}
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => scrollBy(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-foreground text-xl shadow-lg hidden md:flex hover:scale-110 transition-transform"
                  aria-label="Scroll right"
                >
                  ›
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {hasMoreThanLimit && (galleryLayout === 'grid' || galleryLayout === 'masonry') && (
          <motion.div 
            className="mt-8 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`inline-flex items-center gap-2 rounded-full min-h-[40px] px-6 py-2 text-xs font-semibold shadow-luxury gold-border transition-all hover:scale-103 active:scale-97 text-foreground bg-card`}
            >
              {isExpanded ? (
                <>
                  🔼 {lang === 'km' ? 'បង្ហាញតិច' : 'Show Less'}
                </>
              ) : (
                <>
                  🔽 {lang === 'km' ? 'បង្ហាញបន្ថែម' : 'Show More'} (+{filteredPhotos.length - 6})
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Scroll indicator dots (only show for scroll layout) */}
        {galleryLayout === 'scroll' && (
          <div className="flex justify-center gap-1.5 mt-4">
            {filteredPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  scrollRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  lightboxIndex === i ? 'bg-accent w-4' : 'bg-foreground/20 hover:bg-foreground/40'
                }`}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        <p className={`text-xs text-muted-foreground mt-3 ${fontClass}`}>
          {filteredPhotos.length} {lang === 'km' ? 'រូបថត' : 'photos'} • {lang === 'km' ? 'ចុចដើម្បីមើលពេញ' : 'Tap to view'}
        </p>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredPhotos[lightboxIndex].url}
                alt=""
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              {/* Close button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                aria-label="Close"
              >✕</button>
              {/* Navigation */}
              <button
                onClick={() => navigateLightbox(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl hover:bg-white/30 transition-colors"
                aria-label="Previous"
              >‹</button>
              <button
                onClick={() => navigateLightbox(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl hover:bg-white/30 transition-colors"
                aria-label="Next"
              >›</button>
              
              {/* Counter and Caption */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-black/60 backdrop-blur-md rounded-2xl px-5 py-2 text-center text-white">
                <span className="text-xs font-semibold">{filteredPhotos[lightboxIndex].caption || 'Others'}</span>
                <span className="text-[10px] text-white/60">{lightboxIndex + 1} / {filteredPhotos.length}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}