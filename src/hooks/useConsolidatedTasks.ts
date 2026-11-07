import { useMemo } from 'react';
import type { Page, DatabaseRow } from '../types';

export interface ConsolidatedTask extends DatabaseRow {
  pageId: string;
  pageTitle: string;
  pageIcon: string;
}

export function useConsolidatedTasks(pages: Page[]): ConsolidatedTask[] {
  return useMemo(() => {
    const tasks: ConsolidatedTask[] = [];
    for (const page of pages) {
      if (!page.isDeleted && page.databaseConfig?.rows) {
        for (const row of page.databaseConfig.rows) {
          tasks.push({
            ...row,
            pageId: page.id,
            pageTitle: page.title || 'Sem título',
            pageIcon: page.icon || '📄',
          });
        }
      }
    }
    return tasks;
  }, [pages]);
}
