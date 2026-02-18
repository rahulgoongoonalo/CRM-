import { RiCloseLine, RiFileTextLine, RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';

const ViewL2ReviewModal = ({ isOpen, onClose, onboarding }) => {
  if (!isOpen || !onboarding) return null;

  const data = onboarding.l2ReviewData || {};
  const checklist = data.checklist || {};
  const documents = data.documents || [];
  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.artistName || onboarding.member?.artistName || 'N/A';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const membershipTypeDisplay = {
    'artist-investor': 'Artist Investor (₹2500 per share investment)',
    'partner-artist': 'Partner Artist (Distribution + Events)'
  };

  const checklistItems = [
    { key: 'catalogReview', label: '3.1 Catalog & Rights Review', desc: 'What is your complete music catalog? How many original songs, covers, unreleased tracks?' },
    { key: 'rightsOwnership', label: '3.2 Rights Ownership', desc: 'Do you own 100% rights to your music? Any co-writers, producers, or labels with claims?' },
    { key: 'commercialData', label: '3.3 Commercial Data', desc: 'Current streaming numbers & revenue? Existing royalty agreements or advances?' },
    { key: 'contractDiscussion', label: '3.4 Contract Discussion', desc: 'Review terms & partnership agreement. Clarify revenue splits, exclusivity, term duration.' },
    { key: 'techOnboarding', label: '3.5 Tech Onboarding', desc: 'App installation & walkthrough. Profile creation & setup training.' },
    { key: 'contentIngestion', label: '3.6 Content Ingestion', desc: 'Initiate catalog upload process. Verify metadata, artwork, audio quality.' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative bg-surface-card rounded-lg w-full max-w-3xl shadow-2xl shadow-orange-600/20 border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Meeting Scheduled On
                </label>
                <input
                  type="text"
                  value={formatDate(data.meetingScheduledOn)}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Meeting Type
                </label>
                <input
                  type="text"
                  value={data.meetingType || 'N/A'}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
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

          {/* Membership Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400 border-b border-border pb-2">MEMBERSHIP</h3>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Membership Type
              </label>
              <input
                type="text"
                value={membershipTypeDisplay[data.membershipType] || data.membershipType || 'N/A'}
                disabled
                className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
              />
            </div>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-400 border-b border-border pb-2">UPLOADED DOCUMENTS</h3>
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
            </div>
          )}

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
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-6 py-2.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewL2ReviewModal;
