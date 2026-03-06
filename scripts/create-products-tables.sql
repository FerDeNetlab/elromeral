-- ============================================
-- Módulo de Productos y Servicios - El Romeral
-- ============================================

-- 1. Categorías de productos/servicios
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Productos y servicios
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  -- Tipo de precio: 'fijo' = precio único, 'por_invitado' = varía según invitados
  tipo_precio TEXT NOT NULL CHECK (tipo_precio IN ('fijo', 'por_invitado')) DEFAULT 'fijo',
  -- Precio fijo o precio por persona (según tipo_precio)
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  -- URL de la imagen del producto
  imagen_url TEXT,
  -- Categoría
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  -- Estado
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_product_categories_orden ON product_categories(orden);
CREATE INDEX IF NOT EXISTS idx_product_categories_activa ON product_categories(activa);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
CREATE INDEX IF NOT EXISTS idx_products_tipo_precio ON products(tipo_precio);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

-- Product Categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de categorías" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "CRUD autenticado en categorías" ON product_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima bloqueada en categorías" ON product_categories
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Update anónimo bloqueado en categorías" ON product_categories
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo bloqueado en categorías" ON product_categories
  FOR DELETE TO anon USING (false);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos" ON products
  FOR SELECT USING (true);

CREATE POLICY "CRUD autenticado en productos" ON products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima bloqueada en productos" ON products
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Update anónimo bloqueado en productos" ON products
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo bloqueado en productos" ON products
  FOR DELETE TO anon USING (false);

-- ============================================
-- Configuración de Storage para imágenes
-- ============================================
-- NOTA: Ejecutar esto por separado en Supabase si es necesario:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- CREATE POLICY "Lectura pública de imágenes" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Upload autenticado de imágenes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
-- CREATE POLICY "Update autenticado de imágenes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
-- CREATE POLICY "Delete autenticado de imágenes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
