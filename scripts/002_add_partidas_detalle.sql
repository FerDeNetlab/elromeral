-- Add column to store detailed breakdown of all selected items
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS partidas_detalle JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN public.quotes.partidas_detalle IS 'Detailed breakdown of all selected items with quantities, unit prices, and totals';
