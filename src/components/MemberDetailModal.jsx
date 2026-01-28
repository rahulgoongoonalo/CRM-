import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';

const MemberDetailModal = ({ isOpen, onClose, member }) => {
  const [activeTab, setActiveTab] = useState('Music Works');

  if (!isOpen || !member) return null;

  const tabs = ['Music Works', 'Performance', 'Claims', 'Disputes', 'Pay-outs', 'IDs'];

  const agreements = [
    { no: 'A-2019-00100', description: 'Assignment Deal', startDate: '01-Jan-2020', endDate: '31-Dec-2021', country: 'India', status: 'Approved' },
    { no: 'A-2020-00203', description: 'Assignment Deal', startDate: '15-Jan-2020', endDate: '14-Jan-2021', country: 'India', status: 'Expired' },
    { no: 'A-2020-00301', description: 'Assignment Deal', startDate: '1-Apr-2020', endDate: '31-Mar-2021', country: 'India', status: 'Approved' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[#1a2332] rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">MEMBER VIEW</span>
            <span className="text-white text-sm">›</span>
            <span className="text-white font-semibold">{member.name} ({member.iprsId})</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white text-blue-600 px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
              Export
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-lg p-1 transition-colors"
            >
              <RiCloseLine className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 bg-[#0f1419]">
          <div className="grid grid-cols-12 gap-4">
            {/* Profile Image and Member/Contact Info Row */}
            <div className="col-span-2">
              <div className="bg-[#1a2332] rounded-lg p-4 border border-slate-700/50 flex flex-col items-center justify-center h-full">
                <div className="bg-slate-700 text-white font-bold w-20 h-20 rounded-lg flex items-center justify-center text-2xl mb-3">
                  {member.avatar}
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-semibold">{member.name}</p>
                </div>
              </div>
            </div>

            {/* Member Details */}
            <div className="col-span-5">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50 h-full">
                <h3 className="text-blue-400 font-semibold text-xs mb-4 uppercase tracking-wide">Member Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Category</span>
                    <span className="text-white text-sm font-medium">{member.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Talent Role</span>
                    <span className="text-white text-sm font-medium">{member.talentRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Name</span>
                    <span className="text-white text-sm font-medium">{member.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Alias</span>
                    <span className="text-white text-sm font-medium">{member.avatar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Email</span>
                    <span className="text-blue-400 text-sm font-medium">{member.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-span-5">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50 h-full">
                <h3 className="text-blue-400 font-semibold text-xs mb-4 uppercase tracking-wide">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">IPRS ID</span>
                    <span className="text-white text-sm font-medium">{member.iprsId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Contact No.</span>
                    <span className="text-white text-sm font-medium">0038465478</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Alternate No.</span>
                    <span className="text-white text-sm font-medium">0038465479</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Country</span>
                    <span className="text-white text-sm font-medium">India</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Talent Type</span>
                    <span className="text-white text-sm font-medium">Individual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography and IP Details in same row */}
            <div className="col-span-7">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50 h-full">
                <h3 className="text-blue-400 font-semibold text-xs mb-3 uppercase tracking-wide">Biography</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  An Indian playback singer. Born in Delhi, she began performing in local gatherings at the age of four and made her career debut at the age of 12, with the film Shastra.
                </p>
              </div>
            </div>

            <div className="col-span-5">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50 h-full">
                <h3 className="text-blue-400 font-semibold text-xs mb-3 uppercase tracking-wide">IP Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-[#2d3748] text-white border border-slate-600'
                          : 'bg-[#0f1419] text-gray-400 hover:bg-[#2d3748] hover:text-white border border-slate-700/50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KYC Information */}
            <div className="col-span-12">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-blue-400 font-semibold text-xs uppercase tracking-wide">KYC Information</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-xs">Digital Pay-out Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">Bank Name</span>
                    <span className="text-white text-sm font-medium">Kotak Mahindra Bank</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">PAN NO</span>
                    <span className="text-white text-sm font-medium">0038465479</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">A/C No</span>
                    <span className="text-white text-sm font-medium">0038465479</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">AADHAR</span>
                    <span className="text-white text-sm font-medium">0038465479</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">IFSC</span>
                    <span className="text-white text-sm font-medium">0038465479</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="col-span-12">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50">
                <h3 className="text-blue-400 font-semibold text-xs mb-4 uppercase tracking-wide">Agreements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-700/50">
                      <tr>
                        <th className="text-left text-gray-500 text-xs font-semibold pb-3 uppercase">Agreement No.</th>
                        <th className="text-left text-gray-500 text-xs font-semibold pb-3 uppercase">Description</th>
                        <th className="text-left text-gray-500 text-xs font-semibold pb-3 uppercase">Start Date</th>
                        <th className="text-left text-gray-500 text-xs font-semibold pb-3 uppercase">End Date</th>
                        <th className="text-left text-gray-500 text-xs font-semibold pb-3 uppercase">Country</th>
                        <th className="text-left text-gray-500 text-xs font-semibold pb-3 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreements.map((agreement, index) => (
                        <tr key={index} className="border-b border-slate-700/30">
                          <td className="py-3 text-blue-400 text-sm">{agreement.no}</td>
                          <td className="py-3 text-white text-sm">{agreement.description}</td>
                          <td className="py-3 text-white text-sm">{agreement.startDate}</td>
                          <td className="py-3 text-white text-sm">{agreement.endDate}</td>
                          <td className="py-3 text-white text-sm">{agreement.country}</td>
                          <td className="py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              agreement.status === 'Approved'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {agreement.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-start">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#1a2332] text-white rounded-lg hover:bg-[#2d3748] transition-colors border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
