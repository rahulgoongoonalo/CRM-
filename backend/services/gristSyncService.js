import axios from 'axios';
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

  return results;
}

export default syncGristData;
