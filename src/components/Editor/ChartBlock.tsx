import React, { useState } from 'react';
import type { ChartType, ChartData } from '../../types';
import { BarChart2, PieChart, TrendingUp, RefreshCw } from 'lucide-react';

interface ChartBlockProps {
  chartType: ChartType;
  chartData: ChartData;
  chartTitle?: string;
  onChangeType?: (type: ChartType) => void;
  onChangeData?: (data: ChartData) => void;
  onChangeTitle?: (title: string) => void;
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

    // Label position
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
      {/* Y axis grid lines */}
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
  onChangeType,
  onChangeData,
  onChangeTitle,
  readOnly = false,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(() => JSON.stringify(chartData, null, 2));

  const isPie = chartType === 'pie' || chartType === 'doughnut';
  const svgW = isPie ? 180 : 320;
  const svgH = isPie ? 180 : 160;

  const legendItems = isPie
    ? (chartData.labels || []).map((l, i) => ({ label: l, color: PIE_COLORS[i % PIE_COLORS.length] }))
    : chartData.datasets.map((ds, i) => ({ label: ds.label, color: ds.color || CHART_COLORS[i % CHART_COLORS.length] }));

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(editData) as ChartData;
      onChangeData?.(parsed);
      setEditMode(false);
    } catch {
      alert('JSON inválido. Verifique o formato dos dados.');
    }
  };

  return (
    <div className="chart-block" style={{ margin: '10px 0' }}>
      {/* Title */}
      {!readOnly ? (
        <input
          className="chart-title-input"
          value={chartTitle || ''}
          onChange={e => onChangeTitle?.(e.target.value)}
          placeholder="Título do gráfico (opcional)..."
        />
      ) : chartTitle ? (
        <div className="chart-title-display">{chartTitle}</div>
      ) : null}

      {/* Type Switcher */}
      {!readOnly && (
        <div className="chart-type-switcher">
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
          <button
            className="chart-type-btn"
            style={{ marginLeft: 'auto', color: 'var(--accent)' }}
            onClick={() => setEditMode(!editMode)}
            title="Editar dados JSON"
          >
            <RefreshCw size={13} />
            <span>Dados</span>
          </button>
        </div>
      )}

      {/* JSON Editor */}
      {editMode && !readOnly && (
        <div className="chart-json-editor">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Formato: <code>{'{ "labels": [...], "datasets": [{ "label": "...", "values": [...] }] }'}</code>
          </div>
          <textarea
            value={editData}
            onChange={e => setEditData(e.target.value)}
            rows={8}
            style={{
              width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)', padding: '10px', color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', outline: 'none', resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="nav-btn primary" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={handleSaveJson}>
              Aplicar
            </button>
            <button className="nav-btn" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => { setEditMode(false); setEditData(JSON.stringify(chartData, null, 2)); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Chart SVG */}
      <div className="chart-svg-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          style={{ overflow: 'visible', flexShrink: 0 }}
        >
          {isPie ? (
            <PieChart_ data={chartData} isDoughnut={chartType === 'doughnut'} />
          ) : chartType === 'line' ? (
            <LineChartSvg data={chartData} />
          ) : (
            <BarChartSvg data={chartData} horizontal={chartType === 'horizontalBar'} />
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
    </div>
  );
};
