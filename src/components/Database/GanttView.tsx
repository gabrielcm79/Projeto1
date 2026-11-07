import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { DatabaseConfig } from '../../types';

interface GanttViewProps {
  config: DatabaseConfig;
  searchQuery: string;
  onChange: (updatedConfig: DatabaseConfig) => void;
  onOpenRow: (id: string) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({
  config,
  searchQuery,
  onOpenRow,
}) => {
  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 5); // start 5 days before today
    return d;
  });

  const totalDays = 28; // display 4 weeks in view
  const dayWidth = 44; // width in px per day

  // Generate array of consecutive dates
  const timelineDates = useMemo(() => {
    const dates: { date: Date; dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
      dates.push({
        date: d,
        dateStr,
        dayNum,
        dayName,
        isToday: dateStr === todayStr
      });
    }
    return dates;
  }, [baseDate]);

  const handlePrev = () => {
    setBaseDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNext = () => {
    setBaseDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    setBaseDate(d);
  };

  const filteredRows = config.rows.filter(row =>
    row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (row.assignee && row.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startDateStr = timelineDates[0].dateStr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Gantt Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <CalendarIcon size={16} color="var(--accent)" />
            <span>Linha do Tempo / Gantt</span>
          </div>
          <button className="nav-btn" onClick={handleToday} style={{ fontSize: '12px', padding: '4px 10px' }}>
            Hoje
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="sidebar-btn-icon" onClick={handlePrev} title="Recuar 1 Semana">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 8px' }}>
            {timelineDates[0].dayNum}/{timelineDates[0].date.getMonth() + 1} - {timelineDates[totalDays - 1].dayNum}/{timelineDates[totalDays - 1].date.getMonth() + 1}
          </span>
          <button className="sidebar-btn-icon" onClick={handleNext} title="Avançar 1 Semana">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Gantt Layout: Left Task Column + Right Timeline Grid */}
      <div
        style={{
          display: 'flex',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-card)',
          overflow: 'hidden'
        }}
      >
        {/* Left Column: Tasks List */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            borderRight: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          {/* Header */}
          <div
            style={{
              height: '52px',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              fontSize: '12px',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            Tarefas ({filteredRows.length})
          </div>

          {/* Task Names */}
          <div>
            {filteredRows.map(row => (
              <div
                key={row.id}
                style={{
                  height: '44px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                className="gantt-task-row"
                onClick={() => onOpenRow(row.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  {row.icon && <span style={{ fontSize: '14px' }}>{row.icon}</span>}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {row.title}
                  </span>
                </div>

                <button
                  className="sidebar-btn-icon"
                  style={{ opacity: 0.6 }}
                  title="Abrir como página"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRow(row.id);
                  }}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            ))}

            {filteredRows.length === 0 && (
              <div style={{ padding: '24px 12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Nenhuma tarefa encontrada.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Timeline Grid */}
        <div style={{ flex: 1, overflowX: 'auto', position: 'relative' }}>
          <div style={{ width: `${totalDays * dayWidth}px`, minWidth: '100%' }}>
            {/* Timeline Header (Days) */}
            <div
              style={{
                height: '52px',
                display: 'flex',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              {timelineDates.map(td => (
                <div
                  key={td.dateStr}
                  style={{
                    width: `${dayWidth}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid var(--border-subtle)',
                    backgroundColor: td.isToday ? 'var(--accent-soft)' : 'transparent',
                    color: td.isToday ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{td.dayName}</span>
                  <span style={{ fontSize: '13px', fontWeight: td.isToday ? 700 : 500 }}>{td.dayNum}</span>
                </div>
              ))}
            </div>

            {/* Timeline Rows with Bars */}
            <div style={{ position: 'relative' }}>
              {filteredRows.map(row => {
                // Calculate start and end offset in days relative to startDateStr
                let startOffset = 0;
                let durationDays = 2; // default duration

                if (row.date) {
                  const itemStart = new Date(row.date);
                  const viewStart = new Date(startDateStr);
                  const diffTime = itemStart.getTime() - viewStart.getTime();
                  startOffset = Math.round(diffTime / (1000 * 3600 * 24));
                }

                if (row.endDate && row.date) {
                  const itemStart = new Date(row.date);
                  const itemEnd = new Date(row.endDate);
                  const diffEnd = itemEnd.getTime() - itemStart.getTime();
                  durationDays = Math.max(1, Math.round(diffEnd / (1000 * 3600 * 24)) + 1);
                }

                const leftPx = startOffset * dayWidth;
                const widthPx = Math.max(dayWidth, durationDays * dayWidth);

                const statusObj = (config.statuses && config.statuses.length > 0 ? config.statuses : DEFAULT_STATUSES).find(s => s.name === row.status);
                const statusColor = statusObj?.color || '#6366f1';
                const barGradient = `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}cc 100%)`;

                return (
                  <div
                    key={row.id}
                    style={{
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-subtle)',
                      position: 'relative'
                    }}
                  >
                    {/* Background Day Grid Lines */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
                      {timelineDates.map(td => (
                        <div
                          key={`bg-${td.dateStr}`}
                          style={{
                            width: `${dayWidth}px`,
                            height: '100%',
                            borderRight: '1px solid var(--border-subtle)',
                            backgroundColor: td.isToday ? 'rgba(99, 102, 241, 0.04)' : 'transparent'
                          }}
                        />
                      ))}
                    </div>

                    {/* Gantt Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${leftPx}px`,
                        width: `${widthPx}px`,
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        background: barGradient,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        gap: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        zIndex: 2,
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={`${row.title} (${row.date || 'Sem data'} até ${row.endDate || 'Sem data'}) - Clique para abrir a página`}
                      onClick={() => onOpenRow(row.id)}
                    >
                      {row.icon && <span>{row.icon}</span>}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
