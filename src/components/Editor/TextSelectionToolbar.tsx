import React, { useState, useEffect, useRef } from 'react';
import type { BlockType } from '../../types';
import { 
  Bold, Italic, Underline, Strikethrough, Code, Link2, 
  ChevronRight, MoreHorizontal
} from 'lucide-react';

export type TextFormatAction = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strike' 
  | 'code' 
  | 'math' 
  | 'link' 
  | 'clear' 
  | 'color';

interface TextSelectionToolbarProps {
  position: { top: number; left: number };
  currentBlockType: BlockType;
  onApplyFormat: (action: TextFormatAction, param?: string) => void;
  onChangeBlockType: (newType: BlockType) => void;
  onClose: () => void;
}

const BLOCK_TYPE_NAMES: Record<string, string> = {
  paragraph: 'Texto normal',
  heading1: 'Título 1',
  heading2: 'Título 2',
  heading3: 'Título 3',
  bullet: 'Lista de marcadores',
  number: 'Lista numerada',
  todo: 'Lista de tarefas',
  quote: 'Citação',
  callout: 'Destaque',
  code: 'Bloco de código',
};

const TEXT_COLORS = [
  { name: 'Padrão', color: 'inherit' },
  { name: 'Roxo', color: '#7c7fff' },
  { name: 'Azul', color: '#38bdf8' },
  { name: 'Verde', color: '#4ade80' },
  { name: 'Amarelo', color: '#facc15' },
  { name: 'Laranja', color: '#fb923c' },
  { name: 'Vermelho', color: '#f87171' },
  { name: 'Rosa', color: '#f472b6' },
];

export const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  position,
  currentBlockType,
  onApplyFormat,
  onChangeBlockType,
  onClose,
}) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const currentTypeName = BLOCK_TYPE_NAMES[currentBlockType] || 'Texto normal';

  return (
    <div
      ref={toolbarRef}
      className="floating-selection-toolbar"
      style={{
        position: 'fixed',
        top: `${Math.max(10, position.top)}px`,
        left: `${Math.max(10, Math.min(window.innerWidth - 360, position.left))}px`,
        zIndex: 1200,
        backgroundColor: '#1e2035',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        padding: '3px 6px',
        gap: '2px',
        color: '#eceef8',
        userSelect: 'none',
        backdropFilter: 'blur(10px)',
      }}
      onMouseDown={(e) => {
        // Prevent losing textarea selection focus
        e.preventDefault();
      }}
    >
      {/* Block Type Dropdown (Matches Screenshot 3) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setShowColorMenu(false);
            setShowMoreMenu(false);
            setShowTypeMenu(!showTypeMenu);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#eceef8',
            fontSize: '12.5px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontWeight: 600 }}>T</span>
          <span>{currentTypeName}</span>
          <ChevronRight size={12} style={{ opacity: 0.6 }} />
        </button>

        {showTypeMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: '#1e2035',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
              padding: '4px',
              minWidth: '170px',
              zIndex: 1210,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {Object.entries(BLOCK_TYPE_NAMES).map(([typeKey, typeLabel]) => (
              <button
                key={typeKey}
                type="button"
                className="slash-menu-item"
                style={{
                  padding: '5px 8px',
                  fontSize: '12px',
                  background: currentBlockType === typeKey ? 'rgba(124, 127, 255, 0.18)' : 'transparent',
                  color: currentBlockType === typeKey ? '#7c7fff' : '#eceef8',
                  borderRadius: '4px',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onChangeBlockType(typeKey as BlockType);
                  setShowTypeMenu(false);
                }}
              >
                {typeLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 3px' }} />

      {/* Color / Highlight 'A' (Matches Screenshot 3) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setShowTypeMenu(false);
            setShowMoreMenu(false);
            setShowColorMenu(!showColorMenu);
          }}
          title="Cor do texto e destaque"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#eceef8',
            fontSize: '13px',
            fontWeight: 700,
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>A</span>
        </button>

        {showColorMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: '#1e2035',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
              padding: '6px',
              zIndex: 1210,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              width: '120px',
            }}
          >
            {TEXT_COLORS.map(c => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => {
                  onApplyFormat('color', c.color);
                  setShowColorMenu(false);
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: c.color === 'inherit' ? '#5c618a' : c.color,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bold 'B' */}
      <button
        type="button"
        title="Negrito (Ctrl+B)"
        onClick={() => onApplyFormat('bold')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          fontSize: '13px',
          fontWeight: 700,
          padding: '4px 7px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Bold size={13} strokeWidth={3} />
      </button>

      {/* Italic 'I' */}
      <button
        type="button"
        title="Itálico (Ctrl+I)"
        onClick={() => onApplyFormat('italic')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          padding: '4px 7px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Italic size={13} />
      </button>

      {/* Underline 'U' */}
      <button
        type="button"
        title="Sublinhado (Ctrl+U)"
        onClick={() => onApplyFormat('underline')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          padding: '4px 7px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Underline size={13} />
      </button>

      {/* Clear Format 'Tx' */}
      <button
        type="button"
        title="Limpar formatação"
        onClick={() => onApplyFormat('clear')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 6px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1px',
        }}
      >
        <span>T</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>x</span>
      </button>

      {/* Link */}
      <button
        type="button"
        title="Inserir Link"
        onClick={() => {
          const url = prompt('Insira a URL do link:', 'https://');
          if (url) onApplyFormat('link', url);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          padding: '4px 7px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Link2 size={13} />
      </button>

      {/* Strikethrough 'S' */}
      <button
        type="button"
        title="Tachado"
        onClick={() => onApplyFormat('strike')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          padding: '4px 7px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Strikethrough size={13} />
      </button>

      {/* Inline Code '</>' */}
      <button
        type="button"
        title="Código inline"
        onClick={() => onApplyFormat('code')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          padding: '4px 7px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <Code size={13} />
      </button>

      {/* Math formula '√x' */}
      <button
        type="button"
        title="Fórmula matemática (LaTeX / KaTeX)"
        onClick={() => onApplyFormat('math')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#eceef8',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 6px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        √x
      </button>

      {/* More '...' */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          title="Mais opções"
          onClick={() => {
            setShowTypeMenu(false);
            setShowColorMenu(false);
            setShowMoreMenu(!showMoreMenu);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#eceef8',
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <MoreHorizontal size={13} />
        </button>

        {showMoreMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#1e2035',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
              padding: '4px',
              minWidth: '150px',
              zIndex: 1210,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <button
              type="button"
              className="slash-menu-item"
              style={{ padding: '5px 8px', fontSize: '12px', border: 'none', background: 'transparent', color: '#eceef8', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => {
                onApplyFormat('color', '#fbbf24'); // Yellow highlight
                setShowMoreMenu(false);
              }}
            >
              <span>🟡</span>
              <span>Destacar amarelo</span>
            </button>

            <button
              type="button"
              className="slash-menu-item"
              style={{ padding: '5px 8px', fontSize: '12px', border: 'none', background: 'transparent', color: '#eceef8', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => {
                onApplyFormat('color', '#38bdf8'); // Blue highlight
                setShowMoreMenu(false);
              }}
            >
              <span>🔵</span>
              <span>Destacar azul</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
