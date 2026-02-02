import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { onboardingAPI } from '../services/api';

const EditL1QuestionnaireModal = ({ isOpen, onClose, onboarding }) => {
  const [formData, setFormData] = useState({
    // Artist Basics
    artistName: '',
    primaryContact: '',
    email: '',
    phone: '',
    cityCountry: '',
    yearsActive: '',
    artistBio: '',
    // Representation
    hasManager: 'No',
    managerName: '',
    hasLabel: 'No',
    labelName: '',
    // Music & Identity
    primaryRole: '',
    primaryGenres: '',
    languages: '',
    subGenre: '',
    // Streaming & Social Media
    streamingLink: '',
    youtube: '',
    instagram: '',
    otherPlatforms: '',
    // Existing Contracts
    hasDistributor: 'No',
    distributorName: '',
    hasContracts: 'No',
    contractValidUntil: '',
    // Goongoonalo Participation
    exclusiveReleases: 'Yes',
    openToCollabs: 'Yes',
    whyGoongoonalo: '',
    howHeard: '',
    // KYC Information
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    aadharNumber: '',
    // Agreements
    confirmRights: false,
    acceptTerms: false,
    consentEditorial: false,
    understandPayout: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && onboarding?.l1QuestionnaireData) {
      const data = onboarding.l1QuestionnaireData;
      setFormData({
        artistName: data.artistName || '',
        primaryContact: data.primaryContact || '',
        email: data.email || '',
        phone: data.phone || '',
        cityCountry: data.cityCountry || '',
        yearsActive: data.yearsActive || '',
        artistBio: data.artistBio || '',
        hasManager: data.hasManager || 'No',
        managerName: data.managerName || '',
        hasLabel: data.hasLabel || 'No',
        labelName: data.labelName || '',
        primaryRole: data.primaryRole || '',
        primaryGenres: data.primaryGenres || '',
        languages: data.languages || '',
        subGenre: data.subGenre || '',
        streamingLink: data.streamingLink || '',
        youtube: data.youtube || '',
        instagram: data.instagram || '',
        otherPlatforms: data.otherPlatforms || '',
        hasDistributor: data.hasDistributor || 'No',
        distributorName: data.distributorName || '',
        hasContracts: data.hasContracts || 'No',
        contractValidUntil: data.contractValidUntil || '',
        exclusiveReleases: data.exclusiveReleases || 'Yes',
        openToCollabs: data.openToCollabs || 'Yes',
        whyGoongoonalo: data.whyGoongoonalo || '',
        howHeard: data.howHeard || '',
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        ifscCode: data.ifscCode || '',
        panNumber: data.panNumber || '',
        aadharNumber: data.aadharNumber || '',
        confirmRights: data.confirmRights || false,
        acceptTerms: data.acceptTerms || false,
        consentEditorial: data.consentEditorial || false,
        understandPayout: data.understandPayout || false,
      });
    }
  }, [isOpen, onboarding]);

  if (!isOpen || !onboarding) return null;

  const taskId = onboarding.taskNumber || 'N/A';
  const memberName = onboarding.memberName || onboarding.member?.name || 'N/A';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all checkboxes are checked
    if (!formData.confirmRights || !formData.acceptTerms || !formData.consentEditorial || !formData.understandPayout) {
      alert('Please check all agreement checkboxes before submitting the questionnaire.');
      return;
    }
    
    try {
      setSaving(true);
      const response = await onboardingAPI.updateL1Questionnaire(onboarding._id, formData);
      
      if (response.success) {
        alert('L1 Questionnaire updated successfully!');
        onClose(true); // Pass true to indicate data was updated
      }
    } catch (error) {
      console.error('Error updating L1 questionnaire:', error);
      alert('Failed to update L1 questionnaire');
    } finally {
      setSaving(false);
    }
  };
  
  // Check if all agreement checkboxes are checked
  const allAgreementsChecked = formData.confirmRights && formData.acceptTerms && formData.consentEditorial && formData.understandPayout;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      ></div>
      
      <div className="relative bg-[#1e2a3a] rounded-lg w-full max-w-4xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit L1 Questionnaire</h2>
            <p className="text-green-100 text-sm">Task ID: {taskId} | Member: {memberName}</p>
            <p className="text-green-100 text-xs mt-1">Only Artist Name and Phone are required</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 rounded p-1"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ARTIST BASICS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">ARTIST BASICS</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Artist / Band Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    name="primaryContact"
                    value={formData.primaryContact}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City / Country
                  </label>
                  <input
                    type="text"
                    name="cityCountry"
                    value={formData.cityCountry}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Years Active
                  </label>
                  <input
                    type="text"
                    name="yearsActive"
                    value={formData.yearsActive}
                    onChange={handleChange}
                    placeholder="e.g., 2015-present"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist Bio / Background
                </label>
                <textarea
                  name="artistBio"
                  value={formData.artistBio}
                  onChange={handleChange}
                  placeholder="Tell us about your musical journey..."
                  rows="3"
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            {/* REPRESENTATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">REPRESENTATION</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Do you have a manager?
                  </label>
                  <select
                    name="hasManager"
                    value={formData.hasManager}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Are you signed to a label?
                  </label>
                  <select
                    name="hasLabel"
                    value={formData.hasLabel}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {(formData.hasManager === 'Yes' || formData.hasLabel === 'Yes') && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.hasManager === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manager Name
                      </label>
                      <input
                        type="text"
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleChange}
                        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  {formData.hasLabel === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Label Name
                      </label>
                      <input
                        type="text"
                        name="labelName"
                        value={formData.labelName}
                        onChange={handleChange}
                        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MUSIC & IDENTITY */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">MUSIC & IDENTITY</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="primaryRole"
                    value={formData.primaryRole}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Singer, Producer, Rapper"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Genre(s) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="primaryGenres"
                    value={formData.primaryGenres}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Pop, Hip-Hop, Electronic"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language(s) of Music
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="e.g., English, Hindi, Punjabi"
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sub-genre / Style
                </label>
                <input
                  type="text"
                  name="subGenre"
                  value={formData.subGenre}
                  onChange={handleChange}
                  placeholder="e.g., Indie Pop, Trap, Deep House"
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* STREAMING & SOCIAL MEDIA */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">STREAMING & SOCIAL MEDIA</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Streaming Platform Link
                </label>
                <input
                  type="url"
                  name="streamingLink"
                  value={formData.streamingLink}
                  onChange={handleChange}
                  placeholder="Spotify, Apple Music, etc."
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    YouTube Channel
                  </label>
                  <input
                    type="url"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Other Platforms
                </label>
                <input
                  type="text"
                  name="otherPlatforms"
                  value={formData.otherPlatforms}
                  onChange={handleChange}
                  placeholder="TikTok, SoundCloud, etc."
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* EXISTING CONTRACTS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">EXISTING CONTRACTS</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Distributor?
                  </label>
                  <select
                    name="hasDistributor"
                    value={formData.hasDistributor}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Existing Contracts?
                  </label>
                  <select
                    name="hasContracts"
                    value={formData.hasContracts}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {(formData.hasDistributor === 'Yes' || formData.hasContracts === 'Yes') && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.hasDistributor === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Distributor Name
                      </label>
                      <input
                        type="text"
                        name="distributorName"
                        value={formData.distributorName}
                        onChange={handleChange}
                        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  {formData.hasContracts === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contract Valid Until
                      </label>
                      <input
                        type="date"
                        name="contractValidUntil"
                        value={formData.contractValidUntil}
                        onChange={handleChange}
                        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GOONGOONALO PARTICIPATION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">GOONGOONALO PARTICIPATION</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interested in exclusive releases?
                  </label>
                  <select
                    name="exclusiveReleases"
                    value={formData.exclusiveReleases}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Maybe">Maybe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Open to collaborations?
                  </label>
                  <select
                    name="openToCollabs"
                    value={formData.openToCollabs}
                    onChange={handleChange}
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Maybe">Maybe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Why Goongoonalo?
                </label>
                <textarea
                  name="whyGoongoonalo"
                  value={formData.whyGoongoonalo}
                  onChange={handleChange}
                  placeholder="What attracted you to Goongoonalo?"
                  rows="2"
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How did you hear about us?
                </label>
                <input
                  type="text"
                  name="howHeard"
                  value={formData.howHeard}
                  onChange={handleChange}
                  placeholder="Referral, social media, search, etc."
                  className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* KYC INFORMATION */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">KYC INFORMATION</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="Enter PAN number"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="Enter Aadhar number"
                    className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* AGREEMENTS */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-600 pb-2">AGREEMENTS</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg cursor-pointer hover:bg-[#374152] transition-colors">
                  <input
                    type="checkbox"
                    name="confirmRights"
                    checked={formData.confirmRights}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <span className="text-white text-sm">I confirm I have the rights to the music I will distribute</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg cursor-pointer hover:bg-[#374152] transition-colors">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <span className="text-white text-sm">I accept the terms and conditions</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg cursor-pointer hover:bg-[#374152] transition-colors">
                  <input
                    type="checkbox"
                    name="consentEditorial"
                    checked={formData.consentEditorial}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <span className="text-white text-sm">I consent to editorial features and promotions</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#2c3e50] border border-slate-600 rounded-lg cursor-pointer hover:bg-[#374152] transition-colors">
                  <input
                    type="checkbox"
                    name="understandPayout"
                    checked={formData.understandPayout}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <span className="text-white text-sm">I understand the artist-first payout model</span>
                </label>
              </div>
            </div>

            {/* Buttons at the end of form */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !allAgreementsChecked}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Update Questionnaire'}
              </button>
            </div>
            {!allAgreementsChecked && (
              <p className="text-yellow-400 text-sm mt-2">
                Please check all agreement checkboxes to update the questionnaire
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditL1QuestionnaireModal;
