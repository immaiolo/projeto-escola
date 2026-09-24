/*
# Create alunos (students) table

1. New Tables
- `alunos` — stores student records for the school management exercise.
  - `id` (int, auto-increment, primary key)
  - `nome` (varchar(100), not null) — student name
  - `email` (varchar(100), not null) — student email
  - `curso` (varchar(100), not null) — course name
  - `idade` (int, nullable) — student age
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `alunos`.
- Allow anon + authenticated CRUD because this is a single-tenant exercise app with no sign-in.

3. Seed Data
- Inserts the three example students from the exercise: Ana Souza, Carlos Oliveira, Mariana Santos.
*/

CREATE TABLE IF NOT EXISTS alunos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  curso VARCHAR(100) NOT NULL,
  idade INT,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alunos" ON alunos;
CREATE POLICY "anon_select_alunos" ON alunos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alunos" ON alunos;
CREATE POLICY "anon_insert_alunos" ON alunos FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alunos" ON alunos;
CREATE POLICY "anon_update_alunos" ON alunos FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alunos" ON alunos;
CREATE POLICY "anon_delete_alunos" ON alunos FOR DELETE
TO anon, authenticated USING (true);

INSERT INTO alunos (nome, email, curso, idade)
VALUES
  ('Ana Souza', 'ana@email.com', 'Desenvolvimento de Sistemas', 16),
  ('Carlos Oliveira', 'carlos@email.com', 'Administração', 17),
  ('Mariana Santos', 'mariana@email.com', 'Recursos Humanos', 16)
ON CONFLICT DO NOTHING;