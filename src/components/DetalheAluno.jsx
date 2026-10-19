import { useState } from 'react'

export default function DetalheAluno({
  aluno,
  buscando,
  onVoltar,
  onEditar,
  onExcluir,
}) {
  const [idBusca, setIdBusca] = useState(aluno?.id ?? 1)

  return (
    <div className="card">
      <div className="toolbar">
        <button className="btn btn-secondary" onClick={onVoltar}>
          ← Voltar à lista
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: 'var(--neutral-600)' }}>Buscar ID:</label>
          <input
            type="number"
            min="1"
            value={idBusca}
            onChange={(e) => setIdBusca(e.target.value)}
            style={{
              width: 90,
              padding: '8px 12px',
              border: '1px solid var(--neutral-200)',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
      </div>

      <h2 className="section-title">Detalhes do aluno</h2>
      <p className="section-sub">Consulta individual (GET /alunos/:id)</p>

      {buscando && (
        <div className="empty">
          <span className="spinner" /> Buscando aluno...
        </div>
      )}

      {!buscando && !aluno && (
        <div className="alert alert-error">Aluno não encontrado</div>
      )}

      {!buscando && aluno && (
        <>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">ID</div>
              <div className="detail-value">#{aluno.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Idade</div>
              <div className="detail-value">{aluno.idade} anos</div>
            </div>
            <div className="detail-item full">
              <div className="detail-label">Nome</div>
              <div className="detail-value">{aluno.nome}</div>
            </div>
            <div className="detail-item full">
              <div className="detail-label">E-mail</div>
              <div className="detail-value">{aluno.email}</div>
            </div>
            <div className="detail-item full">
              <div className="detail-label">Curso</div>
              <div className="detail-value">{aluno.curso}</div>
            </div>
            <div className="detail-item full">
              <div className="detail-label">Cadastrado em</div>
              <div className="detail-value">
                {new Date(aluno.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => onEditar(aluno)}>
              ✎ Alterar
            </button>
            <button className="btn btn-danger" onClick={() => onExcluir(aluno)}>
              🗑 Excluir
            </button>
          </div>
        </>
      )}
    </div>
  )
}
