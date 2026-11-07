import React, { useState, useEffect } from 'react';
import { 
  Menu, Download, Share2, Star, ChevronRight, Cloud, CloudOff, CloudUpload
} from 'lucide-react';
import type { Page, WorkspaceData, ViewType, Block } from './types';
import { 
  loadWorkspace, saveWorkspace, exportWorkspaceJson, 
  exportPageMarkdown, resetWorkspace 
} from './storage/db';
import { isSupabaseConfigured, fetchWorkspaceFromSupabase, subscribeSyncStatus } from './storage/supabase';
import { Sidebar } from './components/Sidebar/Sidebar';
import { PageHeader } from './components/Editor/PageHeader';
import { BlockEditor } from './components/Editor/BlockEditor';
import { DatabaseView } from './components/Database/DatabaseView';
import { WhiteboardView } from './components/Whiteboard/WhiteboardView';
import { CommandPalette } from './components/Search/CommandPalette';
import { SettingsModal } from './components/Modals/SettingsModal';
import { TrashModal } from './components/Modals/TrashModal';
import { CoverPickerModal } from './components/Modals/CoverPickerModal';
import { EmojiPickerModal } from './components/Modals/EmojiPickerModal';
import { useIsMobile } from './hooks/useIsMobile';

export const App: React.FC = () => {
  const isMobile = useIsMobile();
  const [workspace, setWorkspace] = useState<WorkspaceData>(() => loadWorkspace());
  const [activePageId, setActivePageId] = useState<string>(workspace.activePageId || workspace.pages[0]?.id || '');
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'saving' | 'error' | 'idle'>('idle');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Sync with Supabase on mount
  useEffect(() => {
    const unsub = subscribeSyncStatus((st) => setCloudStatus(st));

    if (isSupabaseConfigured()) {
      fetchWorkspaceFromSupabase('default').then(remote => {
        if (remote && remote.pages && remote.pages.length > 0) {
          setWorkspace(remote);
          if (remote.activePageId) {
            setActivePageId(remote.activePageId);
          }
        } else {
          // Initialize remote
          saveWorkspace(workspace);
        }
      });
    }

    return () => unsub();
  }, []);

  // Auto-save whenever workspace changes
  useEffect(() => {
    saveWorkspace(workspace);
    document.documentElement.setAttribute('data-theme', workspace?.settings?.theme || 'dark');
  }, [workspace]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activePage = workspace.pages.find(p => p.id === activePageId && !p.isDeleted) 
    || workspace.pages.find(p => !p.isDeleted);

  // Ensure activePageId remains valid
  useEffect(() => {
    if (activePage && activePage.id !== activePageId) {
      setActivePageId(activePage.id);
    }
  }, [activePage, activePageId]);

  // Page mutation helpers
  const updateActivePage = (updates: Partial<Page>) => {
    if (!activePage) return;
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === activePage.id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    }));
  };

  const handleCreatePage = (parentId: string | null = null, type: ViewType = 'document') => {
    const newPageId = `page-${Date.now()}`;
    const initialBlocks: Block[] = [
      {
        id: `block-${Date.now()}-1`,
        type: 'heading1',
        content: ''
      },
      {
        id: `block-${Date.now()}-2`,
        type: 'paragraph',
        content: ''
      }
    ];

    const newPage: Page = {
      id: newPageId,
      parentId,
      title: type === 'whiteboard' ? 'Novo Quadro Branco' : 'Nova Página',
      icon: type === 'whiteboard' ? '🎨' : ['board', 'table', 'calendar', 'gantt'].includes(type) ? '📊' : '📄',
      type,
      blocks: initialBlocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(type === 'whiteboard' ? {
        whiteboardData: {
          strokes: [],
          shapes: [],
          stickies: [
            {
              id: `sticky-${Date.now()}-1`,
              x: 220,
              y: 110,
              width: 200,
              height: 160,
              text: '💡 Ideias do Projeto\n• Brainstorm de arquitetura\n• Mapeamento de fluxos',
              color: '#fef08a'
            }
          ],
          texts: []
        }
      } : {}),
      ...(['board', 'table', 'calendar', 'gantt'].includes(type) ? {
        databaseConfig: {
          activeView: (type === 'document' ? 'table' : type) as 'table' | 'board' | 'calendar' | 'gantt',
          columns: [
            { id: 'title', name: 'Título', type: 'text' },
            { id: 'status', name: 'Status', type: 'status' },
            { id: 'priority', name: 'Prioridade', type: 'priority' },
            { id: 'date', name: 'Prazo', type: 'date' },
            { id: 'assignee', name: 'Responsável', type: 'text' }
          ],
          rows: [
            {
              id: `row-${Date.now()}-1`,
              title: 'Primeira tarefa do quadro',
              status: 'A Fazer',
              priority: 'Alta',
              date: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
              assignee: 'Equipe'
            }
          ]
        }
      } : {})
    };

    setWorkspace(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      activePageId: newPageId
    }));
    setActivePageId(newPageId);
  };

  const handleDeletePage = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() } : p)
    }));
  };

  const handleRestorePage = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === id ? { ...p, isDeleted: false, deletedAt: undefined } : p)
    }));
  };

  const handlePermanentDelete = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== id)
    }));
  };

  const handleEmptyTrash = () => {
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.filter(p => !p.isDeleted)
    }));
  };

  const handleToggleFavorite = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    }));
  };

  const handleDuplicatePage = (id: string) => {
    const target = workspace.pages.find(p => p.id === id);
    if (!target) return;

    const dupId = `page-${Date.now()}`;
    const duplicated: Page = {
      ...target,
      id: dupId,
      title: `${target.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkspace(prev => ({
      ...prev,
      pages: [...prev.pages, duplicated],
      activePageId: dupId
    }));
    setActivePageId(dupId);
  };

  // Build breadcrumb trail
  const breadcrumbs: Page[] = [];
  let curr = activePage;
  while (curr) {
    breadcrumbs.unshift(curr);
    if (curr.parentId) {
      curr = workspace.pages.find(p => p.id === curr?.parentId);
    } else {
      break;
    }
  }

  const currentSettings = workspace?.settings || {
    name: 'Projeto 1',
    theme: 'dark' as const,
    font: 'sans' as const,
    fullWidth: false,
    sidebarCollapsed: false
  };

  const fontClass = 
    currentSettings.font === 'serif' ? 'font-serif' :
    currentSettings.font === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className={`app-container ${fontClass}`} data-theme={currentSettings.theme}>
      {/* Mobile Backdrop */}
      {isMobile && !currentSettings.sidebarCollapsed && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => {
            setWorkspace(prev => ({
              ...prev,
              settings: { ...currentSettings, sidebarCollapsed: true }
            }));
          }}
        />
      )}

      {/* Collapsible Sidebar */}
      <Sidebar
        settings={currentSettings}
        pages={workspace.pages || []}
        activePageId={activePageId}
        collapsed={currentSettings.sidebarCollapsed}
        onSelectPage={(id) => {
          setActivePageId(id);
          if (isMobile) {
            setWorkspace(prev => ({
              ...prev,
              settings: { ...currentSettings, sidebarCollapsed: true }
            }));
          }
        }}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onToggleFavorite={handleToggleFavorite}
        onDuplicatePage={handleDuplicatePage}
        onToggleCollapse={() => {
          setWorkspace(prev => ({
            ...prev,
            settings: { ...currentSettings, sidebarCollapsed: !currentSettings.sidebarCollapsed }
          }));
        }}
        onToggleTheme={() => {
          setWorkspace(prev => ({
            ...prev,
            settings: { ...currentSettings, theme: currentSettings.theme === 'dark' ? 'light' : 'dark' }
          }));
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navigation Bar with Breadcrumbs & Export */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(currentSettings.sidebarCollapsed || isMobile) && (
              <button
                className="sidebar-btn-icon"
                title="Expandir Barra Lateral"
                onClick={() => {
                  setWorkspace(prev => ({
                    ...prev,
                    settings: { ...currentSettings, sidebarCollapsed: !currentSettings.sidebarCollapsed }
                  }));
                }}
              >
                <Menu size={18} />
              </button>
            )}

            <div className="breadcrumbs">
              <span className="breadcrumb-item" onClick={() => setIsSettingsOpen(true)}>
                {currentSettings.name}
              </span>
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.id}>
                  <ChevronRight size={13} />
                  <span
                    className="breadcrumb-item"
                    style={{ color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'inherit', fontWeight: idx === breadcrumbs.length - 1 ? 500 : 400 }}
                    onClick={() => setActivePageId(b.id)}
                  >
                    {b.icon && <span>{b.icon}</span>}
                    <span>{b.title || 'Sem título'}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="top-actions">
            {/* Supabase Cloud Status Indicator */}
            {isSupabaseConfigured() && (
              <div
                className={`cloud-status-badge ${cloudStatus}`}
                title={
                  cloudStatus === 'synced' ? 'Conectado e sincronizado com o Supabase' :
                  cloudStatus === 'saving' ? 'Salvando alterações na nuvem...' :
                  cloudStatus === 'error' ? 'Falha ao salvar no Supabase' :
                  'Conectado ao Supabase'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11.5px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: cloudStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                  border: `1px solid ${cloudStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                  color: cloudStatus === 'synced' ? '#10b981' : cloudStatus === 'saving' ? 'var(--accent)' : cloudStatus === 'error' ? '#ef4444' : 'var(--text-muted)'
                }}
              >
                {cloudStatus === 'synced' && <Cloud size={13} />}
                {cloudStatus === 'saving' && <CloudUpload size={13} className="animate-pulse" />}
                {cloudStatus === 'error' && <CloudOff size={13} />}
                {cloudStatus === 'idle' && <Cloud size={13} />}
                <span style={{ fontWeight: 500 }}>
                  {cloudStatus === 'synced' ? 'Nuvem' :
                   cloudStatus === 'saving' ? 'Salvando...' :
                   cloudStatus === 'error' ? 'Erro' : 'Supabase'}
                </span>
              </div>
            )}

            {activePage && (
              <>
                <button
                  className="nav-btn"
                  title="Favoritar Página"
                  onClick={() => handleToggleFavorite(activePage.id)}
                >
                  <Star size={14} color={activePage.isFavorite ? '#f59e0b' : 'inherit'} fill={activePage.isFavorite ? '#f59e0b' : 'none'} />
                </button>

                <button
                  className="nav-btn"
                  title="Exportar para Markdown (.md)"
                  onClick={() => exportPageMarkdown(activePage)}
                >
                  <Download size={14} />
                  <span>Exportar .md</span>
                </button>

                <button
                  className="nav-btn"
                  title="Copiar Link / Título"
                  onClick={() => {
                    navigator.clipboard.writeText(`${activePage.title} - ${window.location.href}`);
                    alert('Link copiado para a área de transferência!');
                  }}
                >
                  <Share2 size={14} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Scroll Container */}
        {activePage ? (
          <div className="page-scroll-container">
            <PageHeader
              page={activePage}
              onUpdateTitle={(title) => updateActivePage({ title })}
              onOpenEmojiPicker={() => setIsEmojiPickerOpen(true)}
              onOpenCoverPicker={() => setIsCoverPickerOpen(true)}
              onRemoveCover={() => updateActivePage({ coverUrl: undefined })}
              onChangeViewType={(type) => {
                if (type === 'whiteboard') {
                  const defaultWhiteboard = activePage.whiteboardData || {
                    strokes: [],
                    shapes: [],
                    stickies: [
                      {
                        id: `sticky-${Date.now()}-1`,
                        x: 240,
                        y: 120,
                        width: 200,
                        height: 160,
                        text: '💡 Ideias do Projeto\n• Brainstorming livre\n• Arraste notas e desenhe!',
                        color: '#fef08a'
                      },
                      {
                        id: `sticky-${Date.now()}-2`,
                        x: 480,
                        y: 120,
                        width: 200,
                        height: 160,
                        text: '🚀 Próxima Entrega\n• Protótipo interativo\n• Validação com clientes',
                        color: '#bae6fd'
                      }
                    ],
                    texts: []
                  };
                  updateActivePage({
                    type: 'whiteboard',
                    whiteboardData: defaultWhiteboard
                  });
                } else if (['board', 'table', 'calendar', 'gantt'].includes(type)) {
                  const dbView = (type === 'document' ? 'table' : type) as 'table' | 'board' | 'calendar' | 'gantt';
                  const currentDb = activePage.databaseConfig || {
                    activeView: dbView,
                    columns: [
                      { id: 'title', name: 'Título', type: 'text' },
                      { id: 'status', name: 'Status', type: 'status' },
                      { id: 'priority', name: 'Prioridade', type: 'priority' },
                      { id: 'date', name: 'Prazo', type: 'date' },
                      { id: 'assignee', name: 'Responsável', type: 'text' }
                    ],
                    rows: [
                      {
                        id: `row-${Date.now()}`,
                        title: 'Novo item',
                        status: 'A Fazer',
                        priority: 'Média',
                        date: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                        assignee: 'Eu'
                      }
                    ]
                  };
                  updateActivePage({ 
                    type, 
                    databaseConfig: { ...currentDb, activeView: dbView } 
                  });
                } else {
                  updateActivePage({ type });
                }
              }}
            />

            <div className={`page-inner-content ${currentSettings.fullWidth ? 'full-width' : ''}`}>
              {activePage.type === 'document' ? (
                <BlockEditor
                  blocks={activePage.blocks}
                  pages={workspace.pages}
                  onSelectPage={setActivePageId}
                  onCreateSubpage={() => handleCreatePage(activePage.id, 'document')}
                  onChange={(blocks) => updateActivePage({ blocks })}
                />
              ) : activePage.type === 'whiteboard' ? (
                <WhiteboardView
                  data={activePage.whiteboardData}
                  onChange={(whiteboardData) => updateActivePage({ whiteboardData })}
                />
              ) : activePage.databaseConfig ? (
                <DatabaseView
                  config={activePage.databaseConfig}
                  databaseTitle={activePage.title}
                  onChange={(databaseConfig) => {
                    updateActivePage({
                      type: databaseConfig.activeView,
                      databaseConfig
                    });
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Nenhuma página selecionada
            </div>
            <button className="nav-btn primary" onClick={() => handleCreatePage(null, 'document')}>
              Criar Nova Página
            </button>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isSearchOpen}
        pages={workspace.pages || []}
        settings={currentSettings}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={setActivePageId}
        onCreatePage={() => handleCreatePage(null, 'document')}
        onToggleTheme={() => {
          setWorkspace(prev => ({
            ...prev,
            settings: { ...currentSettings, theme: currentSettings.theme === 'dark' ? 'light' : 'dark' }
          }));
        }}
        onOpenTrash={() => setIsTrashOpen(true)}
        onExportBackup={() => exportWorkspaceJson(workspace)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={currentSettings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSettings) => setWorkspace(prev => ({ ...prev, settings: newSettings }))}
        onExportBackup={() => exportWorkspaceJson(workspace)}
        onImportBackup={(data) => {
          setWorkspace(data);
          if (data.pages[0]) setActivePageId(data.pages[0].id);
        }}
        onResetWorkspace={() => {
          const fresh = resetWorkspace();
          setWorkspace(fresh);
          setActivePageId(fresh.pages[0]?.id || '');
        }}
      />

      <TrashModal
        isOpen={isTrashOpen}
        pages={workspace.pages}
        onClose={() => setIsTrashOpen(false)}
        onRestorePage={handleRestorePage}
        onPermanentDelete={handlePermanentDelete}
        onEmptyTrash={handleEmptyTrash}
      />

      <CoverPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelectCover={(url) => updateActivePage({ coverUrl: url })}
      />

      <EmojiPickerModal
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelectEmoji={(emoji) => updateActivePage({ icon: emoji })}
      />
    </div>
  );
};

export default App;
