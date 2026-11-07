import React from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseConfig, DatabaseRow, StatusOption } from '../../types';

interface TableViewProps {
  config: DatabaseConfig;
  searchQuery: string;
  onChange: (updatedConfig: DatabaseConfig) => void;
  onOpenRow: (id: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  config,
  searchQuery,
  onChange,
  onOpenRow,
}) => {
  const statuses: StatusOption[] = (config.statuses && config.statuses.length > 0)
    ? config.statuses
    : DEFAULT_STATUSES;

  const filteredRows = config.rows.filter(row =>
    row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.assignee && row.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.status && row.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpdateRow = (id: string, updates: Partial<DatabaseRow>) => {
    onChange({
      ...config,
      statuses,
      rows: config.rows.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const handleAddRow = () => {
    const newRow: DatabaseRow = {
      id: `row-${Date.now()}`,
      title: 'Nova Tarefa',
      status: statuses[0]?.name || 'A Fazer',
      priority: 'Média',
      date: new Date().toISOString().split('T')[0],
      assignee: 'Eu'
    };
    onChange({
      ...config,
      statuses,
      rows: [...config.rows, newRow]
    });
    onOpenRow(newRow.id);
  };

  const handleDeleteRow = (id: string) => {
    onChange({
      ...config,
      statuses,
      rows: config.rows.filter(r => r.id !== id)
    });
  };

  return (
    <div className="table-view-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '38%' }}>Título</th>
            <th style={{ width: '15%' }}>Status</th>
            <th style={{ width: '15%' }}>Prioridade</th>
            <th style={{ width: '15%' }}>Prazo</th>
            <th style={{ width: '15%' }}>Responsável</th>
            <th style={{ width: '70px', textAlign: 'center' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(row => (
            <tr key={row.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {row.icon && <span style={{ fontSize: '15px' }}>{row.icon}</span>}
                  <input
                    type="text"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      width: '100%',
                      fontSize: '13.5px',
                      fontWeight: 500
                    }}
                    value={row.title}
                    onChange={(e) => handleUpdateRow(row.id, { title: e.target.value })}
                  />
                </div>
              </td>
              <td>
                <select
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '3px 6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  value={row.status}
                  onChange={(e) => handleUpdateRow(row.id, { status: e.target.value })}
                >
                  {statuses.map(s => (
                    <option key={s.id} value={s.name}>
                      ● {s.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '3px 6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  value={row.priority || 'Média'}
                  onChange={(e) => handleUpdateRow(row.id, { priority: e.target.value as any })}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </td>
              <td>
                <input
                  type="date"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '12px'
                  }}
                  value={row.date || ''}
                  onChange={(e) => handleUpdateRow(row.id, { date: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-secondary)',
                    width: '100%',
                    fontSize: '13px'
                  }}
                  placeholder="Atribuir..."
                  value={row.assignee || ''}
                  onChange={(e) => handleUpdateRow(row.id, { assignee: e.target.value })}
                />
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <button
                    className="sidebar-btn-icon"
                    title="Abrir como Página (Notion style)"
                    onClick={() => onOpenRow(row.id)}
                    style={{ color: 'var(--accent)' }}
                  >
                    <ExternalLink size={13} />
                  </button>
                  <button
                    className="sidebar-btn-icon"
                    style={{ color: '#ef4444' }}
                    title="Excluir Linha"
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <button className="action-chip" onClick={handleAddRow}>
          <Plus size={14} />
          <span>Nova Linha</span>
        </button>
      </div>
    </div>
  );
};
