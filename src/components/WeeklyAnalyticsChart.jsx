import { useState, useMemo } from 'react';
import { RiLineChartLine, RiArrowUpLine, RiArrowDownLine, RiSubtractLine } from 'react-icons/ri';

const STAGE_COLORS = {
  basicOnboarding: '#3b82f6',
  interestedInvestment: '#06b6d4',
  artistInvestment: '#a855f7',
  distributionAgreement: '#10b981',
  nonExclusiveLicense: '#f59e0b',
  finalClosure: '#ef4444',
};

const STATUS_OPTIONS = [
  { key: 'Closed', label: 'Closed', hint: 'Successful completions' },
  { key: 'In Progress', label: 'In Progress', hint: 'Active workflow' },
  { key: 'New', label: 'New', hint: 'Yet to start' },
];

const WeeklyAnalyticsChart = ({ weeks, stages }) => {
  const [statusKey, setStatusKey] = useState('Closed');
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [hiddenStages, setHiddenStages] = useState(new Set());

  const visibleStages = stages.filter(s => !hiddenStages.has(s.key));

  const chartData = useMemo(() => {
    if (!weeks || weeks.length === 0) return null;

    const series = stages.map(s => ({
      key: s.key,
      title: s.title,
      color: STAGE_COLORS[s.key] || '#94a3b8',
      values: weeks.map(w => w.stages?.[s.key]?.[statusKey] ?? 0),
    }));

    const allValues = visibleStages.flatMap(s =>
      series.find(ss => ss.key === s.key)?.values || []
    );
    const maxY = Math.max(10, ...allValues);

    return { series, maxY };
  }, [weeks, stages, statusKey, visibleStages]);

  const toggleStage = (key) => {
    setHiddenStages(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!weeks || weeks.length === 0) {
    return (
      <div className="bg-surface-card rounded-xl border border-border p-8 text-center">
        <RiLineChartLine className="text-text-muted text-4xl mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-1">No weekly data yet</h3>
        <p className="text-text-muted text-sm">
          Once daily snapshots accumulate (the 5 PM IST cron saves one per day), this chart will show week-over-week trends.
        </p>
      </div>
    );
  }

  // Chart geometry
  const W = 900, H = 340, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 50;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xStep = weeks.length > 1 ? innerW / (weeks.length - 1) : 0;
  const xAt = (i) => PAD_L + (weeks.length === 1 ? innerW / 2 : i * xStep);
  const yAt = (v) => PAD_T + innerH - (v / chartData.maxY) * innerH;

  // Y-axis ticks
  const ticks = 5;
  const yTickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round((chartData.maxY * i) / ticks));

  // Per-stage growth: latest - previous
  const growth = stages.map(s => {
    const series = chartData.series.find(ss => ss.key === s.key);
    const last = series.values[series.values.length - 1] ?? 0;
    const prev = series.values[series.values.length - 2] ?? last;
    const delta = last - prev;
    return { ...s, color: STAGE_COLORS[s.key] || '#94a3b8', last, prev, delta };
  });

  return (
    <div className="bg-surface-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-2 rounded-lg">
            <RiLineChartLine className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Weekly Trend Analysis</h2>
            <p className="text-text-muted text-xs">Sunday → Saturday • {weeks.length} week(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.key}
              type="button"
              onClick={() => setStatusKey(o.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusKey === o.key
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-text-secondary hover:text-white hover:bg-slate-800'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 600 }}>
          {/* Y grid + labels */}
          {yTickVals.map((v, i) => {
            const y = yAt(v);
            return (
              <g key={i}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" />
                <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{v}</text>
              </g>
            );
          })}

          {/* X labels */}
          {weeks.map((w, i) => {
            const x = xAt(i);
            return (
              <g key={i}>
                <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + innerH} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
                <text x={x} y={H - PAD_B + 18} textAnchor="middle" fontSize="10" fill="#94a3b8">{w.weekLabel}</text>
              </g>
            );
          })}

          {/* Series */}
          {chartData.series.map(s => {
            if (hiddenStages.has(s.key)) return null;
            const points = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
            const areaPath = `M ${xAt(0)},${PAD_T + innerH} L ${s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ')} L ${xAt(s.values.length - 1)},${PAD_T + innerH} Z`;
            return (
              <g key={s.key}>
                <path d={areaPath} fill={s.color} opacity="0.08" />
                <polyline points={points} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={xAt(i)}
                    cy={yAt(v)}
                    r={hoveredWeek === i ? 6 : 4}
                    fill={s.color}
                    stroke="#0f172a"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                    onMouseEnter={() => setHoveredWeek(i)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hoveredWeek !== null && weeks[hoveredWeek] && (() => {
            const x = xAt(hoveredWeek);
            const tipW = 220;
            const tipX = Math.min(W - PAD_R - tipW, Math.max(PAD_L, x - tipW / 2));
            const lineHeight = 16;
            const tipH = 30 + visibleStages.length * lineHeight;
            return (
              <g>
                <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + innerH} stroke="#f97316" strokeWidth="1" strokeDasharray="3 3" />
                <rect x={tipX} y={PAD_T + 6} width={tipW} height={tipH} rx="6" fill="#0f172a" stroke="#334155" />
                <text x={tipX + 10} y={PAD_T + 22} fontSize="11" fontWeight="700" fill="#f97316">
                  {weeks[hoveredWeek].weekLabel}
                </text>
                {visibleStages.map((s, i) => {
                  const series = chartData.series.find(ss => ss.key === s.key);
                  const v = series.values[hoveredWeek];
                  return (
                    <g key={s.key}>
                      <circle cx={tipX + 14} cy={PAD_T + 36 + i * lineHeight} r="4" fill={STAGE_COLORS[s.key]} />
                      <text x={tipX + 24} y={PAD_T + 40 + i * lineHeight} fontSize="10" fill="#cbd5e1">
                        {s.title}
                      </text>
                      <text x={tipX + tipW - 12} y={PAD_T + 40 + i * lineHeight} fontSize="10" fontWeight="700" fill="#ffffff" textAnchor="end">
                        {v}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {stages.map(s => {
          const hidden = hiddenStages.has(s.key);
          const color = STAGE_COLORS[s.key] || '#94a3b8';
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleStage(s.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hidden
                  ? 'bg-slate-900/30 border-slate-700 text-text-muted opacity-50'
                  : 'bg-slate-900/50 border-slate-700 text-text-secondary hover:border-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></span>
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Growth/Loss summary */}
      <div className="border-t border-border px-5 py-4 bg-slate-900/30">
        <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
          Week-over-Week Δ ({statusKey}) {weeks.length >= 2 ? `— ${weeks[weeks.length - 2].weekLabel} → ${weeks[weeks.length - 1].weekLabel}` : '(need at least 2 weeks)'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {growth.map(g => {
            const Icon = g.delta > 0 ? RiArrowUpLine : g.delta < 0 ? RiArrowDownLine : RiSubtractLine;
            const trendColor = g.delta > 0 ? 'text-emerald-400' : g.delta < 0 ? 'text-red-400' : 'text-slate-400';
            const trendBg = g.delta > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : g.delta < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-700/30 border-slate-600';
            return (
              <div key={g.key} className={`rounded-lg border p-3 ${trendBg}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }}></span>
                  <span className="text-text-muted text-[10px] uppercase tracking-wider truncate">{g.title}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-white text-xl font-bold">{g.last}</div>
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
                    <Icon className="text-sm" />
                    <span>{g.delta > 0 ? '+' : ''}{g.delta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyAnalyticsChart;
