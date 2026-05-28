
-- ============ CLEAN SLATE: drop existing demo data ============
DELETE FROM public.guests;
DELETE FROM public.wishes;
DELETE FROM public.photos;
DELETE FROM public.program_schedule;
DELETE FROM public.settings;

-- ============ DROP OLD PERMISSIVE POLICIES ============
DROP POLICY IF EXISTS guests_public_all ON public.guests;
DROP POLICY IF EXISTS wishes_public_all ON public.wishes;
DROP POLICY IF EXISTS photos_public_all ON public.photos;
DROP POLICY IF EXISTS program_schedule_public_all ON public.program_schedule;
DROP POLICY IF EXISTS settings_public_all ON public.settings;

-- ============ PROFILES TABLE ============
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  slug text NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'gold',
  is_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can SELECT profile by slug (needed to render public invitations)
CREATE POLICY profiles_public_select ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY profiles_owner_update ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiles_owner_insert ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.get_user_id_by_slug(_slug text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id FROM public.profiles WHERE slug = _slug LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_super_admin FROM public.profiles WHERE user_id = _user_id), false);
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ADD user_id TO EXISTING TABLES ============
ALTER TABLE public.settings ADD COLUMN user_id uuid NOT NULL;
ALTER TABLE public.settings ADD COLUMN gift_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_unique UNIQUE (user_id);

ALTER TABLE public.guests ADD COLUMN user_id uuid NOT NULL;
ALTER TABLE public.guests ADD COLUMN meal_preference text;
ALTER TABLE public.guests ADD COLUMN note text;

ALTER TABLE public.wishes ADD COLUMN user_id uuid NOT NULL;
ALTER TABLE public.photos ADD COLUMN user_id uuid NOT NULL;
ALTER TABLE public.program_schedule ADD COLUMN user_id uuid NOT NULL;

CREATE INDEX idx_guests_user_id ON public.guests(user_id);
CREATE INDEX idx_wishes_user_id ON public.wishes(user_id);
CREATE INDEX idx_photos_user_id ON public.photos(user_id);
CREATE INDEX idx_program_schedule_user_id ON public.program_schedule(user_id);

-- ============ RLS POLICIES FOR DATA TABLES ============
-- SETTINGS
CREATE POLICY settings_public_select ON public.settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY settings_owner_all ON public.settings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- GUESTS: public can INSERT (RSVP) and SELECT (read names); only owner can update/delete
CREATE POLICY guests_public_select ON public.guests
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY guests_public_insert ON public.guests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY guests_owner_update ON public.guests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY guests_owner_delete ON public.guests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WISHES: same as guests (public can write wishes)
CREATE POLICY wishes_public_select ON public.wishes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY wishes_public_insert ON public.wishes
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY wishes_owner_delete ON public.wishes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PHOTOS: owner-managed, public read
CREATE POLICY photos_public_select ON public.photos
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY photos_owner_all ON public.photos
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PROGRAM_SCHEDULE: owner-managed, public read
CREATE POLICY program_public_select ON public.program_schedule
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY program_owner_all ON public.program_schedule
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ AUTO-PROVISION ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- derive slug from email local-part
  base_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'couple'; END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.profiles (user_id, email, display_name, slug)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), final_slug);

  INSERT INTO public.settings (user_id, couple_names, couple_names_km, wedding_date, venue, gift_enabled)
  VALUES (NEW.id, 'Bride & Groom', 'កូនកំលោះ និង កូនក្រមុំ', 'TBA', 'TBA', true);

  INSERT INTO public.program_schedule (user_id, order_index, time_en, time_km, title_en, title_km) VALUES
    (NEW.id, 0, '4:00 PM', '៤:០០ ល្ងាច', 'Welcome Reception', 'ទទួលភ្ញៀវ'),
    (NEW.id, 1, '5:00 PM', '៥:០០ ល្ងាច', 'Ceremony', 'ពិធីមង្គលការ'),
    (NEW.id, 2, '7:00 PM', '៧:០០ យប់', 'Dinner & Celebration', 'ពិធីជប់លៀង');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
