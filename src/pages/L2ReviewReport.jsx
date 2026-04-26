import { useState, useEffect, useMemo } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine, RiSearchLine, RiCloseLine, RiBarChart2Line } from 'react-icons/ri';
import { getL2ReviewReport, getL2WeeklyAnalytics } from '../services/api';
import WeeklyAnalyticsChart from '../components/WeeklyAnalyticsChart';

const STATUS_STYLES = {
  'New': { bg: 'bg-slate-700', text: 'text-slate-200', dot: 'bg-slate-400' },
  'In Progress': { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400' },
  'Closed': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
};

const L2ReviewReport = () => {
  const [stages, setStages] = useState([]);
  const [summary, setSummary] = useState([]);
  const [clients, setClients] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState(null); // `${stageKey}-${status}`
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [report, weekly] = await Promise.all([
        getL2ReviewReport(),
        getL2WeeklyAnalytics().catch(() => ({ success: false, data: { weeks: [] } })),
      ]);
      if (report.success) {
        setStages(report.data.stages || []);
        setSummary(report.data.summary || []);
        setClients(report.data.clients || []);
      }
      if (weekly.success) {
        setWeeklyData(weekly.data.weeks || []);
      }
    } catch (e) {
      console.error('L2 report fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const sources = useMemo(() => {
    const set = new Set(clients.map(c => c.source).filter(s => s && s !== 'N/A'));
    return ['all', ...Array.from(set).sort()];
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (c.artistName || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.spoc || '').toLowerCase().includes(q) ||
          String(c.taskNumber || '').includes(q)
        );
      }
      return true;
    });
  }, [clients, search, sourceFilter]);

  const getDrilldownClients = (stageKey, status) => {
    return filteredClients.filter(c => c.stageStatuses?.[stageKey] === status);
  };

  const toggleDrilldown = (stageKey, status) => {
    const id = `${stageKey}-${status}`;
    setExpandedStage(prev => (prev === id ? null : id));
  };

  const totalArtists = filteredClients.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-2.5 rounded-lg shadow-lg shadow-orange-600/30">
            <RiBarChart2Line className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">L2 Review Report</h1>
        </div>
        <p className="text-text-secondary text-sm">Stage-wise breakdown and detailed view of all onboardings in L2 review</p>
      </div>

      {/* Filters */}
      <div className="bg-surface-card rounded-lg border border-border p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by artist, email, phone, SPOC, task #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="select md:w-56"
        >
          {sources.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Sources' : s}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700">
          <span className="text-text-muted text-xs">Total:</span>
          <span className="text-white font-semibold text-sm">{totalArtists}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading report…</div>
      ) : (
        <>
          {/* Stage Summary Cards */}
          <div className="space-y-3 mb-8">
            <h2 className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Stage Summary</h2>
            {summary.map((s, idx) => {
              const filteredCounts = { New: 0, 'In Progress': 0, Closed: 0 };
              filteredClients.forEach(c => {
                const st = c.stageStatuses?.[s.key];
                if (st && filteredCounts[st] !== undefined) filteredCounts[st]++;
              });

              return (
                <div key={s.key} className="bg-surface-card rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-4 border-l-4" style={{ borderLeftColor: s.color }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <h3 className="font-semibold text-white">
                        <span className="text-text-muted mr-2">{idx + 1}.</span>
                        {s.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {['New', 'In Progress', 'Closed'].map(status => {
                          const count = filteredCounts[status];
                          const style = STATUS_STYLES[status];
                          const isExpanded = expandedStage === `${s.key}-${status}`;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => count > 0 && toggleDrilldown(s.key, status)}
                              disabled={count === 0}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${
                                isExpanded
                                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                  : `${style.bg} ${style.text} border-transparent hover:border-slate-500`
                              } ${count === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                              <span className="font-medium">{status}</span>
                              <span className="font-bold bg-slate-900/50 px-2 py-0.5 rounded text-xs">{count}</span>
                              {count > 0 && (isExpanded ? <RiArrowUpSLine /> : <RiArrowDownSLine />)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Drilldown */}
                  {['New', 'In Progress', 'Closed'].map(status => {
                    const id = `${s.key}-${status}`;
                    if (expandedStage !== id) return null;
                    const list = getDrilldownClients(s.key, status);
                    return (
                      <div key={id} className="border-t border-border bg-slate-900/30">
                        <div className="px-5 py-3 flex items-center justify-between bg-slate-900/50">
                          <span className="text-sm text-text-secondary">
                            <strong className="text-white">{list.length}</strong> onboarding(s) — {s.title} • {status}
                          </span>
                          <button onClick={() => setExpandedStage(null)} className="text-text-muted hover:text-white">
                            <RiCloseLine />
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-800/50 text-left">
                                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">Task #</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">Artist Name</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">Email</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">Phone</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">Source</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-text-muted">SPOC</th>
                              </tr>
                            </thead>
                            <tbody>
                              {list.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-6 text-center text-text-muted">No clients</td></tr>
                              ) : list.map(c => (
                                <tr key={c._id} className="border-t border-border hover:bg-slate-800/30">
                                  <td className="px-4 py-2.5 text-text-secondary">#{c.taskNumber || '-'}</td>
                                  <td className="px-4 py-2.5 text-white font-medium">{c.artistName}</td>
                                  <td className="px-4 py-2.5 text-text-secondary">{c.email}</td>
                                  <td className="px-4 py-2.5 text-text-secondary">{c.phone}</td>
                                  <td className="px-4 py-2.5 text-text-secondary">{c.source}</td>
                                  <td className="px-4 py-2.5 text-text-secondary">{c.spoc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Weekly Analytics Chart */}
          <WeeklyAnalyticsChart weeks={weeklyData} stages={stages} />

        </>
      )}
    </div>
  );
};

export default L2ReviewReport;
