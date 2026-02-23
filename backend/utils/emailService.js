import nodemailer from 'nodemailer';

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
 * Sends a consolidated daily closure checklist report.
 * @param {string} to - recipient email
 * @param {Array} onboardings - array of onboarding docs (with closureChecklist data)
 */
export const sendDailyClosureReport = async (to, onboardings) => {
  if (!onboardings || onboardings.length === 0) {
    console.log('No onboardings with closure checklist data. Skipping email.');
    return null;
  }

  let srNo = 0;

  // Build one section per onboarding
  const sections = onboardings.map((ob) => {
    const artistName = ob.artistName || ob.member?.artistName || 'N/A';
    const taskNumber = ob.taskNumber || 'N/A';
    const closureChecklist = ob.l2ReviewData?.closureChecklist || [];

    const filledRows = closureChecklist.filter(
      (row) => row.status || row.spoc || row.eta
    );

    if (filledRows.length === 0) return '';

    const rows = filledRows
      .map((row) => {
        srNo++;
        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 14px; text-align: center; color: #374151; font-weight: 600; font-size: 13px;">${srNo}</td>
          <td style="padding: 10px 14px; color: #374151; font-size: 13px;">${formatStatus(row.status)}</td>
          <td style="padding: 10px 14px; color: #374151; font-size: 13px;">${row.spoc || 'N/A'}</td>
          <td style="padding: 10px 14px; color: #374151; font-size: 13px;">${formatDate(row.eta)}</td>
        </tr>`;
      })
      .join('');

    return `
    <!-- Artist Section -->
    <div style="margin-bottom: 28px;">
      <div style="background: #1e293b; padding: 12px 20px; border-radius: 8px 8px 0 0;">
        <h3 style="margin: 0; color: #f97316; font-size: 15px; font-weight: 600;">Task #${taskNumber} &mdash; ${artistName}</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-top: none;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 10px 14px; text-align: center; color: #64748b; font-size: 12px; font-weight: 600; width: 60px; border-bottom: 2px solid #e5e7eb;">Sr No</th>
            <th style="padding: 10px 14px; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Status</th>
            <th style="padding: 10px 14px; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">SPOC</th>
            <th style="padding: 10px 14px; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">ETA</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }).filter(Boolean);

  if (sections.length === 0) {
    console.log('All onboardings have empty closure checklists. Skipping email.');
    return null;
  }

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 28px 32px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Daily Closure Checklist Report</h1>
      <p style="margin: 8px 0 0; color: #fed7aa; font-size: 14px;">${formatDate(new Date())} &bull; ${sections.length} onboarding(s) with data</p>
    </div>

    <!-- Body -->
    <div style="padding: 28px 32px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Below is the closure checklist summary for all onboardings that have data recorded. Only filled entries are included.</p>

      ${sections.join('')}

      <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; text-align: center;">
        Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        &bull; <a href="${process.env.APP_URL}" style="color: #f97316; text-decoration: none;">Open CRM</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">Music Rights Management CRM &bull; This is an automated daily report</p>
    </div>
  </div>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Daily Closure Checklist Report — ${formatDate(new Date())}`,
    html,
  };

  const transporter = createTransporter();
  return transporter.sendMail(mailOptions);
};
