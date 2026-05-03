-- ============================================================
-- 009 – WhatsApp Bot + Inbox + PWA Integration
-- Safe to run multiple times (IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ============================================================

-- 1. email puede ser NULL para leads que vienen solo de WhatsApp
ALTER TABLE quotes ALTER COLUMN email DROP NOT NULL;

-- 2. Canal de origen
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
UPDATE quotes SET source = 'web' WHERE source IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_source ON quotes(source);

-- 3. Estado de conversación WhatsApp y datos extra en JSONB
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS source_detail JSONB DEFAULT '{}'::jsonb;

-- 4. Campos CRM propios del bot (columnas reales para filtrar/ordenar en admin)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS tipo_evento TEXT;
-- valores: boda | xv_anos | bautizo | corporativo | social

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS calificacion_lead TEXT;
-- valores: bajo | medio | alto

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS inversion_rango TEXT;
-- ejemplo: "280k-450k", "<280k", ">450k"

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS reconsidero_presupuesto BOOLEAN DEFAULT FALSE;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS horario_preferido TEXT;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS etiqueta_wa TEXT;
-- valores: needs_human | not_qualified | calendly_sent | advisor_notified | completed

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS wa_last_message_at TIMESTAMP WITH TIME ZONE;

-- Índices útiles para inbox y CRM
CREATE INDEX IF NOT EXISTS idx_quotes_calificacion     ON quotes(calificacion_lead);
CREATE INDEX IF NOT EXISTS idx_quotes_tipo_evento      ON quotes(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_quotes_etiqueta_wa      ON quotes(etiqueta_wa);
CREATE INDEX IF NOT EXISTS idx_quotes_wa_last_msg      ON quotes(wa_last_message_at DESC);

-- ============================================================
-- 5. Historial de mensajes WhatsApp (inbound + outbound)
-- ============================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  TEXT    UNIQUE NOT NULL,        -- ID de Meta (garantiza idempotencia)
  quote_id    UUID    REFERENCES quotes(id) ON DELETE SET NULL,
  phone       TEXT    NOT NULL,               -- número normalizado sin +
  direction   TEXT    NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  text        TEXT,
  wa_stage    TEXT,                           -- etapa del bot al enviar/recibir
  payload     JSONB   DEFAULT '{}'::jsonb,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_quote_id   ON whatsapp_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_phone      ON whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_wa_messages_created_at ON whatsapp_messages(created_at DESC);

-- RLS: solo admins autenticados leen/escriben mensajes
-- El service_role key del webhook bypasea RLS automáticamente en Supabase
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read whatsapp_messages"   ON whatsapp_messages;
DROP POLICY IF EXISTS "Admins can insert whatsapp_messages" ON whatsapp_messages;

CREATE POLICY "Admins can read whatsapp_messages"
  ON whatsapp_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert whatsapp_messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 6. Suscripciones push para notificaciones PWA (iOS + desktop)
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    TEXT  UNIQUE NOT NULL,
  p256dh      TEXT  NOT NULL,
  auth_key    TEXT  NOT NULL,
  device_info TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage push_subscriptions" ON push_subscriptions;
CREATE POLICY "Admins can manage push_subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');