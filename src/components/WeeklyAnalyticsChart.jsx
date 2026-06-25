import { useState, useMemo } from 'react';
import { RiLineChartLine, RiArrowUpLine, RiArrowDownLine, RiSubtractLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const STAGE_COLORS = {
  basicOnboarding: '#3b82f6',
  interestedInvestment: '#06b6d4',
  artistInvestment: '#a855f7',
  distributionAgreement: '#10b981',
  nonExclusiveLicense: '#f59e0b',
  finalClosure: '#ef4444',
};

const STATUS_OPTIONS = [
  { key: 'Yes', label: 'Yes' },
  { key: 'No', label: 'No' },
  { key: 'NA', label: 'NA' },
  { key: 'Not Updated', label: 'Not Updated' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, dd] = k.split('-').map(Number); return new Date(y, m - 1, dd); };

const WeeklyAnalyticsChart = ({ days, stages }) => {
  const [statusKey, setStatusKey] = useState('Yes');
  const [stageKey, setStageKey] = useState('');
  const [view, setView] = useState('week'); // 'week' | 'month'
  const [anchor, setAnchor] = useState(() => new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const activeStageKey = (stages || []).some(s => s.key === stageKey) ? stageKey : (stages?.[0]?.key || '');
  const activeStage = (stages || []).find(s => s.key === activeStageKey);
  const color = STAGE_COLORS[activeStageKey] || '#f97316';

  // Visible date range from the view + anchor.
  const range = useMemo(() => {
    const a = new Date(anchor); a.setHours(0, 0, 0, 0);
    if (view === 'month') {
      const start = new Date(a.getFullYear(), a.getMonth(), 1);
      const end = new Date(a.getFullYear(), a.getMonth() + 1, 0);
      return { startKey: toKey(start), endKey: toKey(end), label: `${MONTHS[a.getMonth()]} ${a.getFullYear()}` };
    }
    const start = new Date(a); start.setDate(a.getDate() - a.getDay()); // Sunday
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return {
      startKey: toKey(start), endKey: toKey(end),
      label: `${pad(start.getDate())} ${MONTHS[start.getMonth()]} – ${pad(end.getDate())} ${MONTHS[end.getMonth()]}`,
    };
  }, [view, anchor]);

  const series = useMemo(() => {
    if (!days || !activeStageKey) return null;
    const inRange = days.filter(d => d.dateKey >= range.startKey && d.dateKey <= range.endKey);
    const values = inRange.map(d => d.stages?.[activeStageKey]?.[statusKey] ?? 0);
    const labels = inRange.map(d => { const dt = parseKey(d.dateKey); return `${pad(dt.getDate())}-${pad(dt.getMonth() + 1)}`; });
    return { inRange, values, labels, maxY: Math.max(10, ...values, 0) };
  }, [days, activeStageKey, statusKey, range]);

  if (!days || days.length === 0) {
    return (
      <div className="bg-surface-card rounded-xl border border-border p-8 text-center">
        <RiLineChartLine className="text-text-muted text-4xl mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-1">No daily data yet</h3>
        <p className="text-text-muted text-sm">
          A snapshot is saved each day (the 5 PM IST cron). Once a few days accumulate, this chart will show the day-by-day trend.
        </p>
      </div>
    );
  }

  const shift = (dir) => setAnchor(prev => {
    const d = new Date(prev);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    return d;
  });

  const hasData = series && series.inRange.length > 0;

  // Chart geometry
  const W = 900, H = 300, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 50;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const n = series.values.length;
  const xStep = n > 1 ? innerW / (n - 1) : 0;
  const xAt = (i) => PAD_L + (n === 1 ? innerW / 2 : i * xStep);
  const yAt = (v) => PAD_T + innerH - (v / series.maxY) * innerH;
  const yTickVals = Array.from({ length: 6 }, (_, i) => Math.round((series.maxY * i) / 5));
  const points = series.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
  const areaPath = n ? `M ${xAt(0)},${PAD_T + innerH} L ${series.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ')} L ${xAt(n - 1)},${PAD_T + innerH} Z` : '';

  // Latest in-range value + change vs previous in-range day
  const last = series.values[n - 1] ?? 0;
  const prev = series.values[n - 2] ?? last;
  const delta = last - prev;
  const Icon = delta > 0 ? RiArrowUpLine : delta < 0 ? RiArrowDownLine : RiSubtractLine;
  const trendColor = delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-400';

  const viewBtn = (key, label) => (
    <button
      type="button"
      onClick={() => setView(key)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        view === key ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' : 'text-text-secondary hover:text-white hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-surface-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ background: color }}>
            <RiLineChartLine className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Daily Trend</h2>
            <p className="text-text-muted text-xs">Day by day — one {view} at a time</p>
          </div>
        </div>

        {/* Stage + Status */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Stage</label>
            <select value={activeStageKey} onChange={(e) => setStageKey(e.target.value)} className="select w-full text-sm">
              {stages.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Status</label>
            <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
              {STATUS_OPTIONS.map(o => (
                <button key={o.key} type="button" onClick={() => setStatusKey(o.key)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    statusKey === o.key ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' : 'text-text-secondary hover:text-white hover:bg-slate-800'
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Range navigator */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700">
            {viewBtn('week', 'Week')}
            {viewBtn('month', 'Month')}
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button type="button" onClick={() => shift(-1)} className="p-1.5 rounded-lg border border-slate-700 text-text-secondary hover:text-white hover:bg-slate-800 transition-all" title={`Previous ${view}`}>
              <RiArrowLeftSLine className="text-lg" />
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold text-white min-w-[160px] text-center">{range.label}</span>
            <button type="button" onClick={() => shift(1)} className="p-1.5 rounded-lg border border-slate-700 text-text-secondary hover:text-white hover:bg-slate-800 transition-all" title={`Next ${view}`}>
              <RiArrowRightSLine className="text-lg" />
            </button>
          </div>
          <input
            type="date"
            value={toKey(new Date(anchor))}
            onChange={(e) => e.target.value && setAnchor(parseKey(e.target.value))}
            className="input text-xs py-1.5"
            title="Jump to a date"
          />
        </div>
      </div>

      {!hasData ? (
        <div className="p-10 text-center text-text-muted text-sm">No snapshots in this {view}. Use ‹ › to pick another {view}.</div>
      ) : (
        <>
          {/* Latest value + change */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-border bg-slate-900/30">
            <div>
              <div className="text-text-muted text-xs">{activeStage?.title} • {statusKey} — latest in {view}</div>
              <div className="text-white text-3xl font-bold mt-0.5">{last}</div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
              <Icon className="text-base" />
              <span>{delta > 0 ? '+' : ''}{delta}</span>
              <span className="text-text-muted font-normal text-xs ml-1">vs previous day</span>
            </div>
          </div>

          {/* Chart */}
          <div className="p-5 overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 560 }}>
              {yTickVals.map((v, i) => {
                const y = yAt(v);
                return (
                  <g key={i}>
                    <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" />
                    <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{v}</text>
                  </g>
                );
              })}
              {series.labels.map((lbl, i) => (
                <text key={i} x={xAt(i)} y={H - PAD_B + 18} textAnchor="middle" fontSize="10" fill="#94a3b8">{lbl}</text>
              ))}
              <path d={areaPath} fill={color} opacity="0.1" />
              <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {series.values.map((v, i) => (
                <g key={i}>
                  <circle cx={xAt(i)} cy={yAt(v)} r={hoveredDay === i ? 7 : 5} fill={color} stroke="#0f172a" strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                    onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)} />
                  {hoveredDay === i && (
                    <text x={xAt(i)} y={yAt(v) - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">{v}</text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyAnalyticsChart;
