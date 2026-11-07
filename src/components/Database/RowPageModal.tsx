import React, { useState } from 'react';
import { 
  X, Maximize2, Minimize2, Calendar, User, 
  Smile, Image as ImageIcon, Trash2, Tag, Flag, Clock
} from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseRow, Block, StatusOption } from '../../types';
import { BlockEditor } from '../Editor/BlockEditor';
import { EmojiPickerModal } from '../Modals/EmojiPickerModal';
import { CoverPickerModal } from '../Modals/CoverPickerModal';

interface RowPageModalProps {
  isOpen: boolean;
  row: DatabaseRow | null;
  databaseTitle: string;
  statuses?: StatusOption[];
  onClose: () => void;
  onUpdateRow: (updatedRow: DatabaseRow) => void;
  onDeleteRow: (id: string) => void;
}

export const RowPageModal: React.FC<RowPageModalProps> = ({
  isOpen,
  row,
  databaseTitle,
  statuses,
  onClose,
  onUpdateRow,
  onDeleteRow,
}) => {
  const effectiveStatuses = statuses && statuses.length > 0 ? statuses : DEFAULT_STATUSES;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  if (!isOpen || !row) return null;

  const currentBlocks: Block[] = (row.blocks && row.blocks.length > 0) ? row.blocks : [
    {
      id: `block-${Date.now()}-1`,
      type: 'paragraph',
      content: ''
    }
  ];

  const handleBlocksChange = (newBlocks: Block[]) => {
    onUpdateRow({
      ...row,
      blocks: newBlocks
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card row-page-modal"
        style={{
          width: isFullScreen ? '98vw' : '820px',
          maxWidth: isFullScreen ? '98vw' : '880px',
          height: isFullScreen ? '96vh' : '88vh',
          maxHeight: isFullScreen ? '96vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Topbar / Breadcrumbs */}
        <div className="modal-header" style={{ padding: '10px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>{databaseTitle}</span>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.title || 'Sem título'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="sidebar-btn-icon"
              title={isFullScreen ? 'Restaurar Tamanho' : 'Tela Cheia'}
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              className="sidebar-btn-icon"
              style={{ color: '#ef4444' }}
              title="Excluir Item"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este item?')) {
                  onDeleteRow(row.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={15} />
            </button>
            <button className="sidebar-btn-icon" onClick={onClose} title="Fechar (Esc)">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
          {/* Optional Page Cover */}
          {row.coverUrl && (
            <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
              <img
                src={row.coverUrl}
                alt="Capa"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '8px', right: '12px', display: 'flex', gap: '6px' }}>
                <button
                  className="nav-btn"
                  style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => setShowCoverPicker(true)}
                >
                  <ImageIcon size={12} />
                  <span>Trocar Capa</span>
                </button>
                <button
                  className="nav-btn"
                  style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => onUpdateRow({ ...row, coverUrl: undefined })}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )}

          <div style={{ padding: '24px 36px 80px 36px' }}>
            {/* Header Hover Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {!row.icon && (
                <button className="action-chip" onClick={() => setShowEmojiPicker(true)}>
                  <Smile size={13} />
                  <span>Adicionar Ícone</span>
                </button>
              )}
              {!row.coverUrl && (
                <button className="action-chip" onClick={() => setShowCoverPicker(true)}>
                  <ImageIcon size={13} />
                  <span>Adicionar Capa</span>
                </button>
              )}
            </div>

            {/* Icon */}
            {row.icon && (
              <div
                className="page-icon-wrapper"
                style={{ fontSize: '42px', marginBottom: '8px' }}
                onClick={() => setShowEmojiPicker(true)}
                title="Mudar Ícone"
              >
                {row.icon}
              </div>
            )}

            {/* Title */}
            <input
              type="text"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '20px'
              }}
              placeholder="Nome da Tarefa / Página..."
              value={row.title}
              onChange={(e) => onUpdateRow({ ...row, title: e.target.value })}
            />

            {/* Structured Properties Grid (Notion-style) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                rowGap: '12px',
                columnGap: '16px',
                fontSize: '13px',
                padding: '14px 18px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '28px'
              }}
            >
              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Tag size={14} />
                <span>Status</span>
              </div>
              <div>
                <select
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '4px 10px',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                  value={row.status}
                  onChange={(e) => onUpdateRow({ ...row, status: e.target.value })}
                >
                  {effectiveStatuses.map(s => (
                    <option key={s.id} value={s.name}>
                      ● {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Flag size={14} />
                <span>Prioridade</span>
              </div>
              <div>
                <select
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    padding: '4px 10px',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                  value={row.priority || 'Média'}
                  onChange={(e) => onUpdateRow({ ...row, priority: e.target.value as any })}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              {/* Start Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Calendar size={14} />
                <span>Data Início</span>
              </div>
              <div>
                <input
                  type="date"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    color: 'var(--text-primary)',
                    fontSize: '12.5px'
                  }}
                  value={row.date || ''}
                  onChange={(e) => onUpdateRow({ ...row, date: e.target.value })}
                />
              </div>

              {/* End Date (for Gantt) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Clock size={14} />
                <span>Prazo / Término</span>
              </div>
              <div>
                <input
                  type="date"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    color: 'var(--text-primary)',
                    fontSize: '12.5px'
                  }}
                  value={row.endDate || ''}
                  onChange={(e) => onUpdateRow({ ...row, endDate: e.target.value })}
                />
              </div>

              {/* Assignee */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <User size={14} />
                <span>Responsável</span>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Atribuir pessoa..."
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 10px',
                    color: 'var(--text-primary)',
                    fontSize: '12.5px',
                    width: '220px'
                  }}
                  value={row.assignee || ''}
                  onChange={(e) => onUpdateRow({ ...row, assignee: e.target.value })}
                />
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '24px' }} />

            {/* Full Rich Document Page Body with BlockEditor */}
            <div style={{ minHeight: '260px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Conteúdo da Página
              </div>
              <BlockEditor
                blocks={currentBlocks}
                onChange={handleBlocksChange}
              />
            </div>
          </div>
        </div>

        {/* Emoji & Cover Modals */}
        <EmojiPickerModal
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={(emoji) => {
            onUpdateRow({ ...row, icon: emoji });
            setShowEmojiPicker(false);
          }}
        />

        <CoverPickerModal
          isOpen={showCoverPicker}
          onClose={() => setShowCoverPicker(false)}
          onSelectCover={(url) => {
            onUpdateRow({ ...row, coverUrl: url });
            setShowCoverPicker(false);
          }}
        />
      </div>
    </div>
  );
};
