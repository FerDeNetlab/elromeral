-- Agregar campos para tracking de progreso en cotizaciones
-- current_step: paso actual donde se encuentra el usuario (1-13)
-- is_complete: indica si la cotización fue finalizada
-- last_saved_at: última vez que se guardó progreso

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1;

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS last_saved_at timestamp with time zone DEFAULT now();

-- Actualizar cotizaciones existentes que tienen precio_total como completas
UPDATE quotes 
SET is_complete = true, 
    current_step = 13 
WHERE precio_total IS NOT NULL 
  AND precio_total > 0;

-- Crear índice para búsquedas de cotizaciones incompletas
CREATE INDEX IF NOT EXISTS idx_quotes_is_complete ON quotes(is_complete);
CREATE INDEX IF NOT EXISTS idx_quotes_current_step ON quotes(current_step);

-- Agregar política RLS para permitir actualizar cotizaciones por slug
DROP POLICY IF EXISTS "Anyone can update quotes by slug" ON quotes;
CREATE POLICY "Anyone can update quotes by slug" ON quotes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
