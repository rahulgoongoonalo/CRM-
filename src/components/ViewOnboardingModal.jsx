import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';
import ViewStep1Modal from './ViewStep1Modal';
import ViewL1QuestionnaireModal from './ViewL1QuestionnaireModal';

const ViewOnboardingModal = ({ isOpen, onClose, onboarding }) => {
  const [isStep1Open, setIsStep1Open] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  
  if (!isOpen || !onboarding) return null;

  const taskId = `ONB-${onboarding._id?.slice(-4).toUpperCase()}`;
  const startDate = new Date(onboarding.createdAt).toISOString().split('T')[0];
  const etaClosure = onboarding.etaClosure ? new Date(onboarding.etaClosure).toISOString().split('T')[0] : 'N/A';
  const memberName = onboarding.member?.name || 'N/A';
  const memberEmail = onboarding.member?.email || 'N/A';
  const statusDisplay = {
    'contact-established': 'Contact Established',
    'spoc-assigned': 'SPOC Assigned',
    'review-l2': 'Review for L2',
    'closed-won': 'Closed Won',
    'closed-lost': 'Closed Lost'
  }[onboarding.status] || onboarding.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">View Onboarding - {taskId}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-lg p-1 transition-colors"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Member Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member Name
                </label>
                <input
                  type="text"
                  value={memberName}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member Email
                </label>
                <input
                  type="text"
                  value={memberEmail}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="text"
                  value={startDate}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ETA to Closure
                </label>
                <input
                  type="text"
                  value={etaClosure}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SPOC
                </label>
                <input
                  type="text"
                  value={onboarding.spoc || 'N/A'}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={statusDisplay}
                  disabled
                  className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={onboarding.description || 'N/A'}
                disabled
                rows="3"
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={onboarding.notes || 'N/A'}
                disabled
                rows="3"
                className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 px-6 py-4 flex justify-between border-t border-slate-700">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsStep1Open(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Step 1
              </button>
              <button
                type="button"
                onClick={() => setIsQuestionnaireOpen(true)}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View L1 Questionnaire
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Step1 Modal */}
      <ViewStep1Modal
        isOpen={isStep1Open}
        onClose={() => setIsStep1Open(false)}
        onboarding={onboarding}
        memberName={memberName}
        taskId={taskId}
      />
      
      {/* L1 Questionnaire Modal */}
      <ViewL1QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onboarding={onboarding}
        memberName={memberName}
        taskId={taskId}
      />
    </div>
  );
};

export default ViewOnboardingModal;
