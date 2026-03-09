-- ============================================
-- Módulo de Contactos y Cotizaciones - El Romeral
-- ============================================

-- 1. Contactos (parejas / clientes)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_pareja TEXT NOT NULL,              -- Ej: "Martha & Kevin"
  email TEXT,
  telefono TEXT,
  fecha_evento DATE,
  num_invitados INTEGER,
  tipo_evento TEXT,                          -- comida, cena, etc.
  notas TEXT,
  origen TEXT NOT NULL DEFAULT 'manual'      -- manual | configurador | planners
    CHECK (origen IN ('manual', 'configurador', 'planners')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cotizaciones (encabezado)
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,                      -- Ej: "Cotización de Adicionales"
  slug TEXT NOT NULL UNIQUE,                 -- Slug único aleatorio para URL pública
  estado TEXT NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada')),
  notas_alcance TEXT,                        -- Notas generales de alcance (texto libre)
  total_estimado DECIMAL(12, 2) DEFAULT 0,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  email_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Líneas de cotización (productos/items)
CREATE TABLE IF NOT EXISTS cotizacion_lineas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  -- Si product_id es null, se usa nombre/descripcion manual
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,                             -- Para agrupar visualmente
  precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 1,
  es_por_invitado BOOLEAN DEFAULT false,     -- ¿Se multiplica por num_invitados?
  nota TEXT,                                 -- Nota especial (ej: "Ya se tienen 15 contratados")
  es_acordado BOOLEAN DEFAULT false,         -- Badge "Acordado"
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_origen ON contacts(origen);
CREATE INDEX IF NOT EXISTS idx_contacts_nombre ON contacts(nombre_pareja);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_slug ON cotizaciones(slug);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_contact_id ON cotizaciones(contact_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at ON cotizaciones(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_cotizacion_id ON cotizacion_lineas(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_product_id ON cotizacion_lineas(product_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_orden ON cotizacion_lineas(orden);

-- ============================================
-- Row Level Security
-- ============================================

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de contactos" ON contacts
  FOR SELECT USING (true);

CREATE POLICY "CRUD autenticado en contactos" ON contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima en contactos" ON contacts
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Update anónimo bloqueado en contactos" ON contacts
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo bloqueado en contactos" ON contacts
  FOR DELETE TO anon USING (false);

-- Cotizaciones
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de cotizaciones" ON cotizaciones
  FOR SELECT USING (true);

CREATE POLICY "CRUD autenticado en cotizaciones" ON cotizaciones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima bloqueada en cotizaciones" ON cotizaciones
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Update anónimo bloqueado en cotizaciones" ON cotizaciones
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo bloqueado en cotizaciones" ON cotizaciones
  FOR DELETE TO anon USING (false);

-- Cotización Líneas
ALTER TABLE cotizacion_lineas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de líneas" ON cotizacion_lineas
  FOR SELECT USING (true);

CREATE POLICY "CRUD autenticado en líneas" ON cotizacion_lineas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima bloqueada en líneas" ON cotizacion_lineas
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Update anónimo bloqueado en líneas" ON cotizacion_lineas
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo bloqueado en líneas" ON cotizacion_lineas
  FOR DELETE TO anon USING (false);
