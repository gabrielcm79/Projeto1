import type { Page, WorkspaceData } from '../types';

export const INITIAL_PAGES: Page[] = [
  {
    id: 'page-crm-hub',
    parentId: null,
    title: 'CRM de Vendas & Portal do Projeto',
    icon: '👟',
    coverUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    type: 'document',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'crm-callout-1',
        type: 'callout',
        content: 'Tente mover o mundo – o primeiro passo será mover a si mesmo.',
        properties: { icon: '👏', color: 'amber', author: 'Platão' }
      },
      {
        id: 'crm-callout-2',
        type: 'callout',
        content: 'Pilares da Logística ENM: Organização, padronização, Identificação, controles, rotina e gestão a vista.',
        properties: { icon: '💡', color: 'neutral', author: 'Para uma boa gestão: Meta, plano, execução, acompanhamento, gestão a vista.' }
      },
      {
        id: 'crm-h1',
        type: 'heading2',
        content: 'Páginas Vinculadas ao Projeto'
      },
      {
        id: 'crm-link-1',
        type: 'page_link',
        content: 'Organizador Semanal',
        properties: { targetPageId: 'page-weekly-planner' }
      },
      {
        id: 'crm-link-2',
        type: 'page_link',
        content: 'Modelo de Proposta',
        properties: { targetPageId: 'page-proposal' }
      },
      {
        id: 'crm-link-3',
        type: 'page_link',
        content: 'Quadro de Ideias & Brainstorming (Miro)',
        properties: { targetPageId: 'page-miro-board' }
      },
      {
        id: 'crm-link-4',
        type: 'page_link',
        content: 'Roadmap & Sprint do Projeto',
        properties: { targetPageId: 'page-roadmap' }
      },
      {
        id: 'crm-div-1',
        type: 'divider',
        content: ''
      },
      {
        id: 'crm-h2',
        type: 'heading2',
        content: 'Banco de Dados de Clientes & Contatos'
      },
      {
        id: 'crm-table',
        type: 'table',
        content: '',
        properties: {
          tableData: [
            ['Cliente / Lead', 'Status', 'Valor Estimado', 'Contato', 'Responsável'],
            ['Gustavo Alves', 'Lead', 'R$ 25.000,00', 'gustavo.alves@empresa.com', 'Sohrab'],
            ['Mariana Mendes', 'Qualificado', 'R$ 30.000,00', 'mariana@mendes.com', 'Zoe'],
            ['Camila Souza', 'Proposta', 'R$ 30.000,00', 'camila.souza@notion.so', 'Kengo'],
            ['CALESCITA', 'Negociação', 'R$ 1.090,00', 'contato@calescita.com', 'Zoe Ludwig'],
            ['Marcelo Monteiro', 'Em andamento', 'R$ 30.000,00', 'marcelo@frontier.tech', 'Alice']
          ]
        }
      }
    ]
  },
  {
    id: 'page-weekly-planner',
    parentId: 'page-crm-hub',
    title: 'Organizador Semanal',
    icon: '↗',
    coverUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
    type: 'document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'wp-1',
        type: 'heading1',
        content: 'Planejamento e Metas da Semana'
      },
      {
        id: 'wp-2',
        type: 'callout',
        content: 'Priorize as tarefas de maior impacto no início de cada dia útil.',
        properties: { icon: '🎯', color: 'blue' }
      },
      {
        id: 'wp-3',
        type: 'todo',
        content: 'Alinhar pipeline comercial com a equipe',
        properties: { checked: true }
      },
      {
        id: 'wp-4',
        type: 'todo',
        content: 'Enviar minutas de contrato para clientes qualificados',
        properties: { checked: false }
      },
      {
        id: 'wp-5',
        type: 'todo',
        content: 'Revisar métricas de conversão e receita',
        properties: { checked: false }
      }
    ]
  },
  {
    id: 'page-proposal',
    parentId: 'page-crm-hub',
    title: 'Modelo de Proposta Comercial',
    icon: '📄',
    type: 'document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'prop-1',
        type: 'heading1',
        content: 'Proposta de Prestação de Serviços'
      },
      {
        id: 'prop-2',
        type: 'quote',
        content: 'Transparência, eficiência e excelência na execução.',
        properties: { author: 'Equipe Comercial' }
      },
      {
        id: 'prop-3',
        type: 'paragraph',
        content: 'Apresentamos nossa proposta técnica e comercial desenvolvida sob medida para suas necessidades operacionais.'
      }
    ]
  },
  {
    id: 'page-miro-board',
    parentId: null,
    title: 'Quadro Branco & Brainstorming (Miro)',
    icon: '🎨',
    coverUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1200&q=80',
    type: 'whiteboard',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [],
    whiteboardData: {
      strokes: [],
      shapes: [
        {
          id: 'shape-box-1',
          type: 'rectangle',
          x: 180,
          y: 70,
          width: 550,
          height: 380,
          strokeColor: '#38bdf8',
          strokeWidth: 2,
          fillColor: 'rgba(56, 189, 248, 0.05)'
        }
      ],
      stickies: [
        {
          id: 'sticky-init-1',
          x: 210,
          y: 110,
          width: 210,
          height: 160,
          text: '💡 Arquitetura Modular\n• Editor em Blocos fluídos\n• Arrastar e Soltar (DnD)\n• Suporte a Miro Whiteboard',
          color: '#fef08a'
        },
        {
          id: 'sticky-init-2',
          x: 460,
          y: 110,
          width: 210,
          height: 160,
          text: '🚀 Página Inicial do Projeto\n• Conecta subpáginas\n• Callouts inspiradores\n• Visão unificada',
          color: '#bae6fd'
        },
        {
          id: 'sticky-init-3',
          x: 340,
          y: 290,
          width: 210,
          height: 140,
          text: '🎨 Miro Clone\n• Desenho livre & formas\n• Post-its interativos\n• Zoom e Pan infinito',
          color: '#bbf7d0'
        }
      ],
      texts: [
        {
          id: 'txt-1',
          x: 200,
          y: 60,
          text: 'Espaço de Criação Visual (Miro Canvas)',
          color: '#38bdf8',
          fontSize: 18
        }
      ]
    }
  },
  {
    id: 'page-welcome',
    parentId: null,
    title: 'Bem-vindo ao Projeto 1',
    icon: '🚀',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    type: 'document',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'b1',
        type: 'callout',
        content: 'O Projeto 1 é um workspace local-first, modular e de código aberto. Seus dados ficam salvos com total privacidade, 100% no seu navegador!',
        properties: { icon: '💡', color: 'indigo' }
      },
      {
        id: 'b2',
        type: 'heading1',
        content: 'Descubra o poder do Editor em Blocos'
      },
      {
        id: 'b3',
        type: 'paragraph',
        content: 'Você pode digitar "/" em qualquer linha vazia para abrir o menu de comandos rápidos, ou usar atalhos Markdown naturais como "# " para títulos, "- " para listas e "[] " para tarefas.'
      },
      {
        id: 'b4',
        type: 'heading2',
        content: 'Recursos Essenciais Implementados'
      },
      {
        id: 'b5',
        type: 'todo',
        content: 'Editor de páginas baseado em blocos inteligentes (títulos, listas, callouts, código)',
        properties: { checked: true }
      },
      {
        id: 'b6',
        type: 'todo',
        content: 'Visualizações de Dados: Tabela interativa e Quadro Kanban com drag-and-drop',
        properties: { checked: true }
      },
      {
        id: 'b7',
        type: 'todo',
        content: 'Barra lateral hierárquica com páginas aninhadas, favoritos e lixeira',
        properties: { checked: true }
      },
      {
        id: 'b8',
        type: 'todo',
        content: 'Paleta de Comandos rápida com busca global através de Ctrl+K (ou ⌘+K)',
        properties: { checked: true }
      },
      {
        id: 'b9',
        type: 'todo',
        content: 'Customização com temas Claro/Escuro, fontes e capas fotográficas',
        properties: { checked: true }
      },
      {
        id: 'b10',
        type: 'todo',
        content: 'Exportação e Importação de dados (JSON e Markdown)',
        properties: { checked: true }
      },
      {
        id: 'b11',
        type: 'heading2',
        content: 'Bloco de Código de Exemplo'
      },
      {
        id: 'b12',
        type: 'code',
        content: `// Projeto 1 - Configuração Local-First
const workspace = {
  name: "Meu Espaço",
  engine: "React + TypeScript + Vite",
  architecture: "Modular Block-Based",
  privacy: "100% Local-First"
};

console.log("Bem-vindo ao", workspace.name);`,
        properties: { language: 'typescript' }
      },
      {
        id: 'b13',
        type: 'quote',
        content: '“A melhor maneira de prever o futuro é construí-lo com ferramentas abertas e sob seu controle.”'
      },
      {
        id: 'b14',
        type: 'divider',
        content: ''
      },
      {
        id: 'b15',
        type: 'paragraph',
        content: '👉 Dica: Experimente alternar entre os modos de exibição no topo ou explorar o Quadro Kanban na barra lateral!'
      }
    ]
  },
  {
    id: 'page-roadmap',
    parentId: null,
    title: 'Roadmap & Sprint do Projeto',
    icon: '🎯',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    type: 'board',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [],
    databaseConfig: {
      activeView: 'board',
      columns: [
        { id: 'title', name: 'Título', type: 'text' },
        { id: 'status', name: 'Status', type: 'status' },
        { id: 'priority', name: 'Prioridade', type: 'priority' },
        { id: 'date', name: 'Prazo', type: 'date' },
        { id: 'assignee', name: 'Responsável', type: 'text' }
      ],
      rows: [
        {
          id: 'card-1',
          title: 'Estruturação da interface modular do workspace',
          icon: '✨',
          status: 'Concluído',
          priority: 'Alta',
          date: '2026-10-24',
          endDate: '2026-10-26',
          assignee: 'Equipe de Dev',
          notes: 'Layout com barra lateral retrátil, breadcrumbs e cabeçalho dinâmico.',
          blocks: [
            {
              id: 'c1-b1',
              type: 'callout',
              content: 'Esta tarefa estabelece a fundação de design do workspace com barra lateral retrátil e editor de blocos.',
              properties: { icon: '🎯', color: 'indigo' }
            },
            {
              id: 'c1-b2',
              type: 'heading2',
              content: 'Critérios de Aceite'
            },
            {
              id: 'c1-b3',
              type: 'todo',
              content: 'Barra lateral retrátil com páginas e favoritos',
              properties: { checked: true }
            },
            {
              id: 'c1-b4',
              type: 'todo',
              content: 'Cabeçalho responsivo com caminho de navegação',
              properties: { checked: true }
            }
          ]
        },
        {
          id: 'card-2',
          title: 'Editor de blocos com slash command (/)',
          icon: '⚡',
          status: 'Concluído',
          priority: 'Urgente',
          date: '2026-10-25',
          endDate: '2026-10-28',
          assignee: 'Frontend',
          notes: 'Suporte a H1-H3, to-dos, citações, callouts e blocos de código.',
          blocks: [
            {
              id: 'c2-b1',
              type: 'heading2',
              content: 'Documentação do Editor'
            },
            {
              id: 'c2-b2',
              type: 'paragraph',
              content: 'Permite escrever texto livre e converter blocos usando atalhos Markdown ou o menu flutuante acionado por barra (/).'
            }
          ]
        },
        {
          id: 'card-3',
          title: 'Visualizações Gantt, Calendário & Kanban',
          icon: '📊',
          status: 'Em Progresso',
          priority: 'Alta',
          date: '2026-10-27',
          endDate: '2026-10-31',
          assignee: 'UI/UX',
          notes: 'Todas as visões sincronizadas com abertura de cards como páginas completas.',
          blocks: [
            {
              id: 'c3-b1',
              type: 'callout',
              content: 'Integração 4-em-1: Qualquer alteração na Tabela, Kanban, Calendário ou Gantt reflete instantaneamente em todas as telas.',
              properties: { icon: '💡', color: 'blue' }
            }
          ]
        },
        {
          id: 'card-4',
          title: 'Exportação para Markdown (.md) e JSON',
          icon: '💾',
          status: 'Em Progresso',
          priority: 'Média',
          date: '2026-10-28',
          endDate: '2026-11-03',
          assignee: 'Core Dev'
        },
        {
          id: 'card-5',
          title: 'Suporte a plugins de IA e assistente inteligente',
          icon: '🤖',
          status: 'A Fazer',
          priority: 'Média',
          date: '2026-11-02',
          endDate: '2026-11-08',
          assignee: 'Inovação'
        },
        {
          id: 'card-6',
          title: 'Empacotamento Desktop com Tauri ou Electron',
          icon: '📦',
          status: 'A Fazer',
          priority: 'Baixa',
          date: '2026-11-06',
          endDate: '2026-11-15',
          assignee: 'DevOps'
        }
      ]
    }
  },
  {
    id: 'page-knowledge',
    parentId: null,
    title: 'Base de Conhecimento',
    icon: '📚',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    type: 'document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'kb-1',
        type: 'heading1',
        content: 'Repositório de Conhecimento e Ideias'
      },
      {
        id: 'kb-2',
        type: 'paragraph',
        content: 'Este espaço foi estruturado para abrigar documentações técnicas, anotações de pesquisa e conceitos de design para um workspace local-first moderno.'
      },
      {
        id: 'kb-3',
        type: 'callout',
        content: 'Você pode aninhar novas subpáginas clicando no botão "+" ao lado de "Base de Conhecimento" na barra lateral!',
        properties: { icon: '💡', color: 'blue' }
      }
    ]
  },
  {
    id: 'page-appflowy-arch',
    parentId: 'page-knowledge',
    title: 'Workspace Local-First vs Serviços em Nuvem',
    icon: '⚡',
    type: 'document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'arc-1',
        type: 'heading1',
        content: 'Por que um workspace local-first se destaca?'
      },
      {
        id: 'arc-2',
        type: 'bullet',
        content: 'Local-first: todos os documentos ficam gravados em formato local, sem risco de perda por falha de servidor.'
      },
      {
        id: 'arc-3',
        type: 'bullet',
        content: 'Privacidade total: nenhum dado é coletado sem o consentimento do usuário.'
      },
      {
        id: 'arc-4',
        type: 'bullet',
        content: 'Customização aberta: flexibilidade total para modificar código, plugins e temas.'
      },
      {
        id: 'arc-5',
        type: 'quote',
        content: '“O AppFlowy empodera as pessoas a criarem seu próprio sistema de produtividade sem abrir mão da propriedade de seus dados.”'
      }
    ]
  },
  {
    id: 'page-shortcuts',
    parentId: 'page-knowledge',
    title: 'Guia de Teclas & Comandos Rápidos',
    icon: '⌨️',
    type: 'document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'sc-1',
        type: 'heading1',
        content: 'Atalhos Rápidos'
      },
      {
        id: 'sc-2',
        type: 'callout',
        content: 'Use Ctrl + K (ou ⌘ + K no Mac) a qualquer momento para abrir a busca global instantânea.',
        properties: { icon: '🔍', color: 'purple' }
      },
      {
        id: 'sc-3',
        type: 'heading2',
        content: 'Atalhos no Editor:'
      },
      {
        id: 'sc-4',
        type: 'bullet',
        content: 'Digite / para abrir o menu flutuante de blocos'
      },
      {
        id: 'sc-5',
        type: 'bullet',
        content: '# + Espaço: Título Principal (H1)'
      },
      {
        id: 'sc-6',
        type: 'bullet',
        content: '## + Espaço: Subtítulo (H2)'
      },
      {
        id: 'sc-7',
        type: 'bullet',
        content: '[] + Espaço: Lista de Tarefas (Checkbox)'
      },
      {
        id: 'sc-8',
        type: 'bullet',
        content: '- + Espaço: Lista com marcadores'
      },
      {
        id: 'sc-9',
        type: 'bullet',
        content: '> + Espaço: Bloco de citação'
      },
      {
        id: 'sc-10',
        type: 'bullet',
        content: '``` + Espaço: Bloco de código'
      }
    ]
  }
];

export const INITIAL_WORKSPACE: WorkspaceData = {
  settings: {
    name: 'Projeto 1',
    theme: 'dark',
    font: 'sans',
    fullWidth: false,
    sidebarCollapsed: false
  },
  pages: INITIAL_PAGES,
  activePageId: 'page-welcome'
};
