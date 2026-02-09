import { RiCloseLine, RiFileTextLine } from 'react-icons/ri';
import { useState } from 'react';
import L1QuestionnaireModal from './L1QuestionnaireModal';
import { onboardingAPI } from '../services/api';
import { useToast } from './ToastNotification';

const Step1Modal = ({ isOpen, onClose, onboardingId, memberName, taskId }) => {
  const [formData, setFormData] = useState({
    source: 'Personal Reference',
    contactStatus: 'New',
    notes: ''
  });
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (action) => {
    if (action === 'submit-l2') {
      try {
        setSaving(true);
        const response = await onboardingAPI.updateStep1(onboardingId, {
          source: formData.source,
          contactStatus: formData.contactStatus,
          step1Notes: formData.notes
        });
        
        if (response.success) {
          toast.success('Step 1 data saved successfully');
          onClose();
        }
      } catch (error) {
        console.error('Error saving step 1:', error);
        toast.error('Failed to save step 1 data');
      } finally {
        setSaving(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-[#1e2a3a] rounded-lg w-full max-w-2xl shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Step 1: Initial Contact</h2>
            <p className="text-blue-100 text-sm">{memberName} • {taskId}</p>
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
          {/* Source and Contact Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-[#2d3748] border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                 <option value="Personal Reference">Personal Reference</option>
                  <option value="Curated Artist">Curated Artist</option>
                  <option value="Open Inbound">Open Inbound</option>
                  <option value="Special Curated">Special Curated</option>
                  <option value="Cartel">Cartel</option>
                  <option value="Soumini">Soumini</option>
                  <option value="Marriot">Marriot</option>
                  <option value="SVF">SVF</option>
                  <option value="AME">AME</option>
                  <option value="Caartel Music">Caartel Music</option>
                  <option value="Manipuri Zone">Manipuri Zone</option>
                  <option value="Getgrist">Getgrist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Status
              </label>
              <select
                value={formData.contactStatus}
                onChange={(e) => setFormData({ ...formData, contactStatus: e.target.value })}
                className="w-full bg-[#2d3748] border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option>New</option>
                <option>Contacted</option>
                <option>In Progress</option>
                <option>Follow-up Required</option>
              </select>
            </div>
          </div>

          {/* L1 Questionnaire */}
          <div className="bg-[#2d3748] rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RiFileTextLine className="text-blue-400" size={24} />
                <div>
                  <h3 className="text-white font-medium">L1 Questionnaire</h3>
                  <p className="text-gray-400 text-sm">Complete the initial contact questionnaire</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsQuestionnaireOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Open Questionnaire
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows="4"
              className="w-full bg-[#2d3748] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          <button
            onClick={() => handleSubmit('submit-l2')}
            type="button"
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Submitting...' : 'Submit for L2 Review'}
          </button>
        </div>
      </div>

      {/* L1 Questionnaire Modal */}
      <L1QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onboardingId={onboardingId}
        memberName={memberName}
        taskId={taskId}
      />
    </div>
  );
};

export default Step1Modal;
