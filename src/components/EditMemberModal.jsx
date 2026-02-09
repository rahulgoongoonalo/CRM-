import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';

const EditMemberModal = ({ isOpen, onClose, onSubmit, member }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    aliasName: '',
    email: '',
    contactNumber: '',
    alternateNumber: '',
    country: '',
    category: '',
    tier: '',
    talentRole: '',
    talentType: '',
    genre: '',
    source: '',
    spoc: '',
    status: 'Pending',
    biography: '',
  });

  useEffect(() => {
    if (member) {
      const notes = member.notes ? member.notes.split(', ') : [];
      const category = notes.find(n => n.startsWith('Category:'))?.split(': ')[1] || member.category || 'Premier';
      const talentRole = notes.find(n => n.startsWith('Role:'))?.split(': ')[1] || member.primaryRole || '';
      const source = notes.find(n => n.startsWith('Source:'))?.split(': ')[1] || member.source || 'Personal Reference';
      
      setFormData({
        fullName: member.artistName || '',
        aliasName: member.contactName || '',
        email: member.email || '',
        contactNumber: member.phone || '',
        alternateNumber: member.alternateNumber || '',
        country: member.location || '',
        category: member.category || category,
        tier: member.tier || 'Tier 1',
        talentRole: member.primaryRole || talentRole,
        talentType: member.talentType || '',
        genre: member.primaryGenres || '',
        source: member.source || source,
        spoc: member.spoc || '',
        status: member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || 'Updated',
        biography: member.biography || '',
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id: member._id });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-surface-card rounded-lg shadow-2xl shadow-brand-primary/20 w-full max-w-4xl max-h-[90vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between shadow-lg">
          <h2 className="text-xl font-bold text-white">Edit Member - {member?.memberId}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Alias Name
                </label>
                <input
                  type="text"
                  name="aliasName"
                  placeholder="Enter alias/stage name"
                  value={formData.aliasName}
                  onChange={handleChange}
                  className="input w-full"
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
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="input w-full"
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
                  name="alternateNumber"
                  placeholder="Enter alternate number"
                  value={formData.alternateNumber}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="">Select country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Category (Based on Spotify Monthly Listeners)
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="">Select category</option>
                  <option value="Premier 1 - 20M">Premier 1 - 20M</option>
                  <option value="Premier 2 - 10M">Premier 2 - 10M</option>
                  <option value="Premier 3 - 5M">Premier 3 - 5M</option>
                  <option value="Elite 1 - 1M">Elite 1 - 1M</option>
                  <option value="Elite 2 - 600K">Elite 2 - 600K</option>
                  <option value="Elite 3 - 100K">Elite 3 - 100K</option>
                  <option value="Standard 1 - 50K">Standard 1 - 50K</option>
                  <option value="Standard 2 - 10K">Standard 2 - 10K</option>
                  <option value="Standard 3 - Below 10K">Standard 3 - Below 10K</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Tier (Based on Instagram Followers)
                </label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="">Select tier</option>
                  <option value="Tier 1 - 1M">Tier 1 - 1M</option>
                  <option value="Tier 2 - 750K">Tier 2 - 750K</option>
                  <option value="Tier 3 - 500K">Tier 3 - 500K</option>
                  <option value="Tier 4 - 250K">Tier 4 - 250K</option>
                  <option value="Tier 5 - 100K">Tier 5 - 100K</option>
                  <option value="Tier 6 - 50K">Tier 6 - 50K</option>
                  <option value="Tier 7 - 10K">Tier 7 - 10K</option>
                  <option value="Tier 8 - Below 10K">Tier 8 - Below 10K</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Talent Role
                </label>
                <input
                  type="text"
                  name="talentRole"
                  placeholder="e.g., Singer, Composer, Lyricist"
                  value={formData.talentRole}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Talent Type
                </label>
                <select
                  name="talentType"
                  value={formData.talentType}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="">Select type</option>
                  <option value="Individual">Individual</option>
                  <option value="Band">Band</option>
                  <option value="Group">Group</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  placeholder="e.g., Bollywood, Pop, Classical"
                  value={formData.genre}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
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
                  <option value="">Select source</option>
                  <option value="Personal Reference">Personal Reference</option>
                  <option value="Curated Artist">Curated Artist</option>
                  <option value="Open Inbound">Open Inbound</option>
                  <option value="Special Curated">Special Curated</option>
                  <option value="Cartel">Cartel</option>
                  <option value="Soumini">Soumini</option>
                  <option value="Marriot">Marriot</option>
                  <option value="Website">Website</option>
                  <option value="SVF">SVF</option>
                  <option value="AME">AME</option>
                  <option value="Caartel Music">Caartel Music</option>
                  <option value="Manipuri Zone">Manipuri Zone</option>
                  <option value="Getgrist">Getgrist</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Note
                </label>
                <input
                  type="text"
                  name="spoc"
                  placeholder="Enter note"
                  value={formData.spoc}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Updated">Updated</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Biography based on Spotify
              </label>
              <textarea
                name="biography"
                placeholder="Enter member biography based on Spotify..."
                value={formData.biography}
                onChange={handleChange}
                rows="4"
                className="input w-full resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-lighter px-6 py-4 flex justify-end space-x-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-primary/30"
            >
              Update Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
