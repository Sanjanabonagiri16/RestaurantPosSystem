-- 1. Automated user profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, username, password_hash, role)
  VALUES (NEW.id, NEW.email, 'supabase_auth', 'waiter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Example production-grade RLS policies
-- Only allow users to view and create their own orders
DROP POLICY IF EXISTS "Everyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Everyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Everyone can update orders" ON public.orders;

CREATE POLICY "Users can view their orders" ON public.orders
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.id = user_id));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.id = user_id));

CREATE POLICY "Users can update their orders" ON public.orders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.id = user_id));

-- Only allow users to view and create their own order_items
DROP POLICY IF EXISTS "Everyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Everyone can create order items" ON public.order_items;

CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.users u ON o.user_id = u.id WHERE o.id = order_id AND u.auth_user_id = auth.uid()));

CREATE POLICY "Users can create their order items" ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders o JOIN public.users u ON o.user_id = u.id WHERE o.id = order_id AND u.auth_user_id = auth.uid())); 