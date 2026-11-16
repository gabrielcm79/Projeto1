import React, { useState } from 'react';
import type { Page, EmbedMode, DatabaseConfig, DatabaseRow } from '../../types';
import { ExternalLink, ChevronDown, Layers, Eye, Table, Kanban, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { KanbanBoardView } from '../Database/KanbanBoardView';
import { CalendarView } from '../Database/CalendarView';
import { GanttView } from '../Database/GanttView';
import { TableView } from '../Database/TableView';
import { RowPageModal } from '../Database/RowPageModal';

interface PageEmbedBlockProps {
  embedPageId?: string;
  embedMode?: EmbedMode;
  pages: Page[];
  onSelectPage?: (pageId: string) => void;
  onChangeEmbed?: (pageId: string, mode: EmbedMode) => void;
  onUpdatePage?: (pageId: string, updates: Partial<Page>) => void;
  readOnly?: boolean;
}

const MODE_LABELS: Record<EmbedMode, string> = {
  first_block: 'Primeiro bloco',
  database: 'Banco de dados',
  kanban: 'Quadro Kanban',
  calendar: 'Calendário (Hoje, Semana, Mês)',
  gantt: 'Cronograma Gantt',
  full: 'Página completa',
};

const MODE_ICONS: Record<EmbedMode, React.ReactNode> = {
  first_block: <Layers size={13} />,
  database: <Table size={13} />,
  kanban: <Kanban size={13} />,
  calendar: <CalendarIcon size={13} />,
  gantt: <Clock size={13} />,
  full: <ExternalLink size={13} />,
};

export const PageEmbedBlock: React.FC<PageEmbedBlockProps> = ({
  embedPageId,
  embedMode = 'first_block',
  pages,
  onSelectPage,
  onChangeEmbed,
  onUpdatePage,
  readOnly = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [openedRowId, setOpenedRowId] = useState<string | null>(null);

  const safePages = pages || [];
  const targetPage = safePages.find(p => p.id === embedPageId && !p.isDeleted);
  const filtered = safePages.filter(p => !p.isDeleted && (p.title || '').toLowerCase().includes(search.toLowerCase()));

  const handleUpdateDatabase = (newConfig: DatabaseConfig) => {
    if (!targetPage || !onUpdatePage) return;
    onUpdatePage(targetPage.id, { databaseConfig: newConfig });
  };

  const handleUpdateRow = (updatedRow: DatabaseRow) => {
    if (!targetPage || !targetPage.databaseConfig || !onUpdatePage) return;
    const newConfig: DatabaseConfig = {
      ...targetPage.databaseConfig,
      rows: targetPage.databaseConfig.rows.map(r => r.id === updatedRow.id ? updatedRow : r)
    };
    onUpdatePage(targetPage.id, { databaseConfig: newConfig });
  };

  const handleDeleteRow = (rowId: string) => {
    if (!targetPage || !targetPage.databaseConfig || !onUpdatePage) return;
    const newConfig: DatabaseConfig = {
      ...targetPage.databaseConfig,
      rows: targetPage.databaseConfig.rows.filter(r => r.id !== rowId)
    };
    onUpdatePage(targetPage.id, { databaseConfig: newConfig });
  };

  const targetRow = targetPage?.databaseConfig?.rows.find(r => r.id === openedRowId) || null;

  const renderEmbedContent = () => {
    if (!targetPage) return null;

    // KANBAN VIEW EMBED
    if (embedMode === 'kanban' && targetPage.databaseConfig) {
      return (
        <div style={{ padding: '8px 0', overflowX: 'auto' }}>
          <KanbanBoardView
            config={targetPage.databaseConfig}
            searchQuery=""
            onChange={handleUpdateDatabase}
            onOpenRow={(id) => setOpenedRowId(id)}
          />
        </div>
      );
    }

    // CALENDAR VIEW EMBED (with Hoje, Semana, Mês)
    if (embedMode === 'calendar' && targetPage.databaseConfig) {
      return (
        <div style={{ padding: '8px' }}>
          <CalendarView
            config={targetPage.databaseConfig}
            searchQuery=""
            initialMode="month"
            onChange={handleUpdateDatabase}
            onOpenRow={(id) => setOpenedRowId(id)}
          />
        </div>
      );
    }

    // GANTT VIEW EMBED
    if (embedMode === 'gantt' && targetPage.databaseConfig) {
      return (
        <div style={{ padding: '8px', overflowX: 'auto' }}>
          <GanttView
            config={targetPage.databaseConfig}
            searchQuery=""
            onChange={handleUpdateDatabase}
            onOpenRow={(id) => setOpenedRowId(id)}
          />
        </div>
      );
    }

    // DATABASE TABLE EMBED
    if (embedMode === 'database' && targetPage.databaseConfig) {
      return (
        <div style={{ padding: '4px 0', overflowX: 'auto' }}>
          <TableView
            config={targetPage.databaseConfig}
            searchQuery=""
            onChange={handleUpdateDatabase}
            onOpenRow={(id) => setOpenedRowId(id)}
          />
        </div>
      );
    }

    // FIRST BLOCK EMBED
    if (embedMode === 'first_block') {
      const firstBlock = targetPage.blocks?.[0];
      if (!firstBlock) return <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>Página sem conteúdo</div>;

      if (firstBlock.type === 'table' && firstBlock.properties?.tableData) {
        const tData = firstBlock.properties.tableData;
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <tbody>
              {tData.slice(0, 4).map((row, ri) => (
                <tr key={ri} style={{ background: ri === 0 ? 'var(--bg-tertiary)' : 'transparent' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: ri === 0 ? 600 : 400, color: 'var(--text-primary)', fontSize: '12px' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      return (
        <div style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6 }}>
          {firstBlock.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem conteúdo de texto</span>}
        </div>
      );
    }

    // FULL EMBED — Preview blocks
    const previewBlocks = (targetPage.blocks || []).slice(0, 6);
    return (
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {previewBlocks.map(b => (
          <div key={b.id} style={{
            fontSize: b.type === 'heading1' ? '16px' : b.type === 'heading2' ? '14px' : '13px',
            fontWeight: b.type.startsWith('heading') ? 600 : 400,
            color: b.type.startsWith('heading') ? 'var(--text-primary)' : 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            {b.type === 'bullet' && <span>• </span>}
            {b.type === 'todo' && <span style={{ marginRight: '6px' }}>{b.properties?.checked ? '☑' : '☐'}</span>}
            {b.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
          </div>
        ))}
        {(targetPage.blocks || []).length > 6 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
            + {(targetPage.blocks || []).length - 6} blocos adicionais...
          </div>
        )}
      </div>
    );
  };

  if (!targetPage) {
    return (
      <div style={{ margin: '8px 0', position: 'relative', display: 'inline-block' }}>
        <button
          className="page-link-placeholder"
          onClick={() => !readOnly && setShowPicker(!showPicker)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-tertiary)', border: '1px dashed var(--accent)',
            color: 'var(--accent)', cursor: readOnly ? 'default' : 'pointer',
            fontSize: '13.5px', fontWeight: 500
          }}
        >
          <Layers size={16} />
          <span>Selecionar página para incorporar...</span>
          {!readOnly && <ChevronDown size={14} />}
        </button>

        {showPicker && !readOnly && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '6px',
            width: '300px', maxHeight: '300px', backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)', padding: '8px', zIndex: 80, display: 'flex', flexDirection: 'column'
          }}>
            <input
              type="text" placeholder="Pesquisar página..."
              value={search} onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--text-primary)',
                fontSize: '12.5px', outline: 'none', marginBottom: '6px'
              }}
            />
            <div style={{ overflowY: 'auto', maxHeight: '220px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filtered.map(p => (
                <div
                  key={p.id}
                  className="slash-menu-item"
                  onClick={() => { onChangeEmbed?.(p.id, embedMode); setShowPicker(false); }}
                  style={{ padding: '7px 10px', fontSize: '13px' }}
                >
                  <span>{p.icon || '📄'}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title || 'Sem título'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const availableModes: EmbedMode[] = targetPage.databaseConfig
    ? ['first_block', 'database', 'kanban', 'calendar', 'gantt', 'full']
    : ['first_block', 'full'];

  return (
    <div className="page-embed-block" style={{ margin: '10px 0' }}>
      {/* Header */}
      <div className="page-embed-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '17px' }}>{targetPage.icon || '📄'}</span>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
            {targetPage.title || 'Sem título'}
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
            background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}>
            {MODE_ICONS[embedMode]}
            <span>{MODE_LABELS[embedMode]}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {!readOnly && (
            <div style={{ position: 'relative' }}>
              <button
                className="sidebar-btn-icon"
                title="Mudar modo de visualização"
                onClick={() => setShowPicker(!showPicker)}
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Eye size={13} />
                <ChevronDown size={11} />
              </button>
              {showPicker && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                  padding: '6px', zIndex: 80, width: '220px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px' }}>
                    Visualização:
                  </div>
                  {availableModes.map(mode => (
                    <div
                      key={mode}
                      className="slash-menu-item"
                      style={{
                        padding: '6px 10px',
                        fontSize: '12.5px',
                        fontWeight: embedMode === mode ? 600 : 400,
                        color: embedMode === mode ? 'var(--accent)' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => { onChangeEmbed?.(targetPage.id, mode); setShowPicker(false); }}
                    >
                      {MODE_ICONS[mode]}
                      <span>{MODE_LABELS[mode]}</span>
                    </div>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', marginTop: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px' }}>
                      Trocar página:
                    </div>
                    {pages.filter(p => !p.isDeleted && p.id !== targetPage.id).slice(0, 5).map(p => (
                      <div
                        key={p.id}
                        className="slash-menu-item"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => { onChangeEmbed?.(p.id, embedMode); setShowPicker(false); }}
                      >
                        <span>{p.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            className="sidebar-btn-icon"
            title="Abrir página completa"
            onClick={() => onSelectPage?.(targetPage.id)}
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Embed Content */}
      <div className="page-embed-content">
        {renderEmbedContent()}
      </div>

      {/* Item Modal if clicked inside embed */}
      {targetRow && targetPage && targetPage.databaseConfig && (
        <RowPageModal
          isOpen={Boolean(openedRowId)}
          row={targetRow}
          databaseTitle={targetPage.title}
          statuses={targetPage.databaseConfig.statuses}
          onClose={() => setOpenedRowId(null)}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
        />
      )}
    </div>
  );
};
