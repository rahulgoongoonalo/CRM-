import axios from 'axios';
import nodemailer from 'nodemailer';
import Member from '../models/Member.js';
import Onboarding from '../models/Onboarding.js';

const GRIST_API_URL = process.env.GRIST_API_URL || 'https://ism.getgrist.com/api/docs/5T8YB3qAMkaS/tables/Table1/records';

/**
 * Fetch all records from Grist API
 */
async function fetchGristRecords() {
  try {
    const response = await axios.get(GRIST_API_URL);
    return response.data.records || [];
  } catch (error) {
    console.error('[GristSync] Failed to fetch Grist records:', error.message);
    throw error;
  }
}

/**
 * Map Grist record fields to Member schema fields
 */
function mapToMemberData(fields) {
  return {
    artistName: fields.Artist_Name || '',
    contactName: fields.Contact_Name || '',
    email: fields.Email || '',
    phone: fields.Phone || '',
    location: fields.Location || '',
    primaryRole: fields.Primary_Roles || '',
    primaryGenres: fields.Primary_Genres || '',
    source: 'Getgrist',
    notes: fields.Other_Info || '',
    status: 'pending',
  };
}

/**
 * Map Grist record fields to Onboarding L1 Questionnaire data
 */
function mapToL1QuestionnaireData(fields) {
  return {
    artistName: fields.Artist_Name || '',
    primaryContact: fields.Contact_Name || '',
    email: fields.Email || '',
    phone: fields.Phone || '',
    cityCountry: fields.Location || '',
    primaryRole: fields.Primary_Roles || '',
    primaryGenres: fields.Primary_Genres || '',
    languages: fields.Languages || '',
    streamingLink: fields.Streaming_Platform_Links || '',
    youtube: fields.Youtube_Channel_Link || '',
    instagram: fields.Instagram_Link || '',
    facebook: fields.Facebook_Link || '',
    twitter: fields.Twitter_Link || '',
    soundcloud: fields.Soundcloud_Link || '',
    otherPlatforms: fields.Other_Platforms || '',
    listenerRegion: fields.Listener_Regions || '',
    performLive: fields.Perform_Live || '',
    upcomingProject: fields.Upcoming_Projects || '',
    openToCollabs: fields.Open_to_Collaboration || '',
    interestedInGatecrash: fields.Intersted_In_Gatecrach || '',
    otherInfo: fields.Other_Info || '',
  };
}

/**
 * Sync a single Grist record to Member + Onboarding
 * Returns: { action: 'created' | 'updated' | 'skipped', artistName, details }
 */
