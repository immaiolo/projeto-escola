import { useState, useMemo } from 'react'

export default function ListaAlunos({
  alunos,
  carregando,
  onNovo,
  onEditar,
  onExcluir,
  onDetalhe,
}) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return alunos
    return alunos.filter((a) =>
      [a.nome, a.email, a.curso, String(a.idade)].some((v) =>
        String(v).toLowerCase().includes(termo),
      ),
    )
  }, [alunos, busca])

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="stat-label">Total de alunos</div>
          <div className="stat-value primary">{alunos.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Exibindo</div>
          <div className="stat-value">{filtrados.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Operações</div>
          <div className="stat-value" style={{ fontSize: 14, paddingTop: 6 }}>
            CREATE · READ · UPDATE · DELETE
          </div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search">
            <span className="search-icon">⌕</span>
            <input
              placeholder="Buscar por nome, e-mail, curso..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={onNovo}>
            + Novo aluno
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Curso</th>
                <th style={{ width: 80 }}>Idade</th>
                <th style={{ width: 130, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr className="loading-row">
                  <td colSpan={6}>
                    <span className="spinner" /> Carregando alunos...
                  </td>
                </tr>
              )}

              {!carregando && filtrados.length === 0 && (
                <tr className="loading-row">
                  <td colSpan={6}>
                    <div className="empty">
                      <div className="empty-icon">∅</div>
                      <div>Nenhum aluno encontrado</div>
                    </div>
                  </td>
                </tr>
              )}

              {!carregando &&
                filtrados.map((a) => (
                  <tr key={a.id} onClick={() => onDetalhe(a)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="id-badge">#{a.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{a.nome}</td>
                    <td>{a.email}</td>
                    <td>{a.curso}</td>
                    <td>{a.idade}</td>
                    <td>
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => onEditar(a)}
                          title="Alterar"
                        >
                          ✎
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => onExcluir(a)}
                          title="Excluir"
                          style={{ color: 'var(--error-500)' }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
