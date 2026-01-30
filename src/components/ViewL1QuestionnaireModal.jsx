import { RiCloseLine } from 'react-icons/ri';

const ViewL1QuestionnaireModal = ({ isOpen, onClose, onboarding }) => {
  if (!isOpen || !onboarding) return null;

  const data = onboarding.l1QuestionnaireData || {};
  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.memberName || onboarding.member?.name || 'N/A';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative bg-[#1e2a3a] rounded-lg w-full max-w-4xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-white">View L1 Questionnaire</h2>
            <p className="text-green-100 text-sm">Task ID: {taskId} | Member: {memberName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 rounded p-1"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* ARTIST BASICS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">ARTIST BASICS</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist / Band Name
                </label>
                <input
                  type="text"
                  value={data.artistName || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  value={data.primaryContact || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="text"
                  value={data.email || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={data.phone || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City / Country
                </label>
                <input
                  type="text"
                  value={data.cityCountry || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years Active
                </label>
                <input
                  type="text"
                  value={data.yearsActive || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Bio / Background
              </label>
              <textarea
                value={data.artistBio || 'N/A'}
                disabled
                rows="3"
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {/* REPRESENTATION */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">REPRESENTATION</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Do you have a manager?
                </label>
                <input
                  type="text"
                  value={data.hasManager || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Manager Name
                </label>
                <input
                  type="text"
                  value={data.managerName || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Are you signed to a label?
                </label>
                <input
                  type="text"
                  value={data.hasLabel || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Label Name
                </label>
                <input
                  type="text"
                  value={data.labelName || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* MUSIC & IDENTITY */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">MUSIC & IDENTITY</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Role
                </label>
                <input
                  type="text"
                  value={data.primaryRole || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Genre(s)
                </label>
                <input
                  type="text"
                  value={data.primaryGenres || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language(s) of Music
              </label>
              <input
                type="text"
                value={data.languages || 'N/A'}
                disabled
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sub-genre / Style
              </label>
              <input
                type="text"
                value={data.subGenre || 'N/A'}
                disabled
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* STREAMING & SOCIAL MEDIA */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">STREAMING & SOCIAL MEDIA</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Streaming Platform Link
              </label>
              <input
                type="text"
                value={data.streamingLink || 'N/A'}
                disabled
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube Channel
                </label>
                <input
                  type="text"
                  value={data.youtube || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={data.instagram || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Other Platforms
              </label>
              <input
                type="text"
                value={data.otherPlatforms || 'N/A'}
                disabled
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* EXISTING CONTRACTS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">EXISTING CONTRACTS</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Distributor?
                </label>
                <input
                  type="text"
                  value={data.hasDistributor || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Distributor Name
                </label>
                <input
                  type="text"
                  value={data.distributorName || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Existing Contracts?
                </label>
                <input
                  type="text"
                  value={data.hasContracts || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Valid Until
                </label>
                <input
                  type="text"
                  value={data.contractValidUntil || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* GOONGOONALO PARTICIPATION */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">GOONGOONALO PARTICIPATION</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interested in exclusive releases?
                </label>
                <input
                  type="text"
                  value={data.exclusiveReleases || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Open to collaborations?
                </label>
                <input
                  type="text"
                  value={data.openToCollabs || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Why Goongoonalo?
              </label>
              <textarea
                value={data.whyGoongoonalo || 'N/A'}
                disabled
                rows="2"
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How did you hear about us?
              </label>
              <input
                type="text"
                value={data.howHeard || 'N/A'}
                disabled
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* AGREEMENTS */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">AGREEMENTS</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg">
                <input
                  type="checkbox"
                  checked={data.confirmRights || false}
                  disabled
                  className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500 cursor-not-allowed"
                />
                <span className="text-gray-300 text-sm">I confirm I have the rights to the music I will distribute</span>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg">
                <input
                  type="checkbox"
                  checked={data.acceptTerms || false}
                  disabled
                  className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500 cursor-not-allowed"
                />
                <span className="text-gray-300 text-sm">I accept the terms and conditions</span>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg">
                <input
                  type="checkbox"
                  checked={data.consentEditorial || false}
                  disabled
                  className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500 cursor-not-allowed"
                />
                <span className="text-gray-300 text-sm">I consent to editorial features and promotions</span>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg">
                <input
                  type="checkbox"
                  checked={data.understandPayout || false}
                  disabled
                  className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500 cursor-not-allowed"
                />
                <span className="text-gray-300 text-sm">I understand the artist-first payout model</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-600 flex justify-end sticky bottom-0 bg-[#1e2a3a]">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewL1QuestionnaireModal;
