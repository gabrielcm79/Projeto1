import type { TaskRecurrence } from '../types';

export const DAYS_OF_WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DAYS_OF_WEEK_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function formatRecurrenceLabel(rec?: TaskRecurrence): string {
  if (!rec || rec.frequency === 'none') return 'Sem recorrência';
  if (rec.frequency === 'daily') return 'Todos os dias';
  if (rec.frequency === 'weekdays') return 'Seg a Sex (Dias úteis)';
  if (rec.frequency === 'monthly') return 'Mensalmente';
  if (rec.frequency === 'weekly') {
    if (rec.daysOfWeek && rec.daysOfWeek.length > 0) {
      return rec.daysOfWeek.map(d => DAYS_OF_WEEK_LABELS[d]).join(', ');
    }
    return 'Semanalmente';
  }
  if (rec.frequency === 'custom_days' && rec.daysOfWeek && rec.daysOfWeek.length > 0) {
    return rec.daysOfWeek.map(d => DAYS_OF_WEEK_LABELS[d]).join(', ');
  }
  return rec.label || 'Recorrente';
}

export function isTaskOnDate(rowDate: string | undefined, recurrence: TaskRecurrence | undefined, targetDateStr: string): boolean {
  if (!targetDateStr) return false;
  
  // Exact date match
  if (rowDate === targetDateStr) return true;

  // If there's no recurrence, only exact date
  if (!recurrence || recurrence.frequency === 'none') return false;

  // Parse target date (local date components)
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const dayOfWeek = targetDate.getDay(); // 0 to 6

  // If task has a start date, recurrence usually only applies on or after the start date
  if (rowDate) {
    const [ry, rm, rd] = rowDate.split('-').map(Number);
    const startDate = new Date(ry, rm - 1, rd);
    if (targetDate < startDate) return false;
  }

  switch (recurrence.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekly':
    case 'custom_days':
      return Boolean(recurrence.daysOfWeek && recurrence.daysOfWeek.includes(dayOfWeek));
    case 'monthly':
      if (rowDate) {
        const [, , rd] = rowDate.split('-').map(Number);
        return d === rd;
      }
      return d === 1;
    default:
      return false;
  }
}
