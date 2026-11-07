import React, { useRef } from 'react';
import { Settings, Download, Upload, RotateCcw, X, Moon, Sun, Type } from 'lucide-react';
import type { WorkspaceSettings, WorkspaceData } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: WorkspaceSettings;
  onClose: () => void;
  onUpdateSettings: (settings: WorkspaceSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (data: WorkspaceData) => void;
  onResetWorkspace: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetWorkspace,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.pages && parsed.settings) {
          onImportBackup(parsed);
          onClose();
        } else {
          alert('Arquivo JSON inválido para backup do workspace.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="var(--accent)" />
            <span className="modal-title">Configurações do Projeto 1</span>
          </div>
          <button className="sidebar-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Workspace Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Nome do Workspace
            </label>
            <input
              type="text"
              className="db-search-input"
              style={{ width: '100%' }}
              value={settings.name}
              onChange={(e) => onUpdateSettings({ ...settings, name: e.target.value })}
            />
          </div>

          {/* Theme Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tema da Interface
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="nav-btn"
                style={{
                  justifyContent: 'center',
                  background: settings.theme === 'dark' ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                  borderColor: settings.theme === 'dark' ? 'var(--accent)' : 'var(--border-subtle)',
                  color: settings.theme === 'dark' ? 'var(--accent)' : 'var(--text-primary)'
                }}
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              >
                <Moon size={15} />
                <span>Modo Escuro</span>
              </button>

              <button
                className="nav-btn"
                style={{
                  justifyContent: 'center',
                  background: settings.theme === 'light' ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                  borderColor: settings.theme === 'light' ? 'var(--accent)' : 'var(--border-subtle)',
                  color: settings.theme === 'light' ? 'var(--accent)' : 'var(--text-primary)'
                }}
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              >
                <Sun size={15} />
                <span>Modo Claro</span>
              </button>
            </div>
          </div>

          {/* Typography */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tipografia Padrão
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['sans', 'serif', 'mono'] as const).map(font => (
                <button
                  key={font}
                  className="nav-btn"
                  style={{
                    justifyContent: 'center',
                    background: settings.font === font ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                    borderColor: settings.font === font ? 'var(--accent)' : 'var(--border-subtle)',
                    color: settings.font === font ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                  onClick={() => onUpdateSettings({ ...settings, font })}
                >
                  <Type size={14} />
                  <span style={{ textTransform: 'capitalize' }}>{font}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Width Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Largura Total</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expandir o conteúdo dos documentos horizontalmente</div>
            </div>
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={settings.fullWidth}
              onChange={(e) => onUpdateSettings({ ...settings, fullWidth: e.target.checked })}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Backup & Dados Locais
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="nav-btn" onClick={onExportBackup}>
                <Download size={14} />
                <span>Exportar JSON</span>
              </button>

              <button className="nav-btn" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} />
                <span>Importar JSON</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileUpload}
              />

              <button
                className="nav-btn"
                style={{ color: '#ef4444' }}
                onClick={() => {
                  if (confirm('Tem certeza que deseja restaurar os dados de demonstração originais?')) {
                    onResetWorkspace();
                    onClose();
                  }
                }}
              >
                <RotateCcw size={14} />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
