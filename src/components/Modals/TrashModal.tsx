import React from 'react';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import type { Page } from '../../types';

interface TrashModalProps {
  isOpen: boolean;
  pages: Page[];
  onClose: () => void;
  onRestorePage: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  pages,
  onClose,
  onRestorePage,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  if (!isOpen) return null;

  const deletedPages = pages.filter(p => p.isDeleted);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} color="#ef4444" />
            <span className="modal-title">Lixeira ({deletedPages.length})</span>
          </div>
          <button className="sidebar-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {deletedPages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deletedPages.map(page => (
                <div
                  key={page.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{page.icon || '📄'}</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {page.title || 'Sem título'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="nav-btn"
                      title="Restaurar Página"
                      onClick={() => onRestorePage(page.id)}
                    >
                      <RotateCcw size={13} color="var(--accent)" />
                      <span>Restaurar</span>
                    </button>
                    <button
                      className="nav-btn"
                      style={{ color: '#ef4444' }}
                      title="Excluir Definitivamente"
                      onClick={() => onPermanentDelete(page.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Trash2 size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div>A lixeira está vazia.</div>
            </div>
          )}
        </div>

        {deletedPages.length > 0 && (
          <div className="modal-footer">
            <button
              className="nav-btn"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={onEmptyTrash}
            >
              <AlertTriangle size={13} />
              <span>Esvaziar Lixeira</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
