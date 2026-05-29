-- Install trigger on auth.users so profiles + defaults auto-create on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users that don't yet have a profile
DO $$
DECLARE u RECORD;
BEGIN
  FOR u IN SELECT id, email FROM auth.users WHERE id NOT IN (SELECT user_id FROM public.profiles) LOOP
    PERFORM public.handle_new_user_backfill(u.id, u.email);
  END LOOP;
EXCEPTION WHEN undefined_function THEN
  -- inline backfill
  FOR u IN SELECT id, email FROM auth.users WHERE id NOT IN (SELECT user_id FROM public.profiles) LOOP
    INSERT INTO public.profiles (user_id, email, display_name, slug)
    VALUES (
      u.id,
      u.email,
      split_part(u.email, '@', 1),
      lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9]+', '-', 'g')) || '-' || substr(u.id::text, 1, 6)
    );
    INSERT INTO public.settings (user_id, couple_names, couple_names_km, wedding_date, venue, gift_enabled)
    VALUES (u.id, 'Bride & Groom', 'កូនកំលោះ និង កូនក្រមុំ', 'TBA', 'TBA', true);
    INSERT INTO public.program_schedule (user_id, order_index, time_en, time_km, title_en, title_km) VALUES
      (u.id, 0, '4:00 PM', '៤:០០ ល្ងាច', 'Welcome Reception', 'ទទួលភ្ញៀវ'),
      (u.id, 1, '5:00 PM', '៥:០០ ល្ងាច', 'Ceremony', 'ពិធីមង្គលការ'),
      (u.id, 2, '7:00 PM', '៧:០០ យប់', 'Dinner & Celebration', 'ពិធីជប់លៀង');
  END LOOP;
END $$;