import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Calendar, Repeat, ChevronDown, Clock, AlertCircle } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseConfig, DatabaseRow, StatusOption, TaskRecurrence } from '../../types';
import { formatRecurrenceLabel } from '../../utils/recurrence';

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

  // Column width dragging state
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    title: 260,
    status: 130,
    priority: 110,
    date: 160,
    recurrence: 140,
    assignee: 130,
    actions: 75,
  });

  const resizingColRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  const startResizing = (col: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingColRef.current = {
      col,
      startX: e.clientX,
      startWidth: colWidths[col] || 120,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const delta = moveEvent.clientX - resizingColRef.current.startX;
      const newWidth = Math.max(60, resizingColRef.current.startWidth + delta);
      setColWidths(prev => ({
        ...prev,
        [resizingColRef.current!.col]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingColRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Popover state for quick date/recurrence pickers
  const [activeDatePickerRowId, setActiveDatePickerRowId] = useState<string | null>(null);
  const [activeRecurrenceRowId, setActiveRecurrenceRowId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

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
      date: todayStr,
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

  const setQuickDate = (rowId: string, daysOffset: number | null) => {
    if (daysOffset === null) {
      handleUpdateRow(rowId, { date: undefined });
    } else {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      handleUpdateRow(rowId, { date: d.toISOString().split('T')[0] });
    }
    setActiveDatePickerRowId(null);
  };

  const setQuickRecurrence = (rowId: string, rec?: TaskRecurrence) => {
    handleUpdateRow(rowId, { recurrence: rec });
    setActiveRecurrenceRowId(null);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDatePickerRowId(null);
      setActiveRecurrenceRowId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDateDisplay = (dateStr?: string, status?: string) => {
    if (!dateStr) return { text: 'Definir prazo...', isOverdue: false, isToday: false };
    const isToday = dateStr === todayStr;
    const isOverdue = dateStr < todayStr && status !== 'Concluído';
    const parts = dateStr.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    return { text: formatted, isOverdue, isToday };
  };

  return (
    <div className="table-view-wrapper" style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
        <thead>
          <tr>
            {/* Título */}
            <th style={{ width: `${colWidths.title}px`, position: 'relative' }}>
              <span>Título</span>
              <div
                className="col-resizer"
                onMouseDown={(e) => startResizing('title', e)}
                title="Arraste para redimensionar largura"
              />
            </th>

            {/* Status */}
            <th style={{ width: `${colWidths.status}px`, position: 'relative' }}>
              <span>Status</span>
              <div
                className="col-resizer"
                onMouseDown={(e) => startResizing('status', e)}
                title="Arraste para redimensionar largura"
              />
            </th>

            {/* Prioridade */}
            <th style={{ width: `${colWidths.priority}px`, position: 'relative' }}>
              <span>Prioridade</span>
              <div
                className="col-resizer"
                onMouseDown={(e) => startResizing('priority', e)}
                title="Arraste para redimensionar largura"
              />
            </th>

            {/* Prazo */}
            <th style={{ width: `${colWidths.date}px`, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} />
                <span>Prazo</span>
              </div>
              <div
                className="col-resizer"
                onMouseDown={(e) => startResizing('date', e)}
                title="Arraste para redimensionar largura"
              />
            </th>

            {/* Recorrência */}
            <th style={{ width: `${colWidths.recurrence}px`, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Repeat size={12} />
                <span>Recorrência</span>
              </div>
              <div
                className="col-resizer"
                onMouseDown={(e) => startResizing('recurrence', e)}
                title="Arraste para redimensionar largura"
              />
            </th>

            {/* Responsável */}
            <th style={{ width: `${colWidths.assignee}px`, position: 'relative' }}>
              <span>Responsável</span>
              <div
                className="col-resizer"
                onMouseDown={(e) => startResizing('assignee', e)}
                title="Arraste para redimensionar largura"
              />
            </th>

            {/* Ação */}
            <th style={{ width: `${colWidths.actions}px`, textAlign: 'center' }}>
              <span>Ação</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map(row => {
            const dateInfo = formatDateDisplay(row.date, row.status);
            const recLabel = row.recurrence && row.recurrence.frequency !== 'none'
              ? formatRecurrenceLabel(row.recurrence)
              : null;

            return (
              <tr key={row.id}>
                {/* Título */}
                <td style={{ width: `${colWidths.title}px` }}>
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

                {/* Status */}
                <td style={{ width: `${colWidths.status}px` }}>
                  <select
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      padding: '3px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      width: '100%'
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

                {/* Prioridade */}
                <td style={{ width: `${colWidths.priority}px` }}>
                  <select
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      padding: '3px 6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      width: '100%'
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

                {/* Prazo com Popover & Atalhos Rápidos */}
                <td style={{ width: `${colWidths.date}px`, position: 'relative' }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRecurrenceRowId(null);
                      setActiveDatePickerRowId(activeDatePickerRowId === row.id ? null : row.id);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 7px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      backgroundColor: dateInfo.isOverdue
                        ? 'rgba(239, 68, 68, 0.15)'
                        : dateInfo.isToday
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'var(--bg-secondary)',
                      color: dateInfo.isOverdue
                        ? '#ef4444'
                        : dateInfo.isToday
                        ? '#f59e0b'
                        : row.date
                        ? 'var(--text-primary)'
                        : 'var(--text-muted)',
                      border: `1px solid ${
                        dateInfo.isOverdue
                          ? 'rgba(239, 68, 68, 0.35)'
                          : dateInfo.isToday
                          ? 'rgba(245, 158, 11, 0.35)'
                          : 'var(--border-subtle)'
                      }`,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={dateInfo.isOverdue ? 'Tarefa atrasada!' : dateInfo.isToday ? 'Prazo hoje!' : 'Alterar prazo'}
                  >
                    {dateInfo.isOverdue && <AlertCircle size={12} />}
                    {!dateInfo.isOverdue && <Calendar size={12} />}
                    <span>{dateInfo.text}</span>
                    <ChevronDown size={11} style={{ opacity: 0.6 }} />
                  </div>

                  {activeDatePickerRowId === row.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '4px',
                        marginTop: '4px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '8px',
                        zIndex: 100,
                        minWidth: '190px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Atalhos de data:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <button
                          type="button"
                          className="nav-btn"
                          style={{ fontSize: '11px', padding: '3px 6px', justifyContent: 'center' }}
                          onClick={() => setQuickDate(row.id, 0)}
                        >
                          Hoje
                        </button>
                        <button
                          type="button"
                          className="nav-btn"
                          style={{ fontSize: '11px', padding: '3px 6px', justifyContent: 'center' }}
                          onClick={() => setQuickDate(row.id, 1)}
                        >
                          Amanhã
                        </button>
                        <button
                          type="button"
                          className="nav-btn"
                          style={{ fontSize: '11px', padding: '3px 6px', justifyContent: 'center' }}
                          onClick={() => setQuickDate(row.id, 7)}
                        >
                          +1 Semana
                        </button>
                        <button
                          type="button"
                          className="nav-btn"
                          style={{ fontSize: '11px', padding: '3px 6px', justifyContent: 'center', color: '#ef4444' }}
                          onClick={() => setQuickDate(row.id, null)}
                        >
                          Limpar
                        </button>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Escolher data exata:
                        </div>
                        <input
                          type="date"
                          style={{
                            width: '100%',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 6px',
                            color: 'var(--text-primary)',
                            fontSize: '12px'
                          }}
                          value={row.date || ''}
                          onChange={(e) => {
                            handleUpdateRow(row.id, { date: e.target.value });
                            setActiveDatePickerRowId(null);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </td>

                {/* Recorrência com Popover */}
                <td style={{ width: `${colWidths.recurrence}px`, position: 'relative' }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDatePickerRowId(null);
                      setActiveRecurrenceRowId(activeRecurrenceRowId === row.id ? null : row.id);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 7px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      backgroundColor: recLabel ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                      color: recLabel ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${recLabel ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={recLabel ? `Repete: ${recLabel}` : 'Adicionar recorrência'}
                  >
                    <Repeat size={12} />
                    <span>{recLabel || '+ Repetir'}</span>
                    <ChevronDown size={11} style={{ opacity: 0.6 }} />
                  </div>

                  {activeRecurrenceRowId === row.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '4px',
                        marginTop: '4px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '8px',
                        zIndex: 100,
                        minWidth: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>
                        Recorrência rápida:
                      </div>

                      <button
                        type="button"
                        className="slash-menu-item"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        onClick={() => setQuickRecurrence(row.id, { frequency: 'custom_days', daysOfWeek: [1, 3, 5], label: 'Seg, Qua, Sex' })}
                      >
                        <span>🔁</span>
                        <span>Seg, Qua, Sex (3x semana)</span>
                      </button>

                      <button
                        type="button"
                        className="slash-menu-item"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        onClick={() => setQuickRecurrence(row.id, { frequency: 'daily' })}
                      >
                        <span>☀️</span>
                        <span>Todos os dias</span>
                      </button>

                      <button
                        type="button"
                        className="slash-menu-item"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        onClick={() => setQuickRecurrence(row.id, { frequency: 'weekdays' })}
                      >
                        <span>💼</span>
                        <span>Segunda a Sexta</span>
                      </button>

                      <button
                        type="button"
                        className="slash-menu-item"
                        style={{ fontSize: '12px', padding: '5px 8px' }}
                        onClick={() => setQuickRecurrence(row.id, { frequency: 'weekly', daysOfWeek: [1] })}
                      >
                        <span>📅</span>
                        <span>Semanal (Toda Seg)</span>
                      </button>

                      <button
                        type="button"
                        className="slash-menu-item"
                        style={{ fontSize: '12px', padding: '5px 8px', color: '#ef4444' }}
                        onClick={() => setQuickRecurrence(row.id, undefined)}
                      >
                        <span>✖️</span>
                        <span>Sem recorrência</span>
                      </button>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', marginTop: '2px' }}>
                        <button
                          type="button"
                          className="slash-menu-item"
                          style={{ fontSize: '11px', padding: '4px 6px', color: 'var(--accent)' }}
                          onClick={() => {
                            setActiveRecurrenceRowId(null);
                            onOpenRow(row.id);
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Personalizar dias...</span>
                        </button>
                      </div>
                    </div>
                  )}
                </td>

                {/* Responsável */}
                <td style={{ width: `${colWidths.assignee}px` }}>
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

                {/* Ação */}
                <td style={{ width: `${colWidths.actions}px` }}>
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
            );
          })}
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
