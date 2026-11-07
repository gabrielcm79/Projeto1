import React from 'react';
import { 
  Smile, Image as ImageIcon, Trash2, FileText, 
  Kanban, Palette, CheckCircle2, Clock
} from 'lucide-react';
import type { Page, ViewType } from '../../types';

interface PageHeaderProps {
  page: Page;
  onUpdateTitle: (title: string) => void;
  onOpenEmojiPicker: () => void;
  onOpenCoverPicker: () => void;
  onRemoveCover: () => void;
  onChangeViewType: (type: ViewType) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  onUpdateTitle,
  onOpenEmojiPicker,
  onOpenCoverPicker,
  onRemoveCover,
  onChangeViewType,
}) => {
  // Compute checklist and document stats
  const safeBlocks = Array.isArray(page.blocks) ? page.blocks : [];
  const totalTodos = safeBlocks.filter(b => b.type === 'todo').length;
  const completedTodos = safeBlocks.filter(b => b.type === 'todo' && b.properties?.checked).length;
  const percent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  const totalWords = safeBlocks.reduce((acc, b) => acc + (b.content?.trim() ? b.content.trim().split(/\s+/).length : 0), 0);

  return (
    <div>
      {/* Cover Banner */}
      {page.coverUrl && (
        <div style={{ position: 'relative' }}>
          <img src={page.coverUrl} alt="Capa da Página" className="page-cover-banner" />
          <div className="cover-actions-overlay">
            <button className="nav-btn" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }} onClick={onOpenCoverPicker}>
              <ImageIcon size={13} />
              <span>Mudar Capa</span>
            </button>
            <button className="nav-btn" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }} onClick={onRemoveCover}>
              <Trash2 size={13} />
              <span>Remover</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Block inside Content Area */}
      <div className="page-header-block">
        {/* Hover Action Chips */}
        <div className="page-header-actions">
          {!page.icon && (
            <button className="action-chip" onClick={onOpenEmojiPicker}>
              <Smile size={13} />
              <span>Adicionar Ícone</span>
            </button>
          )}
          {!page.coverUrl && (
            <button className="action-chip" onClick={onOpenCoverPicker}>
              <ImageIcon size={13} />
              <span>Adicionar Capa</span>
            </button>
          )}
        </div>

        {/* Page Icon */}
        {page.icon && (
          <div
            className="page-icon-wrapper"
            title="Alterar Ícone"
            onClick={onOpenEmojiPicker}
          >
            {page.icon}
          </div>
        )}

        {/* Page Title */}
        <input
          type="text"
          className="page-title-input"
          placeholder="Sem título"
          value={page.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
        />

        {/* Progress & Insights Bar */}
        {(totalTodos > 0 || totalWords > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '14px', flexWrap: 'wrap' }}>
            {totalTodos > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
                <CheckCircle2 size={15} color={percent === 100 ? '#10b981' : 'var(--accent)'} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    <span>Progresso das Tarefas</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{completedTodos}/{totalTodos} ({percent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', borderRadius: '999px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: '999px',
                        background: percent === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'var(--accent-gradient)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {totalWords > 0 && page.type === 'document' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <Clock size={13} />
                <span>{totalWords} palavras • ~{Math.max(1, Math.ceil(totalWords / 200))} min de leitura</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Switcher Tabs (Documento, Base de Dados, Quadro de Desenho) */}
      <div className="view-tabs" style={{ overflowX: 'auto', flexWrap: 'nowrap', gap: '6px' }}>
        <button
          className={`view-tab ${page.type === 'document' ? 'active' : ''}`}
          onClick={() => onChangeViewType('document')}
          title="Modo de edição em blocos de documento"
        >
          <FileText size={15} />
          <span>Documento</span>
        </button>

        <button
          className={`view-tab ${['board', 'table', 'calendar', 'gantt'].includes(page.type) ? 'active' : ''}`}
          onClick={() => onChangeViewType(page.databaseConfig?.activeView || 'board')}
          title="Base de dados com visualizações em Kanban, Tabela, Calendário e Gantt"
        >
          <Kanban size={15} />
          <span>Base de Dados</span>
        </button>

        <button
          className={`view-tab ${page.type === 'whiteboard' ? 'active' : ''}`}
          onClick={() => onChangeViewType('whiteboard')}
          title="Quadro branco estilo Miro com desenho livre, post-its e formas"
        >
          <Palette size={15} />
          <span>Quadro de Desenho (Miro)</span>
        </button>
      </div>
    </div>
  );
};
