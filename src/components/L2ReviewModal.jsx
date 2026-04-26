import { useState, useEffect } from 'react';
import { RiCloseLine, RiUploadCloud2Line, RiDeleteBin6Line, RiFileTextLine, RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { useToast } from './ToastNotification';
import { onboardingAPI } from '../services/api';
import { usePicklist } from '../hooks/usePicklist';

// Stage metadata (picklist name → display config)
const STAGE_META = [
  { picklistName: 'stage1-basicOnboarding', key: 'basicOnboarding', title: '1. Basic Artist Onboarding', color: 'blue' },
  { picklistName: null, key: 'interestedInvestment', title: '2. Interested in Investment', color: 'cyan', customType: 'investmentInterest' },
  { picklistName: 'stage2-artistInvestment', key: 'artistInvestment', title: '3. Artist Investment Document', color: 'purple' },
  { picklistName: 'stage3-distributionAgreement', key: 'distributionAgreement', title: '4. Distribution Agreement signed', color: 'emerald' },
  { picklistName: 'stage4-nonExclusiveLicense', key: 'nonExclusiveLicense', title: '5. Non-Exclusive License for Streaming on Goongoonalo', color: 'amber' },
  { picklistName: 'stage5-finalClosure', key: 'finalClosure', title: '6. Final Closure', color: 'red' },
];

const INVESTMENT_INTEREST_ITEMS = [
  { key: 'amount', label: 'Investment Amount', type: 'number' },
  { key: 'received', label: 'Amount Received', type: 'yesno' },
];

const getStageStatus = (stageData, stageItems, customType) => {
  if (!stageData || !stageItems || stageItems.length === 0) return { status: 'Open', color: 'gray' };
  if (customType === 'investmentInterest') {
    const amt = Number(stageData.amount) || 0;
    const rec = stageData.received || 'NA';
    const filled = (amt > 0 ? 1 : 0) + (rec !== 'NA' ? 1 : 0);
    if (filled === 0) return { status: 'Open', color: 'gray' };
    if (filled === 2) return { status: 'Closed', color: 'green' };
    return { status: 'In Progress', color: 'yellow' };
  }
  const values = stageItems.map(i => stageData[i.key] || 'NA');
  const nonNA = values.filter(v => v !== 'NA');
  if (nonNA.length === 0) return { status: 'Open', color: 'gray' };
  if (nonNA.length === values.length) return { status: 'Closed', color: 'green' };
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

const stageAccentClass = (color) => ({
  blue: 'border-blue-500/50', cyan: 'border-cyan-500/50', purple: 'border-purple-500/50', emerald: 'border-emerald-500/50',
  amber: 'border-amber-500/50', red: 'border-red-500/50',
}[color] || 'border-slate-600');

const stageTitleClass = (color) => ({
  blue: 'text-blue-400', cyan: 'text-cyan-400', purple: 'text-purple-400', emerald: 'text-emerald-400',
  amber: 'text-amber-400', red: 'text-red-400',
}[color] || 'text-white');

const L2ReviewModal = ({ isOpen, onClose, onboarding, onSubmit }) => {
  const { items: meetingTypes } = usePicklist('meetingType');
  const { items: stage1Items } = usePicklist('stage1-basicOnboarding');
  const { items: stage2Items } = usePicklist('stage2-artistInvestment');
  const { items: stage3Items } = usePicklist('stage3-distributionAgreement');
  const { items: stage4Items } = usePicklist('stage4-nonExclusiveLicense');
  const { items: stage5Items } = usePicklist('stage5-finalClosure');

  // Build dynamic stages config from picklist data
  const stageItemsMap = {
    'stage1-basicOnboarding': stage1Items,
    'stage2-artistInvestment': stage2Items,
    'stage3-distributionAgreement': stage3Items,
    'stage4-nonExclusiveLicense': stage4Items,
    'stage5-finalClosure': stage5Items,
  };

  const stagesConfig = STAGE_META.map(meta => ({
    ...meta,
    items: meta.customType === 'investmentInterest'
      ? INVESTMENT_INTEREST_ITEMS
      : (stageItemsMap[meta.picklistName] || []).map(i => ({ key: i.value, label: i.label })),
  }));

  const getDefaultStages = () => {
    const stages = {};
    stagesConfig.forEach(stage => {
      stages[stage.key] = {};
      if (stage.customType === 'investmentInterest') {
        stages[stage.key].amount = '';
        stages[stage.key].received = 'NA';
      } else {
        stage.items.forEach(item => {
          stages[stage.key][item.key] = 'NA';
        });
      }
    });
    return stages;
  };

  const [formData, setFormData] = useState({
    meetingScheduledOn: '',
    meetingType: 'In-Person',
    catalogReview: false,
    rightsOwnership: false,
    commercialData: false,
    contractDiscussion: false,
    techOnboarding: false,
    contentIngestion: false,
    stages: {},
    notes: ''
  });
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [expandedStages, setExpandedStages] = useState({ basicOnboarding: true });
  const toast = useToast();

  useEffect(() => {
    if (isOpen && onboarding?._id) {
      const loadData = async () => {
        setLoadingData(true);
        try {
          const response = await onboardingAPI.getById(onboarding._id);
          if (response.success && response.data?.l2ReviewData) {
            const l2Data = response.data.l2ReviewData;
            const hasSavedData = l2Data.meetingScheduledOn || l2Data.checklist || l2Data.notes || l2Data.stages;
            if (hasSavedData) {
              setFormData({
                meetingScheduledOn: l2Data.meetingScheduledOn ? l2Data.meetingScheduledOn.split('T')[0] : '',
                meetingType: l2Data.meetingType || 'In-Person',
                catalogReview: l2Data.checklist?.catalogReview || false,
                rightsOwnership: l2Data.checklist?.rightsOwnership || false,
                commercialData: l2Data.checklist?.commercialData || false,
                contractDiscussion: l2Data.checklist?.contractDiscussion || false,
                techOnboarding: l2Data.checklist?.techOnboarding || false,
                contentIngestion: l2Data.checklist?.contentIngestion || false,
                stages: l2Data.stages || getDefaultStages(),
                notes: l2Data.notes || ''
              });
              setUploadedDocs(l2Data.documents || []);
            } else {
              resetForm();
            }
          } else {
            resetForm();
          }
        } catch (error) {
          console.error('Error fetching onboarding data for L2 review:', error);
          resetForm();
        } finally {
          setLoadingData(false);
        }
      };
      loadData();
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, onboarding?._id]);

  // When picklist items load, ensure stages have all keys (new items added via picklist)
  useEffect(() => {
    if (stagesConfig.some(s => s.items.length > 0)) {
      setFormData(prev => {
        const updatedStages = { ...prev.stages };
        stagesConfig.forEach(stage => {
          if (!updatedStages[stage.key]) updatedStages[stage.key] = {};
          if (stage.customType === 'investmentInterest') {
            if (updatedStages[stage.key].amount === undefined) updatedStages[stage.key].amount = '';
            if (updatedStages[stage.key].received === undefined) updatedStages[stage.key].received = 'NA';
          } else {
            stage.items.forEach(item => {
              if (updatedStages[stage.key][item.key] === undefined) {
                updatedStages[stage.key][item.key] = 'NA';
              }
            });
          }
        });
        return { ...prev, stages: updatedStages };
      });
    }
  }, [stage1Items, stage2Items, stage3Items, stage4Items, stage5Items]);

  const resetForm = () => {
    setFormData({
      meetingScheduledOn: '',
      meetingType: 'In-Person',
      catalogReview: false,
      rightsOwnership: false,
      commercialData: false,
      contractDiscussion: false,
      techOnboarding: false,
      contentIngestion: false,
      stages: getDefaultStages(),
      notes: ''
    });
    setUploadedDocs([]);
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStageItemChange = async (stageKey, itemKey, value) => {
    const updatedStages = {
      ...formData.stages,
      [stageKey]: {
        ...formData.stages[stageKey],
        [itemKey]: value
      }
    };
    setFormData(prev => ({ ...prev, stages: updatedStages }));

    // Auto-save stages to backend
    try {
      await onboardingAPI.updateL2Review(onboarding._id, {
        status: onboarding.status || 'review-l2',
        l2ReviewData: {
          meetingScheduledOn: formData.meetingScheduledOn,
          meetingType: formData.meetingType,
          checklist: {
            catalogReview: formData.catalogReview,
            rightsOwnership: formData.rightsOwnership,
            commercialData: formData.commercialData,
            contractDiscussion: formData.contractDiscussion,
            techOnboarding: formData.techOnboarding,
            contentIngestion: formData.contentIngestion
          },
          stages: updatedStages,
          notes: formData.notes
        }
      });
      toast.success('Saved');
    } catch (error) {
      console.error('Error auto-saving stage item:', error);
      toast.error('Failed to save');
    }
  };

  const toggleStage = (stageKey) => {
    setExpandedStages(prev => ({ ...prev, [stageKey]: !prev[stageKey] }));
  };

  const handleSubmit = async (status, skipValidation = false) => {
    if (!skipValidation) {
      if (!formData.meetingScheduledOn) {
        toast.warning('Please select a meeting date');
        return;
      }

      const allChecklistChecked =
        formData.catalogReview && formData.rightsOwnership && formData.commercialData &&
        formData.contractDiscussion && formData.techOnboarding && formData.contentIngestion;

      if (!allChecklistChecked) {
        toast.warning('Please complete all 6 checklist items before submitting');
        return;
      }
    }

    const dataToSubmit = {
      status,
      l2ReviewData: {
        meetingScheduledOn: formData.meetingScheduledOn,
        meetingType: formData.meetingType,
        checklist: {
          catalogReview: formData.catalogReview,
          rightsOwnership: formData.rightsOwnership,
          commercialData: formData.commercialData,
          contractDiscussion: formData.contractDiscussion,
          techOnboarding: formData.techOnboarding,
          contentIngestion: formData.contentIngestion
        },
        stages: formData.stages,
        notes: formData.notes
      }
    };

    try {
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error submitting L2 review:', error);
    }
  };

  const taskId = `ONB-${onboarding?._id?.slice(-4).toUpperCase()}`;
  const artistName = onboarding?.member?.name || 'N/A';

  const handleUploadDocument = async () => {
    if (!docTitle.trim()) { toast.warning('Please enter a document title'); return; }
    if (!docFile) { toast.warning('Please select a file to upload'); return; }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('document', docFile);
      formDataUpload.append('title', docTitle);
      formDataUpload.append('description', docDescription);

      const response = await onboardingAPI.uploadDocument(onboarding._id, formDataUpload);
      if (response.success) {
        setUploadedDocs(response.data.l2ReviewData?.documents || []);
        setDocTitle(''); setDocDescription(''); setDocFile(null);
        toast.success('Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally { setUploading(false); }
  };

  const handleDeleteDocument = async (docIndex) => {
    try {
      const response = await onboardingAPI.deleteDocument(onboarding._id, docIndex);
      if (response.success) {
        setUploadedDocs(response.data.l2ReviewData?.documents || []);
        toast.success('Document deleted');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Calculate overall progress
  const allStageStatuses = stagesConfig.map(s => getStageStatus(formData.stages[s.key], s.items, s.customType));
  const completedStages = allStageStatuses.filter(s => s.status === 'Closed').length;
  const totalStages = stagesConfig.length || 1;
  const progressPercent = Math.round((completedStages / totalStages) * 100);
  const overallStatus = completedStages === 0 ? { label: 'Open', color: 'gray' }
    : completedStages === totalStages ? { label: 'Closed', color: 'green' }
    : { label: 'In Progress', color: 'yellow' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative bg-surface-card rounded-lg shadow-2xl shadow-orange-600/20 w-full max-w-5xl max-h-[95vh] overflow-hidden border border-border" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-white">L2 Review - Core Group Approval</h2>
            <p className="text-orange-100 text-sm">{artistName} • {taskId}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all">
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6 space-y-6">
          {/* Meeting Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Meeting Scheduled On <span className="text-red-400">*</span>
              </label>
              <input type="date" name="meetingScheduledOn" value={formData.meetingScheduledOn} onChange={handleChange} className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Meeting Type <span className="text-red-400">*</span>
              </label>
              <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="select w-full">
                {meetingTypes.map(item => (
                  <option key={item._id} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 3 CHECKLIST */}
          <div>
            <h3 className="text-yellow-500 font-bold text-sm mb-4">STEP 3 CHECKLIST</h3>
            <div className="space-y-4">
              {[
                { name: 'catalogReview', label: '3.1 Catalog & Rights Review', desc: 'What is your complete music catalog? How many original songs, covers, unreleased tracks?' },
                { name: 'rightsOwnership', label: '3.2 Rights Ownership', desc: 'Do you own 100% rights to your music? Any co-writers, producers, or labels with claims?' },
                { name: 'commercialData', label: '3.3 Commercial Data', desc: 'Current streaming numbers & revenue? Existing royalty agreements or advances?' },
                { name: 'contractDiscussion', label: '3.4 Contract Discussion', desc: 'Review terms & partnership agreement. Clarify revenue splits, exclusivity, term duration.' },
                { name: 'techOnboarding', label: '3.5 Tech Onboarding', desc: 'App installation & walkthrough. Profile creation & setup training.' },
                { name: 'contentIngestion', label: '3.6 Content Ingestion', desc: 'Initiate catalog upload process. Verify metadata, artwork, audio quality.' },
              ].map(item => (
                <div key={item.name} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500" />
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{item.label}</div>
                      <div className="text-gray-400 text-xs mt-1">{item.desc}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* CLOSURE STAGES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-500 font-bold text-sm">CLOSURE STAGES</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Overall:</span>
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-gray-300 font-medium">{completedStages}/{totalStages}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(overallStatus.color)}`}>{overallStatus.label}</span>
              </div>
            </div>

            <div className="space-y-3">
              {stagesConfig.map((stage) => {
                const stageData = formData.stages[stage.key] || {};
                const stageItems = stage.items;
                const { status, color } = getStageStatus(stageData, stageItems, stage.customType);
                const isExpanded = expandedStages[stage.key];
                const completedCount = stage.customType === 'investmentInterest'
                  ? ((Number(stageData.amount) > 0 ? 1 : 0) + ((stageData.received || 'NA') !== 'NA' ? 1 : 0))
                  : stageItems.filter(i => (stageData[i.key] || 'NA') !== 'NA').length;

                return (
                  <div key={stage.key} className={`bg-slate-900/50 rounded-xl border-l-4 ${stageAccentClass(stage.color)} border border-slate-700 overflow-hidden`}>
                    {/* Stage Header */}
                    <button type="button" onClick={() => toggleStage(stage.key)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors">
                      <span className={`font-semibold text-sm ${stageTitleClass(stage.color)}`}>{stage.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{completedCount}/{stageItems.length}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(color)}`}>{status}</span>
                        {isExpanded ? <RiArrowUpSLine className="text-gray-400 text-lg" /> : <RiArrowDownSLine className="text-gray-400 text-lg" />}
                      </div>
                    </button>

                    {/* Stage Items */}
                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-2">
                        {stage.customType === 'investmentInterest' ? (
                          <>
                            <div className="flex items-center justify-between py-2.5 px-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
                              <span className="text-white text-sm">Investment Amount</span>
                              <input
                                type="number"
                                min="0"
                                value={stageData.amount ?? ''}
                                onChange={(e) => handleStageItemChange(stage.key, 'amount', e.target.value)}
                                placeholder="0"
                                className="input w-40 text-sm"
                              />
                            </div>
                            <div className="flex items-center justify-between py-2.5 px-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
                              <span className="text-white text-sm">Amount Received</span>
                              <div className="flex items-center gap-1">
                                {['Yes', 'No', 'NA'].map(val => {
                                  const currentValue = stageData.received || 'NA';
                                  return (
                                    <button key={val} type="button"
                                      onClick={() => handleStageItemChange(stage.key, 'received', val)}
                                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                        currentValue === val
                                          ? val === 'Yes' ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                                            : val === 'No' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                              : 'bg-slate-500 text-white shadow-lg shadow-slate-500/30'
                                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50 border border-slate-600'
                                      }`}>
                                      {val}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          stageItems.map((item) => {
                            const currentValue = stageData[item.key] || 'NA';
                            return (
                              <div key={item.key} className="flex items-center justify-between py-2.5 px-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
                                <span className="text-white text-sm">{item.label}</span>
                                <div className="flex items-center gap-1">
                                  {['Yes', 'No', 'NA'].map(val => (
                                    <button key={val} type="button"
                                      onClick={() => handleStageItemChange(stage.key, item.key, val)}
                                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                        currentValue === val
                                          ? val === 'Yes' ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                                            : val === 'No' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                              : 'bg-slate-500 text-white shadow-lg shadow-slate-500/30'
                                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50 border border-slate-600'
                                      }`}>
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* Stage Progress Bar */}
                        <div className="pt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${
                              color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-slate-600'
                            }`} style={{ width: `${stageItems.length > 0 ? (completedCount / stageItems.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Documents Section */}
          <div>
            <h3 className="text-yellow-500 font-bold text-sm mb-4">UPLOAD DOCUMENTS</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Title <span className="text-red-400">*</span></label>
                  <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. Contract Agreement" className="input w-full text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Description</label>
                  <input type="text" value={docDescription} onChange={(e) => setDocDescription(e.target.value)} placeholder="Brief description..." className="input w-full text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-[#2d3748] border border-dashed border-slate-500 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                  <RiUploadCloud2Line className="text-orange-400 text-lg" />
                  <span className="text-sm text-text-secondary truncate">{docFile ? docFile.name : 'Choose file (max 10MB)'}</span>
                  <input type="file" onChange={(e) => setDocFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" />
                </label>
                <button type="button" onClick={handleUploadDocument} disabled={uploading}
                  className="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 whitespace-nowrap text-sm">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            {uploadedDocs.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedDocs.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3 border border-slate-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <RiFileTextLine className="text-orange-400 text-lg flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{doc.title}</div>
                        <div className="text-gray-400 text-xs truncate">{doc.fileName} • {formatFileSize(doc.fileSize)}{doc.description && ` • ${doc.description}`}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline">View</a>
                      <button type="button" onClick={() => handleDeleteDocument(index)} className="text-red-400 hover:text-red-300 p-1">
                        <RiDeleteBin6Line size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Meeting notes, observations, next steps..." rows="4" className="input w-full resize-none" />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary px-6 py-2.5">Cancel</button>
            <button type="button" onClick={() => handleSubmit('review-l2', true)} className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30">Save Progress</button>
            <button type="button" onClick={() => handleSubmit('closed-won')} className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/30">Closed Won</button>
            <button type="button" onClick={() => handleSubmit('closed-lost')} className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30">Closed Lost</button>
            <button type="button" onClick={() => handleSubmit('cold-storage')} className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-brand-accent to-brand-highlight text-white hover:from-brand-accent/90 hover:to-brand-highlight/90 transition-all shadow-lg shadow-brand-accent/30">Cold Storage</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default L2ReviewModal;
