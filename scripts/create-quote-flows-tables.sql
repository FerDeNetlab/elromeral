-- ============================================
-- Módulo de Personalización de Boda - El Romeral
-- Creador de Flujos + Cotizaciones Personalizadas
-- ============================================

-- 1. Flujos de cotización
CREATE TABLE IF NOT EXISTS quote_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pasos de cada flujo
CREATE TABLE IF NOT EXISTS quote_flow_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES quote_flows(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo_seleccion TEXT NOT NULL CHECK (tipo_seleccion IN ('unico', 'multiple')) DEFAULT 'unico',
  orden INTEGER NOT NULL DEFAULT 0,
  requerido BOOLEAN DEFAULT true,
  permite_omitir BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Productos disponibles en cada paso
CREATE TABLE IF NOT EXISTS quote_flow_step_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES quote_flow_steps(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(step_id, product_id)
);

-- 4. Cotizaciones generadas por clientes
CREATE TABLE IF NOT EXISTS custom_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  flow_id UUID NOT NULL REFERENCES quote_flows(id) ON DELETE CASCADE,
  nombre_cliente TEXT NOT NULL,
  email TEXT,
  tipo_evento TEXT CHECK (tipo_evento IN ('comida', 'cena')) DEFAULT 'comida',
  num_invitados INTEGER NOT NULL DEFAULT 100,
  selecciones JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_quote_flows_slug ON quote_flows(slug);
CREATE INDEX IF NOT EXISTS idx_quote_flows_activo ON quote_flows(activo);
CREATE INDEX IF NOT EXISTS idx_quote_flow_steps_flow_id ON quote_flow_steps(flow_id);
CREATE INDEX IF NOT EXISTS idx_quote_flow_steps_orden ON quote_flow_steps(flow_id, orden);
CREATE INDEX IF NOT EXISTS idx_quote_flow_step_products_step_id ON quote_flow_step_products(step_id);
CREATE INDEX IF NOT EXISTS idx_custom_quotes_slug ON custom_quotes(slug);
CREATE INDEX IF NOT EXISTS idx_custom_quotes_flow_id ON custom_quotes(flow_id);
CREATE INDEX IF NOT EXISTS idx_custom_quotes_created_at ON custom_quotes(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

-- Quote Flows
ALTER TABLE quote_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de flujos activos" ON quote_flows
  FOR SELECT USING (true);
CREATE POLICY "CRUD autenticado en flujos" ON quote_flows
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Inserción anónima bloqueada en flujos" ON quote_flows
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Update anónimo bloqueado en flujos" ON quote_flows
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Delete anónimo bloqueado en flujos" ON quote_flows
  FOR DELETE TO anon USING (false);

-- Quote Flow Steps
ALTER TABLE quote_flow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de pasos" ON quote_flow_steps
  FOR SELECT USING (true);
CREATE POLICY "CRUD autenticado en pasos" ON quote_flow_steps
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Inserción anónima bloqueada en pasos" ON quote_flow_steps
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Update anónimo bloqueado en pasos" ON quote_flow_steps
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Delete anónimo bloqueado en pasos" ON quote_flow_steps
  FOR DELETE TO anon USING (false);

-- Quote Flow Step Products
ALTER TABLE quote_flow_step_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de step_products" ON quote_flow_step_products
  FOR SELECT USING (true);
CREATE POLICY "CRUD autenticado en step_products" ON quote_flow_step_products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Inserción anónima bloqueada en step_products" ON quote_flow_step_products
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Update anónimo bloqueado en step_products" ON quote_flow_step_products
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Delete anónimo bloqueado en step_products" ON quote_flow_step_products
  FOR DELETE TO anon USING (false);

-- Custom Quotes
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede crear cotización" ON custom_quotes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Lectura pública de cotizaciones por slug" ON custom_quotes
  FOR SELECT USING (true);
CREATE POLICY "CRUD autenticado en cotizaciones" ON custom_quotes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
