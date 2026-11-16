import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal, Star, Trash2, Copy, FileText, LayoutGrid, FolderInput } from 'lucide-react';
import type { Page } from '../../types';

interface PageItemViewProps {
  page: Page;
  allPages: Page[];
  activePageId: string;
  depth?: number;
  onSelectPage: (id: string) => void;
  onAddSubPage: (parentId: string) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onMovePage?: (pageId: string, targetParentId: string | null) => void;
}

function isDescendant(pages: Page[], childId: string, ancestorId: string): boolean {
  let curr = pages.find(p => p.id === childId);
  while (curr && curr.parentId) {
    if (curr.parentId === ancestorId) return true;
    curr = pages.find(p => p.id === curr?.parentId);
  }
  return false;
}

export const PageItemView: React.FC<PageItemViewProps> = ({
  page,
  allPages,
  activePageId,
  depth = 0,
  onSelectPage,
  onAddSubPage,
  onDeletePage,
  onToggleFavorite,
  onDuplicatePage,
  onMovePage,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const childPages = allPages.filter(p => p.parentId === page.id && !p.isDeleted);
  const hasChildren = childPages.length > 0;
  const isActive = activePageId === page.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', page.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedPageId = e.dataTransfer.getData('text/plain');
    if (!draggedPageId || draggedPageId === page.id) return;

    // Prevent cycles: cannot move a page inside its own descendant
    if (isDescendant(allPages, page.id, draggedPageId)) {
      alert('Não é possível mover uma página para dentro de uma de suas subpáginas.');
      return;
    }

    if (onMovePage) {
      onMovePage(draggedPageId, page.id);
      setIsExpanded(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        className={`page-item ${isActive ? 'active' : ''}`}
        style={{
          paddingLeft: `${depth * 14 + 8}px`,
          backgroundColor: isDragOver ? 'var(--accent-soft)' : undefined,
          outline: isDragOver ? '2px dashed var(--accent)' : undefined,
          outlineOffset: '-2px',
          transition: 'all 0.15s ease',
        }}
        draggable={true}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelectPage(page.id)}
        title={isDragOver ? `Solte para mover para dentro de "${page.title}"` : 'Arraste para mover para outra página'}
      >
        <span
          style={{ width: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span style={{ width: 14 }} />
          )}
        </span>

        <span className="page-icon">
          {page.icon || (page.type === 'board' || page.type === 'table' ? <LayoutGrid size={15} /> : <FileText size={15} />)}
        </span>

        <span className="page-title">{page.title || 'Sem título'}</span>

        {isDragOver && (
          <span style={{ fontSize: '11px', color: 'var(--accent)', marginLeft: 'auto', marginRight: '6px', fontWeight: 600 }}>
            Mover para cá
          </span>
        )}

        <div className="page-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="sidebar-btn-icon"
            title="Adicionar subpágina"
            onClick={() => {
              setIsExpanded(true);
              onAddSubPage(page.id);
            }}
          >
            <Plus size={14} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="sidebar-btn-icon"
              title="Mais opções"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={14} />
            </button>

            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '4px',
                  zIndex: 50,
                  minWidth: '160px'
                }}
              >
                {page.parentId && onMovePage && (
                  <div
                    className="slash-menu-item"
                    onClick={() => {
                      onMovePage(page.id, null);
                      setShowMenu(false);
                    }}
                  >
                    <FolderInput size={14} />
                    <span>Mover para Raiz</span>
                  </div>
                )}
                <div
                  className="slash-menu-item"
                  onClick={() => {
                    onToggleFavorite(page.id);
                    setShowMenu(false);
                  }}
                >
                  <Star size={14} color={page.isFavorite ? '#f59e0b' : 'inherit'} />
                  <span>{page.isFavorite ? 'Remover Favorito' : 'Favoritar'}</span>
                </div>
                <div
                  className="slash-menu-item"
                  onClick={() => {
                    onDuplicatePage(page.id);
                    setShowMenu(false);
                  }}
                >
                  <Copy size={14} />
                  <span>Duplicar</span>
                </div>
                <div
                  className="slash-menu-item"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    onDeletePage(page.id);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Mover p/ Lixeira</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {childPages.map(child => (
            <PageItemView
              key={child.id}
              page={child}
              allPages={allPages}
              activePageId={activePageId}
              depth={depth + 1}
              onSelectPage={onSelectPage}
              onAddSubPage={onAddSubPage}
              onDeletePage={onDeletePage}
              onToggleFavorite={onToggleFavorite}
              onDuplicatePage={onDuplicatePage}
              onMovePage={onMovePage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
