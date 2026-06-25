/**
 * Shared status-summary builder — used by the L2 Review Report endpoint AND the
 * daily closure email so both show identical numbers.
 *
 * Returns canonical Member + Onboarding status buckets (every status always present,
 * count 0 if none), each sorted ASCENDING by count.
 */
import Member from '../models/Member.js';
import Onboarding from '../models/Onboarding.js';

export const MEMBER_STATUSES = [
  { key: 'pending', label: 'Pending', description: 'Still pending — the member form needs to be updated', match: ['pending'] },
  { key: 'updated', label: 'Updated', description: 'Member data has been updated', match: ['updated', 'active'] },
  { key: 'on-hold', label: 'On Hold', description: 'Member is currently on hold', match: ['on hold', 'on-hold', 'hold', 'inactive'] },
];

export const ONBOARDING_STATUSES = [
  { key: 'hot', label: 'Hot', description: 'High-priority lead, actively engaged', match: ['hot'] },
  { key: 'warm', label: 'Warm', description: 'Engaged and progressing (member marked Updated)', match: ['warm'] },
  { key: 'cold', label: 'Cold', description: 'Early stage / low engagement (member still Pending)', match: ['cold'] },
  { key: 'spoc-assigned', label: 'SPOC Assigned', description: 'A SPOC has been assigned to the artist', match: ['spoc-assigned'] },
  { key: 'review-l2', label: 'Review L2', description: 'Under L2 core-group review', match: ['review-l2', 'review l2'] },
  { key: 'closed-won', label: 'Closed Won', description: 'Successfully onboarded', match: ['closed-won'] },
  { key: 'closed-lost', label: 'Closed Lost', description: 'Did not proceed', match: ['closed-lost'] },
  { key: 'cold-storage', label: 'Cold Storage', description: 'Parked for later follow-up', match: ['cold-storage'] },
];

const countBy = (Model, field) =>
  Model.aggregate([
    { $group: { _id: { $ifNull: ['$' + field, ''] }, count: { $sum: 1 } } },
  ]).then(rows => rows.map(r => ({ value: r._id, count: r.count })));

// Fold raw counts into canonical buckets, append any unmapped values, sort ascending by count.
const bucketize = (rawRows, defs) => {
  const rawToKey = new Map();
  defs.forEach(d => (d.match || [d.key]).forEach(m => rawToKey.set(m.toLowerCase(), d.key)));
  const counts = Object.fromEntries(defs.map(d => [d.key, 0]));
  const unknown = new Map();
  for (const { value, count } of rawRows) {
    const v = (value ?? '').toString().trim().toLowerCase();
    const k = rawToKey.get(v);
    if (k) counts[k] += count;
    else if (v !== '') unknown.set(v, (unknown.get(v) || 0) + count);
  }
  const out = defs.map(d => ({ key: d.key, label: d.label, description: d.description, count: counts[d.key] }));
  for (const [v, c] of unknown) out.push({ key: v, label: v.charAt(0).toUpperCase() + v.slice(1), count: c });
  // Descending by count. Stable sort keeps canonical order among equal counts.
  return out.sort((a, b) => b.count - a.count);
};

export async function buildStatusSummary() {
  const [memTotal, onbTotal, memStatus, onbStatus] = await Promise.all([
    Member.countDocuments(),
    Onboarding.countDocuments(),
    countBy(Member, 'status'),
    countBy(Onboarding, 'status'),
  ]);
  return {
    members: { total: memTotal, byStatus: bucketize(memStatus, MEMBER_STATUSES) },
    onboardings: { total: onbTotal, byStatus: bucketize(onbStatus, ONBOARDING_STATUSES) },
  };
}

export default buildStatusSummary;
