import React, { useState } from 'react';
import { 
  Plus, Trash2, Calendar, User, ArrowRight, ArrowLeft, 
  ExternalLink, MoreHorizontal, Check
} from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseConfig, DatabaseRow, StatusOption } from '../../types';

interface KanbanBoardViewProps {
  config: DatabaseConfig;
  searchQuery: string;
  onChange: (updatedConfig: DatabaseConfig) => void;
  onOpenRow: (id: string) => void;
}

const STATUS_COLORS = [
  { name: 'Âmbar', hex: '#f59e0b' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Roxo', hex: '#8b5cf6' },
  { name: 'Vermelho', hex: '#ef4444' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Ciano', hex: '#06b6d4' },
  { name: 'Cinza', hex: '#64748b' },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  config,
  searchQuery,
  onChange,
  onOpenRow,
}) => {
  const statuses: StatusOption[] = (config.statuses && config.statuses.length > 0)
    ? config.statuses
    : DEFAULT_STATUSES;

  const [activeMenuStatusId, setActiveMenuStatusId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const filteredRows = config.rows.filter(row =>
    row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.assignee && row.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpdateRow = (id: string, updates: Partial<DatabaseRow>) => {
    onChange({
      ...config,
      statuses,
      rows: config.rows.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const handleAddCard = (columnStatus: string) => {
    const newCard: DatabaseRow = {
      id: `card-${Date.now()}`,
      title: 'Novo Cartão',
      status: columnStatus,
      priority: 'Média',
      date: new Date().toISOString().split('T')[0],
      assignee: 'Eu'
    };
    onChange({
      ...config,
      statuses,
      rows: [...config.rows, newCard]
    });
    onOpenRow(newCard.id);
  };

  const handleDeleteCard = (id: string) => {
    onChange({
      ...config,
      statuses,
      rows: config.rows.filter(r => r.id !== id)
    });
  };

  const moveCard = (row: DatabaseRow, direction: 'next' | 'prev') => {
    const currentIndex = statuses.findIndex(c => c.name === row.status);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < statuses.length) {
      handleUpdateRow(row.id, { status: statuses[targetIndex].name });
    }
  };

  // Status Column Management
  const handleAddStatus = () => {
    const newStatusName = `Etapa ${statuses.length + 1}`;
    const newStatus: StatusOption = {
      id: `status-${Date.now()}`,
      name: newStatusName,
      color: STATUS_COLORS[(statuses.length) % STATUS_COLORS.length].hex
    };

    onChange({
      ...config,
      statuses: [...statuses, newStatus]
    });
  };

  const handleRenameStatus = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;

    const updatedStatuses = statuses.map(s => s.name === oldName ? { ...s, name: newName.trim() } : s);
    const updatedRows = config.rows.map(r => r.status === oldName ? { ...r, status: newName.trim() } : r);

    onChange({
      ...config,
      statuses: updatedStatuses,
      rows: updatedRows
    });
    setActiveMenuStatusId(null);
  };

  const handleChangeStatusColor = (statusName: string, color: string) => {
    const updatedStatuses = statuses.map(s => s.name === statusName ? { ...s, color } : s);
    onChange({
      ...config,
      statuses: updatedStatuses
    });
  };

  const handleDeleteStatus = (statusToDelete: StatusOption) => {
    if (statuses.length <= 1) {
      alert('É necessário manter pelo menos uma etapa de status.');
      return;
    }

    if (confirm(`Excluir a etapa "${statusToDelete.name}"? Tarefas nesta coluna serão movidas para a primeira coluna disponível.`)) {
      const remainingStatuses = statuses.filter(s => s.id !== statusToDelete.id);
      const fallbackStatus = remainingStatuses[0].name;

      const updatedRows = config.rows.map(r => 
        r.status === statusToDelete.name ? { ...r, status: fallbackStatus } : r
      );

      onChange({
        ...config,
        statuses: remainingStatuses,
        rows: updatedRows
      });
      setActiveMenuStatusId(null);
    }
  };

  return (
    <div className="kanban-board" style={{ alignItems: 'flex-start' }}>
      {statuses.map((col, colIndex) => {
        const colCards = filteredRows.filter(r => r.status === col.name);
        const isMenuOpen = activeMenuStatusId === col.id;

        return (
          <div key={col.id} className="kanban-column" style={{ position: 'relative' }}>
            {/* Column Header */}
            <div className="kanban-column-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: `${col.color}25`,
                    color: col.color,
                    border: `1px solid ${col.color}40`,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={col.name}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: col.color }} />
                  {col.name}
                </span>

                <span className="kanban-col-count">{colCards.length}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {/* Column options menu toggle */}
                <button
                  className="sidebar-btn-icon"
                  title="Configurar etapa"
                  onClick={() => {
                    if (isMenuOpen) {
                      setActiveMenuStatusId(null);
                    } else {
                      setActiveMenuStatusId(col.id);
                      setEditingName(col.name);
                    }
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>

                <button
                  className="sidebar-btn-icon"
                  title="Adicionar cartão"
                  onClick={() => handleAddCard(col.name)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Column Customization Popover */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px',
                  zIndex: 100,
                  width: '230px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Editar Etapa / Status
                </div>

                {/* Rename input */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    style={{
                      flex: 1,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      color: 'var(--text-primary)',
                      fontSize: '12.5px'
                    }}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameStatus(col.name, editingName);
                    }}
                  />
                  <button
                    className="nav-btn primary"
                    style={{ padding: '4px 8px' }}
                    onClick={() => handleRenameStatus(col.name, editingName)}
                  >
                    <Check size={13} />
                  </button>
                </div>

                {/* Color picker circles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cor da Etapa</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {STATUS_COLORS.map(c => (
                      <button
                        key={c.hex}
                        style={{
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: c.hex,
                          border: col.color === c.hex ? '2px solid #fff' : 'none',
                          cursor: 'pointer'
                        }}
                        title={c.name}
                        onClick={() => handleChangeStatusColor(col.name, c.hex)}
                      />
                    ))}
                  </div>
                </div>

                {/* Delete Column button */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <button
                    className="nav-btn"
                    style={{ color: '#ef4444', width: '100%', justifyContent: 'center', fontSize: '12px' }}
                    onClick={() => handleDeleteStatus(col)}
                  >
                    <Trash2 size={12} />
                    <span>Excluir Etapa</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cards List */}
            <div className="kanban-cards-list">
              {colCards.map(card => (
                <div 
                  key={card.id} 
                  className="kanban-card"
                  onClick={() => onOpenRow(card.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                      {card.icon && <span style={{ fontSize: '15px' }}>{card.icon}</span>}
                      <span className="kanban-card-title" style={{ margin: 0, fontWeight: 500 }}>
                        {card.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="sidebar-btn-icon"
                        title="Abrir como Página (Notion style)"
                        onClick={() => onOpenRow(card.id)}
                        style={{ color: 'var(--accent)', padding: '2px' }}
                      >
                        <ExternalLink size={12} />
                      </button>
                      <button
                        className="sidebar-btn-icon"
                        style={{ color: '#ef4444', padding: '2px' }}
                        title="Excluir"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {card.notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0' }}>
                      {card.notes}
                    </div>
                  )}

                  <div className="kanban-card-meta" style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {card.priority && (
                        <span className={`priority-badge priority-${card.priority.toLowerCase()}`}>
                          {card.priority}
                        </span>
                      )}
                      {card.date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                          <Calendar size={11} />
                          <span>{card.date.slice(5)}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                      {colIndex > 0 && (
                        <button
                          className="sidebar-btn-icon"
                          title={`Mover para "${statuses[colIndex - 1].name}"`}
                          onClick={() => moveCard(card, 'prev')}
                        >
                          <ArrowLeft size={12} />
                        </button>
                      )}
                      {colIndex < statuses.length - 1 && (
                        <button
                          className="sidebar-btn-icon"
                          title={`Mover para "${statuses[colIndex + 1].name}"`}
                          onClick={() => moveCard(card, 'next')}
                        >
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {card.assignee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <User size={11} />
                      <span>{card.assignee}</span>
                    </div>
                  )}
                </div>
              ))}

              {colCards.length === 0 && (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    margin: '4px 0'
                  }}
                >
                  Nenhum item aqui.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Button to Add New Status Column */}
      <div style={{ width: '220px', flexShrink: 0 }}>
        <button
          className="nav-btn"
          style={{
            width: '100%',
            height: '42px',
            border: '1px dashed var(--border-color)',
            background: 'var(--bg-secondary)',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)'
          }}
          onClick={handleAddStatus}
        >
          <Plus size={15} />
          <span>Nova Coluna / Status</span>
        </button>
      </div>
    </div>
  );
};
