-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('waiter', 'admin');

-- Create enum for table status
CREATE TYPE table_status AS ENUM ('available', 'occupied');

-- Create enum for order status
CREATE TYPE order_status AS ENUM ('active', 'preparing', 'served');

-- Create users table for authentication and roles
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'waiter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restaurant tables
CREATE TABLE public.restaurant_tables (
  id SERIAL PRIMARY KEY,
  status table_status NOT NULL DEFAULT 'available',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu items
CREATE TABLE public.menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER NOT NULL REFERENCES public.restaurant_tables(id),
  total DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items (junction table)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL -- Store price at time of order
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see themselves (for now we'll make it open for demo)
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);

-- Restaurant tables - everyone can view and update
CREATE POLICY "Everyone can view tables" ON public.restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Everyone can update tables" ON public.restaurant_tables FOR UPDATE USING (true);

-- Menu items - everyone can view
CREATE POLICY "Everyone can view menu items" ON public.menu_items FOR SELECT USING (true);

-- Orders - everyone can view and create
CREATE POLICY "Everyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Everyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update orders" ON public.orders FOR UPDATE USING (true);

-- Order items - everyone can view and create
CREATE POLICY "Everyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Everyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Insert initial data

-- Create 16 restaurant tables
INSERT INTO public.restaurant_tables (id, status) 
SELECT 
  generate_series(1, 16),
  CASE WHEN random() > 0.7 THEN 'occupied'::table_status ELSE 'available'::table_status END;

-- Insert sample menu items
INSERT INTO public.menu_items (name, price, category) VALUES
  ('Margherita Pizza', 12.99, 'Pizza'),
  ('Caesar Salad', 8.99, 'Salads'),
  ('Grilled Chicken', 15.99, 'Mains'),
  ('Fish & Chips', 14.99, 'Mains'),
  ('Pasta Carbonara', 13.99, 'Pasta'),
  ('Chocolate Cake', 6.99, 'Desserts'),
  ('Coffee', 3.99, 'Beverages'),
  ('Orange Juice', 4.99, 'Beverages');

-- Insert demo users
INSERT INTO public.users (username, password_hash, role) VALUES
  ('waiter1', 'demo_hash', 'waiter'),
  ('admin1', 'demo_hash', 'admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();