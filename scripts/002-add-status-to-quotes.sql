-- Agregar campo status a la tabla quotes para el CRM Kanban
-- Los estados son: nuevo_lead, contactado, perdido, visito, cotizado, ganado

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'nuevo_lead';

-- Crear índice para mejorar rendimiento de consultas por status
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- Actualizar todas las cotizaciones existentes con status por defecto
UPDATE quotes 
SET status = 'nuevo_lead' 
WHERE status IS NULL;
