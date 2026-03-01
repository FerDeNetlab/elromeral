-- Habilitar RLS en la tabla blocked_dates
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden ver fechas bloqueadas
CREATE POLICY "Authenticated users can view blocked dates"
ON blocked_dates
FOR SELECT
TO authenticated
USING (true);

-- Política: Solo usuarios autenticados pueden insertar fechas bloqueadas
CREATE POLICY "Authenticated users can insert blocked dates"
ON blocked_dates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden actualizar fechas bloqueadas
CREATE POLICY "Authenticated users can update blocked dates"
ON blocked_dates
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden eliminar fechas bloqueadas
CREATE POLICY "Authenticated users can delete blocked dates"
ON blocked_dates
FOR DELETE
TO authenticated
USING (true);
