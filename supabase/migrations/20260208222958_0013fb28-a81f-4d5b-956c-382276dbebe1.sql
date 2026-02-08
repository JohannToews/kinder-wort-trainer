-- Fix RLS recursion/timeouts: make has_role independent from user_profiles
-- Ensure user_roles.auth_id is populated
UPDATE public.user_roles ur
SET auth_id = up.auth_id
FROM public.user_profiles up
WHERE ur.user_id = up.id
  AND ur.auth_id IS NULL;

-- Optional: speed up role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_auth_id ON public.user_roles (auth_id);

-- Replace has_role implementation to avoid querying user_profiles (which has policies calling has_role)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.auth_id = _user_id
      AND ur.role = _role
  );
$$;