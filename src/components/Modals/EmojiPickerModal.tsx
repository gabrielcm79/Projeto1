import React from 'react';
import { X, Smile } from 'lucide-react';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    category: 'Geral & Ideias',
    emojis: ['📝', '🚀', '💡', '🎯', '⚡', '✨', '🔥', '🌟', '📚', '🧠', '🔬', '🎨']
  },
  {
    category: 'Trabalho & Projetos',
    emojis: ['📊', '📈', '📋', '📁', '💼', '📌', '🗓️', '⏰', '💻', '🛠️', '⚙️', '🔍']
  },
  {
    category: 'Status & Ícones',
    emojis: ['✅', '⏳', '⚠️', '🚨', '🟢', '🟡', '🔴', '🔷', '🔶', '🏁', '🏷️', '🔒']
  },
  {
    category: 'Pessoas & Emoções',
    emojis: ['👋', '🙌', '🤝', '🤖', '👾', '🎉', '☕', '☕️', '🌍', '🌱', '🏆', '💎']
  }
];

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={18} color="var(--accent)" />
            <span className="modal-title">Escolher Ícone</span>
          </div>
          <button className="sidebar-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {EMOJI_CATEGORIES.map(cat => (
            <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {cat.category}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {cat.emojis.map(emoji => (
                  <button
                    key={emoji}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      fontSize: '22px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s ease, background 0.1s ease'
                    }}
                    onClick={() => {
                      onSelectEmoji(emoji);
                      onClose();
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
