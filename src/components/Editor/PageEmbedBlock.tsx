import React, { useState } from 'react';
import type { Page, EmbedMode } from '../../types';
import { ExternalLink, ChevronDown, Layers, Eye } from 'lucide-react';

interface PageEmbedBlockProps {
  embedPageId?: string;
  embedMode?: EmbedMode;
  pages: Page[];
  onSelectPage?: (pageId: string) => void;
  onChangeEmbed?: (pageId: string, mode: EmbedMode) => void;
  readOnly?: boolean;
}

const MODE_LABELS: Record<EmbedMode, string> = {
  full: 'Página completa',
  first_block: 'Primeiro bloco',
  database: 'Banco de dados',
};

export const PageEmbedBlock: React.FC<PageEmbedBlockProps> = ({
  embedPageId,
  embedMode = 'first_block',
  pages,
  onSelectPage,
  onChangeEmbed,
  readOnly = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const safePages = pages || [];
  const targetPage = safePages.find(p => p.id === embedPageId && !p.isDeleted);
  const filtered = safePages.filter(p => !p.isDeleted && (p.title || '').toLowerCase().includes(search.toLowerCase()));

  const renderEmbedContent = () => {
    if (!targetPage) return null;

    // Database embed
    if (embedMode === 'database' && targetPage.databaseConfig) {
      const rows = targetPage.databaseConfig.rows.slice(0, 5);
      const cols = targetPage.databaseConfig.columns.slice(0, 4);
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr>
                {cols.map(col => (
                  <th key={col.id} style={{
                    padding: '7px 12px', background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)', fontWeight: 600, fontSize: '11px',
                    textAlign: 'left', borderBottom: '1px solid var(--border-color)'
                  }}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  {cols.map(col => {
                    let value: string = '';
                    if (col.id === 'title') value = row.title;
                    else if (col.id === 'status') value = row.status;
                    else if (col.id === 'priority') value = row.priority || '';
                    else if (col.id === 'date') value = row.date || '';
                    else if (col.id === 'assignee') value = row.assignee || '';
                    return (
                      <td key={col.id} style={{
                        padding: '7px 12px', borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}>{value}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {targetPage.databaseConfig.rows.length > 5 && (
            <div style={{ padding: '6px 12px', fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
              + {targetPage.databaseConfig.rows.length - 5} itens adicionais
            </div>
          )}
        </div>
      );
    }

    // First block embed
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

    // Full embed — show first few blocks as text
    const previewBlocks = (targetPage.blocks || []).slice(0, 4);
    return (
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
        {(targetPage.blocks || []).length > 4 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            + {(targetPage.blocks || []).length - 4} blocos adicionais...
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

  return (
    <div className="page-embed-block" style={{ margin: '10px 0' }}>
      {/* Header */}
      <div className="page-embed-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px' }}>{targetPage.icon || '📄'}</span>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
            {targetPage.title || 'Sem título'}
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
            background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500
          }}>
            {MODE_LABELS[embedMode]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {!readOnly && (
            <div style={{ position: 'relative' }}>
              <button
                className="sidebar-btn-icon"
                title="Mudar modo"
                onClick={() => setShowPicker(!showPicker)}
                style={{ fontSize: '11px' }}
              >
                <Eye size={13} />
              </button>
              {showPicker && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                  padding: '6px', zIndex: 80, width: '180px'
                }}>
                  {(['first_block', 'database', 'full'] as EmbedMode[]).map(mode => (
                    <div
                      key={mode}
                      className="slash-menu-item"
                      style={{ padding: '6px 10px', fontSize: '12.5px', fontWeight: embedMode === mode ? 600 : 400, color: embedMode === mode ? 'var(--accent)' : undefined }}
                      onClick={() => { onChangeEmbed?.(targetPage.id, mode); setShowPicker(false); }}
                    >
                      {MODE_LABELS[mode]}
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', marginTop: '4px' }}>
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
            title="Abrir página"
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
    </div>
  );
};
