-- Add reserved status to table_status enum
ALTER TYPE table_status ADD VALUE 'reserved';

-- Add seat_count column to restaurant_tables
ALTER TABLE public.restaurant_tables ADD COLUMN seat_count INTEGER DEFAULT 4;

-- Update existing tables with random seat counts
UPDATE public.restaurant_tables SET seat_count = CASE 
  WHEN id % 4 = 0 THEN 2
  WHEN id % 4 = 1 THEN 4  
  WHEN id % 4 = 2 THEN 6
  ELSE 8
END;