import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, AlertCircle, Calendar, Repeat, Check
} from 'lucide-react';
import type { Page, DatabaseRow } from '../../types';
import { useConsolidatedTasks, type ConsolidatedTask } from '../../hooks/useConsolidatedTasks';
import { isTaskOnDate, formatRecurrenceLabel } from '../../utils/recurrence';

interface NotificationBellProps {
  pages: Page[];
  onSelectPage: (pageId: string) => void;
  onOpenTask: (pageId: string, taskId: string) => void;
  onUpdateTask: (pageId: string, taskId: string, updates: Partial<DatabaseRow>) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  pages,
  onSelectPage: _onSelectPage,
  onOpenTask,
  onUpdateTask,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming'>('overdue');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allTasks = useConsolidatedTasks(pages);
  const todayStr = new Date().toISOString().split('T')[0];

  // Categorize tasks
  const { overdueTasks, todayTasks, upcomingTasks } = useMemo(() => {
    const overdue: ConsolidatedTask[] = [];
    const today: ConsolidatedTask[] = [];
    const upcoming: ConsolidatedTask[] = [];

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysStr = in7Days.toISOString().split('T')[0];

    allTasks.forEach(task => {
      if (task.status === 'Concluído') return;

      // 1. Overdue: task date has passed and not completed
      if (task.date && task.date < todayStr) {
        overdue.push(task);
      }
      // 2. Today: task date is today or task recurs today
      else if (task.date === todayStr || isTaskOnDate(task.date, task.recurrence, todayStr)) {
        today.push(task);
      }
      // 3. Upcoming (next 7 days)
      else if (task.date && task.date > todayStr && task.date <= in7DaysStr) {
        upcoming.push(task);
      }
    });

    return {
      overdueTasks: overdue,
      todayTasks: today,
      upcomingTasks: upcoming,
    };
  }, [allTasks, todayStr]);

  const totalAlerts = overdueTasks.length + todayTasks.length;

  // Auto-switch to today if overdue is empty and today has tasks
  useEffect(() => {
    if (overdueTasks.length === 0 && todayTasks.length > 0) {
      setActiveTab('today');
    }
  }, [overdueTasks.length, todayTasks.length]);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const getDaysDiffText = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Atrasada há 1 dia';
    if (diffDays > 1) return `Atrasada há ${diffDays} dias`;
    return 'Prazo expirado';
  };

  const handleMarkCompleted = (task: ConsolidatedTask, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTask(task.pageId, task.id, { status: 'Concluído' });
  };

  const activeList = activeTab === 'overdue' ? overdueTasks : activeTab === 'today' ? todayTasks : upcomingTasks;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button with badge */}
      <button
        type="button"
        className="nav-btn notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Alertas de tarefas (Atrasadas e do Dia)"
        style={{
          position: 'relative',
          padding: '6px 8px',
          color: overdueTasks.length > 0 ? '#ef4444' : todayTasks.length > 0 ? '#f59e0b' : 'var(--text-secondary)'
        }}
      >
        <Bell size={17} />
        {totalAlerts > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              backgroundColor: overdueTasks.length > 0 ? '#ef4444' : '#f59e0b',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--bg-primary)',
              boxShadow: overdueTasks.length > 0 ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none'
            }}
          >
            {overdueTasks.length > 0 ? overdueTasks.length : todayTasks.length}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '360px',
            maxWidth: '92vw',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13.5px' }}>
              <Bell size={15} color="var(--accent)" />
              <span>Painel de Alertas de Tarefas</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {allTasks.length} tarefas no total
            </span>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '2px 4px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('overdue')}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: 'none',
                background: activeTab === 'overdue' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'overdue' ? '#ef4444' : 'var(--text-secondary)',
                fontWeight: activeTab === 'overdue' ? 600 : 400,
                fontSize: '12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <span>Atrasadas</span>
              {overdueTasks.length > 0 && (
                <span
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '1px 5px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}
                >
                  {overdueTasks.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('today')}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: 'none',
                background: activeTab === 'today' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'today' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'today' ? 600 : 400,
                fontSize: '12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <span>Para Hoje</span>
              {todayTasks.length > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '1px 5px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}
                >
                  {todayTasks.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: 'none',
                background: activeTab === 'upcoming' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'upcoming' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'upcoming' ? 600 : 400,
                fontSize: '12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <span>Próximas</span>
              {upcomingTasks.length > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    borderRadius: '999px',
                    padding: '1px 5px',
                    fontSize: '10px'
                  }}
                >
                  {upcomingTasks.length}
                </span>
              )}
            </button>
          </div>

          {/* Task List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {activeList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {activeTab === 'overdue' && (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎉</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Tudo em dia!</div>
                    <div>Nenhuma tarefa atrasada no momento.</div>
                  </div>
                )}
                {activeTab === 'today' && (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>☕</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Tudo pronto para hoje!</div>
                    <div>Nenhuma tarefa agendada para hoje.</div>
                  </div>
                )}
                {activeTab === 'upcoming' && (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📅</div>
                    <div>Nenhuma tarefa para os próximos 7 dias.</div>
                  </div>
                )}
              </div>
            ) : (
              activeList.map(task => {
                const isOverdue = activeTab === 'overdue';
                const isRec = task.recurrence && task.recurrence.frequency !== 'none';

                return (
                  <div
                    key={`${task.pageId}-${task.id}`}
                    onClick={() => {
                      onOpenTask(task.pageId, task.id);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'background 0.15s ease'
                    }}
                    className="hover-card"
                  >
                    {/* Page tag & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--text-muted)',
                          maxWidth: '180px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>{task.pageIcon}</span>
                        <span>{task.pageTitle}</span>
                      </span>

                      {/* 1-click complete button */}
                      <button
                        type="button"
                        onClick={(e) => handleMarkCompleted(task, e)}
                        title="Marcar como concluída"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#10b981',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          padding: '2px 4px',
                          borderRadius: '4px'
                        }}
                      >
                        <Check size={12} strokeWidth={2.5} />
                        <span>Concluir</span>
                      </button>
                    </div>

                    {/* Task Title */}
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {task.icon && <span>{task.icon}</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </span>
                    </div>

                    {/* Footer info: Due date, recurrence & priority */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', marginTop: '2px' }}>
                      {isOverdue && (
                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <AlertCircle size={11} />
                          <span>{getDaysDiffText(task.date)}</span>
                        </span>
                      )}

                      {!isOverdue && task.date && (
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} />
                          <span>{task.date}</span>
                        </span>
                      )}

                      {isRec && (
                        <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Repeat size={11} />
                          <span>{formatRecurrenceLabel(task.recurrence)}</span>
                        </span>
                      )}

                      {task.priority && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            color: task.priority === 'Urgente' ? '#ef4444' : task.priority === 'Alta' ? '#f59e0b' : 'var(--text-muted)',
                            fontWeight: task.priority === 'Urgente' || task.priority === 'Alta' ? 600 : 400
                          }}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
