import { RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';

const L1QuestionnaireModal = ({ isOpen, onClose, memberName, taskId }) => {
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
    // Agreements
    confirmRights: false,
    acceptTerms: false,
    consentEditorial: false,
    understandPayout: false,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('L1 Questionnaire submitted:', formData);
    onClose();
  };

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
            <h2 className="text-xl font-semibold text-white">L1 Questionnaire - Initial Contact</h2>
            <p className="text-green-100 text-sm">All fields marked * are mandatory</p>
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
                    Artist / Band Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Primary Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="primaryContact"
                    value={formData.primaryContact}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    City & Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="cityCountry"
                    value={formData.cityCountry}
                    onChange={handleChange}
                    required
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
                    Primary Role(s) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="primaryRole"
                    value={formData.primaryRole}
                    onChange={handleChange}
                    placeholder="Singer, Composer, Lyricist..."
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Primary Genres <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="primaryGenres"
                    value={formData.primaryGenres}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Languages You Create In <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    required
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
            </div>

            {/* STREAMING & SOCIAL MEDIA */}
            <div className="mb-6">
              <h3 className="text-blue-400 font-semibold text-lg mb-4">STREAMING & SOCIAL MEDIA</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Streaming Platform Link
                  </label>
                  <input
                    type="text"
                    name="streamingLink"
                    value={formData.streamingLink}
                    onChange={handleChange}
                    placeholder="Spotify, Apple Music, etc."
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    YouTube Channel
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Instagram Profile
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full bg-[#2c3e50] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5 text-left">
                    Other Platforms
                  </label>
                  <input
                    type="text"
                    name="otherPlatforms"
                    value={formData.otherPlatforms}
                    onChange={handleChange}
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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Submit Questionnaire
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default L1QuestionnaireModal;
