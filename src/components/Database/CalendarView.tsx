import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Repeat, CheckCircle2, Clock } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseConfig, DatabaseRow, StatusOption } from '../../types';
import { isTaskOnDate, formatRecurrenceLabel } from '../../utils/recurrence';

export type CalendarViewMode = 'day' | 'week' | 'month';

interface CalendarViewProps {
  config: DatabaseConfig;
  searchQuery: string;
  initialMode?: CalendarViewMode;
  onChange: (updatedConfig: DatabaseConfig) => void;
  onOpenRow: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  config,
  searchQuery,
  initialMode = 'month',
  onChange,
  onOpenRow,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialMode);

  const statuses: StatusOption[] = (config.statuses && config.statuses.length > 0)
    ? config.statuses
    : DEFAULT_STATUSES;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
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
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredRows = config.rows.filter(row =>
    row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.assignee && row.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check if task matches date (including recurrence!)
  const getTasksForDate = (dateStr: string) => {
    return filteredRows.filter(row => {
      if (row.date === dateStr) return true;
      if (row.endDate && row.date && dateStr >= row.date && dateStr <= row.endDate) return true;
      if (isTaskOnDate(row.date, row.recurrence, dateStr)) return true;
      return false;
    });
  };

  // Month Grid Calculation
  const calendarDays = useMemo(() => {
    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month trailing
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month leading to complete grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  // Week Grid Calculation (7 days of the selected week)
  const weekDays = useMemo(() => {
    const days: { date: Date; dateStr: string; dayName: string; dayNumber: number }[] = [];
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        dayName: daysOfWeek[i],
        dayNumber: d.getDate(),
      });
    }
    return days;
  }, [currentDate]);

  // Day View Info
  const selectedDateStr = currentDate.toISOString().split('T')[0];
  const dayTasks = getTasksForDate(selectedDateStr);

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

  const getStatusColor = (statusName: string) => {
    const st = statuses.find(s => s.name === statusName);
    return st?.color || '#3b82f6';
  };

  const formatHeaderTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[month]} ${year}`;
    }
    if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.dayNumber} ${monthNames[start.date.getMonth()].slice(0, 3)} - ${end.dayNumber} ${monthNames[end.date.getMonth()].slice(0, 3)} ${end.date.getFullYear()}`;
    }
    return `${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Calendar Header Navigation & View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {formatHeaderTitle()}
          </h2>
          <button className="nav-btn" onClick={handleToday} style={{ fontSize: '12px', padding: '4px 10px' }}>
            Hoje
          </button>
        </div>

        {/* View Switcher: Hoje, Semana, Mês */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className={`nav-btn ${viewMode === 'day' ? 'primary' : ''}`}
              style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px' }}
              onClick={() => { setViewMode('day'); handleToday(); }}
            >
              Hoje
            </button>
            <button
              type="button"
              className={`nav-btn ${viewMode === 'week' ? 'primary' : ''}`}
              style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px' }}
              onClick={() => setViewMode('week')}
            >
              Semana
            </button>
            <button
              type="button"
              className={`nav-btn ${viewMode === 'month' ? 'primary' : ''}`}
              style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px' }}
              onClick={() => setViewMode('month')}
            >
              Mês
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="sidebar-btn-icon" onClick={handlePrev} title="Anterior">
              <ChevronLeft size={16} />
            </button>
            <button className="sidebar-btn-icon" onClick={handleNext} title="Próximo">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <>
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
              const cellTasks = getTasksForDate(cell.dateStr);

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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '80px' }}>
                    {cellTasks.map(task => {
                      const color = getStatusColor(task.status);
                      const isRec = task.recurrence && task.recurrence.frequency !== 'none';

                      return (
                        <div
                          key={`${cell.dateStr}-${task.id}`}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            backgroundColor: `${color}25`,
                            color,
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
                          title={`${task.title}${isRec ? ` (${formatRecurrenceLabel(task.recurrence)})` : ''}`}
                          onClick={() => onOpenRow(task.id)}
                        >
                          {isRec && <Repeat size={10} style={{ opacity: 0.8 }} />}
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
        </>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {weekDays.map(day => {
            const isToday = day.dateStr === todayStr;
            const tasks = getTasksForDate(day.dateStr);

            return (
              <div
                key={day.dateStr}
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minHeight: '280px'
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {day.dayName}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                      marginTop: '2px'
                    }}
                  >
                    {day.dayNumber}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, overflowY: 'auto' }}>
                  {tasks.map(task => {
                    const color = getStatusColor(task.status);
                    const isRec = task.recurrence && task.recurrence.frequency !== 'none';

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenRow(task.id)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: `${color}18`,
                          borderLeft: `3px solid ${color}`,
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isRec && <Repeat size={11} color="var(--accent)" />}
                          <span>{task.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          <span>{task.status}</span>
                          <span>{task.priority}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="nav-btn"
                  style={{ fontSize: '11px', padding: '4px', justifyContent: 'center' }}
                  onClick={() => handleAddNewTaskOnDate(day.dateStr)}
                >
                  <Plus size={12} />
                  <span>Adicionar</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY (HOJE) VIEW */}
      {viewMode === 'day' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={18} color="var(--accent)" />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>
                {dayTasks.length} {dayTasks.length === 1 ? 'tarefa programada' : 'tarefas programadas'} para este dia
              </span>
            </div>
            <button
              className="action-chip"
              onClick={() => handleAddNewTaskOnDate(selectedDateStr)}
            >
              <Plus size={13} />
              <span>Nova Tarefa</span>
            </button>
          </div>

          {dayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              Nenhuma tarefa para este dia. Aproveite ou adicione uma nova acima! ☕
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dayTasks.map(task => {
                const color = getStatusColor(task.status);
                const isRec = task.recurrence && task.recurrence.frequency !== 'none';

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenRow(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {task.status === 'Concluído' ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <Clock size={16} color={color} />
                      )}
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {task.icon && <span style={{ marginRight: '6px' }}>{task.icon}</span>}
                          {task.title}
                        </div>
                        {isRec && (
                          <div style={{ fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Repeat size={11} />
                            <span>{formatRecurrenceLabel(task.recurrence)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: `${color}25`,
                          color,
                          fontWeight: 500
                        }}
                      >
                        {task.status}
                      </span>
                      {task.priority && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
