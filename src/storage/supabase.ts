import type { WorkspaceData } from '../types';

/**
 * Supabase Storage Integration Layer
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Event listener for UI sync status (e.g. 'saving' | 'synced' | 'error')
type SyncStatus = 'synced' | 'saving' | 'error' | 'idle';
let currentStatus: SyncStatus = 'idle';
const listeners: ((status: SyncStatus) => void)[] = [];

export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
  listeners.push(listener);
  listener(currentStatus);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyStatus(status: SyncStatus) {
  currentStatus = status;
  listeners.forEach(l => l(status));
}

export async function fetchWorkspaceFromSupabase(workspaceId = 'default'): Promise<WorkspaceData | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/workspaces?id=eq.${workspaceId}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!res.ok) throw new Error(`Erro ao buscar workspace: ${res.statusText}`);
    const data = await res.json();
    if (data && data.length > 0) {
      notifyStatus('synced');
      return data[0].data as WorkspaceData;
    }
    return null;
  } catch (err) {
    console.error('Erro na sincronização com Supabase:', err);
    notifyStatus('error');
    return null;
  }
}

// Debounce timer to avoid multiple HTTP requests while typing rapidly
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function queueSaveWorkspaceToSupabase(workspace: WorkspaceData, workspaceId = 'default'): void {
  if (!isSupabaseConfigured()) return;

  notifyStatus('saving');

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/workspaces`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: workspaceId,
          name: workspace.settings.name,
          data: workspace,
          updated_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        notifyStatus('synced');
      } else {
        notifyStatus('error');
      }
    } catch (err) {
      console.error('Erro ao salvar no Supabase:', err);
      notifyStatus('error');
    }
  }, 1000);
}
