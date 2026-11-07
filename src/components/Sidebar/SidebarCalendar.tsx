import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import type { Page } from '../../types';
import { useConsolidatedTasks } from '../../hooks/useConsolidatedTasks';

interface SidebarCalendarProps {
  pages: Page[];
  onSelectPage: (pageId: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const STATUS_COLORS: Record<string, string> = {
  'Concluído': '#10b981',
  'Em Progresso': '#3b82f6',
  'A Fazer': '#f59e0b',
};

export const SidebarCalendar: React.FC<SidebarCalendarProps> = ({ pages, onSelectPage, onClose }) => {
  const tasks = useConsolidatedTasks(pages);
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate(today));
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Map tasks by date
  const tasksByDate: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    const dateStr = task.date || task.endDate;
    if (dateStr) {
      if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
      tasksByDate[dateStr].push(task);
    }
  }

  const getDateStr = (day: number) => {
    const d = new Date(year, month, day);
    return formatDate(d);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Filtered tasks for the list view
  const getWeekRange = () => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: formatDate(start), end: formatDate(end) };
  };

  const filteredTasks = tasks.filter(task => {
    const dateStr = task.date || task.endDate;
    if (!dateStr) return filter === 'all';
    if (filter === 'today') return dateStr === formatDate(today);
    if (filter === 'week') {
      const { start, end } = getWeekRange();
      return dateStr >= start && dateStr <= end;
    }
    if (filter === 'month') {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      return dateStr.startsWith(monthStr);
    }
    return true;
  });

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

  return (
    <div className="sidebar-calendar">
      {/* Header */}
      <div className="sidebar-calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarDays size={14} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>Calendário</span>
        </div>
        <button className="sidebar-btn-icon" onClick={onClose} title="Fechar calendário">
          <X size={13} />
        </button>
      </div>

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px' }}>
        <button className="sidebar-btn-icon" onClick={prevMonth} title="Mês anterior">
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {MONTHS[month]} {year}
        </span>
        <button className="sidebar-btn-icon" onClick={nextMonth} title="Próximo mês">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', padding: '3px 0', fontWeight: 600 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = getDateStr(day);
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === formatDate(today);
          const isSelected = dateStr === selectedDate;
          const hasTask = dayTasks.length > 0;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              style={{
                position: 'relative',
                width: '28px', height: '28px', borderRadius: '50%',
                border: 'none', cursor: 'pointer',
                background: isSelected ? 'var(--accent)' : isToday ? 'var(--accent-soft)' : 'transparent',
                color: isSelected ? '#fff' : isToday ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isToday || isSelected ? 700 : 400,
                fontSize: '11.5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
              title={hasTask ? `${dayTasks.length} tarefa(s) em ${dateStr}` : dateStr}
            >
              {day}
              {hasTask && (
                <span style={{
                  position: 'absolute', bottom: '1px',
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: isSelected ? '#fff' : (STATUS_COLORS[dayTasks[0]?.status] || 'var(--accent)')
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '8px 10px 4px', borderTop: '1px solid var(--border-subtle)', marginTop: '6px' }}>
        {(['today', 'week', 'month', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1, fontSize: '10.5px', padding: '4px 2px',
              borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--accent-soft)' : 'transparent',
              color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: filter === f ? 600 : 400,
              transition: 'all 0.15s ease'
            }}
          >
            {f === 'today' ? 'Hoje' : f === 'week' ? 'Semana' : f === 'month' ? 'Mês' : 'Todos'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 10px 10px' }}>
        {/* Selected day tasks */}
        {selectedDate && selectedTasks.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {selectedDate === formatDate(today) ? 'Hoje' : selectedDate}
            </div>
            {selectedTasks.map(task => (
              <TaskRow key={task.id} task={task} onSelect={() => onSelectPage(task.pageId)} />
            ))}
          </div>
        )}

        {/* Filtered list */}
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '12px 0' }}>
            Nenhuma tarefa {filter === 'today' ? 'para hoje' : filter === 'week' ? 'esta semana' : filter === 'month' ? 'este mês' : ''}
          </div>
        ) : (
          <>
            {selectedDate && selectedTasks.length > 0 && (
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', marginTop: '8px' }}>
                {filter === 'today' ? 'Hoje' : filter === 'week' ? 'Esta semana' : filter === 'month' ? 'Este mês' : 'Todas'}
              </div>
            )}
            {filteredTasks.map(task => (
              <TaskRow key={`${task.pageId}-${task.id}`} task={task} onSelect={() => onSelectPage(task.pageId)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const TaskRow: React.FC<{ task: ReturnType<typeof useConsolidatedTasks>[0]; onSelect: () => void }> = ({ task, onSelect }) => {
  const statusColor = STATUS_COLORS[task.status] || '#94a3b8';
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '5px 6px', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', marginBottom: '2px',
        transition: 'background 0.12s ease',
      }}
      className="sidebar-task-row"
    >
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.pageIcon} {task.pageTitle}
        </div>
      </div>
      {task.date && (
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
          {task.date.slice(5)}
        </span>
      )}
    </div>
  );
};
