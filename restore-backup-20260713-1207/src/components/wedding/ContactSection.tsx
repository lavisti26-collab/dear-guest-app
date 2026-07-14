import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeddingData } from '@/contexts/WeddingDataContext';

const spring = { type: "spring" as const, duration: 0.8, bounce: 0.08 };

export default function ContactSection() {
  const { t, lang } = useLanguage();
  const { settings } = useWeddingData();

  const contacts = [
    { icon: '📱', label: 'Telegram', href: settings.contactTelegram },
    { icon: '📞', label: 'Phone', href: `tel:${settings.contactPhone}` },
    { icon: '📘', label: 'Facebook', href: settings.contactFacebook },
    { icon: '✉️', label: 'Email', href: `mailto:${settings.contactEmail}` },
  ];

  return (
    <motion.section
      className="py-14 sm:py-20 px-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={spring}
    >
      <div className="max-w-md mx-auto text-center">
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 ${lang === 'km' ? 'font-khmer' : 'font-display'}`}>
          {t('contact.title')}
        </h2>
        <div className="section-divider mb-8" />

        <div className="grid grid-cols-2 gap-3">
          {contacts.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="luxury-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-luxury transition-all"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: i * 0.08 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-medium text-foreground">{c.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
