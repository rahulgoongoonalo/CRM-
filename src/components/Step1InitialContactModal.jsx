import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';
import { usePicklist } from '../hooks/usePicklist';

const Step1InitialContactModal = ({ isOpen, onClose, memberName, taskId }) => {
  const { items: sourceOptions } = usePicklist('source');
  const { items: contactStatusOptions } = usePicklist('contactStatus');

  const [formData, setFormData] = useState({
    source: 'Personal Reference',
    contactStatus: 'New',
    notes: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (saveType) => {
    console.log('Saving:', saveType, formData);
    // Handle submission logic here
    if (saveType === 'submit') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1e2a3a] rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-blue-600 rounded-t-lg">
          <div>
            <h2 className="text-white text-lg font-semibold">Step 1: Initial Contact</h2>
            <p className="text-blue-100 text-sm">New Member • {taskId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <RiCloseLine className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <form>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Source */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Source <span className="text-red-400">*</span>
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">Select source</option>
                  {sourceOptions.map(item => (
                    <option key={item._id} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* Contact Status */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Contact Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="contactStatus"
                  value={formData.contactStatus}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {contactStatusOptions.map(item => (
                    <option key={item._id} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* L1 Questionnaire */}
            <div className="mb-4 bg-[#2d3748] rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-white mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">L1 Questionnaire</span>
                  </div>
                  <p className="text-gray-400 text-sm">Complete the initial contact questionnaire</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Open Questionnaire
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows="2"
                className="w-full bg-[#2d3748] text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-start space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('save')}
                className="px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Save Progress
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('submit')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Submit for L2 Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Step1InitialContactModal;
