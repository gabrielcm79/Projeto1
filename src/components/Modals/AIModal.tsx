import React, { useState } from 'react';
import { Sparkles, X, Send, Copy, Check, Plus, Settings } from 'lucide-react';
import type { Page, Block } from '../../types';

interface AIModalProps {
  isOpen: boolean;
  currentPage: Page | null;
  onClose: () => void;
  onInsertBlocks: (blocks: Block[]) => void;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  currentPage,
  onClose,
  onInsertBlocks,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('fluxo_ai_key') || '');

  if (!isOpen || !currentPage) return null;

  const executeAction = (actionType: 'summarize' | 'action_items' | 'brainstorm' | 'expand' | 'improve', customPrompt?: string) => {
    setIsGenerating(true);
    setGeneratedText('');

    setTimeout(() => {
      let result = '';

      if (actionType === 'summarize') {
        result = `### 📋 Resumo Executivo: ${currentPage.title}\n\n` +
          `• **Objetivo Central:** Documento focado em estruturar fluxos locais de alta produtividade.\n` +
          `• **Pontos Principais:** O projeto integra documentos em blocos com visualizações dinâmicas (Kanban, Tabela, Calendário e Gantt).\n` +
          `• **Status:** O conteúdo possui ${currentPage.blocks.length} blocos registrados com persistência local garantida.`;
      } else if (actionType === 'action_items') {
        result = `### 🎯 Plano de Ação & Próximas Tarefas\n\n` +
          `- [ ] Validar sincronização de novas etapas personalizadas no Kanban\n` +
          `- [ ] Adicionar capturas de tela demonstrativas colando imagens (Ctrl+V)\n` +
          `- [ ] Revisar prazos e marcos no gráfico de Gantt\n` +
          `- [ ] Exportar cópia de segurança em formato Markdown (.md)`;
      } else if (actionType === 'brainstorm') {
        result = `### 💡 5 Ideias de Melhorias & Funcionalidades\n\n` +
          `1. **Modo Foco / Zen:** Ocultar todas as barras laterais e cabeçalhos para escrita livre.\n` +
          `2. **Visualização em Galeria:** Cards em grade com preview de capa para portfólios.\n` +
          `3. **Histórico de Versões:** Restaurar versões anteriores salvas no armazenamento local.\n` +
          `4. **Widgets Interativos:** Relógio pomodoro e contador de palavras fixo no rodapé.\n` +
          `5. **Publicação Web:** Exportar páginas como sites estáticos HTML para compartilhamento.`;
      } else if (actionType === 'expand') {
        result = `### 🚀 Continuação Sugerida do Conteúdo\n\n` +
          `À medida que o workspace evolui, a combinação entre a flexibilidade do Notion e a privacidade local-first deste workspace oferece uma experiência incomparável. ` +
          `Permite aos usuários organizar pensamentos, tarefas e prazos sem depender de conexões externas ou servidores de terceiros.`;
      } else if (customPrompt) {
        result = `### 🤖 Resposta para: "${customPrompt}"\n\n` +
          `Com base no contexto de "${currentPage.title}", aqui está uma proposta estruturada:\n\n` +
          `• **Abordagem recomendada:** Mantenha a arquitetura modular orientada a blocos para fácil manutenção.\n` +
          `• **Próximo passo:** Implemente os componentes necessários e teste a responsividade com diferentes densidades de dados.`;
      }

      setGeneratedText(result);
      setIsGenerating(false);
    }, 600);
  };

  const handleInsertIntoDocument = () => {
    if (!generatedText) return;

    // Convert generated text lines to blocks
    const lines = generatedText.split('\n').filter(Boolean);
    const newBlocks: Block[] = lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return {
          id: `ai-block-${Date.now()}-${idx}`,
          type: 'heading2',
          content: line.replace('### ', '')
        };
      } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        return {
          id: `ai-block-${Date.now()}-${idx}`,
          type: 'todo',
          content: line.replace(/- \[[ x]\] /, ''),
          properties: { checked: line.startsWith('- [x] ') }
        };
      } else if (line.startsWith('• ') || line.startsWith('- ')) {
        return {
          id: `ai-block-${Date.now()}-${idx}`,
          type: 'bullet',
          content: line.replace(/^[•\-] /, '')
        };
      } else if (/^\d+\. /.test(line)) {
        return {
          id: `ai-block-${Date.now()}-${idx}`,
          type: 'number',
          content: line.replace(/^\d+\. /, '')
        };
      } else {
        return {
          id: `ai-block-${Date.now()}-${idx}`,
          type: 'paragraph',
          content: line
        };
      }
    });

    onInsertBlocks(newBlocks);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <span className="modal-title">FluxoAI Assistant</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Inteligência local contextual para criar, resumir e organizar
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="sidebar-btn-icon"
              title="Configurar Chave de API"
              onClick={() => setShowApiSettings(!showApiSettings)}
            >
              <Settings size={15} />
            </button>
            <button className="sidebar-btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '75vh', padding: '16px 20px' }}>
          {/* API settings accordion */}
          {showApiSettings && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Configuração Opcional de Provedor LLM (Local / Nuvem)
              </div>
              <input
                type="password"
                placeholder="Cole sua API Key (OpenAI, Gemini ou URL do Ollama local http://localhost:11434)"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('fluxo_ai_key', e.target.value);
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Por padrão, o assistente opera localmente com templates estruturados sem necessidade de chave.
              </div>
            </div>
          )}

          {/* Context Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span>📄 Página:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{currentPage.title}</span>
            <span>({currentPage.blocks.length} blocos)</span>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ações Rápidas
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                className="action-chip"
                style={{ background: 'var(--bg-secondary)', padding: '6px 10px', border: '1px solid var(--border-subtle)' }}
                onClick={() => executeAction('summarize')}
              >
                <span>⚡ Resumir Documento</span>
              </button>
              <button
                className="action-chip"
                style={{ background: 'var(--bg-secondary)', padding: '6px 10px', border: '1px solid var(--border-subtle)' }}
                onClick={() => executeAction('action_items')}
              >
                <span>🎯 Extrair Próximas Tarefas</span>
              </button>
              <button
                className="action-chip"
                style={{ background: 'var(--bg-secondary)', padding: '6px 10px', border: '1px solid var(--border-subtle)' }}
                onClick={() => executeAction('brainstorm')}
              >
                <span>💡 5 Ideias de Melhorias</span>
              </button>
              <button
                className="action-chip"
                style={{ background: 'var(--bg-secondary)', padding: '6px 10px', border: '1px solid var(--border-subtle)' }}
                onClick={() => executeAction('expand')}
              >
                <span>✍️ Expandir Conteúdo</span>
              </button>
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="db-search-input"
              style={{ flex: 1, padding: '10px 14px', fontSize: '13.5px' }}
              placeholder="Ou digite o que deseja pedir para a IA..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim()) {
                  executeAction('improve', prompt);
                }
              }}
            />
            <button
              className="nav-btn primary"
              style={{ padding: '0 16px' }}
              disabled={isGenerating || !prompt.trim()}
              onClick={() => executeAction('improve', prompt)}
            >
              <Send size={14} />
              <span>Gerar</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {isGenerating && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--accent)', fontSize: '13px' }}>
              <Sparkles size={24} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 8px auto' }} />
              <div>O FluxoAI está gerando seu conteúdo...</div>
            </div>
          )}

          {/* Generated Result View */}
          {generatedText && !isGenerating && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div
                style={{
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}
              >
                {generatedText}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <button className="nav-btn" onClick={handleCopy}>
                  {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button className="nav-btn primary" onClick={handleInsertIntoDocument}>
                  <Plus size={14} />
                  <span>Inserir no Documento</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
