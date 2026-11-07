import type { Page, WorkspaceData, WorkspaceSettings } from '../types';
import { INITIAL_WORKSPACE } from './initialData';
import { queueSaveWorkspaceToSupabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'projeto1_workspace_v1';

export function loadWorkspace(): WorkspaceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_WORKSPACE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.pages)) {
      return INITIAL_WORKSPACE;
    }

    // Ensure settings are complete and merged with defaults
    const safeSettings: WorkspaceSettings = {
      ...INITIAL_WORKSPACE.settings,
      ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {})
    };

    // Ensure all pages have required fields
    const sanitizedPages: Page[] = parsed.pages.map((p: any) => ({
      ...p,
      title: p.title || 'Sem título',
      icon: p.icon || '📄',
      type: p.type || 'document',
      blocks: Array.isArray(p.blocks) ? p.blocks : [],
      isDeleted: Boolean(p.isDeleted),
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString()
    }));

    // Merge missing template pages if user had earlier session
    const existingIds = new Set(sanitizedPages.map((p: Page) => p.id));
    const missingPages = INITIAL_WORKSPACE.pages.filter(p => !existingIds.has(p.id));
    const mergedPages = missingPages.length > 0 ? [...missingPages, ...sanitizedPages] : sanitizedPages;

    const validActivePageId = 
      (parsed.activePageId && mergedPages.some(p => p.id === parsed.activePageId && !p.isDeleted))
        ? parsed.activePageId
        : (mergedPages.find(p => !p.isDeleted)?.id || mergedPages[0]?.id || INITIAL_WORKSPACE.activePageId);

    return {
      settings: safeSettings,
      pages: mergedPages,
      activePageId: validActivePageId
    };
  } catch (err) {
    console.error('Failed to load workspace from localStorage', err);
    return INITIAL_WORKSPACE;
  }
}

export function saveWorkspace(data: WorkspaceData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (isSupabaseConfigured()) {
      queueSaveWorkspaceToSupabase(data);
    }
  } catch (err) {
    console.error('Failed to save workspace to localStorage', err);
  }
}

export function resetWorkspace(): WorkspaceData {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_WORKSPACE;
}

export function exportWorkspaceJson(data: WorkspaceData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.settings.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPageMarkdown(page: Page): void {
  let md = `# ${page.icon ? page.icon + ' ' : ''}${page.title}\n\n`;

  if (page.type === 'whiteboard') {
    md += `> **Tipo:** Quadro Branco (Miro Canvas)\n\n`;
    if (page.whiteboardData) {
      md += `### Anotações e Post-its:\n`;
      page.whiteboardData.stickies.forEach(s => {
        md += `- **[Post-it]** ${s.text.replace(/\n/g, ' ')}\n`;
      });
      md += `\n`;
    }
  } else if (page.type !== 'document') {
    md += `> **Tipo:** Base de Dados (${page.type})\n\n`;
    if (page.databaseConfig) {
      md += `| Título | Status | Prioridade | Início | Prazo | Responsável |\n`;
      md += `| ------ | ------ | ---------- | ------ | ----- | ----------- |\n`;
      page.databaseConfig.rows.forEach(r => {
        md += `| ${r.title} | ${r.status || '-'} | ${r.priority || '-'} | ${r.date || '-'} | ${r.endDate || '-'} | ${r.assignee || '-'} |\n`;
      });
    }
  } else {
    page.blocks.forEach(b => {
      switch (b.type) {
        case 'heading1':
          md += `# ${b.content}\n\n`;
          break;
        case 'heading2':
          md += `## ${b.content}\n\n`;
          break;
        case 'heading3':
          md += `### ${b.content}\n\n`;
          break;
        case 'todo':
          md += `- [${b.properties?.checked ? 'x' : ' '}] ${b.content}\n`;
          break;
        case 'bullet':
          md += `- ${b.content}\n`;
          break;
        case 'number':
          md += `1. ${b.content}\n`;
          break;
        case 'quote':
          md += `> ${b.content}${b.properties?.author ? `\n> — *${b.properties.author}*` : ''}\n\n`;
          break;
        case 'callout':
          md += `> ${b.properties?.icon || '💡'} **${b.content}**${b.properties?.author ? `\n> *${b.properties.author}*` : ''}\n\n`;
          break;
        case 'page_link':
          md += `[↗ ${b.content}](#)\n\n`;
          break;
        case 'table':
          if (b.properties?.tableData && b.properties.tableData.length > 0) {
            const [header, ...rows] = b.properties.tableData;
            md += `| ${header.join(' | ')} |\n`;
            md += `| ${header.map(() => '---').join(' | ')} |\n`;
            rows.forEach(row => {
              md += `| ${row.join(' | ')} |\n`;
            });
            md += `\n`;
          }
          break;
        case 'code':
          md += `\`\`\`${b.properties?.language || ''}\n${b.content}\n\`\`\`\n\n`;
          break;
        case 'mermaid':
          md += `\`\`\`mermaid\n${b.content}\n\`\`\`\n\n`;
          break;
        case 'chart':
          md += `> 📊 **Gráfico:** ${b.properties?.chartTitle || 'Sem título'} (${b.properties?.chartType || 'bar'})\n\n`;
          break;
        case 'page_embed':
          md += `> 📎 **Incorporado:** Página ID ${b.properties?.embedPageId || 'indefinida'}\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        case 'paragraph':
        default:
          md += `${b.content}\n\n`;
          break;
      }
    });
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${page.title.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'pagina'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
