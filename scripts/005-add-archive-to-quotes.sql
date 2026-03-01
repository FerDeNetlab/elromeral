-- Agregar campo is_archived a la tabla quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar performance en consultas de archivados
CREATE INDEX IF NOT EXISTS idx_quotes_is_archived ON quotes(is_archived);

-- Actualizar cotizaciones existentes
UPDATE quotes SET is_archived = FALSE WHERE is_archived IS NULL;
