import nodemailer from 'nodemailer';
import Picklist from '../models/Picklist.js';

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
  { picklistName: 'stage2-artistInvestment', key: 'artistInvestment', title: 'Artist Investment', color: '#a855f7' },
  { picklistName: 'stage3-distributionAgreement', key: 'distributionAgreement', title: 'Distribution Agreement', color: '#10b981' },
  { picklistName: 'stage4-nonExclusiveLicense', key: 'nonExclusiveLicense', title: 'Non-Exclusive License', color: '#f59e0b' },
  { picklistName: 'stage5-finalClosure', key: 'finalClosure', title: 'Final Closure', color: '#ef4444' },
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
    items: (plMap[meta.picklistName] || []).map(i => ({ key: i.value, label: i.label })),
  }));
};

const getStageStatus = (stageData, stageItems) => {
  if (!stageData || !stageItems || stageItems.length === 0) return 'Open';
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

/**
 * Sends a consolidated daily closure stages report.
 * @param {string} to - recipient email
 * @param {Array} onboardings - array of onboarding docs (with stages data)
 */
export const sendDailyClosureReport = async (to, onboardings) => {
  if (!onboardings || onboardings.length === 0) {
    console.log('No onboardings with closure stages data. Skipping email.');
    return null;
  }

  // Load stages config dynamically from picklists
  const STAGES_CONFIG = await loadStagesConfig();

  // Build one section per onboarding
  const sections = onboardings.map((ob) => {
    const artistName = ob.artistName || ob.member?.artistName || 'N/A';
    const taskNumber = ob.taskNumber || 'N/A';
    const stages = ob.l2ReviewData?.stages;

    if (!stages) return '';

    // Check if any stage has non-NA data using picklist items
    const hasAnyData = STAGES_CONFIG.some(sc => {
      const sd = stages[sc.key];
      return sd && sc.items.some(item => (sd[item.key] || 'NA') !== 'NA');
    });

    if (!hasAnyData) return '';

    // Calculate per-stage statuses and overall
    let closedCount = 0;
    const stageRows = STAGES_CONFIG.map((sc, idx) => {
      const sd = stages[sc.key] || {};
      const status = getStageStatus(sd, sc.items);
      if (status === 'Closed') closedCount++;
      const sColor = statusColor(status);
      const completedCount = sc.items.filter(i => (sd[i.key] || 'NA') !== 'NA').length;

      const itemRows = sc.items.map(item => {
        const val = sd[item.key] || 'NA';
        const vColor = valueColor(val);
        return `<tr>
          <td style="padding: 6px 14px 6px 28px; color: #6b7280; font-size: 12px; border-bottom: 1px solid #f3f4f6;">${item.label}</td>
          <td style="padding: 6px 14px; text-align: center; border-bottom: 1px solid #f3f4f6;">
            <span style="display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; color: white; background: ${vColor};">${val}</span>
          </td>
        </tr>`;
      }).join('');

      return `
        <tr style="background: #f8fafc;">
          <td style="padding: 10px 14px; font-weight: 700; color: ${sc.color}; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${idx + 1}. ${sc.title} <span style="color: #94a3b8; font-weight: 400; font-size: 11px;">(${completedCount}/${sc.items.length})</span></td>
          <td style="padding: 10px 14px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <span style="display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; color: white; background: ${sColor};">${status}</span>
          </td>
        </tr>
        ${itemRows}`;
    }).join('');

    // Overall status
    const totalStages = STAGES_CONFIG.length;
    const overallLabel = closedCount === 0 ? 'Open' : closedCount === totalStages ? 'Closed' : 'In Progress';
    const overallColor = closedCount === 0 ? '#94a3b8' : closedCount === totalStages ? '#10b981' : '#f59e0b';

    return `
    <div style="margin-bottom: 28px;">
      <div style="background: #1e293b; padding: 12px 20px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #f97316; font-size: 15px; font-weight: 600;">Task #${taskNumber} &mdash; ${artistName}</h3>
        <span style="display: inline-block; padding: 4px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; color: white; background: ${overallColor};">Overall: ${overallLabel} (${closedCount}/${totalStages})</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-top: none;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 10px 14px; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Stage / Item</th>
            <th style="padding: 10px 14px; text-align: center; color: #64748b; font-size: 12px; font-weight: 600; width: 120px; border-bottom: 2px solid #e5e7eb;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${stageRows}
        </tbody>
      </table>
    </div>`;
  }).filter(Boolean);

  if (sections.length === 0) {
    console.log('All onboardings have empty closure stages. Skipping email.');
    return null;
  }

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 28px 32px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Daily Closure Stages Report</h1>
      <p style="margin: 8px 0 0; color: #fed7aa; font-size: 14px;">${formatDate(new Date())} &bull; ${sections.length} onboarding(s) with data</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Below is the closure stages summary for all onboardings. Only onboardings with at least one filled stage item are shown.</p>
      ${sections.join('')}
      <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; text-align: center;">
        Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        &bull; <a href="${process.env.APP_URL}" style="color: #f97316; text-decoration: none;">Open CRM</a>
      </p>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">Music Rights Management CRM &bull; This is an automated daily report</p>
    </div>
  </div>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Daily Closure Stages Report — ${formatDate(new Date())}`,
    html,
  };

  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
};
