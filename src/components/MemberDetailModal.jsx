import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';

const MemberDetailModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

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
            <span className="text-white font-semibold">{member.name} ({member.memberId})</span>
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
                    <span className="text-white text-sm font-medium">{member.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Talent Role</span>
                    <span className="text-white text-sm font-medium">{member.talentRole || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Talent Type</span>
                    <span className="text-white text-sm font-medium">{member.talentType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Genre</span>
                    <span className="text-white text-sm font-medium">{member.genre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Name</span>
                    <span className="text-white text-sm font-medium">{member.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Alias Name</span>
                    <span className="text-white text-sm font-medium">{member.aliasName || 'N/A'}</span>
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
                    <span className="text-gray-500 text-sm">Member ID</span>
                    <span className="text-white text-sm font-medium">{member.memberId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Contact No.</span>
                    <span className="text-white text-sm font-medium">{member.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Alternate No.</span>
                    <span className="text-white text-sm font-medium">{member.alternateNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Country</span>
                    <span className="text-white text-sm font-medium">{member.address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Note</span>
                    <span className="text-white text-sm font-medium">{member.spoc || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Status</span>
                    <span className="text-white text-sm font-medium">{member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Membership Tier</span>
                    <span className="text-white text-sm font-medium">{member.tier || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="col-span-12">
              <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50">
                <h3 className="text-blue-400 font-semibold text-xs mb-3 uppercase tracking-wide">Additional Information</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Source</span>
                    <span className="text-white text-sm font-medium">{member.source || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Membership Type</span>
                    <span className="text-white text-sm font-medium">{member.membershipType?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Join Date</span>
                    <span className="text-white text-sm font-medium">
                      {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Member Since</span>
                    <span className="text-white text-sm font-medium">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            {member.biography && (
              <div className="col-span-12">
                <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50">
                  <h3 className="text-blue-400 font-semibold text-xs mb-3 uppercase tracking-wide">Biography</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {member.biography}
                  </p>
                </div>
              </div>
            )}

            {/* KYC Information */}
            {(member.bankName || member.accountNumber || member.ifscCode || member.panNumber || member.aadharNumber) && (
              <div className="col-span-12">
                <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50">
                  <h3 className="text-blue-400 font-semibold text-xs mb-4 uppercase tracking-wide">KYC Information</h3>
                  <div className="grid grid-cols-5 gap-6">
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">Bank Name</span>
                      <span className="text-white text-sm font-medium">{member.bankName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">Account Number</span>
                      <span className="text-white text-sm font-medium">{member.accountNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">IFSC Code</span>
                      <span className="text-white text-sm font-medium">{member.ifscCode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">PAN Number</span>
                      <span className="text-white text-sm font-medium">{member.panNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">Aadhar Number</span>
                      <span className="text-white text-sm font-medium">{member.aadharNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {member.notes && (
              <div className="col-span-12">
                <div className="bg-[#1a2332] rounded-lg p-5 border border-slate-700/50">
                  <h3 className="text-blue-400 font-semibold text-xs mb-3 uppercase tracking-wide">Notes</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {member.notes}
                  </p>
                </div>
              </div>
            )}

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
