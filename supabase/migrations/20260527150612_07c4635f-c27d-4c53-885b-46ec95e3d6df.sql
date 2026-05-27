
-- GUESTS
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rsvp_status TEXT NOT NULL DEFAULT 'pending',
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO anon, authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guests_public_all" ON public.guests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- WISHES
CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishes TO anon, authenticated;
GRANT ALL ON public.wishes TO service_role;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishes_public_all" ON public.wishes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- PHOTOS
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO anon, authenticated;
GRANT ALL ON public.photos TO service_role;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_public_all" ON public.photos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- SETTINGS
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_names TEXT,
  couple_names_km TEXT,
  wedding_date TEXT,
  wedding_date_km TEXT,
  wedding_time TEXT,
  wedding_time_km TEXT,
  venue TEXT,
  venue_km TEXT,
  wedding_date_time TEXT,
  calendar_url TEXT,
  map_lat TEXT,
  map_lng TEXT,
  map_embed_url TEXT,
  contact_telegram TEXT,
  contact_phone TEXT,
  contact_facebook TEXT,
  contact_email TEXT,
  music_url TEXT,
  music_file TEXT,
  hero_image TEXT,
  wedding_description TEXT,
  wedding_description_km TEXT,
  gift_bank_name TEXT,
  gift_bank_account TEXT,
  gift_qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_all" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- PROGRAM SCHEDULE
CREATE TABLE public.program_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_en TEXT,
  time_km TEXT,
  title_en TEXT,
  title_km TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_schedule TO anon, authenticated;
GRANT ALL ON public.program_schedule TO service_role;
ALTER TABLE public.program_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "program_schedule_public_all" ON public.program_schedule FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.program_schedule;

INSERT INTO public.settings (id) VALUES (gen_random_uuid());
