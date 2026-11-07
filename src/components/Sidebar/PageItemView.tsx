import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal, Star, Trash2, Copy, FileText, LayoutGrid } from 'lucide-react';
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
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const childPages = allPages.filter(p => p.parentId === page.id && !p.isDeleted);
  const hasChildren = childPages.length > 0;
  const isActive = activePageId === page.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        className={`page-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => onSelectPage(page.id)}
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
                  minWidth: '150px'
                }}
              >
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
