import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';

const NewCampaignModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    campaignName: '',
    subjectLine: '',
    recipients: 'All Members',
    emailContent: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e, saveType) => {
    e.preventDefault();
    onSubmit({ ...formData, saveType });
    setFormData({
      campaignName: '',
      subjectLine: '',
      recipients: 'All Members',
      emailContent: '',
    });
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
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1e2a3a] rounded-lg shadow-2xl w-full max-w-xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <h2 className="text-white text-lg font-semibold">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <form>
            {/* Campaign Name */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                name="campaignName"
                value={formData.campaignName}
                onChange={handleChange}
                placeholder="Enter campaign name..."
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Subject Line */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Subject Line
              </label>
              <input
                type="text"
                name="subjectLine"
                value={formData.subjectLine}
                onChange={handleChange}
                placeholder="Enter email subject..."
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Select Recipients */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Select Recipients
              </label>
              <select
                name="recipients"
                value={formData.recipients}
                onChange={handleChange}
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option>All Members</option>
                <option>Tier 1 Members</option>
                <option>Tier 2 Members</option>
                <option>Tier 3 Members</option>
                <option>Active Members Only</option>
                <option>Premier Category</option>
                <option>Elite Category</option>
              </select>
            </div>

            {/* Email Content */}
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Content (HTML)
              </label>
              <textarea
                name="emailContent"
                value={formData.emailContent}
                onChange={handleChange}
                placeholder="Enter your HTML email content..."
                rows="4"
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none font-mono text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'scheduled')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Schedule Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCampaignModal;
