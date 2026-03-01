-- Crear tabla de planners
CREATE TABLE IF NOT EXISTS planners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campo planner_id a quotes para identificar consultas de planners
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS planner_id UUID REFERENCES planners(id);

-- Agregar campo is_planner_inquiry para marcar consultas de planners
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_planner_inquiry BOOLEAN DEFAULT FALSE;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_quotes_planner_id ON quotes(planner_id);
CREATE INDEX IF NOT EXISTS idx_quotes_is_planner_inquiry ON quotes(is_planner_inquiry);
CREATE INDEX IF NOT EXISTS idx_planners_email ON planners(email);

-- Habilitar RLS
ALTER TABLE planners ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Planners are viewable by authenticated users" ON planners
  FOR SELECT TO authenticated USING (true);

-- Política para inserción pública (los planners se registran solos)
CREATE POLICY "Anyone can insert planners" ON planners
  FOR INSERT TO anon, authenticated WITH CHECK (true);
