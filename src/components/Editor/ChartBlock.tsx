import React, { useState, useMemo } from 'react';
import type { ChartType, ChartData, ChartDataSource, Page } from '../../types';
import { 
  BarChart2, PieChart, TrendingUp, Hash, Percent, 
  Database, CheckCircle2, Clock
} from 'lucide-react';

interface ChartBlockProps {
  chartType: ChartType;
  chartData: ChartData;
  chartTitle?: string;
  chartDataSource?: ChartDataSource;
  chartAsPercentage?: boolean;
  pages?: Page[];
  onChangeType?: (type: ChartType) => void;
  onChangeData?: (data: ChartData) => void;
  onChangeTitle?: (title: string) => void;
  onChangeDataSource?: (source?: ChartDataSource) => void;
  onChangeAsPercentage?: (asPct: boolean) => void;
  readOnly?: boolean;
}

const CHART_COLORS = [
  '#7c7fff', '#f472b6', '#4ade80', '#fb923c', '#38bdf8',
  '#c084fc', '#facc15', '#f87171', '#34d399', '#a78bfa'
];

const PIE_COLORS = [
  '#7c7fff', '#f472b6', '#4ade80', '#fb923c', '#38bdf8',
  '#c084fc', '#facc15', '#f87171', '#34d399', '#a78bfa'
];

