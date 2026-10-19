/*
# Create alunos table (single-tenant, no auth)

1. New Tables
- `alunos`
  - `id` (int, primary key, auto-incrementing) — student identifier
  - `nome` (text, not null) — student full name
  - `email` (text, not null) — student email
  - `curso` (text, not null) — course name
  - `idade` (int, not null) — student age
  - `created_at` (timestamptz, default now()) — record creation timestamp

2. Security
- Enable RLS on `alunos`.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public
  (no sign-in screen in this app).

3. Important Notes
- Uses SERIAL so the id auto-increments like a MariaDB AUTO_INCREMENT.
- All four CRUD policies are declared separately (select/insert/update/delete).
- RLS role is `anon, authenticated` because the frontend has no login screen.
*/

CREATE TABLE IF NOT EXISTS alunos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  curso TEXT NOT NULL,
  idade INT NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alunos" ON alunos;
CREATE POLICY "anon_select_alunos" ON alunos
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alunos" ON alunos;
CREATE POLICY "anon_insert_alunos" ON alunos
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alunos" ON alunos;
CREATE POLICY "anon_update_alunos" ON alunos
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alunos" ON alunos;
CREATE POLICY "anon_delete_alunos" ON alunos
  FOR DELETE TO anon, authenticated USING (true);
