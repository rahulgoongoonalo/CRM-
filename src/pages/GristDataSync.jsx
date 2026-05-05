import { useState, useEffect, useMemo } from 'react';
import { RiRefreshLine, RiCheckboxCircleLine, RiTimeLine, RiForbidLine, RiArrowGoBackLine, RiSearchLine, RiDownloadCloud2Line } from 'react-icons/ri';
import { gristSyncAPI } from '../services/api';
import { useToast, useConfirm } from '../components/ToastNotification';

const TABS = [
  { key: 'pending', label: 'Pending', icon: RiTimeLine, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { key: 'synced', label: 'Already in App', icon: RiCheckboxCircleLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { key: 'ignored', label: 'Ignored', icon: RiForbidLine, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
];

const GristDataSync = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, synced: 0, ignored: 0 });
  const [appCounts, setAppCounts] = useState({ getgristMembers: 0, getgristOnboardings: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const toast = useToast();
  const confirm = useConfirm();

  const fetchRows = async (status = activeTab) => {
    try {
      setLoading(true);
      const res = await gristSyncAPI.list(status);
      if (res.success) {
        setRows(res.data || []);
        setCounts(res.counts || { pending: 0, synced: 0, ignored: 0 });
        setAppCounts(res.appCounts || { getgristMembers: 0, getgristOnboardings: 0 });
      }
    } catch (e) {
      toast.error('Failed to load staging rows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(activeTab);
    setSelected(new Set());
    setSearch('');
  }, [activeTab]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      (r.artistName || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const allSelected = filteredRows.length > 0 && filteredRows.every(r => selected.has(r._id));
  const someSelected = filteredRows.some(r => selected.has(r._id));
  const tableColSpan = 10 + (activeTab !== 'synced' ? 1 : 0) + (activeTab === 'pending' ? 1 : 0) + (activeTab === 'synced' ? 1 : 0);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredRows.map(r => r._id)));
    }
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleRefreshFromGrist = async () => {
    try {
      setRefreshing(true);
      const res = await gristSyncAPI.refresh();
      if (res.success) {
        toast.success(res.message || 'Refreshed from Grist');
        await fetchRows(activeTab);
      } else {
        toast.error(res.message || 'Refresh failed');
      }
    } catch (e) {
      toast.error('Failed to refresh from Grist');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncSelected = async () => {
    if (selected.size === 0) {
      toast.warning('Select at least one row to sync');
      return;
    }
    const ok = await confirm({
      title: 'Sync to App',
      message: `Push ${selected.size} selected row(s) into Member Management + Onboarding? Existing matches (by email + artist name) will be updated, new ones will be created.`,
      confirmText: 'Sync',
      cancelText: 'Cancel',
      type: 'info',
    });
    if (!ok) return;

    try {
      setSyncing(true);
      const ids = Array.from(selected);
      const res = await gristSyncAPI.promote(ids);
      if (res.success) {
        const data = res.data || {};
        const errs = data.errors || [];

        if (data.synced > 0 || data.alreadySynced > 0) {
          toast.success(`Synced ${data.synced} new, ${data.alreadySynced} already-synced${errs.length ? `, ${errs.length} errors` : ''}`);
        }

        // Surface each per-row error individually so the user sees exactly what failed and why
        errs.forEach((err) => {
          const label = err.artistName || 'Unknown';
          toast.error(`${label}: ${err.error}`, 8000);
        });

        if (errs.length > 0 && data.synced === 0 && data.alreadySynced === 0) {
          // All failed — make sure user sees a top-level summary too
          toast.warning(`No rows synced. ${errs.length} error(s) — see details above.`);
        }

        setSelected(new Set());
        await fetchRows(activeTab);
      } else {
        toast.error(res.message || 'Sync failed');
      }
    } catch (e) {
      toast.error('Sync failed: ' + (e?.message || 'unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const handleIgnoreSelected = async () => {
    if (selected.size === 0) {
      toast.warning('Select at least one row to ignore');
      return;
    }
    const ok = await confirm({
      title: 'Mark as Ignored',
      message: `Mark ${selected.size} row(s) as ignored? They will stay listed under "Ignored" tab and won't be auto-synced. You can move them back to Pending later.`,
      confirmText: 'Ignore',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (!ok) return;
    try {
      const res = await gristSyncAPI.ignore(Array.from(selected));
      if (res.success) {
        toast.success(res.message);
        setSelected(new Set());
        await fetchRows(activeTab);
      }
    } catch (e) {
      toast.error('Ignore failed');
    }
  };

  const handleUnignoreSelected = async () => {
    if (selected.size === 0) {
      toast.warning('Select at least one row');
      return;
    }
    try {
      const res = await gristSyncAPI.unignore(Array.from(selected));
      if (res.success) {
        toast.success(res.message);
        setSelected(new Set());
        await fetchRows(activeTab);
      }
    } catch (e) {
      toast.error('Failed to move back to pending');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Grist Data Sync</h1>
          <p className="text-text-muted text-sm mt-1">
            Daily cron pulls Grist rows into this staging table only. Use this page to manually approve which rows go into Member Management + Onboarding.
          </p>
        </div>
        <button
          onClick={handleRefreshFromGrist}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50"
        >
          <RiDownloadCloud2Line className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh from Grist'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                isActive
                  ? `${t.bg} ${t.color} ${t.border}`
                  : 'bg-surface text-text-muted border-border hover:bg-surface-light'
              }`}
            >
              <Icon className="text-lg" />
              {t.label}
              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${isActive ? t.bg : 'bg-surface-light'}`}>
                {counts[t.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-text-muted">
        <span className="rounded-md border border-border bg-surface px-3 py-2">
          Member Management Getgrist: <strong className="text-white">{appCounts.getgristMembers || 0}</strong>
        </span>
        <span className="rounded-md border border-border bg-surface px-3 py-2">
          Onboarding linked to Getgrist: <strong className="text-white">{appCounts.getgristOnboardings || 0}</strong>
        </span>
        <span className="rounded-md border border-border bg-surface px-3 py-2">
          Current Grist staging rows: <strong className="text-white">{counts.pending + counts.synced + counts.ignored}</strong>
        </span>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border text-white text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>

        {activeTab === 'pending' && (
          <>
            <button
              onClick={handleSyncSelected}
              disabled={syncing || selected.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold hover:bg-emerald-500/30 disabled:opacity-40"
            >
              <RiCheckboxCircleLine className="text-lg" />
              Sync Selected ({selected.size})
            </button>
            <button
              onClick={handleIgnoreSelected}
              disabled={selected.size === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-500/20 text-slate-300 border border-slate-500/40 font-semibold hover:bg-slate-500/30 disabled:opacity-40"
            >
              <RiForbidLine className="text-lg" />
              Mark as Ignored
            </button>
          </>
        )}

        {activeTab === 'ignored' && (
          <button
            onClick={handleUnignoreSelected}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold hover:bg-amber-500/30 disabled:opacity-40"
          >
            <RiArrowGoBackLine className="text-lg" />
            Move Back to Pending
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-light border-b border-border">
              <tr className="text-left text-xs uppercase text-text-muted">
                {activeTab !== 'synced' && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = !allSelected && someSelected; }}
                      onChange={toggleSelectAll}
                      className="accent-brand-primary"
                    />
                  </th>
                )}
                <th className="px-4 py-3">Grist ID</th>
                <th className="px-4 py-3">Artist Name</th>
                {activeTab === 'pending' && <th className="px-4 py-3">Review</th>}
                <th className="px-4 py-3">Contact Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Primary Roles</th>
                <th className="px-4 py-3">Primary Genres</th>
                <th className="px-4 py-3">Languages</th>
                {activeTab === 'synced' && <th className="px-4 py-3">Linked Member / Task</th>}
                <th className="px-4 py-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={tableColSpan} className="px-4 py-10 text-center text-text-muted">Loading…</td></tr>
              )}
              {!loading && filteredRows.length === 0 && (
                <tr><td colSpan={tableColSpan} className="px-4 py-10 text-center text-text-muted">No rows in this bucket</td></tr>
              )}
              {!loading && filteredRows.map(r => {
                const f = r.fields || {};
                const isSelected = selected.has(r._id);
                return (
                  <tr key={r._id} className={`border-b border-border hover:bg-surface-light/50 ${isSelected ? 'bg-brand-primary/5' : ''}`}>
                    {activeTab !== 'synced' && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(r._id)}
                          className="accent-brand-primary"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-text-muted">{r.gristId}</td>
                    <td className="px-4 py-3 text-white font-semibold">{r.artistName || f.Artist_Name || '-'}</td>
                    {activeTab === 'pending' && (
                      <td className="px-4 py-3 text-xs">
                        <div className="max-w-[260px] rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                          {r.reviewReason || 'Review before syncing.'}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-text-secondary">{f.Contact_Name || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.email || f.Email || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.phone || f.Phone || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{f.Location || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{f.Primary_Roles || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{f.Primary_Genres || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{f.Languages || '-'}</td>
                    {activeTab === 'synced' && (
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {r.member ? (
                          <div>
                            <div>#{r.member.memberNumber} {r.member.artistName}</div>
                            {r.onboarding && <div className="text-text-muted">Task #{r.onboarding.taskNumber} · {r.onboarding.status}</div>}
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {r.lastSeenAt ? new Date(r.lastSeenAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Showing {filteredRows.length} of {rows.length} row(s) in <strong>{activeTab}</strong> bucket.
        Total in Grist: {counts.pending + counts.synced + counts.ignored}.
      </p>
    </div>
  );
};

export default GristDataSync;