function PieChart_({ data, isDoughnut }: { data: ChartData; isDoughnut: boolean }) {
  const values = data.datasets[0]?.values || [];
  const labels = data.labels || [];
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return <text x="50" y="55" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Sem dados</text>;

  const cx = 90, cy = 90, r = 80, innerR = isDoughnut ? 48 : 0;
  let angle = -Math.PI / 2;
  const slices: React.ReactNode[] = [];

  values.forEach((val, i) => {
    const sliceAngle = (val / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sliceAngle);
    const y2 = cy + r * Math.sin(angle + sliceAngle);
    const xi1 = cx + innerR * Math.cos(angle);
    const yi1 = cy + innerR * Math.sin(angle);
    const xi2 = cx + innerR * Math.cos(angle + sliceAngle);
    const yi2 = cy + innerR * Math.sin(angle + sliceAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const color = PIE_COLORS[i % PIE_COLORS.length];

    const midAngle = angle + sliceAngle / 2;
    const lr = r * 0.65;
    const lx = cx + lr * Math.cos(midAngle);
    const ly = cy + lr * Math.sin(midAngle);
    const pct = Math.round((val / total) * 100);

    const path = isDoughnut
      ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    slices.push(
      <g key={i}>
        <path d={path} fill={color} stroke="var(--bg-primary)" strokeWidth="2" opacity="0.9">
          <title>{labels[i] || `Item ${i+1}`}: {val} ({pct}%)</title>
        </path>
        {sliceAngle > 0.3 && (
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="600">
            {pct}%
          </text>
        )}
      </g>
    );
    angle += sliceAngle;
  });

  return <>{slices}</>;
}

function BarChartSvg({ data, horizontal }: { data: ChartData; horizontal: boolean }) {
  const allVals = data.datasets.flatMap(d => d.values);
  const maxVal = Math.max(...allVals, 1);
  const labels = data.labels || [];
  const barW = horizontal ? undefined : Math.max(12, Math.min(40, 300 / Math.max(labels.length, 1) - 6));
  const svgW = 320, svgH = 160;
  const padL = horizontal ? 70 : 30, padR = 10, padT = 10, padB = horizontal ? 20 : 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  if (horizontal) {
    const rowH = chartH / Math.max(labels.length, 1);
    return (
      <>
        {labels.map((label, i) => {
          const val = data.datasets[0]?.values[i] ?? 0;
          const barLen = (val / maxVal) * chartW;
          const y = padT + i * rowH + rowH * 0.1;
          const h = rowH * 0.8;
          const color = data.datasets[0]?.color || CHART_COLORS[i % CHART_COLORS.length];
          return (
            <g key={i}>
              <text x={padL - 6} y={padT + i * rowH + rowH / 2} textAnchor="end" dominantBaseline="middle" fill="var(--text-secondary)" fontSize="10">
                {label.length > 10 ? label.slice(0, 9) + '…' : label}
              </text>
              <rect x={padL} y={y} width={Math.max(0, barLen)} height={h} rx="3" fill={color} opacity="0.85">
                <title>{label}: {val}</title>
              </rect>
              <text x={padL + barLen + 4} y={padT + i * rowH + rowH / 2} dominantBaseline="middle" fill="var(--text-muted)" fontSize="9">
                {val}
              </text>
            </g>
          );
        })}
      </>
    );
  }

  const groupW = chartW / Math.max(labels.length, 1);
  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padT + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4,3" />
            <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fill="var(--text-muted)" fontSize="9">
              {Math.round(maxVal * t)}
            </text>
          </g>
        );
      })}

      {labels.map((label, i) => {
        const groupX = padL + i * groupW;
        const dsCount = data.datasets.length;
        const bw = barW ?? 20;
        const totalW = dsCount * bw + (dsCount - 1) * 3;
        const startX = groupX + (groupW - totalW) / 2;

        return (
          <g key={i}>
            {data.datasets.map((ds, di) => {
              const val = ds.values[i] ?? 0;
              const barH = (val / maxVal) * chartH;
              const color = ds.color || CHART_COLORS[di % CHART_COLORS.length];
              const bx = startX + di * (bw + 3);
              return (
                <rect key={di} x={bx} y={padT + chartH - barH} width={bw} height={Math.max(0, barH)} rx="3" fill={color} opacity="0.85">
                  <title>{label} — {ds.label}: {val}</title>
                </rect>
              );
            })}
            <text x={groupX + groupW / 2} y={svgH - padB + 12} textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
              {label.length > 7 ? label.slice(0, 6) + '…' : label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function LineChartSvg({ data }: { data: ChartData }) {
  const allVals = data.datasets.flatMap(d => d.values);
  const maxVal = Math.max(...allVals, 1);
  const labels = data.labels || [];
  const svgW = 320, svgH = 160;
  const padL = 30, padR = 10, padT = 10, padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;
  const n = labels.length;

  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padT + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4,3" />
            <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fill="var(--text-muted)" fontSize="9">
              {Math.round(maxVal * t)}
            </text>
          </g>
        );
      })}

      {data.datasets.map((ds, di) => {
        const color = ds.color || CHART_COLORS[di % CHART_COLORS.length];
        const pts = ds.values.map((val, i) => {
          const x = padL + (i / Math.max(n - 1, 1)) * chartW;
          const y = padT + chartH - (val / maxVal) * chartH;
          return { x, y, val };
        });

        const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaD = pts.length > 0
          ? `${pathD} L ${pts[pts.length - 1].x} ${padT + chartH} L ${pts[0].x} ${padT + chartH} Z`
          : '';

        return (
          <g key={di}>
            <path d={areaD} fill={color} opacity="0.08" />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="var(--bg-primary)" strokeWidth="2">
                <title>{labels[i]}: {p.val}</title>
              </circle>
            ))}
          </g>
        );
      })}

      {labels.map((label, i) => {
        const x = padL + (i / Math.max(n - 1, 1)) * chartW;
        return (
          <text key={i} x={x} y={svgH - padB + 12} textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
            {label.length > 7 ? label.slice(0, 6) + '…' : label}
          </text>
        );
      })}
    </>
  );
}

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'metric', label: 'Total / KPI', icon: <Hash size={13} /> },
  { type: 'bar', label: 'Colunas', icon: <BarChart2 size={13} /> },
  { type: 'horizontalBar', label: 'Barras', icon: <BarChart2 size={13} style={{ transform: 'rotate(90deg)' }} /> },
  { type: 'line', label: 'Linha', icon: <TrendingUp size={13} /> },
  { type: 'pie', label: 'Pizza', icon: <PieChart size={13} /> },
  { type: 'doughnut', label: 'Rosca', icon: <PieChart size={13} /> },
];

