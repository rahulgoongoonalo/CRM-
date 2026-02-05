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
      
      <div className="relative bg-surface-card rounded-lg w-full max-w-2xl shadow-2xl shadow-brand-primary/20 border border-border" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 rounded-t-lg flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Step 1: Initial Contact</h2>
            <p className="text-white/80 text-sm">Task ID: {taskId} | Member: {memberName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Source */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Source
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="select w-full"
            >
              <option value="">Select Source</option>
                 <option value="Personal Reference">Personal Reference</option>
                  <option value="Curated Artist">Curated Artist</option>
                  <option value="Open Inbound">Open Inbound</option>
                  <option value="Special Curated">Special Curated</option>
                  <option value="Cartel">Cartel</option>
                  <option value="Soumini">Soumini</option>
                  <option value="Marriot">Marriot</option>
                  <option value="Website">Website</option>
            </select>
          </div>

          {/* Contact Status */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Contact Status
            </label>
            <select
              name="contactStatus"
              value={formData.contactStatus}
              onChange={handleChange}
              className="select w-full"
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
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Notes
            </label>
            <textarea
              name="step1Notes"
              value={formData.step1Notes}
              onChange={handleChange}
              placeholder="Add any relevant notes about the initial contact..."
              rows="4"
              className="input w-full resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 bg-surface-lighter">
          <button
            onClick={onClose}
            type="button"
            className="btn-secondary px-6 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('save')}
            type="button"
            disabled={saving}
            className="btn-secondary px-6 py-2.5 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => handleSubmit('submit-l2')}
            type="button"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50"
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
