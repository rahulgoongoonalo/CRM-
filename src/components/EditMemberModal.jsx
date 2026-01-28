import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';

const EditMemberModal = ({ isOpen, onClose, onSubmit, member }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    category: 'Premier',
    talentRole: '',
    tier: 'Tier 1',
    source: 'Personal Reference',
    status: 'Active',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        fullName: member.name || '',
        email: member.email || '',
        category: member.category || 'Premier',
        talentRole: member.talentRole || '',
        tier: member.tier || 'Tier 1',
        source: member.source || 'Personal Reference',
        status: member.status || 'Active',
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id: member.id });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1e2a3a] rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <h2 className="text-white text-lg font-semibold">Edit Member - {member.iprsId}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email"
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option>Premier</option>
                  <option>Elite</option>
                  <option>Standard</option>
                </select>
              </div>

              {/* Talent Role */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Talent Role *
                </label>
                <input
                  type="text"
                  name="talentRole"
                  value={formData.talentRole}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Singer, Composer"
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
              </div>

              {/* Tier */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tier *
                </label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option>Tier 1</option>
                  <option>Tier 2</option>
                  <option>Tier 3</option>
                </select>
              </div>

              {/* Source */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Source *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option>Personal Reference</option>
                  <option>Curated Artist</option>
                  <option>Open Inbound</option>
                  <option>Special Curated</option>
                </select>
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option>Active</option>
                  <option>On Hold</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;
