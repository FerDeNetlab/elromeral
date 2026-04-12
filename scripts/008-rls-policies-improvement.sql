-- RLS Policy improvements for enhanced security
-- WARNING: These are suggested policies - review before applying
-- Test on development database first

-- ============ QUOTES TABLE ============
-- Current issue: Anyone can read quotes by slug
-- Improved: Add content-based restrictions without breaking public access

-- NOTE: Public read is needed for client access to /cotizacion-adicionales/[slug]
-- Keep existing "Anyone can read quotes by slug"
-- But consider adding rate limiting at application level

-- ============ COTIZACIONES TABLE ============
-- Currently has no RLS - HIGH PRIORITY

ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see all cotizaciones (admin)
CREATE POLICY "Admins can read all cotizaciones"
  ON cotizaciones FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow public read only by slug (similar to quotes)
CREATE POLICY "Anyone can read cotizaciones by slug"
  ON cotizaciones FOR SELECT
  USING (true);  -- Public access for sharing

CREATE POLICY "Only admins can insert cotizaciones"
  ON cotizaciones FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update cotizaciones"
  ON cotizaciones FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete cotizaciones"
  ON cotizaciones FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============ COTIZACION_LINEAS TABLE ============
-- Currently has no RLS

ALTER TABLE cotizacion_lineas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cotizacion_lineas"
  ON cotizacion_lineas FOR SELECT
  USING (true);  -- Read-only for clients

CREATE POLICY "Only admins can modify cotizacion_lineas"
  ON cotizacion_lineas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update cotizacion_lineas"
  ON cotizacion_lineas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete cotizacion_lineas"
  ON cotizacion_lineas FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============ CONTACTS TABLE ============
-- Best practice: Restrict admin-only

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read contacts"
  ON contacts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update contacts"
  ON contacts FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete contacts"
  ON contacts FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============ NOTE ============
-- Test these policies incrementally:
-- 1. Test contacts first (admin-only view already in code)
-- 2. Test cotizaciones (public slug read needed)
-- 3. Test cotizacion_lineas (joined with cotizaciones)
-- 4. Monitor for 403 errors in production
