-- Create quotes table to store all wedding quote configurations
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  fecha_evento DATE,
  num_invitados INTEGER,
  tipo_ceremonia TEXT,
  menu TEXT,
  barra TEXT,
  servicios_adicionales TEXT[] DEFAULT '{}',
  decoracion TEXT,
  precio_total DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Public can insert quotes (no auth required for quote creation)
CREATE POLICY "Anyone can create quotes" 
  ON public.quotes 
  FOR INSERT 
  WITH CHECK (true);

-- Public can read their own quote by slug (no auth required)
CREATE POLICY "Anyone can read quotes by slug" 
  ON public.quotes 
  FOR SELECT 
  USING (true);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS quotes_slug_idx ON public.quotes(slug);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON public.quotes(created_at DESC);
