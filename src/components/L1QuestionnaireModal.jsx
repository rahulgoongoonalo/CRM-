import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';
import { onboardingAPI } from '../services/api';
import { useToast } from './ToastNotification';

const L1QuestionnaireModal = ({ isOpen, onClose, onboardingId, memberName, taskId }) => {
  const [formData, setFormData] = useState({
    // Artist Basics
    artistName: '',
    primaryContact: '',
    email: '',
    phone: '',
    cityCountry: '',
    yearsActive: '',
    artistBio: '',
    listenerRegion: '',
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
    facebook: '',
    twitter: '',
    soundcloud: '',
    otherPlatforms: '',
    // Existing Contracts
    hasDistributor: 'No',
    distributorName: '',
    hasContracts: 'No',
    contractValidUntil: '',
    // Goongoonalo Participation
    exclusiveReleases: 'Yes',
    openToCollabs: 'Yes',
    performLive: '',
    upcomingProject: '',
    interestedInGatecrash: 'No',
    whyGoongoonalo: '',
    howHeard: '',
    otherInfo: '',
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
  const toast = useToast();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate streaming & social media fields are filled
    const streamingFields = ['streamingLink', 'youtube', 'instagram', 'facebook', 'twitter', 'soundcloud', 'otherPlatforms'];
    const missingStreaming = streamingFields.filter(f => !formData[f]?.trim());
    if (missingStreaming.length > 0) {
      toast.warning('Please fill in all Streaming & Social Media fields before submitting.');
      return;
    }

    // Validate all checkboxes are checked
    if (!formData.confirmRights || !formData.acceptTerms || !formData.consentEditorial || !formData.understandPayout) {
      toast.warning('Please check all agreement checkboxes before submitting the questionnaire.');
      return;
    }
    
    try {
      setSaving(true);
      const response = await onboardingAPI.updateL1Questionnaire(onboardingId, formData);
      
      if (response.success) {
        toast.success('L1 Questionnaire submitted successfully! Status updated to Review for L2.');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting L1 questionnaire:', error);
      toast.error('Failed to submit L1 questionnaire');
    } finally {
      setSaving(false);
    }
  };
  
  // Check if all agreement checkboxes are checked
  const allAgreementsChecked = formData.confirmRights && formData.acceptTerms && formData.consentEditorial && formData.understandPayout;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      ></div>
      
      <div className="relative bg-[#1e2a3a] rounded-lg w-full max-w-4xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-white">L1 Questionnaire - Initial Contact</h2>
            <p className="text-green-100 text-sm">Fill in the questionnaire details</p>
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
          <form onSubmit={handleSubmit} id="l1-questionnaire-form">
            {/* ARTIST BASICS */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">ARTIST BASICS</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Artist / Band Name
                  </label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    name="primaryContact"
                    value={formData.primaryContact}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    City & Country
                  </label>
                  <input
                    type="text"
                    name="cityCountry"
                    value={formData.cityCountry}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Year Actively in Music
                  </label>
                  <input
                    type="text"
                    name="yearsActive"
                    value={formData.yearsActive}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5 text-left">
                  Short Artist Bio
                </label>
                <textarea
                  name="artistBio"
                  value={formData.artistBio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5 text-left">
                  Listener Region
                </label>
                <input
                  type="text"
                  name="listenerRegion"
                  value={formData.listenerRegion}
                  onChange={handleChange}
                  placeholder="e.g., India, USA, Global"
                  className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* REPRESENTATION */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">REPRESENTATION</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Do you have a manager?
                  </label>
                  <select
                    name="hasManager"
                    value={formData.hasManager}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Manager Name (if yes)
                  </label>
                  <input
                    type="text"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Are you signed to a label?
                  </label>
                  <select
                    name="hasLabel"
                    value={formData.hasLabel}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Label Name (if yes)
                  </label>
                  <input
                    type="text"
                    name="labelName"
                    value={formData.labelName}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* MUSIC & IDENTITY */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">MUSIC & IDENTITY</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Primary Role(s)
                  </label>
                  <input
                    type="text"
                    name="primaryRole"
                    value={formData.primaryRole}
                    onChange={handleChange}
                    placeholder="Singer, Composer, Lyricist..."
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Primary Genres
                  </label>
                  <input
                    type="text"
                    name="primaryGenres"
                    value={formData.primaryGenres}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1.5 text-left">
                  Languages You Create In
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1.5 text-left">
                  Sub-Genre / Style
                </label>
                <input
                  type="text"
                  name="subGenre"
                  value={formData.subGenre}
                  onChange={handleChange}
                  className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* STREAMING & SOCIAL MEDIA */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">STREAMING & SOCIAL MEDIA</h3>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1.5 text-left">
                  Streaming Platform Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="streamingLink"
                  value={formData.streamingLink}
                  onChange={handleChange}
                  required
                  placeholder="Spotify, Apple Music, etc."
                  className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
<div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    YouTube Channel <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Instagram Profile <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Facebook Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Twitter Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    SoundCloud Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="soundcloud"
                    value={formData.soundcloud}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Other Platforms <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherPlatforms"
                    value={formData.otherPlatforms}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* EXISTING CONTRACTS */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">EXISTING CONTRACTS</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Do you have a music distributor?
                  </label>
                  <select
                    name="hasDistributor"
                    value={formData.hasDistributor}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Distributor Name (if yes)
                  </label>
                  <input
                    type="text"
                    name="distributorName"
                    value={formData.distributorName}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Any ongoing contracts?
                  </label>
                  <select
                    name="hasContracts"
                    value={formData.hasContracts}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Contract Valid Until
                  </label>
                  <input
                    type="text"
                    name="contractValidUntil"
                    value={formData.contractValidUntil}
                    onChange={handleChange}
                    placeholder="dd-mm-yyyy"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* GOONGOONALO PARTICIPATION */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">GOONGOONALO PARTICIPATION</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Open to Goongoonalo exclusive releases?
                  </label>
                  <select
                    name="exclusiveReleases"
                    value={formData.exclusiveReleases}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>Yes</option>
                    <option>No</option>
                    <option>Maybe</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Open to Collaborations?
                  </label>
                  <select
                    name="openToCollabs"
                    value={formData.openToCollabs}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>Yes</option>
                    <option>No</option>
                    <option>Maybe</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Why Goongoonalo?
                  </label>
                  <input
                    type="text"
                    name="whyGoongoonalo"
                    value={formData.whyGoongoonalo}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    name="howHeard"
                    value={formData.howHeard}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Perform Live?
                  </label>
                  <input
                    type="text"
                    name="performLive"
                    value={formData.performLive}
                    onChange={handleChange}
                    placeholder="Yes/No or frequency"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Upcoming Project
                  </label>
                  <input
                    type="text"
                    name="upcomingProject"
                    value={formData.upcomingProject}
                    onChange={handleChange}
                    placeholder="Brief description"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Interested in Gatecrash?
                  </label>
                  <select
                    name="interestedInGatecrash"
                    value={formData.interestedInGatecrash}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Other Info
                  </label>
                  <input
                    type="text"
                    name="otherInfo"
                    value={formData.otherInfo}
                    onChange={handleChange}
                    placeholder="Any additional information"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* KYC INFORMATION */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">KYC INFORMATION</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="Enter PAN number"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="Enter Aadhar number"
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* AGREEMENTS */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">AGREEMENTS</h3>
              
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
                {saving ? 'Submitting...' : 'Submit Questionnaire'}
              </button>
            </div>
            {!allAgreementsChecked && (
              <p className="text-yellow-400 text-sm mt-2">
                Please check all agreement checkboxes to submit the questionnaire
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default L1QuestionnaireModal;
