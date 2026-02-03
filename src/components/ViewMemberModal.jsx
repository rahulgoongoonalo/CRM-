import { RiCloseLine } from 'react-icons/ri';

const ViewMemberModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 w-full max-w-4xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between shadow-lg">
          <h2 className="text-xl font-bold text-white">View Member - {member.memberId}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Form Content - All fields disabled */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={member.name || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Alias Name
                </label>
                <input
                  type="text"
                  value={member.aliasName || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={member.email || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={member.phone || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Alternate Number
                </label>
                <input
                  type="tel"
                  value={member.alternateNumber || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={member.address || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={member.category || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Tier
                </label>
                <input
                  type="text"
                  value={member.tier || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Talent Role
                </label>
                <input
                  type="text"
                  value={member.talentRole || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Talent Type
                </label>
                <input
                  type="text"
                  value={member.talentType || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  value={member.genre || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={member.source || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Note
                </label>
                <input
                  type="text"
                  value={member.spoc || ''}
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
                  value={member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || ''}
                  disabled
                  className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Biography
              </label>
              <textarea
                value={member.biography || ''}
                disabled
                rows="4"
                className="w-full bg-surface-light/50 text-text-muted px-4 py-2.5 rounded-lg border border-border cursor-not-allowed resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-lighter px-6 py-4 flex justify-end border-t border-border">
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
    </div>
  );
};

export default ViewMemberModal;
