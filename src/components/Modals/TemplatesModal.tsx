import React, { useState } from 'react';
import { X, LayoutTemplate, ArrowRight } from 'lucide-react';
import type { Page } from '../../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templatePage: Partial<Page>) => void;
}

interface TemplateDef {
  id: string;
  category: 'Engenharia' | 'Projetos' | 'Conteúdo' | 'Pessoal';
  title: string;
  icon: string;
  description: string;
  badge: string;
  pageData: Partial<Page>;
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'tmpl-agile-sprint',
    category: 'Engenharia',
    title: 'Sprint Scrum & Backlog Ágil',
    icon: '⚡',
    description: 'Quadro ágil completo com etapas de desenvolvimento, revisão e controle de estimativas.',
    badge: 'Popular',
    pageData: {
      title: 'Sprint 14 - Desenvolvimento',
      icon: '⚡',
      type: 'board',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      databaseConfig: {
        activeView: 'board',
        statuses: [
          { id: 's1', name: 'Backlog', color: '#64748b' },
          { id: 's2', name: 'Sprint Atual', color: '#f59e0b' },
          { id: 's3', name: 'Em Desenvolvimento', color: '#3b82f6' },
          { id: 's4', name: 'Code Review', color: '#8b5cf6' },
          { id: 's5', name: 'Pronto / Concluído', color: '#10b981' },
        ],
        columns: [
          { id: 'title', name: 'História / Tarefa', type: 'text' },
          { id: 'status', name: 'Etapa', type: 'status' },
          { id: 'priority', name: 'Prioridade', type: 'priority' },
          { id: 'date', name: 'Início', type: 'date' },
          { id: 'endDate', name: 'Término', type: 'date' },
          { id: 'assignee', name: 'Responsável', type: 'text' }
        ],
        rows: [
          {
            id: 'r1',
            title: 'Configurar autenticação JWT e sessão',
            status: 'Pronto / Concluído',
            priority: 'Alta',
            date: '2026-10-20',
            endDate: '2026-10-23',
            assignee: 'Backend Team',
            notes: 'Testes unitários cobrindo 95% do módulo.'
          },
          {
            id: 'r2',
            title: 'Refatorar componentes da tela inicial',
            status: 'Em Desenvolvimento',
            priority: 'Média',
            date: '2026-10-24',
            endDate: '2026-10-27',
            assignee: 'Frontend Dev'
          },
          {
            id: 'r3',
            title: 'Auditoria de acessibilidade e tema escuro',
            status: 'Sprint Atual',
            priority: 'Urgente',
            date: '2026-10-28',
            endDate: '2026-10-31',
            assignee: 'UI/UX'
          }
        ]
      }
    }
  },
  {
    id: 'tmpl-api-docs',
    category: 'Engenharia',
    title: 'Guia de Engenharia & API Wiki',
    icon: '🛠️',
    description: 'Documentação técnica com padrões de código, convenções de arquitetura e endpoints REST.',
    badge: 'Técnico',
    pageData: {
      title: 'Guia de Arquitetura & API v1',
      icon: '🛠️',
      type: 'document',
      coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      blocks: [
        {
          id: 'b1',
          type: 'callout',
          content: 'Documento central de referência de código e convenções para novos contribuidores.',
          properties: { icon: '📘', color: 'indigo' }
        },
        {
          id: 'b2',
          type: 'heading1',
          content: 'Convenções de API'
        },
        {
          id: 'b3',
          type: 'paragraph',
          content: 'Todos os endpoints devem responder em formato JSON padrão e utilizar códigos HTTP semânticos (200 OK, 201 Created, 400 Bad Request, 404 Not Found).'
        },
        {
          id: 'b4',
          type: 'heading2',
          content: 'Exemplo de Payload de Resposta'
        },
        {
          id: 'b5',
          type: 'code',
          content: `{\n  "status": "success",\n  "data": {\n    "workspaceId": "ws_9921",\n    "name": "Projeto 1",\n    "storageEngine": "IndexedDB / Local-First"\n  }\n}`,
          properties: { language: 'json' }
        },
        {
          id: 'b6',
          type: 'heading2',
          content: 'Checklist de Deploy'
        },
        {
          id: 'b7',
          type: 'todo',
          content: 'Rodar npm run build e verificar ausência de erros de tipagem',
          properties: { checked: true }
        },
        {
          id: 'b8',
          type: 'todo',
          content: 'Validar persistência no armazenamento local',
          properties: { checked: false }
        }
      ]
    }
  },
  {
    id: 'tmpl-editorial-calendar',
    category: 'Conteúdo',
    title: 'Calendário Editorial de Mídias',
    icon: '📅',
    description: 'Planeje publicações para redes sociais, blog e canais de comunicação com visão em calendário e Gantt.',
    badge: 'Marketing',
    pageData: {
      title: 'Calendário de Conteúdo & Mídias',
      icon: '📅',
      type: 'calendar',
      coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      databaseConfig: {
        activeView: 'calendar',
        statuses: [
          { id: 's1', name: 'Ideia', color: '#64748b' },
          { id: 's2', name: 'Em Redação', color: '#f59e0b' },
          { id: 's3', name: 'Agendado', color: '#3b82f6' },
          { id: 's4', name: 'Publicado', color: '#10b981' }
        ],
        columns: [
          { id: 'title', name: 'Título do Post', type: 'text' },
          { id: 'status', name: 'Status', type: 'status' },
          { id: 'priority', name: 'Canal', type: 'priority' },
          { id: 'date', name: 'Data de Publicação', type: 'date' },
          { id: 'endDate', name: 'Término da Campanha', type: 'date' },
          { id: 'assignee', name: 'Criador', type: 'text' }
        ],
        rows: [
          {
            id: 'p1',
            title: 'Lançamento do Projeto 1 no GitHub',
            status: 'Agendado',
            priority: 'Alta',
            date: '2026-10-25',
            endDate: '2026-10-27',
            assignee: 'Comunicação'
          },
          {
            id: 'p2',
            title: 'Artigo: Como construir um workspace modular com React',
            status: 'Em Redação',
            priority: 'Média',
            date: '2026-10-28',
            endDate: '2026-10-30',
            assignee: 'Redator'
          },
          {
            id: 'p3',
            title: 'Tutorial em Vídeo: Atalhos Markdown e Slash Commands',
            status: 'Ideia',
            priority: 'Baixa',
            date: '2026-11-04',
            endDate: '2026-11-06',
            assignee: 'Vídeo Maker'
          }
        ]
      }
    }
  },
  {
    id: 'tmpl-habits',
    category: 'Pessoal',
    title: 'Rastreador de Hábitos & Metas',
    icon: '🎯',
    description: 'Acompanhe objetivos semanais, rotinas diárias e anotações de foco pessoal.',
    badge: 'Produtividade',
    pageData: {
      title: 'Minhas Metas & Hábitos Diários',
      icon: '🎯',
      type: 'document',
      coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      blocks: [
        {
          id: 'hb1',
          type: 'quote',
          content: '“Somos o que repetidamente fazemos. A excelência, portanto, não é um ato, mas um hábito.” – Aristóteles'
        },
        {
          id: 'hb2',
          type: 'heading1',
          content: 'Rotina Matinal'
        },
        {
          id: 'hb3',
          type: 'todo',
          content: 'Beber 500ml de água ao acordar',
          properties: { checked: true }
        },
        {
          id: 'hb4',
          type: 'todo',
          content: '30 minutos de atividade física ou caminhada',
          properties: { checked: false }
        },
        {
          id: 'hb5',
          type: 'todo',
          content: 'Revisar o roadmap de prioridades do dia',
          properties: { checked: false }
        },
        {
          id: 'hb6',
          type: 'heading2',
          content: 'Foco da Semana'
        },
        {
          id: 'hb7',
          type: 'callout',
          content: 'Dedicar 2 horas de trabalho profundo ininterrupto todos os dias pela manhã.',
          properties: { icon: '🧠', color: 'purple' }
        }
      ]
    }
  }
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  if (!isOpen) return null;

  const categories = ['Todos', 'Engenharia', 'Conteúdo', 'Pessoal'];

  const filteredTemplates = selectedCategory === 'Todos'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <LayoutTemplate size={16} />
            </div>
            <div>
              <span className="modal-title">Galeria de Templates</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Modelos prontos para turbinar sua produtividade
              </div>
            </div>
          </div>
          <button className="sidebar-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', padding: '16px 20px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className="view-tab"
                style={{
                  padding: '4px 12px',
                  fontSize: '12.5px',
                  background: selectedCategory === cat ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                  color: selectedCategory === cat ? 'var(--accent)' : 'var(--text-secondary)'
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {filteredTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  onApplyTemplate(tmpl.pageData);
                  onClose();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>{tmpl.icon}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)'
                      }}
                    >
                      {tmpl.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {tmpl.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {tmpl.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: 'var(--accent)', fontSize: '12.5px', fontWeight: 500 }}>
                  <span>Usar este modelo</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
