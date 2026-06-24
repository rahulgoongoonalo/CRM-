/**
 * Shared L2 closure-stage classification — single source of truth for both the
 * L2 Review Report endpoint and the daily closure email, so they never drift.
 *
 * A stage is reduced to one canonical decision token:
 *   'Yes' | 'No' | 'NA' | 'NotUpdated'
 *
 * 'Not updated' is the untouched default for an item; 'NA' is a deliberate choice.
 *
 * Stages 1 / 4 / 5 are KEY-FIELD driven: the stage is 'Yes' only when every one
 * of its listed key fields is 'Yes', otherwise 'No' — except when every decision
 * item is uniformly 'NA' (→ NA) or uniformly untouched (→ Not Updated).
 * Other stages keep the generic "all items must agree" rule.
 */

const UNSET = 'Not updated';

// Key decision fields per stage (by the stage `key`), matched on the stable
// picklist `value`. Resolved against the live picklists and confirmed with the user.
// NOTE: 'KYC Recieved' / 'DocuSign Agreement send' are the exact stored keys
// (spaces + typo are intentional — created via the picklist admin UI).
export const STAGE_KEY_FIELDS = {
  basicOnboarding: ['firstCallCompleted', 'whatsappGroupCreated'],
  distributionAgreement: ['distributionAgreementSent', 'contentReceivedForUpload'],
  nonExclusiveLicense: ['streamingAgreementSent', 'KYC Recieved', 'DocuSign Agreement send', 'artistReviewMeeting'],
};

const isDecisionItem = (item) => (item.type || 'yesno') !== 'number';

/**
 * @param {string} stageKey   - stage `key` (e.g. 'basicOnboarding')
 * @param {object} stageData  - this onboarding's stored values for the stage
 * @param {Array}  items      - stage items ({ key, type, ... }) where key === picklist value
 * @param {string} [customType]
 * @returns {'Yes'|'No'|'NA'|'NotUpdated'}
 */
export function classifyStageDecision(stageKey, stageData, items, customType) {
  const sd = stageData || {};
  if (!items || items.length === 0) return 'NotUpdated';

  if (customType === 'investmentInterest') {
    const rec = sd.received || UNSET;
    if (rec === 'Yes') return 'Yes';
    if (rec === 'No') return 'No';
    if (rec === 'NA') return 'NA';
    return 'NotUpdated';
  }

  const decisionItems = items.filter(isDecisionItem);
  if (decisionItems.length === 0) return 'NotUpdated';
  const values = decisionItems.map(i => sd[i.key] || UNSET);

  // If ANY decision item is still untouched, the stage isn't fully evaluated yet.
  if (values.some(v => v === UNSET)) return 'NotUpdated';
  if (values.every(v => v === 'NA')) return 'NA';

  const keyFields = STAGE_KEY_FIELDS[stageKey];
  if (keyFields) {
    // Key-field stages (1, 4, 5): Yes only when all key fields are Yes, else No.
    return keyFields.every(k => sd[k] === 'Yes') ? 'Yes' : 'No';
  }

  // Generic stages (3, 6): every decision item must agree.
  if (values.every(v => v === 'Yes')) return 'Yes';
  if (values.every(v => v === 'No')) return 'No';
  return 'NotUpdated'; // mixed decided values
}

export default classifyStageDecision;
