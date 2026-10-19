import { useEffect, useState, useCallback } from 'react'
import {
  listarAlunos,
  consultarAluno,
  cadastrarAluno,
  alterarAluno,
  excluirAluno,
} from './lib/api.js'
import ListaAlunos from './components/ListaAlunos.jsx'
import DetalheAluno from './components/DetalheAluno.jsx'
import PainelTestes from './components/PainelTestes.jsx'

export default function App() {
  const [aba, setAba] = useState('lista')
  const [alunos, setAlunos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [modalAberto, setModalAberto] = useState(null)
  const [alunoDetalhe, setAlunoDetalhe] = useState(null)
  const [buscandoDetalhe, setBuscandoDetalhe] = useState(false)

  const mostrarToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }, [])

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const data = await listarAlunos()
      setAlunos(data)
    } catch (e) {
      setErro(e.message || 'Erro ao carregar alunos')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function abrirDetalhe(id) {
    setAba('detalhe')
    setBuscandoDetalhe(true)
    setAlunoDetalhe(null)
    setErro('')
    try {
      const data = await consultarAluno(id)
      setAlunoDetalhe(data)
    } catch (e) {
      setErro(e.message || 'Erro ao consultar aluno')
    } finally {
      setBuscandoDetalhe(false)
    }
  }

  async function salvarAluno(valores, idEdicao) {
    if (idEdicao) {
      const atualizado = await alterarAluno(idEdicao, valores)
      if (!atualizado) throw new Error('Aluno não encontrado')
      mostrarToast('Aluno alterado com sucesso')
    } else {
      await cadastrarAluno(valores)
      mostrarToast('Aluno cadastrado com sucesso')
    }
    setModalAberto(null)
    await recarregar()
  }

  async function confirmarExclusao(id) {
    await excluirAluno(id)
    mostrarToast('Aluno excluído com sucesso')
    setModalAberto(null)
    await recarregar()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">A</div>
            <div>
              <h1>CRUD Alunos</h1>
              <p>Gerenciamento de alunos · API REST</p>
            </div>
          </div>
          <nav className="tabs" role="tablist">
            <button
              className={`tab ${aba === 'lista' ? 'active' : ''}`}
              onClick={() => setAba('lista')}
              role="tab"
            >
              Alunos
            </button>
            <button
              className={`tab ${aba === 'detalhe' ? 'active' : ''}`}
              onClick={() => setAba('detalhe')}
              role="tab"
            >
              Detalhe
            </button>
            <button
              className={`tab ${aba === 'testes' ? 'active' : ''}`}
              onClick={() => setAba('testes')}
              role="tab"
            >
              Testes
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {erro && (
          <div className="alert alert-error" role="alert">
            <span>{erro}</span>
          </div>
        )}

        {aba === 'lista' && (
          <ListaAlunos
            alunos={alunos}
            carregando={carregando}
            onNovo={() => setModalAberto({ tipo: 'form' })}
            onEditar={(a) => setModalAberto({ tipo: 'form', aluno: a })}
            onExcluir={(a) => setModalAberto({ tipo: 'delete', aluno: a })}
            onDetalhe={(a) => abrirDetalhe(a.id)}
          />
        )}

        {aba === 'detalhe' && (
          <DetalheAluno
            aluno={alunoDetalhe}
            buscando={buscandoDetalhe}
            onVoltar={() => setAba('lista')}
            onEditar={(a) => setModalAberto({ tipo: 'form', aluno: a })}
            onExcluir={(a) => setModalAberto({ tipo: 'delete', aluno: a })}
          />
        )}

        {aba === 'testes' && <PainelTestes onConcluido={recarregar} />}
      </main>

      <footer className="footer">
        CRUD Alunos · Operações CREATE, READ, UPDATE e DELETE
      </footer>

      {modalAberto && modalAberto.tipo === 'form' && (
        <FormModal
          aluno={modalAberto.aluno}
          onClose={() => setModalAberto(null)}
          onSalvar={salvarAluno}
        />
      )}

      {modalAberto && modalAberto.tipo === 'delete' && (
        <DeleteModal
          aluno={modalAberto.aluno}
          onClose={() => setModalAberto(null)}
          onConfirmar={confirmarExclusao}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function FormModal({ aluno, onClose, onSalvar }) {
  const [valores, setValores] = useState({
    nome: aluno?.nome ?? '',
    email: aluno?.email ?? '',
    curso: aluno?.curso ?? '',
    idade: aluno?.idade ?? '',
  })
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erroServ, setErroServ] = useState('')

  function atualizar(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }))
  }

  function validar() {
    const e = {}
    if (!valores.nome.trim()) e.nome = 'Informe o nome'
    if (!valores.email.trim()) e.email = 'Informe o e-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) e.email = 'E-mail inválido'
    if (!valores.curso.trim()) e.curso = 'Informe o curso'
    if (valores.idade === '' || valores.idade === null) e.idade = 'Informe a idade'
    else if (Number(valores.idade) <= 0) e.idade = 'Idade inválida'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function enviar(ev) {
    ev.preventDefault()
    setErroServ('')
    if (!validar()) return
    setSalvando(true)
    try {
      await onSalvar(
        {
          nome: valores.nome.trim(),
          email: valores.email.trim(),
          curso: valores.curso.trim(),
          idade: Number(valores.idade),
        },
        aluno?.id,
      )
    } catch (err) {
      setErroServ(err.message || 'Erro ao salvar aluno')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{aluno ? 'Alterar aluno' : 'Cadastrar aluno'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <div className="modal-body">
          {erroServ && <div className="alert alert-error">{erroServ}</div>}
          <form onSubmit={enviar}>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  value={valores.nome}
                  onChange={(e) => atualizar('nome', e.target.value)}
                  placeholder="Ex.: Pedro Lima"
                />
                {erros.nome && <span className="err">{erros.nome}</span>}
              </div>
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  value={valores.email}
                  onChange={(e) => atualizar('email', e.target.value)}
                  placeholder="Ex.: pedro@email.com"
                />
                {erros.email && <span className="err">{erros.email}</span>}
              </div>
              <div className="field">
                <label htmlFor="idade">Idade</label>
                <input
                  id="idade"
                  type="number"
                  min="1"
                  value={valores.idade}
                  onChange={(e) => atualizar('idade', e.target.value)}
                  placeholder="Ex.: 17"
                />
                {erros.idade && <span className="err">{erros.idade}</span>}
              </div>
              <div className="field full">
                <label htmlFor="curso">Curso</label>
                <input
                  id="curso"
                  value={valores.curso}
                  onChange={(e) => atualizar('curso', e.target.value)}
                  placeholder="Ex.: Desenvolvimento de Sistemas"
                />
                {erros.curso && <span className="err">{erros.curso}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando && <span className="spinner" />}
                {aluno ? 'Salvar alterações' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ aluno, onClose, onConfirmar }) {
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  async function confirmar() {
    setErro('')
    setExcluindo(true)
    try {
      await onConfirmar(aluno.id)
    } catch (err) {
      setErro(err.message || 'Erro ao excluir aluno')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Excluir aluno</h2>
          <button className="close-btn" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <div className="modal-body">
          {erro && <div className="alert alert-error">{erro}</div>}
          <p style={{ fontSize: 14, color: 'var(--neutral-600)' }}>
            Tem certeza que deseja excluir <strong>{aluno.nome}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose} disabled={excluindo}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={confirmar} disabled={excluindo}>
              {excluindo && <span className="spinner" />}
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
