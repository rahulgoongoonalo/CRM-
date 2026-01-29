import { RiCloseLine } from 'react-icons/ri';

const ViewStep1Modal = ({ isOpen, onClose, onboarding, memberName, taskId }) => {
  if (!isOpen || !onboarding) return null;

  const step1Data = onboarding.step1Data || {};

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative bg-[#1e2a3a] rounded-lg w-full max-w-2xl shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">View Step 1: Initial Contact</h2>
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
              Source
            </label>
            <input
              type="text"
              value={step1Data.source || 'N/A'}
              disabled
              className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
            />
          </div>

          {/* Contact Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Status
            </label>
            <input
              type="text"
              value={step1Data.contactStatus || 'N/A'}
              disabled
              className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={step1Data.step1Notes || 'N/A'}
              disabled
              rows="4"
              className="w-full bg-slate-900/50 text-gray-300 px-4 py-2.5 rounded-lg border border-slate-700 cursor-not-allowed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-600 flex justify-end">
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

export default ViewStep1Modal;
