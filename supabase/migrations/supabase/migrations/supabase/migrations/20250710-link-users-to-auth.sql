-- 1. Add auth_user_id to public.users if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- 2. Remove the old open RLS policy (if it exists)
DROP POLICY IF EXISTS "Users can view all users" ON public.users;

-- 3. Add a secure RLS policy: users can only view their own row via Supabase Auth
CREATE POLICY "Users can view themselves" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);