export const ChartBlock: React.FC<ChartBlockProps> = ({
  chartType,
  chartData,
  chartTitle,
  chartDataSource,
  chartAsPercentage = false,
  pages = [],
  onChangeType,
  onChangeData,
  onChangeTitle,
  onChangeDataSource,
  onChangeAsPercentage,
  readOnly = false,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [editData, setEditData] = useState(() => JSON.stringify(chartData, null, 2));

  // Find linked page
  const linkedPage = pages.find(p => p.id === chartDataSource?.pageId && !p.isDeleted);
  const databasePages = pages.filter(p => !p.isDeleted && p.databaseConfig && p.databaseConfig.rows.length > 0);

  // Derive data from linked table
  const tableStats = useMemo(() => {
    if (!linkedPage?.databaseConfig) return null;
    const rows = linkedPage.databaseConfig.rows || [];
    const total = rows.length;
    const completed = rows.filter(r => r.status === 'Concluído').length;
    const inProgress = rows.filter(r => r.status === 'Em Progresso').length;
    const todo = rows.filter(r => r.status === 'A Fazer').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Grouping for charts
    const groupBy = chartDataSource?.groupBy || 'status';
    let labels: string[] = [];
    let values: number[] = [];

    if (groupBy === 'status') {
      const statuses = linkedPage.databaseConfig.statuses || [
        { id: '1', name: 'A Fazer', color: '#f59e0b' },
        { id: '2', name: 'Em Progresso', color: '#3b82f6' },
        { id: '3', name: 'Concluído', color: '#10b981' }
      ];
      labels = statuses.map(s => s.name);
      values = statuses.map(s => rows.filter(r => r.status === s.name).length);
    } else if (groupBy === 'priority') {
      labels = ['Baixa', 'Média', 'Alta', 'Urgente'];
      values = labels.map(pri => rows.filter(r => (r.priority || 'Média') === pri).length);
    } else if (groupBy === 'assignee') {
      const map: Record<string, number> = {};
      rows.forEach(r => {
        const who = r.assignee || 'Não atribuído';
        map[who] = (map[who] || 0) + 1;
      });
      labels = Object.keys(map);
      values = Object.values(map);
    }

    const derivedChartData: ChartData = {
      labels,
      datasets: [
        {
          label: groupBy === 'status' ? 'Tarefas por Status' : groupBy === 'priority' ? 'Por Prioridade' : 'Por Responsável',
          values,
        }
      ]
    };

    return { total, completed, inProgress, todo, pct, derivedChartData };
  }, [linkedPage, chartDataSource?.groupBy]);

  // Determine active chart data to plot
  const activeChartData: ChartData = (chartDataSource && tableStats) ? tableStats.derivedChartData : chartData;

  const isPie = chartType === 'pie' || chartType === 'doughnut';
  const svgW = isPie ? 180 : 320;
  const svgH = isPie ? 180 : 160;

  const legendItems = isPie
    ? (activeChartData.labels || []).map((l, i) => ({ label: l, color: PIE_COLORS[i % PIE_COLORS.length] }))
    : activeChartData.datasets.map((ds, i) => ({ label: ds.label, color: ds.color || CHART_COLORS[i % CHART_COLORS.length] }));

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(editData) as ChartData;
      onChangeData?.(parsed);
      onChangeDataSource?.(undefined); // Switched to manual JSON
      setShowConfig(false);
    } catch {
      alert('JSON inválido. Verifique o formato dos dados.');
    }
  };

  const handleLinkTable = (pageId: string) => {
    onChangeDataSource?.({
      pageId,
      groupBy: 'status',
      metricType: 'total',
    });
  };

  return (
    <div className="chart-block" style={{ margin: '10px 0' }}>
      {/* Title */}
      {!readOnly ? (
        <input
          className="chart-title-input"
          value={chartTitle || ''}
          onChange={e => onChangeTitle?.(e.target.value)}
          placeholder={linkedPage ? `Gráfico de: ${linkedPage.title}...` : "Título do gráfico (opcional)..."}
        />
      ) : chartTitle ? (
        <div className="chart-title-display">{chartTitle}</div>
      ) : null}

      {/* Type Switcher & Table Link Button */}
      {!readOnly && (
        <div className="chart-type-switcher" style={{ flexWrap: 'wrap', gap: '4px' }}>
          {CHART_TYPES.map(ct => (
            <button
              key={ct.type}
              className={`chart-type-btn ${chartType === ct.type ? 'active' : ''}`}
              onClick={() => onChangeType?.(ct.type)}
              title={ct.label}
            >
              {ct.icon}
              <span>{ct.label}</span>
            </button>
          ))}

          {/* Toggle between % and 123 for metric mode */}
          {chartType === 'metric' && (
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginLeft: '4px' }}>
              <button
                className={`chart-type-btn ${!chartAsPercentage ? 'active' : ''}`}
                style={{ padding: '3px 8px' }}
                onClick={() => onChangeAsPercentage?.(false)}
                title="Número absoluto"
              >
                <Hash size={12} />
                <span>Qtd</span>
              </button>
              <button
                className={`chart-type-btn ${chartAsPercentage ? 'active' : ''}`}
                style={{ padding: '3px 8px' }}
                onClick={() => onChangeAsPercentage?.(true)}
                title="Percentual"
              >
                <Percent size={12} />
                <span>%</span>
              </button>
            </div>
          )}

          <button
            className={`chart-type-btn ${chartDataSource ? 'active' : ''}`}
            style={{ marginLeft: 'auto', color: 'var(--accent)' }}
            onClick={() => setShowConfig(!showConfig)}
            title="Conectar a uma tabela de outra página ou editar dados"
          >
            <Database size={13} />
            <span>{linkedPage ? `Tabela: ${linkedPage.title}` : 'Dados'}</span>
          </button>
        </div>
      )}

      {/* Configuration & Data Source Panel */}
      {showConfig && !readOnly && (
        <div className="chart-json-editor" style={{ marginBottom: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Fonte de Dados do Gráfico
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {/* Escolher Página com Tabela */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Vincular à tabela da página:
              </label>
              <select
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
                value={chartDataSource?.pageId || ''}
                onChange={(e) => {
                  if (!e.target.value) {
                    onChangeDataSource?.(undefined);
                  } else {
                    handleLinkTable(e.target.value);
                  }
                }}
              >
                <option value="">Nenhuma (Dados manuais JSON)</option>
                {databasePages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.title} ({p.databaseConfig?.rows.length || 0} itens)
                  </option>
                ))}
              </select>
            </div>

            {/* Agrupamento */}
            {chartDataSource && (
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Agrupar / Categorizar por:
                </label>
                <select
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                  value={chartDataSource.groupBy || 'status'}
                  onChange={(e) => onChangeDataSource?.({
                    ...chartDataSource,
                    groupBy: e.target.value as any
                  })}
                >
                  <option value="status">Status das Tarefas</option>
                  <option value="priority">Nível de Prioridade</option>
                  <option value="assignee">Responsável / Pessoa</option>
                </select>
              </div>
            )}
          </div>

          {/* Fallback to JSON editor if no table linked */}
          {!chartDataSource && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Editar JSON manualmente:
              </div>
              <textarea
                value={editData}
                onChange={e => setEditData(e.target.value)}
                rows={6}
                style={{
                  width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: '11.5px', outline: 'none', resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button className="nav-btn primary" style={{ fontSize: '11.5px', padding: '3px 10px' }} onClick={handleSaveJson}>
                  Aplicar JSON
                </button>
                <button className="nav-btn" style={{ fontSize: '11.5px', padding: '3px 10px' }} onClick={() => setShowConfig(false)}>
                  Fechar
                </button>
              </div>
            </div>
          )}

          {chartDataSource && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="nav-btn primary" style={{ fontSize: '11.5px', padding: '4px 12px' }} onClick={() => setShowConfig(false)}>
                Concluído
              </button>
            </div>
          )}
        </div>
      )}

      {/* METRIC / KPI CARD VIEW */}
      {chartType === 'metric' ? (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            margin: '8px 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {chartTitle || (linkedPage ? `Métrica: ${linkedPage.title}` : 'Totalizador Geral')}
            </span>
            {linkedPage && (
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500 }}>
                {linkedPage.icon} {linkedPage.title}
              </span>
            )}
          </div>

          {/* Main Number or Percentage Display */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {tableStats ? (
                chartAsPercentage ? `${tableStats.pct}%` : tableStats.total
              ) : (
                chartAsPercentage ? '100%' : activeChartData.datasets[0]?.values.reduce((a, b) => a + b, 0) || 0
              )}
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {chartAsPercentage ? 'tarefas concluídas' : 'linhas / tarefas no total'}
            </div>
          </div>

          {/* Progress Bar */}
          {tableStats && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                <span>Progresso de Conclusão</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {tableStats.completed} de {tableStats.total} ({tableStats.pct}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${tableStats.pct}%`,
                    height: '100%',
                    background: 'var(--accent-gradient)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Breakdown Chips */}
          {tableStats && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                <CheckCircle2 size={12} />
                <span>Concluídas: {tableStats.completed}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                <Clock size={12} />
                <span>Em Progresso: {tableStats.inProgress}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                <span>●</span>
                <span>A Fazer: {tableStats.todo}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CHARTS (Colunas, Barras, Linha, Pizza, Rosca) */
        <div className="chart-svg-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width={svgW}
            height={svgH}
            style={{ overflow: 'visible', flexShrink: 0 }}
          >
            {isPie ? (
              <PieChart_ data={activeChartData} isDoughnut={chartType === 'doughnut'} />
            ) : chartType === 'line' ? (
              <LineChartSvg data={activeChartData} />
            ) : (
              <BarChartSvg data={activeChartData} horizontal={chartType === 'horizontalBar'} />
            )}
          </svg>

          {/* Legend */}
          <div className="chart-legend">
            {legendItems.map((item, i) => (
              <div key={i} className="chart-legend-item">
                <span className="chart-legend-dot" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
