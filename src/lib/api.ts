const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const API_BASE = `${SUPABASE_URL}/functions/v1/alunos-api`;

const headers = {
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  curso: string;
  idade: number | null;
  created_at?: string;
}

export interface ApiInfo {
  mensagem: string;
  sistema: string;
  versao: string;
  instituicao: string;
  curso: string;
  professor: string;
  rotas: string[];
}

export interface ApiError {
  erro: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const errBody = body as ApiError;
    throw new Error(errBody?.erro || `Erro ${res.status}`);
  }
  return body as T;
}

export const api = {
  async getInfo(): Promise<ApiInfo> {
    const res = await fetch(`${API_BASE}/info`, { headers });
    return handleResponse<ApiInfo>(res);
  },

  async listAlunos(): Promise<Aluno[]> {
    const res = await fetch(`${API_BASE}/alunos`, { headers });
    return handleResponse<Aluno[]>(res);
  },

  async getAluno(id: number): Promise<Aluno> {
    const res = await fetch(`${API_BASE}/alunos/${id}`, { headers });
    return handleResponse<Aluno>(res);
  },

  async createAluno(data: {
    nome: string;
    email: string;
    curso: string;
    idade: number | null;
  }): Promise<Aluno> {
    const res = await fetch(`${API_BASE}/alunos`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<Aluno>(res);
  },

  async updateAluno(
    id: number,
    data: { nome: string; email: string; curso: string; idade: number | null },
  ): Promise<Aluno> {
    const res = await fetch(`${API_BASE}/alunos/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<Aluno>(res);
  },

  async deleteAluno(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/alunos/${id}`, {
      method: "DELETE",
      headers,
    });
    await handleResponse<void>(res);
  },
};
