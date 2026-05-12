-- User-facing «about me» / bio (separate from skills_description for task matching).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS about text;

COMMENT ON COLUMN public.profiles.about IS 'User bio / about me, optional';
