import nodemailer from 'nodemailer';
import Picklist from '../models/Picklist.js';
import ClosureReportSnapshot from '../models/ClosureReportSnapshot.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatStatus = (s) => {
  if (!s) return 'N/A';
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Stage metadata — items are loaded dynamically from picklists
 */
const STAGE_META = [
  { picklistName: 'stage1-basicOnboarding', key: 'basicOnboarding', title: 'Basic Artist Onboarding', color: '#3b82f6' },
  { picklistName: null, key: 'interestedInvestment', title: 'Interested in Investment', color: '#06b6d4', customType: 'investmentInterest' },
  { picklistName: 'stage2-artistInvestment', key: 'artistInvestment', title: 'Artist Investment Document', color: '#a855f7' },
  { picklistName: 'stage3-distributionAgreement', key: 'distributionAgreement', title: 'Distribution Agreement signed', color: '#10b981' },
  { picklistName: 'stage4-nonExclusiveLicense', key: 'nonExclusiveLicense', title: 'Non-Exclusive License', color: '#f59e0b' },
  { picklistName: 'stage5-finalClosure', key: 'finalClosure', title: 'Final Closure', color: '#ef4444' },
];

const INVESTMENT_INTEREST_ITEMS = [
  { key: 'amount', label: 'Investment Amount' },
  { key: 'received', label: 'Amount Received' },
];

/**
 * Load stages config dynamically from picklists DB
 */
const loadStagesConfig = async () => {
  const picklists = await Picklist.find({
    name: { $in: STAGE_META.map(m => m.picklistName) }
  });
  const plMap = {};
  picklists.forEach(pl => { plMap[pl.name] = pl.items.filter(i => i.isActive).sort((a, b) => a.order - b.order); });

  return STAGE_META.map(meta => ({
    ...meta,
    items: meta.customType === 'investmentInterest'
      ? INVESTMENT_INTEREST_ITEMS
      : (plMap[meta.picklistName] || []).map(i => ({ key: i.value, label: i.label })),
  }));
};

const getStageStatus = (stageData, stageItems, customType) => {
  if (!stageData || !stageItems || stageItems.length === 0) return 'Open';
  if (customType === 'investmentInterest') {
    const amt = Number(stageData.amount) || 0;
    const rec = stageData.received || 'NA';
    const filled = (amt > 0 ? 1 : 0) + (rec !== 'NA' ? 1 : 0);
    if (filled === 0) return 'Open';
    if (filled === 2) return 'Closed';
    return 'In Progress';
  }
  const values = stageItems.map(i => stageData[i.key] || 'NA');
  const nonNA = values.filter(v => v !== 'NA');
  if (nonNA.length === 0) return 'Open';
  if (nonNA.length === values.length) return 'Closed';
  return 'In Progress';
};

const statusColor = (status) => {
  if (status === 'Closed') return '#10b981';
  if (status === 'In Progress') return '#f59e0b';
  return '#94a3b8';
};

const valueColor = (val) => {
  if (val === 'Yes') return '#10b981';
  if (val === 'No') return '#ef4444';
  return '#94a3b8';
};

