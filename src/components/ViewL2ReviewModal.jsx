import { RiCloseLine, RiFileTextLine, RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';
import { usePicklist } from '../hooks/usePicklist';

// Stage metadata (picklist name → display config) — same as L2ReviewModal
const STAGE_META = [
  { picklistName: 'stage1-basicOnboarding', key: 'basicOnboarding', title: '1. Basic Artist Onboarding', color: 'blue', description: 'Sending them the Goongoonalo Agreement for review' },
  { picklistName: null, key: 'interestedInvestment', title: '2. Interested in Investment', color: 'cyan', customType: 'investmentInterest', description: 'All Process Completed' },
  { picklistName: 'stage2-artistInvestment', key: 'artistInvestment', title: '3. Artist Investment Document', color: 'purple' },
  { picklistName: 'stage3-distributionAgreement', key: 'distributionAgreement', title: '4. Distribution Agreement signed', color: 'emerald', description: 'Become the exclusive distributor for the artist content across streaming platform' },
  { picklistName: 'stage4-nonExclusiveLicense', key: 'nonExclusiveLicense', title: '5. Non-Exclusive License for Streaming on Goongoonalo', color: 'amber', description: 'For Streaming content on Goongoonalo' },
  { picklistName: 'stage5-finalClosure', key: 'finalClosure', title: '6. Final Closure', color: 'red' },
];

const INVESTMENT_INTEREST_ITEMS = [
  { key: 'amount', label: 'Investment Amount', type: 'number' },
  { key: 'received', label: 'Interested in Investment', type: 'yesno' },
];

// Sentinel for an undecided item (the default state). 'NA' is now a real choice.
const UNSET = 'Not updated';

const isNumberItem = (item) => item.type === 'number';
const isDecisionItem = (item) => !isNumberItem(item);

const getStageStatus = (stageData, stageItems, customType) => {
  if (!stageData || !stageItems || stageItems.length === 0) return { status: 'Open', color: 'gray' };
  if (customType === 'investmentInterest') {
    const amt = Number(stageData.amount) || 0;
    const rec = stageData.received || UNSET;
    if (rec === 'No' || rec === 'NA') return { status: 'Closed', color: 'green' };
    if (rec === 'Yes' && amt > 0) return { status: 'Closed', color: 'green' };
    if (rec === UNSET && amt === 0) return { status: 'Open', color: 'gray' };
    return { status: 'In Progress', color: 'yellow' };
  }
  const values = stageItems.filter(isDecisionItem).map(item => stageData[item.key] || UNSET);
  const decided = values.filter(v => v !== UNSET);
  if (decided.length === 0) return { status: 'Open', color: 'gray' };
  if (decided.length === values.length) return { status: 'Closed', color: 'green' };
  return { status: 'In Progress', color: 'yellow' };
};

const statusBadgeClass = (color) => {
  const map = {
    gray: 'bg-slate-700 text-slate-300 border-slate-600',
    yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    green: 'bg-green-900/50 text-green-300 border-green-700',
  };
  return map[color] || map.gray;
};

const stageTitleClass = (color) => {
  const map = {
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };
  return map[color] || 'text-white';
};

const stageAccentClass = (color) => {
  const map = {
    blue: 'border-l-blue-500',
    cyan: 'border-l-cyan-500',
    purple: 'border-l-purple-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
  };
  return map[color] || 'border-l-slate-600';
};

const valueBadge = (val) => {
  if (val === 'Yes') return 'bg-green-600 text-white';
  if (val === 'No') return 'bg-red-600 text-white';
  if (val === UNSET) return 'bg-amber-600 text-white';
  return 'bg-slate-600 text-slate-300'; // NA
};

const StageHeading = ({ title, description, color }) => (
  <span className="min-w-0 flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-1 pr-4 text-left">
    <span className={`font-semibold text-sm ${stageTitleClass(color)}`}>{title}</span>
    {description && (
      <span className="text-xs font-medium text-slate-400 leading-snug">
        ({description})
      </span>
    )}
  </span>
);

const ViewL2ReviewModal = ({ isOpen, onClose, onboarding }) => {
  const { items: stage1Items, picklist: stage1Picklist } = usePicklist('stage1-basicOnboarding');
  const { items: stage2Items, picklist: stage2Picklist } = usePicklist('stage2-artistInvestment');
  const { items: stage3Items, picklist: stage3Picklist } = usePicklist('stage3-distributionAgreement');
  const { items: stage4Items, picklist: stage4Picklist } = usePicklist('stage4-nonExclusiveLicense');
  const { items: stage5Items, picklist: stage5Picklist } = usePicklist('stage5-finalClosure');

  if (!isOpen || !onboarding) return null;

  const stageItemsMap = {
    'stage1-basicOnboarding': stage1Items,
    'stage2-artistInvestment': stage2Items,
    'stage3-distributionAgreement': stage3Items,
    'stage4-nonExclusiveLicense': stage4Items,
    'stage5-finalClosure': stage5Items,
  };

  const stagePicklistMap = {
    'stage1-basicOnboarding': stage1Picklist,
    'stage2-artistInvestment': stage2Picklist,
    'stage3-distributionAgreement': stage3Picklist,
    'stage4-nonExclusiveLicense': stage4Picklist,
    'stage5-finalClosure': stage5Picklist,
  };

  const stagesConfig = STAGE_META.map(meta => ({
    ...meta,
    description: stagePicklistMap[meta.picklistName]?.description || meta.description || '',
    items: meta.customType === 'investmentInterest'
      ? INVESTMENT_INTEREST_ITEMS
      : (stageItemsMap[meta.picklistName] || []).map(i => ({
        key: i.value,
        label: i.label,
        type: i.type || 'yesno',
        dependsOn: i.dependsOn || '',
        showWhen: i.showWhen || ''
      })),
  }));

  const data = onboarding.l2ReviewData || {};
  const checklist = data.checklist || {};
  const stages = data.stages || {};
  const documents = data.documents || [];
  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.artistName || onboarding.member?.artistName || 'N/A';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d) ? 'N/A' : d.toISOString().split('T')[0];
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const checklistItems = [
    { key: 'catalogReview', label: '3.1 Catalog & Rights Review', desc: 'What is your complete music catalog? How many original songs, covers, unreleased tracks?' },
    { key: 'rightsOwnership', label: '3.2 Rights Ownership', desc: 'Do you own 100% rights to your music? Any co-writers, producers, or labels with claims?' },
    { key: 'commercialData', label: '3.3 Commercial Data', desc: 'Current streaming numbers & revenue? Existing royalty agreements or advances?' },
    { key: 'contractDiscussion', label: '3.4 Contract Discussion', desc: 'Review terms & partnership agreement. Clarify revenue splits, exclusivity, term duration.' },
    { key: 'techOnboarding', label: '3.5 Tech Onboarding', desc: 'App installation & walkthrough. Profile creation & setup training.' },
    { key: 'contentIngestion', label: '3.6 Content Ingestion', desc: 'Initiate catalog upload process. Verify metadata, artwork, audio quality.' },
  ];

  // Overall progress based on dynamic stages
  const allStageStatuses = stagesConfig.map(s => getStageStatus(stages[s.key], s.items, s.customType));
  const completedStages = allStageStatuses.filter(s => s.status === 'Closed').length;
  const progressPercent = stagesConfig.length > 0 ? Math.round((completedStages / stagesConfig.length) * 100) : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative bg-surface-card rounded-lg w-full max-w-4xl shadow-2xl shadow-orange-600/20 border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10 shadow-lg">
          <div>
            <h2 className="text-xl font-semibold text-white">View L2 Review</h2>
            <p className="text-orange-100 text-sm">Task ID: {taskId} | Member: {memberName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Meeting Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400 border-b border-border pb-2">MEETING DETAILS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Meeting Scheduled On</label>
                <input type="text" value={formatDate(data.meetingScheduledOn)} disabled className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Meeting Type</label>
                <input type="text" value={data.meetingType || 'N/A'} disabled className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400 border-b border-border pb-2">STEP 3 CHECKLIST</h3>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.key} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 flex items-start gap-3">
                  {checklist[item.key] ? (
                    <RiCheckboxCircleLine className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
                  ) : (
                    <RiCloseCircleLine className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-white font-medium text-sm">{item.label}</div>
                    <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Closure Stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-semibold text-orange-400">CLOSURE STAGES</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Overall:</span>
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-gray-300 font-medium">{completedStages}/{stagesConfig.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              {stagesConfig.map((stage) => {
                const stageData = stages[stage.key] || {};
                const { status, color } = getStageStatus(stageData, stage.items, stage.customType);
                const completedCount = stage.customType === 'investmentInterest'
                  ? ((Number(stageData.amount) > 0 ? 1 : 0) + ((stageData.received || UNSET) !== UNSET ? 1 : 0))
                  : stage.items.filter(isDecisionItem).filter(item => (stageData[item.key] || UNSET) !== UNSET).length;
                const decisionItems = stage.items.filter(isDecisionItem);

                return (
                  <div key={stage.key} className={`bg-slate-900/50 rounded-xl border-l-4 ${stageAccentClass(stage.color)} border border-slate-700 overflow-hidden`}>
                    {/* Stage Header */}
                    <div className="flex items-center justify-between px-5 py-3">
                      <StageHeading title={stage.title} description={stage.description} color={stage.color} />
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{completedCount}/{decisionItems.length}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(color)}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Stage Items */}
                    <div className="px-5 pb-4 space-y-1.5">
                      {stage.customType === 'investmentInterest' ? (
                        <>
                          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">Investment Amount</span>
                            <span className="px-3 py-0.5 rounded-md text-xs font-medium bg-slate-600 text-white">
                              {stageData.amount ? stageData.amount : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
                            <span className="text-gray-300 text-sm">Interested in Investment</span>
                            <span className={`px-3 py-0.5 rounded-md text-xs font-medium ${valueBadge(stageData.received || UNSET)}`}>
                              {stageData.received || UNSET}
                            </span>
                          </div>
                        </>
                      ) : decisionItems.map((item) => {
                        const val = stageData[item.key] || UNSET;
                        const dependentNumberItems = stage.items.filter(numberItem =>
                          isNumberItem(numberItem) &&
                          numberItem.dependsOn === item.key &&
                          (!numberItem.showWhen || numberItem.showWhen === val)
                        );
                        return (
                          <div key={item.key} className="py-2 px-3 bg-slate-800/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300 text-sm">{item.label}</span>
                              <span className={`px-3 py-0.5 rounded-md text-xs font-medium ${valueBadge(val)}`}>
                                {val}
                              </span>
                            </div>
                            {dependentNumberItems.map(numberItem => (
                              <div className="mt-2 flex items-center justify-between border-t border-slate-700/60 pt-2">
                                <span className="text-gray-400 text-xs">{numberItem.label}</span>
                                <span className="px-3 py-0.5 rounded-md text-xs font-medium bg-slate-600 text-white">
                                  {stageData[numberItem.key] ?? 'N/A'}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}

                      {/* Stage Progress */}
                      <div className="pt-1">
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-slate-600'
                            }`}
                            style={{ width: `${decisionItems.length > 0 ? (completedCount / decisionItems.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400 border-b border-border pb-2">UPLOADED DOCUMENTS</h3>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <RiFileTextLine className="text-orange-400 text-lg flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{doc.title}</div>
                        <div className="text-gray-400 text-xs truncate">
                          {doc.fileName} • {formatFileSize(doc.fileSize)}
                          {doc.description && ` • ${doc.description}`}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`http://localhost:5000${doc.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs underline flex-shrink-0 ml-3"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700 text-gray-400 text-sm">
                No documents uploaded
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400 border-b border-border pb-2">NOTES</h3>
            <textarea
              value={data.notes || 'N/A'}
              disabled
              rows="4"
              className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-lighter px-6 py-4 flex justify-end border-t border-border sticky bottom-0">
          <button type="button" onClick={onClose} className="btn-secondary px-6 py-2.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewL2ReviewModal;
