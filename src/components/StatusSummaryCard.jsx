// Dot colour per status key (falls back to slate).
export const STATUS_DOT = {
  pending: '#f59e0b', updated: '#10b981', 'on-hold': '#64748b',
  hot: '#ef4444', warm: '#f59e0b', cold: '#3b82f6', 'spoc-assigned': '#a855f7',
  'review-l2': '#eab308', 'closed-won': '#10b981', 'closed-lost': '#ef4444', 'cold-storage': '#64748b',
};

// Compact, text-first status summary: label + count + % (+ optional description).
const StatusSummaryCard = ({ title, total, items, showDescriptions }) => {
  const safeTotal = total || 0;
  return (
    <div className="bg-surface-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{title}</h3>
        <span className="text-text-muted text-xs">{safeTotal.toLocaleString()} total</span>
      </div>
      <div className="divide-y divide-border/60">
        {(items || []).map((it) => {
          const pct = safeTotal ? Math.round((it.count / safeTotal) * 100) : 0;
          const color = STATUS_DOT[it.key] || '#64748b';
          return (
            <div key={it.key} className="py-2.5 flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-text-primary font-medium">{it.label}</span>
                  <span className="text-sm text-white font-semibold whitespace-nowrap">
                    {it.count.toLocaleString()} <span className="text-text-muted text-xs font-normal">({pct}%)</span>
                  </span>
                </div>
                {showDescriptions && it.description && (
                  <p className="text-xs text-text-muted mt-0.5">{it.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusSummaryCard;
