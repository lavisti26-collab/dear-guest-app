import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

function parseCoordinate(value?: string) {
  const number = Number.parseFloat(value ?? '');
  return Number.isFinite(number) ? number : null;
}

function extractCoordinates(url?: string) {
  if (!url) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        lat: Number.parseFloat(match[1]),
        lng: Number.parseFloat(match[2]),
      };
    }
  }

  return null;
}

export default function MapSection() {
  const { t, lang } = useLanguage();
  const { settings } = useWeddingData();
  const fontClass = lang === 'km' ? 'font-khmer' : '';

  const fallbackCoordinates = extractCoordinates(settings.mapEmbedUrl);
  const lat = parseCoordinate(settings.mapLat) ?? fallbackCoordinates?.lat ?? null;
  const lng = parseCoordinate(settings.mapLng) ?? fallbackCoordinates?.lng ?? null;
  const hasCoordinates = lat !== null && lng !== null;
  const bbox = hasCoordinates
    ? `${lng - 0.012},${lat - 0.008},${lng + 0.012},${lat + 0.008}`
    : null;

  const openGoogleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : settings.mapEmbedUrl || '#';
  const openStreetMapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
    : '#';
  const embedUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
    : null;

  return (
    <motion.section
      className="px-5 py-14 sm:py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className={`mb-2 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('map.title')}
        </h2>
        <div className="section-divider mb-8" />

        <div className="luxury-card mb-5 overflow-hidden rounded-[2rem] p-3 sm:p-4">
          {embedUrl ? (
            <div className="overflow-hidden rounded-[1.5rem] gold-border bg-secondary/40">
              <iframe
                src={embedUrl}
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                title="Wedding venue map"
              />
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] bg-secondary/40 px-6 text-center text-muted-foreground">
              <p className={fontClass}>
                {lang === 'km'
                  ? 'សូមបញ្ចូល Latitude និង Longitude ក្នុងផ្ទាំង Admin ដើម្បីបង្ហាញទីតាំង។'
                  : 'Add latitude and longitude in Admin to show the venue location.'}
              </p>
            </div>
          )}

          <div className="px-2 pb-2 pt-4 sm:px-4">
            <p className={`text-xs text-muted-foreground sm:text-sm ${fontClass}`}>
              {lang === 'km'
                ? 'ផែនទីនេះប្រើ OpenStreetMap ដើម្បីឲ្យបើកបានល្អលើទូរស័ព្ទ និងក្នុង preview។'
                : 'This preview now uses OpenStreetMap for better compatibility on mobile and inside the preview.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {openGoogleMapsUrl !== '#' && (
            <motion.a
              href={openGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-gradient-to-br from-accent to-gold px-6 py-3 text-sm font-medium text-accent-foreground shadow-luxury transition-transform ${fontClass}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              📍 {t('map.open')}
            </motion.a>
          )}

          {openStreetMapUrl !== '#' && (
            <motion.a
              href={openStreetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-border/70 bg-card/80 px-6 py-3 text-sm font-medium text-foreground shadow-surface transition-transform ${fontClass}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ✦ OpenStreetMap
            </motion.a>
          )}
        </div>
      </div>
    </motion.section>
  );
}
