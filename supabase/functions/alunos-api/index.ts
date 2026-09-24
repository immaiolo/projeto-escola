/*
# CRUD API for alunos — Escola

This edge function is the equivalent of the Node.js HTTP server from the exercise.
It implements the full CRUD API:

- GET    /alunos        → list all students
- GET    /alunos/:id    → get a single student
- POST   /alunos        → create a new student
- PUT    /alunos/:id    → update a student
- DELETE /alunos/:id    → delete a student

Data flow: Supabase (Postgres) → SQL → Edge Function → JSON → Browser
*/

import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AlunoPayload {
  nome?: string;
  email?: string;
  curso?: string;
  idade?: number | null;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validatePayload(body: AlunoPayload): string | null {
  if (!body.nome || typeof body.nome !== "string" || body.nome.trim() === "") {
    return "O campo 'nome' é obrigatório.";
  }
  if (!body.email || typeof body.email !== "string" || body.email.trim() === "") {
    return "O campo 'email' é obrigatório.";
  }
  if (!body.curso || typeof body.curso !== "string" || body.curso.trim() === "") {
    return "O campo 'curso' é obrigatório.";
  }
  if (body.idade !== null && body.idade !== undefined) {
    if (typeof body.idade !== "number" || body.idade < 0 || body.idade > 120) {
      return "O campo 'idade' deve ser um número entre 0 e 120.";
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const path = url.pathname;

  // Strip the edge function path prefix to get the logical route.
  // Supabase may provide the path as /functions/v1/alunos-api/... or /alunos-api/...
  const route = path.replace(/^\/(functions\/v1\/)?alunos-api/, "");

  try {
    // GET / or /info — API info (Exercise 2: the "server.js" welcome message)
    if ((route === "/" || route === "/info") && req.method === "GET") {
      return jsonResponse({
        mensagem: "API de alunos funcionando!",
        sistema: "Sistema Escolar",
        versao: "1.0",
        instituicao: "Etec",
        curso: "Desenvolvimento de Sistemas",
        professor: "Professor Responsável",
        rotas: [
          "GET    /alunos       — Listar todos os alunos",
          "GET    /alunos/:id   — Consultar um aluno",
          "POST   /alunos       — Cadastrar um novo aluno",
          "PUT    /alunos/:id   — Alterar um aluno",
          "DELETE /alunos/:id   — Excluir um aluno",
        ],
      });
    }

    // GET /alunos — List all students (Exercise 4, Part A)
    if (route === "/alunos" && req.method === "GET") {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        return jsonResponse({ erro: "Erro ao consultar o banco de dados" }, 500);
      }

      return jsonResponse(data);
    }

    // POST /alunos — Create a new student (Exercise 4, Part C)
    if (route === "/alunos" && req.method === "POST") {
      const body: AlunoPayload = await req.json();
      const validationError = validatePayload(body);
      if (validationError) {
        return jsonResponse({ erro: validationError }, 400);
      }

      const payload = {
        nome: body.nome!.trim(),
        email: body.email!.trim(),
        curso: body.curso!.trim(),
        idade: body.idade ?? null,
      };

      const { data, error } = await supabase
        .from("alunos")
        .insert(payload)
        .select()
        .single();

      if (error) {
        return jsonResponse({ erro: "Erro ao cadastrar o aluno" }, 500);
      }

      return jsonResponse(data, 201);
    }

    // Routes with /alunos/:id
    const match = route.match(/^\/alunos\/(\d+)$/);
    if (match) {
      const id = parseInt(match[1], 10);

      // GET /alunos/:id — Get single student (Exercise 4, Part B)
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("alunos")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          return jsonResponse({ erro: "Erro ao consultar o banco de dados" }, 500);
        }

        if (!data) {
          return jsonResponse({ erro: "Aluno não encontrado" }, 404);
        }

        return jsonResponse(data);
      }

      // PUT /alunos/:id — Update student (Exercise 4, Part D)
      if (req.method === "PUT") {
        const body: AlunoPayload = await req.json();
        const validationError = validatePayload(body);
        if (validationError) {
          return jsonResponse({ erro: validationError }, 400);
        }

        // Check existence first (return 404 if not found)
        const { data: existing } = await supabase
          .from("alunos")
          .select("id")
          .eq("id", id)
          .maybeSingle();

        if (!existing) {
          return jsonResponse({ erro: "Aluno não encontrado" }, 404);
        }

        const payload = {
          nome: body.nome!.trim(),
          email: body.email!.trim(),
          curso: body.curso!.trim(),
          idade: body.idade ?? null,
        };

        const { data, error } = await supabase
          .from("alunos")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return jsonResponse({ erro: "Erro ao atualizar o aluno" }, 500);
        }

        return jsonResponse(data, 200);
      }

      // DELETE /alunos/:id — Delete student (Exercise 4, Part E)
      if (req.method === "DELETE") {
        const { data: existing } = await supabase
          .from("alunos")
          .select("id")
          .eq("id", id)
          .maybeSingle();

        if (!existing) {
          return jsonResponse({ erro: "Aluno não encontrado" }, 404);
        }

        const { error } = await supabase
          .from("alunos")
          .delete()
          .eq("id", id);

        if (error) {
          return jsonResponse({ erro: "Erro ao excluir o aluno" }, 500);
        }

        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    // 404 — Route not found
    return jsonResponse({ erro: "Rota não encontrada" }, 404);

  } catch (err) {
    console.error(err);
    return jsonResponse({ erro: "Erro interno do servidor" }, 500);
  }
});
