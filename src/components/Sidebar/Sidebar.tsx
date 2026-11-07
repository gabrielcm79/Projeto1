import React, { useState } from 'react';
import { 
  Search, Plus, Settings, Trash2, Sun, Moon, 
  ChevronLeft, Layout, Star, CalendarDays
} from 'lucide-react';
import type { Page, WorkspaceSettings, ViewType } from '../../types';
import { PageItemView } from './PageItemView';
import { SidebarCalendar } from './SidebarCalendar';

interface SidebarProps {
  settings: WorkspaceSettings;
  pages: Page[];
  activePageId: string;
  collapsed: boolean;
  onSelectPage: (id: string) => void;
  onCreatePage: (parentId?: string | null, type?: ViewType) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onToggleCollapse: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  pages,
  activePageId,
  collapsed,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onToggleFavorite,
  onDuplicatePage,
  onToggleCollapse,
  onToggleTheme,
  onOpenSettings,
  onOpenTrash,
  onOpenSearch,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const safePages = Array.isArray(pages) ? pages : [];
  const safeSettings = settings || {
    name: 'Projeto 1',
    theme: 'dark',
    font: 'sans',
    fullWidth: false,
    sidebarCollapsed: false
  };
  const activePages = safePages.filter(p => !p.isDeleted);
  const favoritePages = activePages.filter(p => p.isFavorite);
  const topLevelPages = activePages.filter(p => p.parentId === null);
  const deletedCount = safePages.filter(p => p.isDeleted).length;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Workspace Header */}
      <div className="sidebar-header">
        <div className="workspace-badge" onClick={onOpenSettings} title="Configurações do Workspace">
          <div className="workspace-avatar">
            {(safeSettings.name || 'P').charAt(0).toUpperCase()}
          </div>
          <span>{safeSettings.name || 'Projeto 1'}</span>
        </div>

        <button 
          className="sidebar-btn-icon" 
          onClick={onToggleCollapse}
          title="Ocultar Barra Lateral"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Quick Search Button */}
      <button className="sidebar-search-btn" onClick={onOpenSearch}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={14} />
          <span>Pesquisar...</span>
        </div>
        <span className="kbd-shortcut">Ctrl+K</span>
      </button>


      <div className="sidebar-content">
        {/* Favorites Section */}
        {favoritePages.length > 0 && (
          <div>
            <div className="sidebar-section-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <span>Favoritos</span>
              </div>
            </div>
            <div className="page-tree">
              {favoritePages.map(page => (
                <div
                  key={`fav-${page.id}`}
                  className={`page-item ${activePageId === page.id ? 'active' : ''}`}
                  onClick={() => onSelectPage(page.id)}
                >
                  <span className="page-icon">{page.icon || <Layout size={15} />}</span>
                  <span className="page-title">{page.title || 'Sem título'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Pages Hierarchy */}
        <div>
          <div className="sidebar-section-title">
            <span>Páginas</span>
            <button
              className="sidebar-btn-icon"
              title="Nova Página"
              onClick={() => onCreatePage(null, 'document')}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="page-tree">
            {topLevelPages.map(page => (
              <PageItemView
                key={page.id}
                page={page}
                allPages={pages}
                activePageId={activePageId}
                depth={0}
                onSelectPage={onSelectPage}
                onAddSubPage={(parentId) => onCreatePage(parentId, 'document')}
                onDeletePage={onDeletePage}
                onToggleFavorite={onToggleFavorite}
                onDuplicatePage={onDuplicatePage}
              />
            ))}

            {topLevelPages.length === 0 && (
              <div style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Nenhuma página ainda. Crie uma nova acima!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation & Controls */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="sidebar-btn-icon"
            title="Lixeira"
            onClick={onOpenTrash}
            style={{ position: 'relative' }}
          >
            <Trash2 size={16} />
            {deletedCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#ef4444'
                }}
              />
            )}
          </button>

          <button
            className="sidebar-btn-icon"
            title="Calendário Consolidado"
            onClick={() => setShowCalendar(c => !c)}
            style={{ color: showCalendar ? 'var(--accent)' : undefined }}
          >
            <CalendarDays size={16} />
          </button>

          <button
            className="sidebar-btn-icon"
            title="Configurações do Workspace"
            onClick={onOpenSettings}
          >
            <Settings size={16} />
          </button>
        </div>

        <button
          className="sidebar-btn-icon"
          title={`Mudar para modo ${settings.theme === 'dark' ? 'Claro' : 'Escuro'}`}
          onClick={onToggleTheme}
        >
          {settings.theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
        </button>
      </div>

      {/* Calendar Panel */}
      {showCalendar && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', overflowY: 'auto', maxHeight: '480px' }}>
          <SidebarCalendar
            pages={pages}
            onSelectPage={onSelectPage}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </aside>
  );
};
