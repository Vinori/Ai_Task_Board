-- Global user role & skills (optional text). Filled from signup user_metadata via trigger below.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS skills_description text;

COMMENT ON COLUMN public.profiles.role IS 'User-declared job role (free text), optional';
COMMENT ON COLUMN public.profiles.skills_description IS 'User skills description for future task matching, optional';

-- Idempotent: works whether or not another trigger already inserted profiles for NEW.id.
CREATE OR REPLACE FUNCTION public.sync_profiles_role_skills_from_user_meta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'role', '')), '');
  v_skills text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'skills_description', '')), '');
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role, skills_description)
  VALUES (NEW.id, NEW.email, NULL, v_role, v_skills)
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role),
    skills_description = COALESCE(EXCLUDED.skills_description, profiles.skills_description);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile_role_skills ON auth.users;

CREATE TRIGGER on_auth_user_created_profile_role_skills
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profiles_role_skills_from_user_meta();