async function syncSingleRecord(gristRecord) {
  const { id: gristId, fields } = gristRecord;

  if (!fields || !fields.Artist_Name) {
    return { action: 'skipped', artistName: 'Unknown', details: 'No Artist_Name in record' };
  }

  const memberData = mapToMemberData(fields);
  const l1Data = mapToL1QuestionnaireData(fields);
  const email = (fields.Email || '').trim().toLowerCase();
  const artistName = (fields.Artist_Name || '').trim();

  let member = null;
  let action = 'created';

  // --- Step 1: Find or create Member ---
  // Try to find by email first (most reliable), then by artistName
  if (email) {
    member = await Member.findOne({ email });
  }
  if (!member && artistName) {
    member = await Member.findOne({ artistName: { $regex: new RegExp(`^${artistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
  }

  if (member) {
    // Update existing member — only update fields that have data from Grist
    action = 'updated';
    const updateFields = {};

    if (fields.Contact_Name) updateFields.contactName = fields.Contact_Name;
    if (fields.Email) updateFields.email = fields.Email.toLowerCase().trim();
    if (fields.Phone) updateFields.phone = fields.Phone;
    if (fields.Location) updateFields.location = fields.Location;
    if (fields.Primary_Roles) updateFields.primaryRole = fields.Primary_Roles;
    if (fields.Primary_Genres) updateFields.primaryGenres = fields.Primary_Genres;
    // Always keep source as Getgrist for Grist-synced records
    updateFields.source = 'Getgrist';
    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length > 0) {
      await Member.findByIdAndUpdate(member._id, updateFields);
    }
  } else {
    // Create new member
    member = new Member(memberData);
    await member.save();
  }

  // --- Step 2: Find or create Onboarding ---
  let onboarding = await Onboarding.findOne({ member: member._id });

  if (onboarding) {
    // Update existing onboarding
    const onboardingUpdate = {
      artistName: artistName || onboarding.artistName,
      notes: fields.Other_Info || onboarding.notes,
      l1QuestionnaireData: { ...onboarding.l1QuestionnaireData?.toObject?.() || {}, ...l1Data },
    };

    await Onboarding.findByIdAndUpdate(onboarding._id, onboardingUpdate);
  } else {
    // Create new onboarding record
    onboarding = new Onboarding({
      member: member._id,
      artistName: artistName,
      description: `Auto-synced from Grist (ID: ${gristId})`,
      spoc: 'Soumini Paul',
      notes: fields.Other_Info || '',
      status: 'warm',
      step1Data: {
        source: 'Getgrist',
        contactStatus: 'New',
        step1Notes: `Auto-imported from Grist form on ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      },
      l1QuestionnaireData: l1Data,
    });
    await onboarding.save();
  }

  return {
    action,
    artistName,
    gristId,
    memberId: member._id,
    onboardingId: onboarding._id,
  };
}

/**
 * Send Grist sync report email to rahul.goongoonalo@gmail.com
 */
async function sendGristSyncEmail(results) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const syncTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Build newly created artists table rows
    const createdRecords = results.details.filter(d => d.action === 'created');
    const updatedRecords = results.details.filter(d => d.action === 'updated');
    const skippedRecords = results.details.filter(d => d.action === 'skipped');

    const createdRows = createdRecords.length > 0
      ? createdRecords.map((r, i) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 14px; text-align: center; font-size: 13px; color: #374151;">${i + 1}</td>
          <td style="padding: 8px 14px; font-size: 13px; color: #374151; font-weight: 600;">${r.artistName}</td>
          <td style="padding: 8px 14px; font-size: 13px; color: #374151;">${r.gristId || 'N/A'}</td>
          <td style="padding: 8px 14px; text-align: center;"><span style="background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">NEW</span></td>
        </tr>`).join('')
      : `<tr><td colspan="4" style="padding: 14px; text-align: center; color: #9ca3af; font-size: 13px;">No new members added in this sync</td></tr>`;

    const updatedRows = updatedRecords.length > 0
      ? updatedRecords.map((r, i) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 14px; text-align: center; font-size: 13px; color: #374151;">${i + 1}</td>
          <td style="padding: 8px 14px; font-size: 13px; color: #374151;">${r.artistName}</td>
          <td style="padding: 8px 14px; font-size: 13px; color: #374151;">${r.gristId || 'N/A'}</td>
          <td style="padding: 8px 14px; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">UPDATED</span></td>
        </tr>`).join('')
      : `<tr><td colspan="4" style="padding: 14px; text-align: center; color: #9ca3af; font-size: 13px;">No members updated in this sync</td></tr>`;

    const errorRows = results.errors.length > 0
      ? results.errors.map((e, i) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 14px; text-align: center; font-size: 13px; color: #374151;">${i + 1}</td>
          <td style="padding: 8px 14px; font-size: 13px; color: #374151;">${e.artistName}</td>
          <td colspan="2" style="padding: 8px 14px; font-size: 13px; color: #dc2626;">${e.error}</td>
        </tr>`).join('')
      : '';

    const hasErrors = results.errors.length > 0;
    const statusColor = hasErrors ? '#dc2626' : '#16a34a';
    const statusText = hasErrors ? 'Completed with Errors' : 'Completed Successfully';
    const statusIcon = hasErrors ? '⚠️' : '✅';

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 28px 32px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">🔄 Grist Data Sync Report</h1>
        <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">${syncTime}</p>
      </div>

      <!-- Summary Cards -->
      <div style="padding: 24px 32px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px; text-align: center; background: #f0fdf4; border-radius: 8px; width: 25%;">
              <div style="font-size: 28px; font-weight: 700; color: #16a34a;">${results.created}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">New Members</div>
            </td>
            <td style="width: 8px;"></td>
            <td style="padding: 12px; text-align: center; background: #eff6ff; border-radius: 8px; width: 25%;">
              <div style="font-size: 28px; font-weight: 700; color: #2563eb;">${results.updated}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Updated</div>
            </td>
            <td style="width: 8px;"></td>
            <td style="padding: 12px; text-align: center; background: #fefce8; border-radius: 8px; width: 25%;">
              <div style="font-size: 28px; font-weight: 700; color: #ca8a04;">${results.skipped}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Skipped</div>
            </td>
            <td style="width: 8px;"></td>
            <td style="padding: 12px; text-align: center; background: ${hasErrors ? '#fef2f2' : '#f9fafb'}; border-radius: 8px; width: 25%;">
              <div style="font-size: 28px; font-weight: 700; color: ${hasErrors ? '#dc2626' : '#6b7280'};">${results.errors.length}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Errors</div>
            </td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 10px 16px; background: ${hasErrors ? '#fef2f2' : '#f0fdf4'}; border-radius: 8px; border-left: 4px solid ${statusColor};">
          <span style="font-size: 14px; color: ${statusColor}; font-weight: 600;">${statusIcon} ${statusText}</span>
          <span style="font-size: 13px; color: #6b7280;"> — ${results.total} total Grist records processed</span>
        </div>
      </div>

      <!-- Newly Created Members -->
      <div style="padding: 24px 32px 0;">
        <h3 style="margin: 0 0 12px; color: #16a34a; font-size: 15px;">🆕 Newly Created Members (${createdRecords.length})</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 14px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; width: 50px; border-bottom: 2px solid #e5e7eb;">#</th>
              <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Artist Name</th>
              <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Grist ID</th>
              <th style="padding: 10px 14px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${createdRows}
          </tbody>
        </table>
      </div>

      <!-- Updated Members -->
      <div style="padding: 24px 32px 0;">
        <h3 style="margin: 0 0 12px; color: #2563eb; font-size: 15px;">🔄 Updated Members (${updatedRecords.length})</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 14px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; width: 50px; border-bottom: 2px solid #e5e7eb;">#</th>
              <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Artist Name</th>
              <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Grist ID</th>
              <th style="padding: 10px 14px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${updatedRows}
          </tbody>
        </table>
      </div>

      ${hasErrors ? `
      <!-- Errors -->
      <div style="padding: 24px 32px 0;">
        <h3 style="margin: 0 0 12px; color: #dc2626; font-size: 15px;">❌ Errors (${results.errors.length})</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #fecaca; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #fef2f2;">
              <th style="padding: 10px 14px; text-align: center; font-size: 12px; color: #991b1b; font-weight: 600; width: 50px; border-bottom: 2px solid #fecaca;">#</th>
              <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #991b1b; font-weight: 600; border-bottom: 2px solid #fecaca;">Artist</th>
              <th colspan="2" style="padding: 10px 14px; text-align: left; font-size: 12px; color: #991b1b; font-weight: 600; border-bottom: 2px solid #fecaca;">Error</th>
            </tr>
          </thead>
          <tbody>
            ${errorRows}
          </tbody>
        </table>
      </div>` : ''}

      <!-- Footer -->
      <div style="padding: 24px 32px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0; text-align: center;">
          Auto-generated by Grist Sync Service &bull; <a href="${process.env.APP_URL || '#'}" style="color: #3b82f6; text-decoration: none;">Open CRM</a>
        </p>
      </div>

      <div style="background: #f9fafb; padding: 14px 32px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">Music Rights Management CRM &bull; Grist Sync Automated Report</p>
      </div>
    </div>`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'rahul.goongoonalo@gmail.com, aayush@goongoonalo.com',
      subject: `${statusIcon} Grist Sync Report — ${results.created} New, ${results.updated} Updated, ${results.errors.length} Errors — ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('[GristSync] Sync report email sent to rahul.goongoonalo@gmail.com');
  } catch (emailError) {
    console.error('[GristSync] Failed to send sync report email:', emailError.message);
  }
}

/**
 * Main sync function — fetches all Grist records and syncs to DB
 */
export async function syncGristData() {
  console.log('[GristSync] Starting Grist data sync at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  try {
    const records = await fetchGristRecords();
    results.total = records.length;
    console.log(`[GristSync] Fetched ${records.length} records from Grist`);

    for (const record of records) {
      try {
        const result = await syncSingleRecord(record);
        results.details.push(result);

        if (result.action === 'created') results.created++;
        else if (result.action === 'updated') results.updated++;
        else if (result.action === 'skipped') results.skipped++;
      } catch (error) {
        const artistName = record?.fields?.Artist_Name || `Grist ID ${record?.id}`;
        console.error(`[GristSync] Error syncing "${artistName}":`, error.message);
        results.errors.push({ artistName, error: error.message });
      }
    }

    console.log(`[GristSync] Sync complete — Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
  } catch (error) {
    console.error('[GristSync] Sync failed:', error.message);
    results.errors.push({ artistName: 'GLOBAL', error: error.message });
  }

  // Send email report after every sync
  await sendGristSyncEmail(results);

  return results;
}

export default syncGristData;
