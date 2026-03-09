-- Agregar columna incluir_paso_fijo a quote_flows
-- Este campo controla si el paso fijo de "Información básica"
-- (nombre, email, invitados, tipo de evento) se muestra en el flujo público.
-- Default: true (mantiene el comportamiento actual)

ALTER TABLE quote_flows
ADD COLUMN IF NOT EXISTS incluir_paso_fijo BOOLEAN NOT NULL DEFAULT true;
