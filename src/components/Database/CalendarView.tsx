import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseConfig, DatabaseRow } from '../../types';

interface CalendarViewProps {
  config: DatabaseConfig;
  searchQuery: string;
  onChange: (updatedConfig: DatabaseConfig) => void;
  onOpenRow: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  config,
  searchQuery,
  onChange,
  onOpenRow,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month names in Portuguese
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate days for the calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete 35 or 42 cells (standard 7 columns)
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  const remaining = totalCells - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredRows = config.rows.filter(row =>
    row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.assignee && row.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNewTaskOnDate = (dateStr: string) => {
    const newRow: DatabaseRow = {
      id: `task-${Date.now()}`,
      title: 'Nova Tarefa',
      status: 'A Fazer',
      priority: 'Média',
      date: dateStr,
      assignee: 'Eu'
    };
    onChange({
      ...config,
      rows: [newRow, ...config.rows]
    });
    onOpenRow(newRow.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Calendar Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </h2>
          <button className="nav-btn" onClick={handleToday} style={{ fontSize: '12px', padding: '4px 10px' }}>
            Hoje
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="sidebar-btn-icon" onClick={handlePrevMonth} title="Mês Anterior">
            <ChevronLeft size={16} />
          </button>
          <button className="sidebar-btn-icon" onClick={handleNextMonth} title="Próximo Mês">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          paddingBottom: '8px'
        }}
      >
        {daysOfWeek.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: 'var(--border-color)',
          gap: '1px'
        }}
      >
        {calendarDays.map((cell) => {
          const isToday = cell.dateStr === todayStr;
          // Tasks falling on this date (exact date or within date - endDate range)
          const cellTasks = filteredRows.filter(row => {
            if (!row.date) return false;
            if (row.date === cell.dateStr) return true;
            if (row.endDate && cell.dateStr >= row.date && cell.dateStr <= row.endDate) return true;
            return false;
          });

          return (
            <div
              key={cell.dateStr}
              style={{
                minHeight: '110px',
                backgroundColor: 'var(--bg-secondary)',
                opacity: cell.isCurrentMonth ? 1 : 0.45,
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                position: 'relative'
              }}
              className="calendar-cell"
            >
              {/* Day Number and Add Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isToday ? 700 : 500,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isToday ? 'var(--accent)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {cell.dayNumber}
                </span>

                <button
                  className="sidebar-btn-icon"
                  style={{ width: '20px', height: '20px', padding: 0 }}
                  title="Criar tarefa nesta data"
                  onClick={() => handleAddNewTaskOnDate(cell.dateStr)}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Tasks in Day */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '80px' }}>
                {cellTasks.map(task => {
                  const statusObj = (config.statuses && config.statuses.length > 0 ? config.statuses : DEFAULT_STATUSES).find(s => s.name === task.status);
                  const statusColor = statusObj?.color || '#3b82f6';
                  const badgeBg = `${statusColor}25`;
                  const badgeColor = statusColor;

                  return (
                    <div
                      key={`${cell.dateStr}-${task.id}`}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '4px',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        fontSize: '11.5px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                      title={`${task.title} (Clique para abrir a página)`}
                      onClick={() => onOpenRow(task.id)}
                    >
                      {task.icon && <span>{task.icon}</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
