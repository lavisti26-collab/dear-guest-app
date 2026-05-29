COMMENT ON TABLE public.profiles IS 'Couple profile (cache bump)';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';