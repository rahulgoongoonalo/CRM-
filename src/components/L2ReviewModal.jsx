import { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';

const L2ReviewModal = ({ isOpen, onClose, onboarding, onSubmit }) => {
  const [formData, setFormData] = useState({
    meetingScheduledOn: '',
    meetingType: 'In-Person',
    catalogReview: false,
    rightsOwnership: false,
    commercialData: false,
    contractDiscussion: false,
    techOnboarding: false,
    contentIngestion: false,
    membershipType: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (status) => {
    // Validation: Check if all required fields are filled
    if (!formData.meetingScheduledOn) {
      alert('Please select a meeting date');
      return;
    }

    if (!formData.membershipType) {
      alert('Please select a membership type');
      return;
    }

    // Validation: Check if all checklist items are checked
    const allChecklistChecked = 
      formData.catalogReview &&
      formData.rightsOwnership &&
      formData.commercialData &&
      formData.contractDiscussion &&
      formData.techOnboarding &&
      formData.contentIngestion;

    if (!allChecklistChecked) {
      alert('Please complete all 6 checklist items before submitting');
      return;
    }

    const dataToSubmit = {
      ...formData,
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
        membershipType: formData.membershipType,
        notes: formData.notes
      }
    };
    
    onSubmit(dataToSubmit);
    
    // Reset form
    setFormData({
      meetingScheduledOn: '',
      meetingType: 'In-Person',
      catalogReview: false,
      rightsOwnership: false,
      commercialData: false,
      contractDiscussion: false,
      techOnboarding: false,
      contentIngestion: false,
      membershipType: '',
      notes: ''
    });
  };

  const taskId = `ONB-${onboarding?._id?.slice(-4).toUpperCase()}`;
  const artistName = onboarding?.member?.name || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      ></div>

      {/* Modal */}
      <div 
        className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-orange-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">L2 Review - Core Group Approval</h2>
            <p className="text-orange-100 text-sm">{artistName} • {taskId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 rounded-lg p-1 transition-colors"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* Meeting Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Scheduled On <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="meetingScheduledOn"
                value={formData.meetingScheduledOn}
                onChange={handleChange}
                className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Type <span className="text-red-400">*</span>
              </label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="In-Person">In-Person</option>
                <option value="Google Meet">Google Meet</option>
              </select>
            </div>
          </div>

          {/* STEP 3 CHECKLIST */}
          <div>
            <h3 className="text-yellow-500 font-bold text-sm mb-4">STEP 3 CHECKLIST</h3>
            <div className="space-y-4">
              {/* Checkbox 3.1 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="catalogReview"
                    checked={formData.catalogReview}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.1 Catalog & Rights Review</div>
                    <div className="text-gray-400 text-xs mt-1">
                      What is your complete music catalog? How many original songs, covers, unreleased tracks?
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.2 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rightsOwnership"
                    checked={formData.rightsOwnership}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.2 Rights Ownership</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Do you own 100% rights to your music? Any co-writers, producers, or labels with claims?
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.3 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="commercialData"
                    checked={formData.commercialData}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.3 Commercial Data</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Current streaming numbers & revenue? Existing royalty agreements or advances?
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.4 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="contractDiscussion"
                    checked={formData.contractDiscussion}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.4 Contract Discussion</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Review terms & partnership agreement. Clarify revenue splits, exclusivity, term duration.
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.5 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="techOnboarding"
                    checked={formData.techOnboarding}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.5 Tech Onboarding</div>
                    <div className="text-gray-400 text-xs mt-1">
                      App installation & walkthrough. Profile creation & setup training.
                    </div>
                  </div>
                </label>
              </div>

              {/* Checkbox 3.6 */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="contentIngestion"
                    checked={formData.contentIngestion}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">3.6 Content Ingestion</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Initiate catalog upload process. Verify metadata, artwork, audio quality.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Membership Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Membership Type <span className="text-red-400">*</span>
            </label>
            <select
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select membership type</option>
              <option value="artist-investor">Artist Investor (rs 2500 per share investment)</option>
              <option value="partner-artist">Partner Artist (Distribution + Events)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Meeting notes, observations, next steps..."
              rows="4"
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('review-l2')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Progress
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('closed-won')}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Closed Won
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('closed-lost')}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Closed Lost
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('review-l2')}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Cold Storage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default L2ReviewModal;
