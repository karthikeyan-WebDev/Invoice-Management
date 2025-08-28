
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    tax_id: '',
  });

  useEffect(() => {
    setLoading(true);
    axios.get('/api/business-profiles/')
      .then(res => {
        if (res.data.length > 0) {
          setProfile(res.data[0]);
          setFormData(res.data[0]);
        }
      })
      .catch(err => console.error('Error fetching profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = {
      ...formData,
      website: formData.website && !formData.website.startsWith('http')
        ? 'https://' + formData.website
        : formData.website
    };

    if (profile) {
      axios.post(`/api/business-profiles/${profile.id}/update-profile/`, dataToSubmit)
        .then(() => alert('Profile updated successfully!'))
        .catch(err => console.error('Update failed:', err.response?.data || err.message))
        .finally(() => setLoading(false));
    } else {
      axios.post('/api/business-profiles/', dataToSubmit)
        .then(res => {
          setProfile(res.data);
          alert('Profile created successfully!');
        })
        .catch(err => console.error('Creation failed:', err.response?.data || err.message))
        .finally(() => setLoading(false));
    }
  };

  const getFieldType = (field) => {
    switch (field) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      case 'website': return 'url';
      default: return 'text';
    }
  };

  const getFieldIcon = (field) => {
    const icons = {
      business_name: '🏢',
      address: '📍',
      phone: '📞',
      email: '✉️',
      website: '🌐',
      tax_id: '🏷️'
    };
    return icons[field] || '📝';
  };

  const fieldLabels = {
    business_name: 'Business Name',
    address: 'Business Address',
    phone: 'Phone Number',
    email: 'Email Address',
    website: 'Website URL',
    tax_id: 'Tax ID Number'
  };

  if (loading && !profile) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile ? 'Business Profile' : 'Create Business Profile'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {profile ? 'Update your business information' : 'Set up your business profile to get started'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['business_name', 'address', 'phone', 'email', 'website', 'tax_id'].map(field => (
                  <div key={field} className={field === 'address' ? 'md:col-span-2' : ''}>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-lg">{getFieldIcon(field)}</span>
                      <span>{fieldLabels[field]}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={getFieldType(field)}
                        name={field}
                        value={formData[field] || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                        placeholder={`Enter your ${fieldLabels[field].toLowerCase()}`}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    onClick={() => window.location.reload()}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{profile ? '💾 Update Profile' : '✨ Create Profile'}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Additional Info Card */}
          {profile && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mt-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Profile Tips</h3>
                  <p className="text-blue-700 text-sm">
                    Keep your business information up to date to ensure smooth operations and better customer communication.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
