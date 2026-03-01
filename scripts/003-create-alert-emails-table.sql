-- Crear tabla para almacenar los correos de alerta del equipo
CREATE TABLE IF NOT EXISTS alert_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos correos iniciales (puedes cambiarlos)
INSERT INTO alert_emails (email, nombre, activo) VALUES
  ('admin@elromeral.com.mx', 'Administrador', true)
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS
ALTER TABLE alert_emails ENABLE ROW LEVEL SECURITY;

-- Política para lectura (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden ver correos de alerta"
  ON alert_emails FOR SELECT
  TO authenticated
  USING (true);

-- Política para inserción (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden agregar correos de alerta"
  ON alert_emails FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualización (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden actualizar correos de alerta"
  ON alert_emails FOR UPDATE
  TO authenticated
  USING (true);

-- Política para eliminación (usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden eliminar correos de alerta"
  ON alert_emails FOR DELETE
  TO authenticated
  USING (true);
