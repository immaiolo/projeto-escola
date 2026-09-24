import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  Mail,
  User,
  X,
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  Server,
  Database,
  ArrowRight,
  Globe,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { api, type Aluno, type ApiInfo } from '@/lib/api';

type AlunoFormData = {
  nome: string;
  email: string;
  curso: string;
  idade: string;
};

const emptyForm: AlunoFormData = {
  nome: '',
  email: '',
  curso: '',
  idade: '',
};

export default function App() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cursoFilter, setCursoFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AlunoFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);

  const fetchAlunos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAlunos();
      setAlunos(data);
    } catch {
      setError('Não foi possível carregar os alunos.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    api.getInfo().then(setApiInfo).catch(() => {});
    fetchAlunos();
  }, [fetchAlunos]);

  const cursos = ['all', ...Array.from(new Set(alunos.map((a) => a.curso))).sort()];

  const filtered = alunos.filter((a) => {
    const matchesSearch =
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchesCurso = cursoFilter === 'all' || a.curso === cursoFilter;
    return matchesSearch && matchesCurso;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (aluno: Aluno) => {
    setEditingId(aluno.id);
    setForm({
      nome: aluno.nome,
      email: aluno.email,
      curso: aluno.curso,
      idade: aluno.idade !== null ? String(aluno.idade) : '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSave = async () => {
    setFormError(null);

    if (!form.nome.trim()) {
      setFormError('O nome é obrigatório.');
      return;
    }
    if (!form.email.trim()) {
      setFormError('O e-mail é obrigatório.');
      return;
    }
    if (!form.curso.trim()) {
      setFormError('O curso é obrigatório.');
      return;
    }

    const idadeNum = form.idade.trim() === '' ? null : parseInt(form.idade, 10);
    if (idadeNum !== null && (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 120)) {
      setFormError('A idade deve ser um número válido.');
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      curso: form.curso.trim(),
      idade: idadeNum,
    };

    setSaving(true);
    try {
      if (editingId !== null) {
        await api.updateAluno(editingId, payload);
      } else {
        await api.createAluno(payload);
      }
      closeModal();
      await fetchAlunos();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar o aluno.');
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.deleteAluno(deleteId);
      setDeleteId(null);
      await fetchAlunos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir o aluno.');
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Escola — Gestão de Alunos</h1>
              <p className="text-sm text-slate-500">API CRUD completa para cadastro de estudantes</p>
            </div>
          </div>
          <button
            onClick={() => setShowApiPanel(!showApiPanel)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">API</span>
          </button>
        </div>
      </header>

      {/* API Info Banner */}
      {apiInfo && (
        <div className="bg-emerald-600">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 text-sm text-white overflow-x-auto whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{apiInfo.sistema}</span>
            <span className="opacity-70">·</span>
            <span>v{apiInfo.versao}</span>
            <span className="opacity-70">·</span>
            <span>{apiInfo.instituicao}</span>
            <span className="opacity-70">·</span>
            <span>{apiInfo.curso}</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* API Explorer Panel */}
        {showApiPanel && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-semibold text-slate-900">Explorador da API</h2>
              </div>
              <button
                onClick={() => setShowApiPanel(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Data Flow Diagram */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Fluxo da Informação
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <FlowStep icon={<Database className="w-4 h-4" />} label="Banco de Dados" sub="Postgres" color="bg-blue-100 text-blue-700" />
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <FlowStep icon={<Code className="w-4 h-4" />} label="SQL" sub="SELECT / INSERT / UPDATE / DELETE" color="bg-violet-100 text-violet-700" />
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <FlowStep icon={<Server className="w-4 h-4" />} label="API (Edge Function)" sub="Node.js / Deno" color="bg-emerald-100 text-emerald-700" />
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <FlowStep icon={<Code className="w-4 h-4" />} label="JSON" sub="Resposta HTTP" color="bg-amber-100 text-amber-700" />
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <FlowStep icon={<Globe className="w-4 h-4" />} label="Navegador" sub="Interface" color="bg-rose-100 text-rose-700" />
              </div>
            </div>

            {/* Routes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apiInfo?.rotas.map((rota, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                  <RouteBadge route={rota} />
                </div>
              ))}
            </div>

            {/* Status codes */}
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge code="200" label="Consulta / Alteração" />
              <StatusBadge code="201" label="Cadastro" />
              <StatusBadge code="204" label="Exclusão" />
              <StatusBadge code="404" label="Não encontrado" />
              <StatusBadge code="500" label="Erro interno" />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5 text-emerald-600" />}
            label="Total de Alunos"
            value={alunos.length}
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            label="Cursos Cadastrados"
            value={cursos.length - 1}
          />
          <StatCard
            icon={<Search className="w-5 h-5 text-amber-600" />}
            label="Resultados Filtrados"
            value={filtered.length}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <select
              value={cursoFilter}
              onChange={(e) => setCursoFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer"
            >
              <option value="all">Todos os cursos</option>
              {cursos
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
            <button
              onClick={openAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 transition shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Aluno
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-900">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table / Loading / Empty */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {alunos.length === 0
                ? 'Nenhum aluno cadastrado ainda.'
                : 'Nenhum aluno encontrado com os filtros aplicados.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                      E-mail
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                      Curso
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Idade
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 text-sm text-slate-400 font-mono">
                        {aluno.id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{aluno.nome}</p>
                            <p className="text-xs text-slate-500 sm:hidden">{aluno.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {aluno.email}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {aluno.curso}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 text-center">
                        {aluno.idade ?? '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(aluno)}
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(aluno.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId !== null ? 'Editar Aluno' : 'Novo Aluno'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field label="Nome" required>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Nome do aluno"
                />
              </Field>
              <Field label="E-mail" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="email@exemplo.com"
                />
              </Field>
              <Field label="Curso" required>
                <input
                  type="text"
                  value={form.curso}
                  onChange={(e) => setForm({ ...form, curso: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Nome do curso"
                  list="curso-list"
                />
                <datalist id="curso-list">
                  {cursos
                    .filter((c) => c !== 'all')
                    .map((c) => (
                      <option key={c} value={c} />
                    ))}
                </datalist>
              </Field>
              <Field label="Idade">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={form.idade}
                  onChange={(e) => setForm({ ...form, idade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Idade"
                />
              </Field>
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-900">{formError}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 transition shadow-sm disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId !== null ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Excluir aluno?</h3>
              <p className="text-sm text-slate-500">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function FlowStep({
  icon,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">{label}</p>
        <p className="text-[10px] text-slate-500 whitespace-nowrap">{sub}</p>
      </div>
    </div>
  );
}

function RouteBadge({ route }: { route: string }) {
  const method = route.trim().split(/\s+/)[0];
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700 border-blue-200',
    POST: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PUT: 'bg-amber-100 text-amber-700 border-amber-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <>
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${methodColors[method] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {method}
      </span>
      <span className="text-sm text-slate-700 font-mono">{route.replace(method, '').trim()}</span>
    </>
  );
}

function StatusBadge({ code, label }: { code: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
      <span className="text-xs font-mono font-bold text-slate-700">{code}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
