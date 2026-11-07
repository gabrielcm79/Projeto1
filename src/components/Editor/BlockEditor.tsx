import React, { useState } from 'react';
import type { Block, BlockType, Page } from '../../types';
import { BlockItem } from './BlockItem';
import { SlashMenu } from './SlashMenu';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  pages?: Page[];
  onSelectPage?: (pageId: string) => void;
  onCreateSubpage?: (title: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChange,
  pages = [],
  onSelectPage,
  onCreateSubpage,
}) => {
  const [slashState, setSlashState] = useState<{
    isOpen: boolean;
    blockId: string | null;
    position: { top: number; left: number };
    query: string;
  }>({
    isOpen: false,
    blockId: null,
    position: { top: 0, left: 0 },
    query: '',
  });

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom'>('bottom');

  const handleUpdateBlock = (updated: Block) => {
    onChange(blocks.map(b => b.id === updated.id ? updated : b));
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    onChange(blocks.filter(b => b.id !== id));
  };

  const handleAddBelow = (targetId: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: '',
      properties: 
        type === 'todo' ? { checked: false } :
        type === 'callout' ? { icon: '👏', color: 'amber', author: '' } :
        type === 'table' ? {
          tableData: [
            ['Coluna 1', 'Coluna 2', 'Coluna 3'],
            ['', '', ''],
            ['', '', '']
          ]
        } :
        type === 'chart' ? {
          chartType: 'bar',
          chartTitle: '',
          chartData: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
              { label: 'Série A', values: [42, 65, 38, 80, 55, 72] },
              { label: 'Série B', values: [28, 45, 60, 35, 70, 48] }
            ]
          }
        } :
        type === 'page_embed' ? { embedMode: 'first_block' } :
        type === 'mermaid' ? {} :
        {} 
    };

    const index = blocks.findIndex(b => b.id === targetId);
    if (index === -1) {
      onChange([...blocks, newBlock]);
    } else {
      const updated = [...blocks];
      updated.splice(index + 1, 0, newBlock);
      onChange(updated);
    }
  };

  const handleAddImage = (targetId: string, url: string, caption: string = '') => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'image',
      content: caption,
      properties: { url, caption: '' }
    };

    const index = blocks.findIndex(b => b.id === targetId);
    if (index === -1) {
      onChange([...blocks, newBlock]);
    } else {
      const updated = [...blocks];
      updated.splice(index + 1, 0, newBlock);
      onChange(updated);
    }
  };

  const handleDuplicate = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;

    const original = blocks[index];
    const copy: Block = {
      ...original,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    const updated = [...blocks];
    updated.splice(index + 1, 0, copy);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDragOverIndex(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position = offsetY < rect.height / 2 ? 'top' : 'bottom';

    setDragOverIndex(index);
    setDropPosition(position);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...blocks];
    const [movedBlock] = updated.splice(draggedIndex, 1);
    
    let insertIndex = targetIndex;
    if (draggedIndex < targetIndex && dropPosition === 'top') {
      insertIndex = targetIndex - 1;
    } else if (draggedIndex > targetIndex && dropPosition === 'bottom') {
      insertIndex = targetIndex + 1;
    }

    updated.splice(insertIndex, 0, movedBlock);
    onChange(updated);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSelectSlashCommand = (type: BlockType) => {
    if (!slashState.blockId) return;

    const block = blocks.find(b => b.id === slashState.blockId);
    if (!block) return;

    // Remove the slash from content
    const lastSlashIdx = block.content.lastIndexOf('/');
    const cleanContent = lastSlashIdx !== -1 ? block.content.slice(0, lastSlashIdx) : block.content;

    let properties = { ...block.properties };
    if (type === 'todo') {
      properties.checked = false;
    } else if (type === 'code') {
      properties.language = 'typescript';
    } else if (type === 'callout') {
      properties.icon = '👏';
      properties.color = 'amber';
    } else if (type === 'table') {
      properties.tableData = [
        ['Item', 'Status', 'Observação'],
        ['Tarefa A', 'Concluído', 'Entregue no prazo'],
        ['Tarefa B', 'Em andamento', 'Aguardando validação']
      ];
    } else if (type === 'chart') {
      properties.chartType = 'bar';
      properties.chartData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          { label: 'Série A', values: [42, 65, 38, 80, 55, 72] }
        ]
      };
      properties.chartTitle = '';
    } else if (type === 'page_embed') {
      properties.embedMode = 'first_block';
    } else if (type === 'mermaid') {
      // content will hold the mermaid code
    } else if (type === 'whiteboard') {
      properties.whiteboardData = {
        strokes: [],
        shapes: [],
        stickies: [
          {
            id: 'sticky-1',
            x: 200,
            y: 80,
            width: 180,
            height: 140,
            text: '💡 Ideias do Projeto',
            color: '#fef08a'
          }
        ],
        texts: []
      };
    }

    handleUpdateBlock({
      ...block,
      type,
      content: cleanContent,
      properties
    });

    setSlashState({ isOpen: false, blockId: null, position: { top: 0, left: 0 }, query: '' });
  };

  // Global paste listener for pasting images directly into the page
  const handleContainerPaste = (e: React.ClipboardEvent) => {
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
            const lastBlockId = blocks[blocks.length - 1]?.id || '';
            handleAddImage(lastBlockId, base64Url, file.name);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  return (
    <div
      className="blocks-container"
      onPaste={handleContainerPaste}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOverIndex(null);
        }
      }}
    >
      {blocks.map((block, index) => (
        <BlockItem
          key={block.id}
          block={block}
          index={index}
          totalBlocks={blocks.length}
          pages={pages}
          onSelectPage={onSelectPage}
          onCreateSubpage={onCreateSubpage}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
          onAddBelow={handleAddBelow}
          onAddImage={handleAddImage}
          onDuplicate={handleDuplicate}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragOver={dragOverIndex === index}
          dropPosition={dropPosition}
          onOpenSlashMenu={(blockId, pos, query) => {
            setSlashState({ isOpen: true, blockId, position: pos, query });
          }}
          onCloseSlashMenu={() => {
            setSlashState(prev => ({ ...prev, isOpen: false }));
          }}
        />
      ))}

      {slashState.isOpen && (
        <SlashMenu
          query={slashState.query}
          position={slashState.position}
          onSelect={handleSelectSlashCommand}
          onClose={() => setSlashState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
