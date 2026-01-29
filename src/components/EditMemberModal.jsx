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
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    aadharNumber: '',
  });

  useEffect(() => {
    if (member) {
      const notes = member.notes ? member.notes.split(', ') : [];
      const category = notes.find(n => n.startsWith('Category:'))?.split(': ')[1] || member.category || 'Premier';
      const talentRole = notes.find(n => n.startsWith('Role:'))?.split(': ')[1] || member.talentRole || '';
      const source = notes.find(n => n.startsWith('Source:'))?.split(': ')[1] || member.source || 'Personal Reference';
      
      setFormData({
        fullName: member.name || '',
        aliasName: member.aliasName || '',
        email: member.email || '',
        contactNumber: member.phone || '',
        alternateNumber: member.alternateNumber || '',
        country: member.address || '',
        category: member.category || category,
        tier: member.tier || 'Tier 1',
        talentRole: member.talentRole || talentRole,
        talentType: member.talentType || '',
        genre: member.genre || '',
        source: member.source || source,
        spoc: member.spoc || '',
        status: member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || 'Active',
        biography: member.biography || '',
        bankName: member.bankName || '',
        accountNumber: member.accountNumber || '',
        ifscCode: member.ifscCode || '',
        panNumber: member.panNumber || '',
        aadharNumber: member.aadharNumber || '',
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Member - {member?.iprsId}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-lg p-1 transition-colors"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alias Name
                </label>
                <input
                  type="text"
                  name="aliasName"
                  placeholder="Enter alias/stage name"
                  value={formData.aliasName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Number
                </label>
                <input
                  type="tel"
                  name="alternateNumber"
                  placeholder="Enter alternate number"
                  value={formData.alternateNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Premier">Premier</option>
                  <option value="Elite">Elite</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tier <span className="text-red-400">*</span>
                </label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select tier</option>
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Talent Role <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="talentRole"
                  placeholder="e.g., Singer, Composer, Lyricist"
                  value={formData.talentRole}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Talent Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="talentType"
                  value={formData.talentType}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  placeholder="e.g., Bollywood, Pop, Classical"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source <span className="text-red-400">*</span>
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select source</option>
                  <option value="Personal Reference">Personal Reference</option>
                  <option value="Curated Artist">Curated Artist</option>
                  <option value="Open Inbound">Open Inbound</option>
                  <option value="Special Curated">Special Curated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note
                </label>
                <input
                  type="text"
                  name="spoc"
                  placeholder="Enter note"
                  value={formData.spoc}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biography
              </label>
              <textarea
                name="biography"
                placeholder="Enter member biography..."
                value={formData.biography}
                onChange={handleChange}
                rows="4"
                className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
              ></textarea>
            </div>

            {/* KYC Information */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">KYC Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    placeholder="Enter IFSC code"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    placeholder="Enter PAN number"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    placeholder="Enter Aadhar number"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 px-6 py-4 flex justify-end space-x-3 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
