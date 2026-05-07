import axios from 'axios';
import nodemailer from 'nodemailer';
import Member from '../models/Member.js';
import Onboarding from '../models/Onboarding.js';
import GristStaging from '../models/GristStaging.js';

const GRIST_API_URL = process.env.GRIST_API_URL || 'https://ism.getgrist.com/api/docs/5T8YB3qAMkaS/tables/Table1/records';

const normText = (value) => (value || '').toString().trim();
const normEmail = (value) => normText(value).toLowerCase();
const phoneDigits = (value) => normText(value).replace(/\D/g, '');
const compactName = (value) => normText(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
const escapeRegex = (value) => normText(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findStrictAppMatch(artistName /* email kept in signature for callers but unused */) {
  // artistName is the unique business identity — match purely on case-insensitive name.
  const cleanName = normText(artistName);
  if (!cleanName) return null;

  const nameRegex = new RegExp(`^${escapeRegex(cleanName)}$`, 'i');
  const member = await Member.findOne({ artistName: { $regex: nameRegex } });
  if (!member) return null;

  const onboarding = await Onboarding.findOne({ member: member._id, artistName: { $regex: nameRegex } });
  return { member, onboarding };
}

function looseMatchReasons(row, member) {
  // Identity is artistName ONLY. Email/phone are explicitly NOT identifiers — multiple
  // artists may share contact info (managers, family, shared inboxes). We never auto-merge
  // on email/phone overlap.
  const rowName = compactName(row.artistName || row.fields?.Artist_Name);
  const memberName = compactName(member.artistName);
  if (!rowName || !memberName) return [];
  // Only an exact compact-name match (case + punctuation insensitive) counts as a loose link.
  if (rowName === memberName) return ['name'];
  return [];
}

/**
 * Rebuild staging buckets after refresh/manual changes.
 * Only the first Grist row for a strict Member match stays "synced".
 * Extra Grist submissions for the same Member stay "pending" for review.
 */
export async function normalizeGristStagingBuckets() {
  const rows = await GristStaging.find({ status: { $ne: 'ignored' } }).sort({ gristId: 1 });
  const getgristMembers = await Member.find({ source: 'Getgrist' }).sort({ memberNumber: 1 });
  const firstSyncedByMember = new Map();
  const pendingRows = [];
  const results = {
    synced: 0,
    pending: 0,
    duplicatesMovedToPending: 0,
    missingMatchesMovedToPending: 0,
    promotedToSynced: 0,
    looseLinkedToSynced: 0,
  };

  for (const row of rows) {
    const fields = row.fields || {};
    const artistName = normText(fields.Artist_Name || row.artistName);
    const email = normEmail(fields.Email || row.email);
    const phone = normText(fields.Phone || row.phone);
    const previousStatus = row.status;

    row.artistName = artistName;
    row.email = email;
    row.phone = phone;

    const match = await findStrictAppMatch(artistName, email);
    if (!match) {
      pendingRows.push({ row, previousStatus, strictMatch: null, pendingReason: 'missing-match' });
      continue;
    }

    const memberId = match.member._id.toString();
    const firstSynced = firstSyncedByMember.get(memberId);
    row.member = match.member._id;
    row.onboarding = match.onboarding?._id || null;

    if (firstSynced) {
      pendingRows.push({ row, previousStatus, strictMatch: match, pendingReason: 'duplicate' });
    } else {
      firstSyncedByMember.set(memberId, row.gristId);
      row.status = 'synced';
      row.syncedAt = row.syncedAt || match.member.createdAt || new Date();
      results.synced++;
      if (previousStatus === 'pending') results.promotedToSynced++;
    }

    await row.save();
  }

  for (const item of pendingRows) {
    const usedMemberIds = new Set(firstSyncedByMember.keys());
    const candidates = [];

    for (const member of getgristMembers) {
      const memberId = member._id.toString();
      if (usedMemberIds.has(memberId)) continue;

      const reasons = looseMatchReasons(item.row, member);
      if (reasons.length > 0) candidates.push({ member, reasons });
    }

    if (candidates.length === 1) {
      const { member } = candidates[0];
      const onboarding = await Onboarding.findOne({ member: member._id });
      const memberId = member._id.toString();

      firstSyncedByMember.set(memberId, item.row.gristId);
      item.row.status = 'synced';
      item.row.member = member._id;
      item.row.onboarding = onboarding?._id || null;
      item.row.syncedAt = item.row.syncedAt || member.createdAt || new Date();
      results.synced++;
      results.looseLinkedToSynced++;
      if (item.previousStatus === 'pending') results.promotedToSynced++;
      await item.row.save();
      continue;
    }

    item.row.status = 'pending';
    item.row.syncedAt = null;
    results.pending++;

    if (item.strictMatch) {
      item.row.member = item.strictMatch.member._id;
      item.row.onboarding = item.strictMatch.onboarding?._id || null;
      if (item.pendingReason === 'duplicate') results.duplicatesMovedToPending++;
    } else {
      item.row.member = null;
      item.row.onboarding = null;
      if (item.previousStatus === 'synced') results.missingMatchesMovedToPending++;
    }

    await item.row.save();
  }

  return results;
}

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
 * Pull all rows from Grist into the GristStaging collection.
 * Does NOT touch Member or Onboarding.
 *
 * Behavior:
 * - For each Grist row (by gristId): upsert into staging, refresh `fields` snapshot, bump `lastSeenAt`.
 * - If the staging row was already `synced`, leave its status alone but still refresh `fields` (read-only view stays accurate).
 * - If the staging row was `ignored`, leave it alone. Marking again is the user's call.
 * - New rows enter as `pending`.
 *
 * Detection of "already in app":
 * - On every refresh, for staging rows that are still `pending`, check if a Member exists with matching
 *   (email + artistName). If yes, auto-promote staging row to `synced` and link the Member/Onboarding refs.
 *   This keeps the "Already in app" tab accurate even for records added before this staging system existed.
 */
export async function refreshGristStaging() {
  console.log('[GristStaging] Starting Grist staging refresh at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

  const results = {
    total: 0,
    newPending: 0,
    refreshed: 0,
    autoLinked: 0,
    errors: [],
    details: [],
  };

  let records;
  try {
    records = await fetchGristRecords();
  } catch (error) {
    results.errors.push({ artistName: 'GLOBAL', error: error.message });
    return results;
  }

  results.total = records.length;
  console.log(`[GristStaging] Fetched ${records.length} records from Grist`);

  for (const record of records) {
    try {
      const { id: gristId, fields } = record;
      if (!fields || !fields.Artist_Name) {
        results.details.push({ action: 'skipped', gristId, reason: 'No Artist_Name' });
        continue;
      }

      const artistName = normText(fields.Artist_Name);
      const email = normEmail(fields.Email);
      const phone = normText(fields.Phone);

      // STRICT auto-link rule: only count as "already in app" if BOTH email AND artistName
      // match the same Member. Name-only or email-only matches are NOT enough — those go
      // to pending, where the user manually decides whether to sync.
      const existing = await GristStaging.findOne({ gristId });

      if (!existing) {
        const match = await findStrictAppMatch(artistName, email);
        const stagingDoc = {
          gristId,
          fields,
          artistName,
          email,
          phone,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        };

        if (match) {
          stagingDoc.status = 'synced';
          stagingDoc.member = match.member._id;
          stagingDoc.onboarding = match.onboarding?._id || null;
          stagingDoc.syncedAt = match.member.createdAt || new Date();
          results.autoLinked++;
        } else {
          stagingDoc.status = 'pending';
          results.newPending++;
        }

        await GristStaging.create(stagingDoc);
        results.details.push({
          action: match ? 'auto-linked' : 'new-pending',
          gristId, artistName
        });
      } else {
        // Refresh snapshot
        existing.fields = fields;
        existing.artistName = artistName;
        existing.email = email;
        existing.phone = phone;
        existing.lastSeenAt = new Date();

        // If pending, re-check strict match (maybe user manually created the Member meanwhile)
        if (existing.status === 'pending') {
          const match = await findStrictAppMatch(artistName, email);
          if (match) {
            existing.status = 'synced';
            existing.member = match.member._id;
            existing.onboarding = match.onboarding?._id || null;
            existing.syncedAt = match.member.createdAt || new Date();
            results.autoLinked++;
          }
        } else if (existing.status === 'synced') {
          // Sanity check: if a previously-synced row no longer has a strict match
          // (e.g. Member was deleted, or artistName changed in Grist), demote it back to pending.
          const match = await findStrictAppMatch(artistName, email);
          if (!match) {
            existing.status = 'pending';
            existing.member = null;
            existing.onboarding = null;
            existing.syncedAt = null;
          } else {
            // Refresh refs in case Member/Onboarding _ids changed
            existing.member = match.member._id;
            existing.onboarding = match.onboarding?._id || null;
          }
        }

        await existing.save();
        results.refreshed++;
      }
    } catch (error) {
      const artistName = record?.fields?.Artist_Name || `Grist ID ${record?.id}`;
      console.error(`[GristStaging] Error processing "${artistName}":`, error.message);
      results.errors.push({ artistName, error: error.message });
    }
  }

  results.reclassified = await normalizeGristStagingBuckets();

  console.log(`[GristStaging] Refresh complete — Total: ${results.total}, New pending: ${results.newPending}, Refreshed: ${results.refreshed}, Auto-linked: ${results.autoLinked}, Pending duplicates: ${results.reclassified.duplicatesMovedToPending}, Errors: ${results.errors.length}`);

  // Email report
  await sendGristStagingEmail(results);

  return results;
}

/**
 * Promote a single staging row to Member + Onboarding.
 * Used by the manual "Sync Selected" action from the UI.
 * Idempotent: if the staging row is already synced, returns the existing refs.
 */
export async function promoteStagingRow(stagingId) {
  const staging = await GristStaging.findById(stagingId);
  if (!staging) {
    throw new Error('Staging row not found');
  }
  if (staging.status === 'synced') {
    return {
      action: 'already-synced',
      memberId: staging.member,
      onboardingId: staging.onboarding,
      artistName: staging.artistName,
    };
  }
  if (staging.status === 'ignored') {
    throw new Error('Cannot sync an ignored row. Mark it as pending first.');
  }

  const fields = staging.fields || {};
  const artistName = (fields.Artist_Name || staging.artistName || '').trim();
  if (!artistName) {
    throw new Error('Cannot sync — Artist_Name is empty');
  }

  const email = (fields.Email || staging.email || '').trim().toLowerCase();

  // Match by artistName ONLY (case-insensitive). Email/phone are NOT identity — multiple
  // artists may legitimately share a contact (manager, family, shared inbox).
  const escapedName = artistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nameRegex = new RegExp(`^${escapedName}$`, 'i');

  const member0 = await Member.findOne({ artistName: { $regex: nameRegex } });
  let member = member0;

  if (member) {
    const duplicateSynced = await GristStaging.findOne({
      _id: { $ne: staging._id },
      status: 'synced',
      member: member._id,
    }).lean();

    if (duplicateSynced) {
      const onboarding = await Onboarding.findOne({
        member: member._id,
        artistName: { $regex: nameRegex }
      });

      staging.status = 'pending';
      staging.member = member._id;
      staging.onboarding = onboarding?._id || null;
      staging.syncedAt = null;
      await staging.save();

      throw new Error(`Duplicate Grist row. "${member.artistName}" is already represented by Grist ID ${duplicateSynced.gristId} / Member #${member.memberNumber}. This row stays pending for review.`);
    }

    // Update existing member with any new fields from Grist (don't overwrite artistName).
    // Skip email update if it would collide with another member.
    const updateFields = {};
    if (fields.Contact_Name) updateFields.contactName = fields.Contact_Name;
    if (fields.Phone) updateFields.phone = fields.Phone;
    if (fields.Location) updateFields.location = fields.Location;
    if (fields.Primary_Roles) updateFields.primaryRole = fields.Primary_Roles;
    if (fields.Primary_Genres) updateFields.primaryGenres = fields.Primary_Genres;
    if (fields.Email) {
      const newEmail = fields.Email.toLowerCase().trim();
      if (newEmail && newEmail !== (member.email || '').toLowerCase().trim()) {
        // Email is no longer unique; just update it.
        updateFields.email = newEmail;
      }
    }
    updateFields.source = 'Getgrist';
    updateFields.updatedAt = new Date();
    if (Object.keys(updateFields).length > 0) {
      await Member.findByIdAndUpdate(member._id, updateFields);
    }
  } else {
    // Email no longer enforced as unique — create a new member directly. Identity is by
    // artistName, which we've already searched for above and not found.
    member = new Member(mapToMemberData(fields));
    await member.save();
  }

  // Find or create the onboarding that belongs to (this member, this artistName)
  let onboarding = await Onboarding.findOne({
    member: member._id,
    artistName: { $regex: nameRegex }
  });
  const l1Data = mapToL1QuestionnaireData(fields);

  if (onboarding) {
    const onboardingUpdate = {
      notes: fields.Other_Info || onboarding.notes,
      l1QuestionnaireData: { ...onboarding.l1QuestionnaireData?.toObject?.() || {}, ...l1Data },
    };
    await Onboarding.findByIdAndUpdate(onboarding._id, onboardingUpdate);
  } else {
    onboarding = new Onboarding({
      member: member._id,
      artistName,
      description: `Manually synced from Grist (ID: ${staging.gristId})`,
      spoc: 'Soumini Paul',
      notes: fields.Other_Info || '',
      status: 'warm',
      step1Data: {
        source: 'Getgrist',
        contactStatus: 'New',
        step1Notes: `Manually approved from Grist staging on ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      },
      l1QuestionnaireData: l1Data,
    });
    await onboarding.save();
  }

  // Mark staging as synced
  staging.status = 'synced';
  staging.member = member._id;
  staging.onboarding = onboarding._id;
  staging.syncedAt = new Date();
  await staging.save();

  return {
    action: 'synced',
    memberId: member._id,
    onboardingId: onboarding._id,
    artistName,
  };
}

/**
 * Email report after a staging refresh
 */
async function sendGristStagingEmail(results) {
  try {
    if (!process.env.SMTP_HOST) return; // skip if SMTP not configured
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const syncTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const hasErrors = results.errors.length > 0;
    const statusColor = hasErrors ? '#dc2626' : '#16a34a';

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px 28px;color:#fff;">
        <h1 style="margin:0;font-size:20px;">Grist Staging Refresh</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">${syncTime}</p>
      </div>
      <div style="padding:20px 28px;">
        <p style="font-size:13px;color:#374151;">
          The cron has refreshed the Grist staging table. <strong>No member or onboarding records have been created or modified.</strong>
          To push pending rows into the app, log in and use the Settings → Grist Data Sync page.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:14px;">
          <tr>
            <td style="padding:10px;background:#f0fdf4;text-align:center;border-radius:6px;width:25%;">
              <div style="font-size:24px;font-weight:700;color:#16a34a;">${results.total}</div>
              <div style="font-size:11px;color:#6b7280;">Total Grist rows</div>
            </td>
            <td style="width:6px;"></td>
            <td style="padding:10px;background:#fefce8;text-align:center;border-radius:6px;width:25%;">
              <div style="font-size:24px;font-weight:700;color:#ca8a04;">${results.newPending}</div>
              <div style="font-size:11px;color:#6b7280;">New pending</div>
            </td>
            <td style="width:6px;"></td>
            <td style="padding:10px;background:#eff6ff;text-align:center;border-radius:6px;width:25%;">
              <div style="font-size:24px;font-weight:700;color:#2563eb;">${results.autoLinked}</div>
              <div style="font-size:11px;color:#6b7280;">Auto-linked (already in app)</div>
            </td>
            <td style="width:6px;"></td>
            <td style="padding:10px;background:${hasErrors?'#fef2f2':'#f9fafb'};text-align:center;border-radius:6px;width:25%;">
              <div style="font-size:24px;font-weight:700;color:${statusColor};">${results.errors.length}</div>
              <div style="font-size:11px;color:#6b7280;">Errors</div>
            </td>
          </tr>
        </table>
      </div>
    </div>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'rahul.goongoonalo@gmail.com, aayush@goongoonalo.com',
      subject: `Grist Staging Refresh — ${results.newPending} new pending, ${results.autoLinked} auto-linked`,
      html,
    });
    console.log('[GristStaging] Refresh report email sent');
  } catch (e) {
    console.error('[GristStaging] Email failed:', e.message);
  }
}

// Backwards-compatible alias for any callers still importing the old name
export const syncGristData = refreshGristStaging;

export default refreshGristStaging;