const formatShortDate = (d) => {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yy = String(dt.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
};

/**
 * Sends a consolidated daily closure stages report — summary counts per stage.
 * @param {string} to - recipient email
 * @param {Array} onboardings - array of onboarding docs (with stages data)
 */
export const sendDailyClosureReport = async (to, onboardings, options = {}) => {
  const { persistSnapshot = true } = options;
  if (!onboardings || onboardings.length === 0) {
    console.log('No onboardings with closure stages data. Skipping email.');
    return null;
  }

  const STAGES_CONFIG = await loadStagesConfig();
  const today = formatShortDate(new Date());
  const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Per-stage counts: New / In Progress / Closed
  const stageCounts = STAGES_CONFIG.map(sc => {
    let newCount = 0, inProgressCount = 0, closedCount = 0;
    onboardings.forEach(ob => {
      const sd = ob.l2ReviewData?.stages?.[sc.key] || {};
      const status = getStageStatus(sd, sc.items, sc.customType);
      if (status === 'Closed') closedCount++;
      else if (status === 'In Progress') inProgressCount++;
      else newCount++;
    });
    return { ...sc, newCount, inProgressCount, closedCount };
  });

  const totalArtists = onboardings.length;

  // Load most-recent prior snapshot (any date before today) for delta comparison
  const previousSnapshot = await ClosureReportSnapshot.findOne({
    dateKey: { $lt: todayKey }
  }).sort({ dateKey: -1 }).lean();

  const prevMap = {};
  if (previousSnapshot?.counts) {
    previousSnapshot.counts.forEach(c => {
      prevMap[c.stageKey] = { New: c.New, 'In Progress': c.inProgress, Closed: c.Closed };
    });
  }
  const prevTotal = previousSnapshot?.totalArtists ?? null;

  const renderCell = (current, prev, bg, textColor) => {
    const delta = prev === undefined || prev === null ? 0 : current - prev;
    const sign = delta >= 0 ? '+' : '';
    const deltaColor = delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : '#94a3b8';
    return `
      <span style="display: inline-block; min-width: 42px; padding: 6px 14px; border-radius: 16px; font-size: 13px; font-weight: 700; color: ${textColor}; background: ${bg};">${current}</span>
      <span style="display: inline-block; margin-left: 6px; font-size: 11px; font-weight: 700; color: ${deltaColor};">${sign}${delta}</span>
    `;
  };

  const rows = stageCounts.map((sc, idx) => {
    const prev = prevMap[sc.key] || {};
    return `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb; border-left: 4px solid ${sc.color};">
        <div style="font-weight: 600; color: #1e293b; font-size: 14px;">${idx + 1}. ${sc.title}</div>
      </td>
      <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        ${renderCell(sc.newCount, prev.New, '#e2e8f0', '#475569')}
      </td>
      <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        ${renderCell(sc.inProgressCount, prev['In Progress'], '#f59e0b', '#ffffff')}
      </td>
      <td style="padding: 14px 18px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        ${renderCell(sc.closedCount, prev.Closed, '#10b981', '#ffffff')}
      </td>
    </tr>
  `;
  }).join('');

  const totalDelta = prevTotal === null ? 0 : totalArtists - prevTotal;
  const totalSign = totalDelta >= 0 ? '+' : '';
  const totalDeltaColor = totalDelta > 0 ? '#10b981' : totalDelta < 0 ? '#ef4444' : '#94a3b8';
  const prevDateLabel = previousSnapshot?.dateKey
    ? formatShortDate(previousSnapshot.dateKey)
    : null;

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 28px 32px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Daily Closure Stages Report</h1>
      <p style="margin: 8px 0 0; color: #fed7aa; font-size: 14px;">${formatDate(new Date())} &bull; ${totalArtists} artist onboarding(s)</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">Stage-wise summary across all onboardings — counts of <strong>New</strong>, <strong>In Progress</strong>, and <strong>Closed</strong> as of today.${prevDateLabel ? ` Each cell shows <strong>today + delta</strong> vs ${prevDateLabel}.` : ' (No prior snapshot — deltas will appear from next run.)'}</p>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #1e293b;">
            <th style="padding: 14px 18px; text-align: left; color: #f97316; font-size: 13px; font-weight: 700; letter-spacing: 0.3px;">Stages</th>
            <th style="padding: 14px 18px; text-align: center; color: #cbd5e1; font-size: 12px; font-weight: 600; width: 130px;">${today}<br/><span style="color: #94a3b8; font-size: 11px; font-weight: 500;">New</span></th>
            <th style="padding: 14px 18px; text-align: center; color: #fbbf24; font-size: 12px; font-weight: 600; width: 130px;">${today}<br/><span style="color: #fde68a; font-size: 11px; font-weight: 500;">In Progress</span></th>
            <th style="padding: 14px 18px; text-align: center; color: #34d399; font-size: 12px; font-weight: 600; width: 130px;">${today}<br/><span style="color: #6ee7b7; font-size: 11px; font-weight: 500;">Closed</span></th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px 18px; font-weight: 700; color: #1e293b; font-size: 13px;">Total Onboardings</td>
            <td colspan="3" style="padding: 12px 18px; text-align: center; font-weight: 700; color: #1e293b; font-size: 13px;">
              ${totalArtists}
              <span style="margin-left: 8px; font-size: 12px; font-weight: 700; color: ${totalDeltaColor};">${totalSign}${totalDelta}</span>
            </td>
          </tr>
        </tfoot>
      </table>

      <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; text-align: center;">
        Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        &bull; <a href="${process.env.APP_URL}" style="color: #f97316; text-decoration: none;">Open CRM</a>
      </p>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">Music Rights Management CRM &bull; Automated daily report</p>
    </div>
  </div>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Daily Closure Stages Report — ${today}`,
    html,
  };

  const transporter = createTransporter();
  const result = await transporter.sendMail(mailOptions);

  // Persist today's snapshot (upsert by dateKey). Test runs can opt out.
  if (persistSnapshot) {
    try {
      const snapshotCounts = stageCounts.map(sc => ({
        stageKey: sc.key,
        New: sc.newCount,
        inProgress: sc.inProgressCount,
        Closed: sc.closedCount,
      }));
      await ClosureReportSnapshot.findOneAndUpdate(
        { dateKey: todayKey },
        { dateKey: todayKey, totalArtists, counts: snapshotCounts },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      console.error('Snapshot persist failed (email already sent):', err.message);
    }
  }

  return result;
};
