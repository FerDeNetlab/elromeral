-- Agregar columna para guardar el estado completo del configurador
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS configuracion_completa JSONB;

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_quotes_configuracion_completa ON quotes USING GIN (configuracion_completa);
