-- ============================================
-- Módulo de Encuestas - El Romeral
-- ============================================

-- 1. Tabla principal de encuestas
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Preguntas de cada encuesta
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('abierta', 'cerrada')),
  pregunta TEXT NOT NULL,
  opciones TEXT[] DEFAULT '{}',
  orden INTEGER NOT NULL DEFAULT 0,
  requerida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Respuestas de los clientes
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_name TEXT,
  respondent_email TEXT,
  respuestas JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(slug);
CREATE INDEX IF NOT EXISTS idx_surveys_activa ON surveys(activa);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_orden ON survey_questions(survey_id, orden);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

-- Surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de encuestas activas" ON surveys
  FOR SELECT USING (true);

CREATE POLICY "CRUD para usuarios autenticados en surveys" ON surveys
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima de surveys bloqueada" ON surveys
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Update anónimo de surveys bloqueado" ON surveys
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo de surveys bloqueado" ON surveys
  FOR DELETE TO anon USING (false);

-- Survey Questions
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de preguntas" ON survey_questions
  FOR SELECT USING (true);

CREATE POLICY "CRUD para usuarios autenticados en questions" ON survey_questions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Inserción anónima de questions bloqueada" ON survey_questions
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Update anónimo de questions bloqueado" ON survey_questions
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Delete anónimo de questions bloqueado" ON survey_questions
  FOR DELETE TO anon USING (false);

-- Survey Responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede enviar respuestas" ON survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver respuestas" ON survey_responses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lectura anónima de respuestas bloqueada" ON survey_responses
  FOR SELECT TO anon USING (false);
