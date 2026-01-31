import { RiCloseLine } from 'react-icons/ri';

const ViewStep1Modal = ({ isOpen, onClose, onboarding }) => {
  if (!isOpen || !onboarding) return null;

  const step1Data = onboarding.step1Data || {};
  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.memberName || onboarding.member?.name || 'N/A';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative bg-surface-card rounded-lg w-full max-w-2xl shadow-2xl shadow-brand-primary/20 border border-border" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 rounded-t-lg flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-xl font-semibold text-white">View Step 1: Initial Contact</h2>
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
            <input
              type="text"
              value={step1Data.source || 'N/A'}
              disabled
              className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
            />
          </div>

          {/* Contact Status */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Contact Status
            </label>
            <input
              type="text"
              value={step1Data.contactStatus || 'N/A'}
              disabled
              className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Notes
            </label>
            <textarea
              value={step1Data.step1Notes || 'N/A'}
              disabled
              rows="4"
              className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end bg-surface-lighter">
          <button
            onClick={onClose}
            type="button"
            className="btn-secondary px-6 py-2.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewStep1Modal;
