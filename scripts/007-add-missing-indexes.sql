-- Add missing indexes for performance improvement
-- Safe to run multiple times (IF NOT EXISTS prevents errors)

-- contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_nombre_pareja ON contacts(nombre_pareja);

-- cotizaciones table indexes
CREATE INDEX IF NOT EXISTS idx_cotizaciones_contact_id ON cotizaciones(contact_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_slug ON cotizaciones(slug);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at ON cotizaciones(created_at DESC);

-- cotizacion_lineas table indexes
CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_cotizacion_id ON cotizacion_lineas(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_lineas_product_id ON cotizacion_lineas(product_id);

-- quotes table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_slug ON quotes(slug);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);

-- products table indexes
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- alert_emails table indexes
CREATE INDEX IF NOT EXISTS idx_alert_emails_created_at ON alert_emails(created_at DESC);
