import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { onboardingAPI } from '../services/api';
import EditL1QuestionnaireModal from './EditL1QuestionnaireModal';

const EditStep1Modal = ({ isOpen, onClose, onboarding }) => {
  const [formData, setFormData] = useState({
    source: '',
    contactStatus: '',
    step1Notes: ''
  });
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && onboarding) {
      setFormData({
        source: onboarding.step1Data?.source || '',
        contactStatus: onboarding.step1Data?.contactStatus || '',
        step1Notes: onboarding.step1Data?.step1Notes || ''
      });
    }
  }, [isOpen, onboarding]);

  if (!isOpen || !onboarding) return null;

  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.memberName || onboarding.member?.name || 'N/A';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (action) => {
    try {
      setSaving(true);
      const response = await onboardingAPI.updateStep1(onboarding._id, formData);
      
      if (response.success) {
        alert('Step 1 updated successfully!');
        if (action === 'submit-l2') {
          onClose(true); // Pass true to indicate data was updated
          setIsQuestionnaireOpen(true);
        } else {
          onClose(true); // Pass true to indicate data was updated
        }
      }
    } catch (error) {
      console.error('Error updating step 1:', error);
      alert('Failed to update step 1 data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative bg-[#1e2a3a] rounded-lg w-full max-w-2xl shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Step 1: Initial Contact</h2>
            <p className="text-blue-100 text-sm">Task ID: {taskId} | Member: {memberName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded p-1"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Source <span className="text-red-400">*</span>
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Source</option>
                 <option value="Personal Reference">Personal Reference</option>
                  <option value="Curated Artist">Curated Artist</option>
                  <option value="Open Inbound">Open Inbound</option>
                  <option value="Special Curated">Special Curated</option>
                  <option value="Cartel">Cartel</option>
                  <option value="Soumini">Soumini</option>
                  <option value="Marriot">Marriot</option>
            </select>
          </div>

          {/* Contact Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Status <span className="text-red-400">*</span>
            </label>
            <select
              name="contactStatus"
              value={formData.contactStatus}
              onChange={handleChange}
              required
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="First Contact">First Contact</option>
              <option value="Follow-up Scheduled">Follow-up Scheduled</option>
              <option value="Information Shared">Information Shared</option>
              <option value="Awaiting Response">Awaiting Response</option>
              <option value="Ready for L1">Ready for L1</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="step1Notes"
              value={formData.step1Notes}
              onChange={handleChange}
              placeholder="Add any relevant notes about the initial contact..."
              rows="4"
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-600 flex gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('save')}
            type="button"
            disabled={saving}
            className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => handleSubmit('submit-l2')}
            type="button"
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Open L1 Questionnaire'}
          </button>
        </div>
      </div>

      {/* L1 Questionnaire Modal */}
      <EditL1QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onboarding={onboarding}
        memberName={memberName}
        taskId={taskId}
      />
    </div>
  );
};

export default EditStep1Modal;
