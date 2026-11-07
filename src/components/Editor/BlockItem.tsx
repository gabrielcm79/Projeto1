import React, { useRef, useEffect, useState } from 'react';
import { 
  GripVertical, Plus, Copy, Trash2, ArrowUp, ArrowDown, 
  Check, Code as CodeIcon, Image as ImageIcon, Upload,
  ArrowUpRight, Link2, PlusCircle, Palette, ChevronDown, Edit2, Eye, BarChart2
} from 'lucide-react';
import type { Block, BlockType, Page } from '../../types';
import { WhiteboardView } from '../Whiteboard/WhiteboardView';
import { ChartBlock } from './ChartBlock';
import { PageEmbedBlock } from './PageEmbedBlock';
import { renderMarkdownBlock } from '../../utils/markdownParser';

interface BlockItemProps {
  block: Block;
  index: number;
  totalBlocks: number;
  autoFocus?: boolean;
  pages?: Page[];
  onSelectPage?: (pageId: string) => void;
  onCreateSubpage?: (title: string) => void;
  onUpdate: (updatedBlock: Block) => void;
  onDelete: (id: string) => void;
  onAddBelow: (id: string, type?: BlockType) => void;
  onAddImage?: (targetId: string, url: string, caption?: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (index: number) => void;
  isDragOver?: boolean;
  dropPosition?: 'top' | 'bottom';
  onOpenSlashMenu: (blockId: string, position: { top: number; left: number }, query: string) => void;
  onCloseSlashMenu: () => void;
}

// ─── Mermaid Block ──────────────────────────────────────────────────────────
let mermaidLoaded = false;
function loadMermaid(): Promise<void> {
  if (mermaidLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = () => {
      // @ts-ignore
      window.mermaid?.initialize({ startOnLoad: false, theme: 'dark' });
      mermaidLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}

interface MermaidBlockProps {
  code: string;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ code, onChange, onKeyDown }) => {
  const [editMode, setEditMode] = useState(!code);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const idRef = React.useRef(`mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);

  useEffect(() => {
    if (!code || editMode) return;
    setError('');
    loadMermaid().then(async () => {
      try {
        // @ts-ignore
        const { svg: rendered } = await window.mermaid.render(idRef.current, code);
        setSvg(rendered);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao renderizar diagrama');
        setSvg('');
      }
    });
  }, [code, editMode]);

  return (
    <div className="mermaid-block" style={{ margin: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
          <span>🔀</span>
          <span>Diagrama Mermaid</span>
        </div>
        <button
          className="sidebar-btn-icon"
          title={editMode ? 'Pré-visualizar' : 'Editar código'}
          onClick={() => setEditMode(e => !e)}
          style={{ fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}
        >
          {editMode ? <Eye size={13} /> : <Edit2 size={13} />}
          <span style={{ fontSize: '11px' }}>{editMode ? 'Visualizar' : 'Editar'}</span>
        </button>
      </div>

      {editMode ? (
        <textarea
          className="code-editor-textarea"
          rows={6}
          placeholder={'graph TD\n  A[Início] --> B[Processo]\n  B --> C{Decisão}\n  C -->|Sim| D[Fim]\n  C -->|Não| B'}
          value={code}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
      ) : error ? (
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#ef4444', fontSize: '12.5px' }}>
          ⚠️ {error}
        </div>
      ) : svg ? (
        <div
          className="mermaid-preview"
          dangerouslySetInnerHTML={{ __html: svg }}
          style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', overflowX: 'auto' }}
        />
      ) : (
        <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>Carregando diagrama...</div>
      )}
    </div>
  );
};

// ─── Callout Colors ───────────────────────────────────────────────────────────
const CALLOUT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: '#2b2111', border: '#784d16', text: '#fbbf24' },
  indigo: { bg: '#1e1c3b', border: '#4338ca', text: '#a5b4fc' },
  blue: { bg: '#132438', border: '#1e486d', text: '#60a5fa' },
  green: { bg: '#132920', border: '#1e5a40', text: '#4ade80' },
  purple: { bg: '#291838', border: '#5b2b7d', text: '#c084fc' },
  rose: { bg: '#331521', border: '#6f2441', text: '#f472b6' },
  neutral: { bg: '#1c1d29', border: '#33364f', text: '#eceef8' }
};

const DEFAULT_CALLOUT_THEME = CALLOUT_COLORS.amber;

const CALLOUT_EMOJIS = ['👏', '💡', '🎯', '🚀', '⚡', '📌', '⚠️', '💬', '💎', '🧠', '✨', '📝'];

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  autoFocus = false,
  pages = [],
  onSelectPage,
  onCreateSubpage,
  onUpdate,
  onDelete,
  onAddBelow,
  onAddImage,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver = false,
  dropPosition = 'bottom',
  onOpenSlashMenu,
  onCloseSlashMenu,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [mdPreview, setMdPreview] = useState(false);

  // Auto-resize textarea according to content
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [block.content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Handle clipboard paste (including images!)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Url = event.target?.result as string;
            if (block.content.trim() === '' && block.type === 'paragraph') {
              onUpdate({
                ...block,
                type: 'image',
                content: file.name,
                properties: { url: base64Url, caption: '' }
              });
            } else if (onAddImage) {
              onAddImage(block.id, base64Url, file.name);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        onUpdate({
          ...block,
          type: 'image',
          content: file.name,
          properties: { url: base64Url, caption: '' }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const text = block.content;

    // Markdown shortcut detection
    if (e.key === ' ' && textareaRef.current) {
      const cursor = textareaRef.current.selectionStart;
      const prefix = text.slice(0, cursor);

      if (prefix === '#') {
        e.preventDefault();
        onUpdate({ ...block, type: 'heading1', content: text.slice(cursor) });
        return;
      }
      if (prefix === '##') {
        e.preventDefault();
        onUpdate({ ...block, type: 'heading2', content: text.slice(cursor) });
        return;
      }
      if (prefix === '###') {
        e.preventDefault();
        onUpdate({ ...block, type: 'heading3', content: text.slice(cursor) });
        return;
      }
      if (prefix === '[]' || prefix === '[ ]') {
        e.preventDefault();
        onUpdate({ ...block, type: 'todo', content: text.slice(cursor), properties: { checked: false } });
        return;
      }
      if (prefix === '-') {
        e.preventDefault();
        onUpdate({ ...block, type: 'bullet', content: text.slice(cursor) });
        return;
      }
      if (prefix === '1.') {
        e.preventDefault();
        onUpdate({ ...block, type: 'number', content: text.slice(cursor) });
        return;
      }
      if (prefix === '>') {
        e.preventDefault();
        onUpdate({ ...block, type: 'quote', content: text.slice(cursor) });
        return;
      }
      if (prefix === '---') {
        e.preventDefault();
        onUpdate({ ...block, type: 'divider', content: '' });
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCloseSlashMenu();
      onAddBelow(block.id, block.type === 'todo' ? 'todo' : block.type === 'bullet' ? 'bullet' : 'paragraph');
      return;
    }

    if (e.key === 'Backspace' && block.content === '' && totalBlocks > 1) {
      e.preventDefault();
      onCloseSlashMenu();
      onDelete(block.id);
      return;
    }

    if (e.key === 'Escape') {
      onCloseSlashMenu();
      setShowOptions(false);
      setShowPagePicker(false);
      setShowEmojiPicker(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onUpdate({ ...block, content: val });

    // Slash command check
    const lastSlashIdx = val.lastIndexOf('/');
    if (lastSlashIdx !== -1 && textareaRef.current) {
      const query = val.slice(lastSlashIdx + 1);
      const rect = textareaRef.current.getBoundingClientRect();
      onOpenSlashMenu(
        block.id,
        { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
        query
      );
    } else {
      onCloseSlashMenu();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(block.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Table Helpers
  const tableData = block.properties?.tableData || [
    ['Coluna 1', 'Coluna 2', 'Coluna 3'],
    ['Item 1', 'Item 2', 'Item 3'],
    ['Item 4', 'Item 5', 'Item 6']
  ];

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const updated = tableData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? val : cell));
      }
      return [...row];
    });
    onUpdate({ ...block, properties: { ...block.properties, tableData: updated } });
  };

  const handleAddTableRow = () => {
    const colCount = tableData[0]?.length || 3;
    const newRow = Array(colCount).fill('');
    const updated = [...tableData, newRow];
    onUpdate({ ...block, properties: { ...block.properties, tableData: updated } });
  };

  const handleAddTableCol = () => {
    const updated = tableData.map((row, rIdx) => [...row, rIdx === 0 ? `Coluna ${row.length + 1}` : '']);
    onUpdate({ ...block, properties: { ...block.properties, tableData: updated } });
  };

  const handleDeleteTableRow = (rIdx: number) => {
    if (tableData.length <= 1) return;
    const updated = tableData.filter((_, idx) => idx !== rIdx);
    onUpdate({ ...block, properties: { ...block.properties, tableData: updated } });
  };

  const handleDeleteTableCol = (cIdx: number) => {
    if ((tableData[0]?.length || 0) <= 1) return;
    const updated = tableData.map(row => row.filter((_, idx) => idx !== cIdx));
    onUpdate({ ...block, properties: { ...block.properties, tableData: updated } });
  };

  const handleConvertTableToChart = () => {
    const headerRow = tableData[0] || [];
    const dataRows = tableData.slice(1);
    const labels = dataRows.map((r, idx) => r[0] || `Item ${idx + 1}`);

    const datasets = [];
    for (let c = 1; c < headerRow.length; c++) {
      const colName = headerRow[c] || `Série ${c}`;
      const values = dataRows.map(r => {
        const parsed = parseFloat(r[c]?.replace(',', '.') || '0');
        return isNaN(parsed) ? 10 : parsed;
      });
      datasets.push({ label: colName, values });
    }

    if (datasets.length === 0) {
      datasets.push({
        label: headerRow[0] || 'Valores',
        values: labels.map((_, i) => (i + 1) * 15)
      });
    }

    onUpdate({
      ...block,
      type: 'chart',
      properties: {
        ...block.properties,
        chartType: 'bar',
        chartTitle: block.content || 'Gráfico da Tabela',
        chartData: {
          labels: labels.length > 0 ? labels : ['A', 'B', 'C'],
          datasets
        }
      }
    });
  };

  // Target Page for 'page_link'
  const linkedPage = pages.find(p => p.id === block.properties?.targetPageId && !p.isDeleted);
  const filteredPages = pages.filter(p => 
    !p.isDeleted && 
    (p.title || '').toLowerCase().includes(pageSearchQuery.toLowerCase())
  );

  const calloutTheme = (block.properties?.color && CALLOUT_COLORS[block.properties.color]) 
    || DEFAULT_CALLOUT_THEME 
    || { bg: '#1c1d29', border: '#33364f', text: '#eceef8' };

  return (
    <div
      className={`block-row block-${block.type} ${isDragOver ? (dropPosition === 'top' ? 'drag-over-top' : 'drag-over-bottom') : ''}`}
      onPaste={handlePaste}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={() => onDrop && onDrop(index)}
      style={{ position: 'relative' }}
    >
      {/* Drop Indicator Bar */}
      {isDragOver && (
        <div
          className="block-drop-line"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [dropPosition === 'top' ? 'top' : 'bottom']: '-2px',
            height: '3px',
            backgroundColor: 'var(--accent)',
            borderRadius: '999px',
            boxShadow: 'var(--accent-glow)',
            zIndex: 30
          }}
        />
      )}

      {/* Hover handle & actions */}
      <div className="block-handle-container">
        <button
          className="block-handle-btn"
          title="Adicionar bloco abaixo"
          onClick={() => onAddBelow(block.id, 'paragraph')}
        >
          <Plus size={14} />
        </button>

        <div style={{ position: 'relative' }}>
          <div
            className="block-handle-btn"
            title="Arraste para reordenar ou clique para opções"
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(index));
              e.dataTransfer.effectAllowed = 'move';
              if (onDragStart) onDragStart(index);
            }}
            onClick={() => setShowOptions(!showOptions)}
            style={{ cursor: 'grab' }}
          >
            <GripVertical size={14} />
          </div>

          {showOptions && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                padding: '4px',
                zIndex: 60,
                width: '170px'
              }}
            >
              <div
                className="slash-menu-item"
                onClick={() => {
                  onDuplicate(block.id);
                  setShowOptions(false);
                }}
              >
                <Copy size={14} />
                <span>Duplicar bloco</span>
              </div>
              {index > 0 && (
                <div
                  className="slash-menu-item"
                  onClick={() => {
                    onMoveUp(index);
                    setShowOptions(false);
                  }}
                >
                  <ArrowUp size={14} />
                  <span>Mover para cima</span>
                </div>
              )}
              {index < totalBlocks - 1 && (
                <div
                  className="slash-menu-item"
                  onClick={() => {
                    onMoveDown(index);
                    setShowOptions(false);
                  }}
                >
                  <ArrowDown size={14} />
                  <span>Mover para baixo</span>
                </div>
              )}
              {totalBlocks > 1 && (
                <div
                  className="slash-menu-item"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    onDelete(block.id);
                    setShowOptions(false);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Excluir bloco</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Block Body Rendering */}
      <div className="block-content-wrapper">
        {/* TODO / CHECKBOX */}
        {block.type === 'todo' && (
          <div className="block-todo">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={block.properties?.checked || false}
              onChange={(e) => {
                onUpdate({
                  ...block,
                  properties: { ...block.properties, checked: e.target.checked }
                });
              }}
            />
            <textarea
              ref={textareaRef}
              rows={1}
              className={`block-editable ${block.properties?.checked ? 'todo-text-completed' : ''}`}
              placeholder="Tarefa a fazer..."
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>
        )}

        {/* BULLET LIST */}
        {block.type === 'bullet' && (
          <div className="block-bullet">
            <span className="bullet-dot">•</span>
            <textarea
              ref={textareaRef}
              rows={1}
              className="block-editable"
              placeholder="Item com marcador..."
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>
        )}

        {/* NUMBERED LIST */}
        {block.type === 'number' && (
          <div className="block-number">
            <span className="number-prefix">{index + 1}.</span>
            <textarea
              ref={textareaRef}
              rows={1}
              className="block-editable"
              placeholder="Item ordenado..."
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>
        )}

        {/* CALLOUT (Frase de Destaque) - Matches Screenshot 1 */}
        {block.type === 'callout' && (
          <div
            className="block-callout-custom"
            style={{
              backgroundColor: calloutTheme.bg,
              border: `1px solid ${calloutTheme.border}`,
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              margin: '8px 0',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              {/* Clickable Icon / Emoji Picker */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="callout-icon-btn"
                  title="Alterar emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '22px',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {block.properties?.icon || '👏'}
                </button>

                {showEmojiPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '8px',
                      zIndex: 80,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '4px',
                      width: '160px'
                    }}
                  >
                    {CALLOUT_EMOJIS.map(em => (
                      <button
                        key={em}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                        onClick={() => {
                          onUpdate({
                            ...block,
                            properties: { ...block.properties, icon: em }
                          });
                          setShowEmojiPicker(false);
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text content & Author */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="block-editable"
                  placeholder="Escreva a frase de destaque ou citação..."
                  style={{
                    fontSize: '15.5px',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    fontWeight: 400
                  }}
                  value={block.content}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />

                {/* Subtitle / Author input (e.g. Platão) */}
                <input
                  ref={authorRef}
                  type="text"
                  placeholder="Autor ou subtítulo (ex: Platão, Nota de Alinhamento...)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    width: '100%',
                    opacity: 0.85
                  }}
                  value={block.properties?.author || ''}
                  onChange={(e) => onUpdate({
                    ...block,
                    properties: { ...block.properties, author: e.target.value }
                  })}
                />
              </div>

              {/* Color theme switch button */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  title="Mudar cor do destaque"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <Palette size={15} />
                </button>

                {showColorPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '6px',
                      zIndex: 80,
                      display: 'flex',
                      gap: '6px'
                    }}
                  >
                    {Object.entries(CALLOUT_COLORS).map(([colorKey, conf]) => (
                      <button
                        key={colorKey}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: conf.bg,
                          border: `2px solid ${conf.border}`,
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title={colorKey}
                        onClick={() => {
                          onUpdate({
                            ...block,
                            properties: { ...block.properties, color: colorKey }
                          });
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QUOTE (Citação) - Matches Screenshot 1 */}
        {block.type === 'quote' && (
          <div
            className="block-quote-custom"
            style={{
              borderLeft: '4px solid var(--accent)',
              paddingLeft: '16px',
              margin: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              className="block-editable"
              placeholder="Digite a citação..."
              style={{
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                fontSize: '15.5px'
              }}
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
            <input
              type="text"
              placeholder="— Autor da citação (opcional)"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '12.5px',
                color: 'var(--text-muted)',
                fontStyle: 'normal'
              }}
              value={block.properties?.author || ''}
              onChange={(e) => onUpdate({
                ...block,
                properties: { ...block.properties, author: e.target.value }
              })}
            />
          </div>
        )}

        {/* LINK PARA A PÁGINA (Page Link) - Matches Screenshots 3 & 4 */}
        {block.type === 'page_link' && (
          <div className="block-page-link-wrapper" style={{ margin: '6px 0' }}>
            {linkedPage ? (
              <div
                className="page-link-card"
                onClick={() => onSelectPage && onSelectPage(linkedPage.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontSize: '18px' }}>{linkedPage.icon || '📄'}</span>
                <span style={{ fontWeight: 500, fontSize: '14.5px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  {linkedPage.title || 'Página sem título'}
                </span>
                <ArrowUpRight size={15} color="var(--accent)" />
                <button
                  type="button"
                  title="Alterar página vinculada"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPagePicker(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '4px'
                  }}
                >
                  <ChevronDown size={13} />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  className="page-link-placeholder"
                  onClick={() => setShowPagePicker(!showPagePicker)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px dashed var(--accent)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: 500
                  }}
                >
                  <Link2 size={16} />
                  <span>{block.content ? block.content : 'Selecione uma página para vincular...'}</span>
                  <ChevronDown size={14} />
                </button>

                {showPagePicker && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '6px',
                      width: '280px',
                      maxHeight: '300px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '8px',
                      zIndex: 80,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Pesquisar página..."
                      value={pageSearchQuery}
                      onChange={(e) => setPageSearchQuery(e.target.value)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 10px',
                        color: 'var(--text-primary)',
                        fontSize: '12.5px',
                        outline: 'none',
                        marginBottom: '8px'
                      }}
                      autoFocus
                    />

                    <div style={{ overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {filteredPages.map(p => (
                        <div
                          key={p.id}
                          className="slash-menu-item"
                          onClick={() => {
                            onUpdate({
                              ...block,
                              content: p.title,
                              properties: { ...block.properties, targetPageId: p.id }
                            });
                            setShowPagePicker(false);
                          }}
                          style={{ padding: '6px 8px', fontSize: '13px' }}
                        >
                          <span>{p.icon || '📄'}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.title || 'Sem título'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {onCreateSubpage && (
                      <div
                        className="slash-menu-item"
                        style={{
                          marginTop: '6px',
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '6px',
                          color: 'var(--accent)',
                          fontWeight: 500
                        }}
                        onClick={() => {
                          onCreateSubpage('Nova Subpágina');
                          setShowPagePicker(false);
                        }}
                      >
                        <PlusCircle size={15} />
                        <span>Criar nova subpágina</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* INTERACTIVE TABLE BLOCK - Matches Screenshot 3 */}
        {block.type === 'table' && (
          <div className="block-table-wrapper" style={{ margin: '10px 0', overflowX: 'auto' }}>
            <div style={{ display: 'inline-block', minWidth: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <tbody>
                  {tableData.map((row, rIdx) => (
                    <tr key={rIdx} style={{ backgroundColor: rIdx === 0 ? 'var(--bg-secondary)' : 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            borderRight: '1px solid var(--border-color)',
                            padding: '6px 10px',
                            fontWeight: rIdx === 0 ? 600 : 400
                          }}
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: 'var(--text-primary)',
                              fontSize: '13px'
                            }}
                          />
                        </td>
                      ))}
                      {/* Delete row button */}
                      {tableData.length > 1 && (
                        <td style={{ width: '28px', textAlign: 'center', padding: '2px' }}>
                          <button
                            type="button"
                            title="Excluir linha"
                            onClick={() => handleDeleteTableRow(rIdx)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '8px', padding: '6px 10px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="nav-btn"
                  style={{ fontSize: '12px', padding: '3px 8px' }}
                  onClick={handleAddTableRow}
                >
                  <Plus size={12} />
                  <span>Linha</span>
                </button>
                <button
                  type="button"
                  className="nav-btn"
                  style={{ fontSize: '12px', padding: '3px 8px' }}
                  onClick={handleAddTableCol}
                >
                  <Plus size={12} />
                  <span>Coluna</span>
                </button>
                {(tableData[0]?.length || 0) > 1 && (
                  <button
                    type="button"
                    className="nav-btn"
                    style={{ fontSize: '12px', padding: '3px 8px', color: '#ef4444' }}
                    title="Excluir última coluna"
                    onClick={() => handleDeleteTableCol(tableData[0].length - 1)}
                  >
                    <Trash2 size={12} />
                    <span>Coluna</span>
                  </button>
                )}
                <button
                  type="button"
                  className="nav-btn"
                  style={{ fontSize: '12px', padding: '3px 8px', marginLeft: 'auto', color: 'var(--accent)' }}
                  title="Converter dados desta tabela em gráfico (pizza, rosca, colunas, linha)"
                  onClick={handleConvertTableToChart}
                >
                  <BarChart2 size={12} />
                  <span>Ver como gráfico</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMBEDDED WHITEBOARD CANVAS (Quadro de Desenho estilo Miro) */}
        {block.type === 'whiteboard' && (
          <div className="block-whiteboard-embedded" style={{ margin: '14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
                <Palette size={16} />
                <span>Quadro de Desenho & Post-its (Miro)</span>
              </div>
            </div>
            <WhiteboardView
              data={block.properties?.whiteboardData}
              onChange={(whiteboardData) => onUpdate({
                ...block,
                properties: { ...block.properties, whiteboardData }
              })}
            />
          </div>
        )}

        {/* CHART BLOCK */}
        {block.type === 'chart' && (
          <ChartBlock
            chartType={block.properties?.chartType || 'bar'}
            chartData={block.properties?.chartData || { labels: [], datasets: [] }}
            chartTitle={block.properties?.chartTitle}
            onChangeType={(chartType) => onUpdate({ ...block, properties: { ...block.properties, chartType } })}
            onChangeData={(chartData) => onUpdate({ ...block, properties: { ...block.properties, chartData } })}
            onChangeTitle={(chartTitle) => onUpdate({ ...block, properties: { ...block.properties, chartTitle } })}
          />
        )}

        {/* PAGE EMBED BLOCK */}
        {block.type === 'page_embed' && (
          <PageEmbedBlock
            embedPageId={block.properties?.embedPageId}
            embedMode={block.properties?.embedMode}
            pages={pages}
            onSelectPage={onSelectPage}
            onChangeEmbed={(embedPageId, embedMode) => onUpdate({ ...block, properties: { ...block.properties, embedPageId, embedMode } })}
          />
        )}

        {/* MERMAID DIAGRAM BLOCK */}
        {block.type === 'mermaid' && (
          <MermaidBlock
            code={block.content}
            onChange={(val) => onUpdate({ ...block, content: val })}
            onKeyDown={handleKeyDown}
          />
        )}

        {/* CODE BLOCK */}
        {block.type === 'code' && (
          <div className="block-code-container">
            <div className="code-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CodeIcon size={14} />
                <span>{block.properties?.language || 'typescript'}</span>
              </div>
              <button className="code-copy-btn" onClick={copyCode}>
                {copiedCode ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              rows={3}
              className="code-editor-textarea"
              placeholder="// Digite ou cole seu código..."
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>
        )}

        {/* IMAGE BLOCK */}
        {block.type === 'image' && (
          <div style={{ margin: '8px 0' }}>
            {block.properties?.url ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                  <img
                    src={block.properties.url}
                    alt={block.properties.caption || 'Imagem colada'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '520px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'block'
                    }}
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    <button
                      className="sidebar-btn-icon"
                      style={{ background: 'rgba(0,0,0,0.65)', color: '#fff' }}
                      title="Substituir imagem"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={13} />
                    </button>
                    <button
                      className="sidebar-btn-icon"
                      style={{ background: 'rgba(0,0,0,0.65)', color: '#ef4444' }}
                      title="Excluir imagem"
                      onClick={() => onDelete(block.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Adicionar legenda à imagem..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    width: '100%',
                    marginTop: '6px'
                  }}
                  value={block.properties.caption || ''}
                  onChange={(e) => onUpdate({
                    ...block,
                    properties: { ...block.properties, caption: e.target.value }
                  })}
                />
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={30} color="var(--accent)" />
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Cole uma imagem da área de transferência (Ctrl+V) ou clique para fazer upload
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Suporta PNG, JPG, GIF, WebP e capturas de tela
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* DIVIDER */}
        {block.type === 'divider' && (
          <div className="block-divider">
            <hr />
          </div>
        )}

        {/* HEADINGS & PARAGRAPH — with inline Markdown rendering */}
        {['paragraph', 'heading1', 'heading2', 'heading3'].includes(block.type) && (
          mdPreview && block.content.trim() !== '' ? (
            <div
              className={`block-editable md-rendered-block ${block.type}`}
              onClick={() => setMdPreview(false)}
              title="Clique para editar Markdown"
              style={{ cursor: 'text', minHeight: '24px' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownBlock(block.content) }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              rows={1}
              className="block-editable"
              placeholder={
                block.type === 'heading1' ? 'Título 1...' :
                block.type === 'heading2' ? 'Título 2...' :
                block.type === 'heading3' ? 'Título 3...' :
                'Digite "/" para comandos, "*texto*" para Markdown, ou cole imagens (Ctrl+V)...'
              }
              value={block.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => {
                if (/[*_`~\[]/.test(block.content)) {
                  setMdPreview(true);
                }
              }}
            />
          )
        )}
      </div>
    </div>
  );
};
