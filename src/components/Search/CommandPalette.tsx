import React, { useState, useEffect } from 'react';
import { Search, FileText, LayoutGrid, Plus, Moon, Sun, Download, Trash2, X } from 'lucide-react';
import type { Page, WorkspaceSettings } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  pages: Page[];
  settings: WorkspaceSettings;
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onToggleTheme: () => void;
  onOpenTrash: () => void;
  onExportBackup: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  pages,
  settings,
  onClose,
  onSelectPage,
  onCreatePage,
  onToggleTheme,
  onOpenTrash,
  onExportBackup,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activePages = pages.filter(p => !p.isDeleted);

  // Filter pages
  const matchingPages = activePages.filter(p => {
    const titleMatch = p.title.toLowerCase().includes(query.toLowerCase());
    const blockMatch = p.blocks.some(b => b.content.toLowerCase().includes(query.toLowerCase()));
    return titleMatch || blockMatch;
  });

  // Action items
  const actions = [
    {
      id: 'act-new-page',
      title: 'Criar Nova Página',
      icon: <Plus size={16} />,
      run: () => { onCreatePage(); onClose(); }
    },
    {
      id: 'act-theme',
      title: `Alternar Tema (Atual: ${settings.theme === 'dark' ? 'Escuro' : 'Claro'})`,
      icon: settings.theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />,
      run: () => { onToggleTheme(); onClose(); }
    },
    {
      id: 'act-export',
      title: 'Exportar Backup do Workspace (JSON)',
      icon: <Download size={16} />,
      run: () => { onExportBackup(); onClose(); }
    },
    {
      id: 'act-trash',
      title: 'Abrir Lixeira',
      icon: <Trash2 size={16} />,
      run: () => { onOpenTrash(); onClose(); }
    }
  ].filter(act => act.title.toLowerCase().includes(query.toLowerCase()));

  const totalResults = [...matchingPages, ...actions];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, totalResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalResults.length) % Math.max(1, totalResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = totalResults[selectedIndex];
      if (item) {
        if ('blocks' in item) {
          onSelectPage(item.id);
          onClose();
        } else if ('run' in item) {
          item.run();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-search-header">
          <Search size={18} color="var(--accent)" />
          <input
            type="text"
            className="command-search-input"
            autoFocus
            placeholder="Pesquise por títulos, conteúdos ou comandos..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="sidebar-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="command-results-list">
          {matchingPages.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div className="slash-menu-header">Páginas & Documentos</div>
              {matchingPages.map((p, idx) => (
                <div
                  key={p.id}
                  className={`command-item ${selectedIndex === idx ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectPage(p.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span style={{ fontSize: '18px' }}>
                    {p.icon || (p.type === 'board' || p.type === 'table' ? <LayoutGrid size={16} /> : <FileText size={16} />)}
                  </span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500 }}>{p.title || 'Sem título'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.type === 'document' ? `${p.blocks.length} blocos` : 'Base de dados'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div>
              <div className="slash-menu-header">Ações Rápidas</div>
              {actions.map((act, idx) => {
                const actualIdx = matchingPages.length + idx;
                return (
                  <div
                    key={act.id}
                    className={`command-item ${selectedIndex === actualIdx ? 'selected' : ''}`}
                    onClick={act.run}
                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                  >
                    <div className="slash-item-icon">{act.icon}</div>
                    <span style={{ fontWeight: 500 }}>{act.title}</span>
                  </div>
                );
              })}
            </div>
          )}

          {totalResults.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Nenhum resultado encontrado para "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
