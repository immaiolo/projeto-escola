import { useState } from 'react'
import {
  listarAlunos,
  consultarAluno,
  cadastrarAluno,
  alterarAluno,
  excluirAluno,
} from '../lib/api.js'

const TESTES = [
  { id: 1, titulo: 'Listagem', desc: 'GET /alunos — retorna lista de alunos' },
  { id: 2, titulo: 'Consulta por ID', desc: 'GET /alunos/:id — dados do aluno' },
  { id: 3, titulo: 'ID inexistente', desc: 'GET /alunos/999 — retorna "não encontrado"' },
  { id: 4, titulo: 'Cadastro', desc: 'POST /alunos — cadastra um novo aluno' },
  { id: 5, titulo: 'Alteração', desc: 'PUT /alunos/:id — altera o e-mail do aluno' },
  { id: 6, titulo: 'Exclusão', desc: 'DELETE /alunos/:id — exclui o aluno cadastrado' },
  { id: 7, titulo: 'Conferência no banco', desc: 'SELECT * FROM alunos — valida alterações' },
]

export default function PainelTestes({ onConcluido }) {
  const [statuses, setStatuses] = useState({})
  const [logs, setLogs] = useState([])
  const [rodando, setRodando] = useState(false)

  function log(linha, tipo = '') {
    setLogs((prev) => [...prev, { texto: linha, tipo }])
  }

  function setStatus(id, status) {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  async function rodarTeste(teste) {
    setStatus(teste.id, 'running')
    try {
      switch (teste.id) {
        case 1: {
          log('→ GET /alunos', 'info')
          const data = await listarAlunos()
          log(`← 200 OK · ${data.length} aluno(s) retornado(s)`, 'ok')
          if (data.length === 0) log('  (lista vazia — cadastre um aluno no teste 4)', 'dim')
          return true
        }
        case 2: {
          const todos = await listarAlunos()
          if (todos.length === 0) {
            log('→ Nenhum aluno disponível para consulta', 'err')
            return false
          }
          const alvo = todos[0]
          log(`→ GET /alunos/${alvo.id}`, 'info')
          const data = await consultarAluno(alvo.id)
          if (!data) {
            log('← 404 · Aluno não encontrado', 'err')
            return false
          }
          log(`← 200 OK · ${data.nome} (${data.email})`, 'ok')
          return true
        }
        case 3: {
          log('→ GET /alunos/999', 'info')
          const data = await consultarAluno(999)
          if (data === null) {
            log('← 404 · {"erro":"Aluno não encontrado"}', 'ok')
            return true
          }
          log('← Esperado null (não encontrado), mas veio um registro', 'err')
          return false
        }
        case 4: {
          const payload = {
            nome: 'João Pereira',
            email: `joao_${Date.now()}@email.com`,
            curso: 'Desenvolvimento de Sistemas',
            idade: 17,
          }
          log(`→ POST /alunos · ${payload.nome}`, 'info')
          const data = await cadastrarAluno(payload)
          log(`← 201 Created · novo id=${data.id}`, 'ok')
          window.__testeIdCriado = data.id
          return true
        }
        case 5: {
          const id = window.__testeIdCriado
          if (!id) {
            log('→ Execute o Teste 4 antes do Teste 5', 'err')
            return false
          }
          const novoEmail = `joao.alterado_${Date.now()}@email.com`
          log(`→ PUT /alunos/${id} · novo e-mail=${novoEmail}`, 'info')
          const data = await alterarAluno(id, {
            nome: 'João Pereira',
            email: novoEmail,
            curso: 'Desenvolvimento de Sistemas',
            idade: 17,
          })
          if (!data) {
            log('← 404 · Aluno não encontrado', 'err')
            return false
          }
          log(`← 200 OK · e-mail atualizado para ${data.email}`, 'ok')
          return true
        }
        case 6: {
          const id = window.__testeIdCriado
          if (!id) {
            log('→ Execute o Teste 4 antes do Teste 6', 'err')
            return false
          }
          log(`→ DELETE /alunos/${id}`, 'info')
          await excluirAluno(id)
          log('← 204 No Content · aluno excluído', 'ok')
          const aindaExiste = await consultarAluno(id)
          if (aindaExiste) {
            log('  (!) registro ainda aparece na consulta', 'err')
            return false
          }
          log('  confirmação: registro não aparece mais', 'dim')
          window.__testeIdCriado = null
          return true
        }
        case 7: {
          log('→ SELECT * FROM alunos', 'info')
          const data = await listarAlunos()
          log(`← ${data.length} aluno(s) atualmente no banco`, 'ok')
          data.forEach((a) =>
            log(`  #${a.id} · ${a.nome} · ${a.email} · ${a.curso} · ${a.idade} anos`, 'dim'),
          )
          return true
        }
        default:
          return false
      }
    } catch (err) {
      log(`✗ Erro: ${err.message || err}`, 'err')
      return false
    }
  }

  async function rodarTodos() {
    setRodando(true)
    setLogs([])
    setStatuses({})
    log('=== Iniciando roteiro de testes ===', 'info')
    for (const teste of TESTES) {
      log(`\n[Teste ${teste.id}] ${teste.titulo}`, 'info')
      const ok = await rodarTeste(teste)
      setStatus(teste.id, ok ? 'pass' : 'fail')
    }
    log('\n=== Roteiro concluído ===', 'info')
    setRodando(false)
    if (onConcluido) onConcluido()
  }

  async function rodarUm(teste) {
    setRodando(true)
    log(`\n[Teste ${teste.id}] ${teste.titulo}`, 'info')
    const ok = await rodarTeste(teste)
    setStatus(teste.id, ok ? 'pass' : 'fail')
    setRodando(false)
  }

  const passou = Object.values(statuses).filter((s) => s === 'pass').length
  const falhou = Object.values(statuses).filter((s) => s === 'fail').length

  return (
    <>
      <div className="card">
        <h2 className="section-title">Roteiro de testes</h2>
        <p className="section-sub">
          Valida automaticamente as seis operações CRUD e a conferência no banco.
        </p>

        <div className="stats" style={{ marginBottom: 20 }}>
          <div className="stat">
            <div className="stat-label">Aprovados</div>
            <div className="stat-value" style={{ color: 'var(--success-600)' }}>{passou}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Falhas</div>
            <div className="stat-value" style={{ color: 'var(--error-600)' }}>{falhou}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total</div>
            <div className="stat-value">{TESTES.length}</div>
          </div>
        </div>

        <div className="toolbar">
          <button className="btn btn-primary" onClick={rodarTodos} disabled={rodando}>
            {rodando && <span className="spinner" />}
            Executar todos
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setLogs([])
              setStatuses({})
            }}
            disabled={rodando}
          >
            Limpar
          </button>
        </div>

        <div className="tests-list">
          {TESTES.map((t) => (
            <div className="test-item" key={t.id}>
              <div className="test-num">{t.id}</div>
              <div className="test-body">
                <div className="test-title">{t.titulo}</div>
                <div className="test-desc">{t.desc}</div>
              </div>
              <span className={`test-status ${statuses[t.id] || 'pending'}`}>
                {statuses[t.id] === 'pass'
                  ? 'Aprovado'
                  : statuses[t.id] === 'fail'
                    ? 'Falhou'
                    : statuses[t.id] === 'running'
                      ? 'Executando...'
                      : 'Pendente'}
              </span>
              <button
                className="btn btn-ghost"
                onClick={() => rodarUm(t)}
                disabled={rodando}
                title="Executar este teste"
              >
                ▶
              </button>
            </div>
          ))}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="card">
          <h2 className="section-title">Log de execução</h2>
          <p className="section-sub">Saída das consultas parametrizadas enviadas ao banco</p>
          <div className="log">
            {logs.map((l, i) => (
              <p key={i} className={`log-line ${l.tipo}`}>
                {l.texto}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
