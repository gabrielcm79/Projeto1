import React, { useState } from 'react';
import { Plus, Kanban, Table as TableIcon, Calendar as CalendarIcon, AlignLeft } from 'lucide-react';
import type { DatabaseConfig, DatabaseRow } from '../../types';
import { TableView } from './TableView';
import { KanbanBoardView } from './KanbanBoardView';
import { CalendarView } from './CalendarView';
import { GanttView } from './GanttView';
import { RowPageModal } from './RowPageModal';

interface DatabaseViewProps {
  config: DatabaseConfig;
  databaseTitle?: string;
  onChange: (updatedConfig: DatabaseConfig) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ 
  config, 
  databaseTitle = 'Base de Dados',
  onChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const selectedRow = config.rows.find(r => r.id === selectedRowId) || null;

  const handleAddNewItem = () => {
    const newItem: DatabaseRow = {
      id: `item-${Date.now()}`,
      title: 'Nova Tarefa',
      status: 'A Fazer',
      priority: 'Média',
      date: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      assignee: 'Eu'
    };
    onChange({
      ...config,
      rows: [newItem, ...config.rows]
    });
    setSelectedRowId(newItem.id);
  };

  const handleUpdateRow = (updatedRow: DatabaseRow) => {
    onChange({
      ...config,
      rows: config.rows.map(r => r.id === updatedRow.id ? updatedRow : r)
    });
  };

  const handleDeleteRow = (id: string) => {
    onChange({
      ...config,
      rows: config.rows.filter(r => r.id !== id)
    });
    if (selectedRowId === id) {
      setSelectedRowId(null);
    }
  };

  return (
    <div className="db-container">
      {/* Database View Toolbar with 4 View Switchers */}
      <div className="db-toolbar" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="db-search-input"
              placeholder="Filtrar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {config.rows.length} {config.rows.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Buttons (Table, Kanban, Calendar, Gantt) */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)', gap: '2px' }}>
            <button
              className="view-tab"
              title="Visualização em Tabela"
              style={{
                padding: '4px 8px',
                fontSize: '12.5px',
                background: config.activeView === 'table' ? 'var(--bg-tertiary)' : 'transparent',
                color: config.activeView === 'table' ? 'var(--accent)' : 'var(--text-secondary)'
              }}
              onClick={() => onChange({ ...config, activeView: 'table' })}
            >
              <TableIcon size={14} />
              <span>Tabela</span>
            </button>

            <button
              className="view-tab"
              title="Quadro Kanban"
              style={{
                padding: '4px 8px',
                fontSize: '12.5px',
                background: config.activeView === 'board' ? 'var(--bg-tertiary)' : 'transparent',
                color: config.activeView === 'board' ? 'var(--accent)' : 'var(--text-secondary)'
              }}
              onClick={() => onChange({ ...config, activeView: 'board' })}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>

            <button
              className="view-tab"
              title="Calendário Mensal"
              style={{
                padding: '4px 8px',
                fontSize: '12.5px',
                background: config.activeView === 'calendar' ? 'var(--bg-tertiary)' : 'transparent',
                color: config.activeView === 'calendar' ? 'var(--accent)' : 'var(--text-secondary)'
              }}
              onClick={() => onChange({ ...config, activeView: 'calendar' })}
            >
              <CalendarIcon size={14} />
              <span>Calendário</span>
            </button>

            <button
              className="view-tab"
              title="Linha do Tempo / Gráfico de Gantt"
              style={{
                padding: '4px 8px',
                fontSize: '12.5px',
                background: config.activeView === 'gantt' ? 'var(--bg-tertiary)' : 'transparent',
                color: config.activeView === 'gantt' ? 'var(--accent)' : 'var(--text-secondary)'
              }}
              onClick={() => onChange({ ...config, activeView: 'gantt' })}
            >
              <AlignLeft size={14} />
              <span>Gantt</span>
            </button>
          </div>

          <button className="nav-btn primary" onClick={handleAddNewItem}>
            <Plus size={14} />
            <span>Novo Item</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {config.activeView === 'board' && (
        <KanbanBoardView
          config={config}
          searchQuery={searchQuery}
          onChange={onChange}
          onOpenRow={(id) => setSelectedRowId(id)}
        />
      )}

      {config.activeView === 'table' && (
        <TableView
          config={config}
          searchQuery={searchQuery}
          onChange={onChange}
          onOpenRow={(id) => setSelectedRowId(id)}
        />
      )}

      {config.activeView === 'calendar' && (
        <CalendarView
          config={config}
          searchQuery={searchQuery}
          onChange={onChange}
          onOpenRow={(id) => setSelectedRowId(id)}
        />
      )}

      {config.activeView === 'gantt' && (
        <GanttView
          config={config}
          searchQuery={searchQuery}
          onChange={onChange}
          onOpenRow={(id) => setSelectedRowId(id)}
        />
      )}

      {/* Row Opened as a Full Page Modal (Notion-style) */}
      <RowPageModal
        isOpen={!!selectedRow}
        row={selectedRow}
        databaseTitle={databaseTitle}
        statuses={config.statuses}
        onClose={() => setSelectedRowId(null)}
        onUpdateRow={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
      />
    </div>
  );
};
