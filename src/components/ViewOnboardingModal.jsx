import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';
import ViewStep1Modal from './ViewStep1Modal';
import ViewL1QuestionnaireModal from './ViewL1QuestionnaireModal';
import ViewL2ReviewModal from './ViewL2ReviewModal';

const ViewOnboardingModal = ({ isOpen, onClose, onboarding }) => {
  const [isStep1Open, setIsStep1Open] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isL2ReviewOpen, setIsL2ReviewOpen] = useState(false);
  
  if (!isOpen || !onboarding) return null;

  console.log('ViewOnboardingModal - onboarding object received:', onboarding);
  console.log('ViewOnboardingModal - step1Data:', onboarding.step1Data);
  console.log('ViewOnboardingModal - l1QuestionnaireData:', onboarding.l1QuestionnaireData);

  const taskId = onboarding.taskNumber || 'N/A';
  const startDate = new Date(onboarding.createdAt).toISOString().split('T')[0];
  const etaClosure = onboarding.etaClosure ? new Date(onboarding.etaClosure).toISOString().split('T')[0] : 'N/A';
  const memberName = onboarding.artistName || onboarding.member?.artistName || 'N/A';
  const memberEmail = onboarding.member?.email || 'N/A';
  const statusDisplay = {
    'hot': 'Hot',
    'warm': 'Warm',
    'cold': 'Cold',
    'closed-won': 'Closed Won',
    'closed-lost': 'Closed Lost',
    'cold-storage': 'Cold Storage'
  }[onboarding.status] || onboarding.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between shadow-lg">
          <h2 className="text-xl font-bold text-white">View Onboarding - {taskId}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
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
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={memberName}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Member Email
                </label>
                <input
                  type="text"
                  value={memberEmail}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Start Date
                </label>
                <input
                  type="text"
                  value={startDate}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  ETA to Closure
                </label>
                <input
                  type="text"
                  value={etaClosure}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  SPOC
                </label>
                <input
                  type="text"
                  value={onboarding.spoc || 'N/A'}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={statusDisplay}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={onboarding.description || 'N/A'}
                disabled
                rows="3"
                className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Notes
              </label>
              <textarea
                value={onboarding.notes || 'N/A'}
                disabled
                rows="3"
                className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-lighter px-6 py-4 flex justify-between border-t border-border">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsStep1Open(true)}
                className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30"
              >
                View Step 1
              </button>
              <button
                type="button"
                onClick={() => setIsQuestionnaireOpen(true)}
                className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/30"
              >
                View L1 Questionnaire
              </button>
              <button
                type="button"
                onClick={() => setIsL2ReviewOpen(true)}
                className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-600/30"
              >
                View L2 Review
              </button>
            </div>
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
      
      {/* Step1 Modal */}
      <ViewStep1Modal
        isOpen={isStep1Open}
        onClose={() => setIsStep1Open(false)}
        onboarding={onboarding}
      />
      
      {/* L1 Questionnaire Modal */}
      <ViewL1QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onboarding={onboarding}
      />
      
      {/* L2 Review Modal */}
      <ViewL2ReviewModal
        isOpen={isL2ReviewOpen}
        onClose={() => setIsL2ReviewOpen(false)}
        onboarding={onboarding}
      />
    </div>
  );
};

export default ViewOnboardingModal;
