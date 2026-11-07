import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, CheckSquare, 
  List, ListOrdered, Quote, AlertCircle, Code, Minus, 
  Image as ImageIcon, Table as TableIcon, Link2, Palette, X,
  BarChart2, Layers, FileCode
} from 'lucide-react';
import type { BlockType } from '../../types';

interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ReactNode;
}

const SLASH_COMMANDS: SlashMenuItem[] = [
  { type: 'paragraph', label: 'Texto', description: 'Parágrafo de texto comum', icon: <Type size={16} /> },
  { type: 'heading1', label: 'Título 1', description: 'Título de seção principal', shortcut: '#', icon: <Heading1 size={16} /> },
  { type: 'heading2', label: 'Título 2', description: 'Subtítulo médio', shortcut: '##', icon: <Heading2 size={16} /> },
  { type: 'heading3', label: 'Título 3', description: 'Subtítulo menor', shortcut: '###', icon: <Heading3 size={16} /> },
  { type: 'todo', label: 'Lista de tarefas', description: 'Acompanhe tarefas com checkbox', shortcut: '[]', icon: <CheckSquare size={16} /> },
  { type: 'bullet', label: 'Lista de marcadores', description: 'Lista com pontos simples', shortcut: '-', icon: <List size={16} /> },
  { type: 'number', label: 'Lista numerada', description: 'Lista ordenada por números', shortcut: '1.', icon: <ListOrdered size={16} /> },
  { type: 'callout', label: 'Frase de destaque', description: 'Chame atenção para notas e avisos com ícone e cor', icon: <AlertCircle size={16} /> },
  { type: 'quote', label: 'Citação', description: 'Destaque uma frase ou citação inspiradora', shortcut: '"', icon: <Quote size={16} /> },
  { type: 'table', label: 'Tabela', description: 'Tabela simples editável com linhas e colunas', icon: <TableIcon size={16} /> },
  { type: 'chart', label: 'Gráfico', description: 'Pizza, rosca, colunas, linha — visualize dados graficamente', icon: <BarChart2 size={16} /> },
  { type: 'page_embed', label: 'Incorporar Página', description: 'Exibir conteúdo de outra página inline (tabela, banco, texto)', icon: <Layers size={16} /> },
  { type: 'mermaid', label: 'Diagrama Mermaid', description: 'Fluxogramas, sequência e outros diagramas com código', icon: <FileCode size={16} /> },
  { type: 'divider', label: 'Divisor', description: 'Linha horizontal para separar conteúdo', shortcut: '---', icon: <Minus size={16} /> },
  { type: 'page_link', label: 'Link para a página', description: 'Conecte páginas e crie um portal do projeto', icon: <Link2 size={16} /> },
  { type: 'whiteboard', label: 'Quadro de Desenho', description: 'Quadro interativo para desenho e post-its estilo Miro', icon: <Palette size={16} /> },
  { type: 'image', label: 'Imagem', description: 'Inserir, carregar ou colar imagem', icon: <ImageIcon size={16} /> },
  { type: 'code', label: 'Código', description: 'Trecho de código com realce', shortcut: '```', icon: <Code size={16} /> },
];

interface SlashMenuProps {
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  query,
  onSelect,
  onClose,
  position,
}) => {
  const [filterQuery, setFilterQuery] = useState(query || '');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilterQuery(query || '');
  }, [query]);

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  // Adjust position so it doesn't overflow screen bounds
  const topPos = Math.min(position.top, window.innerHeight - 380 + window.scrollY);
  const leftPos = Math.min(position.left, window.innerWidth - 320 + window.scrollX);

  return (
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        top: `${Math.max(10, topPos)}px`,
        left: `${Math.max(10, leftPos)}px`,
        width: '300px',
        maxHeight: '420px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="slash-menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Blocos básicos</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ maxHeight: '280px', overflowY: 'auto', flex: 1 }}>
        {filteredCommands.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Nenhum bloco encontrado
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => (
            <div
              key={cmd.type}
              className={`slash-menu-item ${selectedIndex === idx ? 'selected' : ''}`}
              onClick={() => onSelect(cmd.type)}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="slash-item-icon">{cmd.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500, fontSize: '13.5px' }}>{cmd.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cmd.description}</span>
                </div>
              </div>
              {cmd.shortcut && (
                <span className="slash-shortcut-badge" style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {cmd.shortcut}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer matching user screenshot */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)'
        }}
      >
        <span>Fechar menu</span>
        <kbd style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          esc
        </kbd>
      </div>

      {/* Filter input */}
      <div style={{ padding: '6px 8px', borderTop: '1px solid var(--border-subtle)' }}>
        <input
          ref={inputRef}
          type="text"
          className="slash-filter-input"
          placeholder="Digite para filtrar..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 10px',
            color: 'var(--text-primary)',
            fontSize: '12.5px',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
};
