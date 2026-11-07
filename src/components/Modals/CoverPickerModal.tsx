import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCover: (url: string) => void;
}

const PRESET_COVERS = [
  { name: 'Gradiente Cósmico', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Oceano & Dunas', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Biblioteca Minimalista', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Montanhas & Neblina', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Arquitetura Moderna', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Formas Abstratas 3D', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' },
];

export const CoverPickerModal: React.FC<CoverPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectCover,
}) => {
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--accent)" />
            <span className="modal-title">Escolher Capa da Página</span>
          </div>
          <button className="sidebar-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Cole a URL de uma Imagem
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="db-search-input"
                style={{ flex: 1, width: '100%' }}
                placeholder="https://exemplo.com/imagem.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <button
                className="nav-btn primary"
                onClick={() => {
                  if (customUrl.trim()) {
                    onSelectCover(customUrl.trim());
                    onClose();
                  }
                }}
              >
                Aplicar
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Capas Pré-definidas em Alta Resolução
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {PRESET_COVERS.map(cover => (
                <div
                  key={cover.url}
                  style={{
                    position: 'relative',
                    height: '90px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    onSelectCover(cover.url);
                    onClose();
                  }}
                >
                  <img
                    src={cover.url}
                    alt={cover.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 500
                    }}
                  >
                    {cover.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
