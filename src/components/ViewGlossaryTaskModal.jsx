import { RiCloseLine, RiDownloadLine, RiFileTextLine, RiCalendarLine, RiUserLine, RiUserStarLine } from 'react-icons/ri';
import { glossaryAPI } from '../services/api';

const ViewGlossaryTaskModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = () => {
    if (task.fileId) {
      const url = glossaryAPI.download(task._id);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', task.fileOriginalName || 'document');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-card rounded-2xl shadow-2xl shadow-black/40 w-full max-w-xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">SOP Details</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-5">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-text-primary">{task.title}</h3>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Description</label>
              <p className="text-sm text-text-secondary leading-relaxed bg-surface-lighter rounded-xl px-4 py-3 border border-border">
                {task.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-lighter rounded-xl px-4 py-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <RiUserLine className="text-brand-primary text-sm" />
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Accountable</label>
              </div>
              <p className="text-sm font-medium text-text-primary">{task.accountable}</p>
            </div>
            <div className="bg-surface-lighter rounded-xl px-4 py-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <RiUserStarLine className="text-brand-accent text-sm" />
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Created By</label>
              </div>
              <p className="text-sm font-medium text-text-primary">{task.createdBy || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-surface-lighter rounded-xl px-4 py-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <RiCalendarLine className="text-yellow-400 text-sm" />
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Created Date</label>
            </div>
            <p className="text-sm font-medium text-text-primary">{formatDate(task.createdDate)}</p>
          </div>

          {/* File */}
          {task.fileId && (
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Attached Document</label>
              <div className="flex items-center justify-between bg-surface-lighter rounded-xl px-4 py-3 border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                    <RiFileTextLine className="text-xl text-brand-primary" />
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">{task.fileOriginalName || 'Document'}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-brand-primary/30 transition-all flex-shrink-0"
                >
                  <RiDownloadLine />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-text-secondary hover:bg-surface-lighter transition-all font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewGlossaryTaskModal;
