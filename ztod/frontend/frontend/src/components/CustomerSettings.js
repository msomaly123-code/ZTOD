// src/components/CustomerSettings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaSave,
  FaTimes,
  FaEdit,
  FaCamera,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaUserCheck,
  FaIdCard,
  FaHome,
  FaBuilding,
  FaArrowLeft,
  FaTimesCircle,
} from 'react-icons/fa';
import CustomerSideNavbar from './CustomerSideNavbar';

const CustomerSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    houseno: '',
    customerid: '',
    status: '',
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
  });

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Fetch customer profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setLoading(false);
        navigate('/CustomerLogin');
        return;
      }

      // ✅ First, check if user is a customer
      const role = localStorage.getItem('role');
      if (role !== 'customer') {
        console.log('User is not a customer, role:', role);
        // Try to get customer data from localStorage first
        if (userData && userData.id) {
          setProfile({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            houseno: userData.houseno || '',
            customerid: userData.id || '',
            status: userData.status || 'active',
          });
          setLoading(false);
          return;
        }
      }

      // ✅ Try to fetch customer by ID from localStorage
      if (userData && userData.id) {
        const customerResponse = await fetch(`http://localhost:8000/api/customers/${userData.id}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (customerResponse.ok) {
          const customer = await customerResponse.json();
          setProfile({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            houseno: customer.houseno || '',
            customerid: customer.customerid || '',
            status: customer.status || 'active',
          });
          setLoading(false);
          return;
        }
      }

      // ✅ Fallback: Try to get current user and find customer by email
      const response = await fetch('http://localhost:8000/api/me/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          navigate('/CustomerLogin');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      // ✅ Try to find customer by email
      const customerResponse = await fetch(`http://localhost:8000/api/customers/?email=${data.email}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (customerResponse.ok) {
        const customers = await customerResponse.json();
        if (customers.length > 0) {
          const customer = customers[0];
          setProfile({
            name: customer.name || data.name || '',
            email: customer.email || data.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            houseno: customer.houseno || '',
            customerid: customer.customerid || '',
            status: customer.status || 'active',
          });
        } else {
          // Use data from /me/ endpoint
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            houseno: data.houseno || '',
            customerid: data.id || '',
            status: data.status || 'active',
          });
        }
      } else {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          houseno: data.houseno || '',
          customerid: data.id || '',
          status: data.status || 'active',
        });
      }

      // ✅ Update localStorage with latest data
      const updatedUserData = {
        id: profile.customerid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        houseno: profile.houseno,
        status: profile.status,
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToastNotification('Failed to load profile data', 'danger');
      setLoading(false);
    }
  };

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setProfile(prev => ({ ...prev, [name]: digitsOnly }));
      }
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!profile.phone || profile.phone.length !== 10) {
        showToastNotification('Phone number must be exactly 10 digits', 'danger');
        setSaving(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/customers/${profile.customerid}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          houseno: profile.houseno,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = profile.name;
      userData.phone = profile.phone;
      userData.address = profile.address;
      userData.houseno = profile.houseno;
      localStorage.setItem('user', JSON.stringify(userData));

      showToastNotification('✅ Profile updated successfully!', 'success');
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      showToastNotification(`❌ ${error.message || 'Failed to update profile'}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!passwordData.newPassword || passwordData.newPassword.trim() === '') {
      showToastNotification('Password cannot be empty', 'danger');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToastNotification('Password must be at least 6 characters', 'danger');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/update-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      showToastNotification('✅ Password updated successfully!', 'success');
      setPasswordData({
        newPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      showToastNotification(`❌ ${error.message || 'Failed to update password'}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getStatusIcon = (status) => {
    return status === 'active' 
      ? <FaCheckCircle className="text-green-500" /> 
      : <FaTimesCircle className="text-red-500" />;
  };

  if (loading) {
    return (
      <CustomerSideNavbar activeMenu="settings">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="settings">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            toastVariant === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {toastVariant === 'success' ? (
                  <FaCheckCircle className="mr-2 text-lg" />
                ) : (
                  <FaExclamationCircle className="mr-2 text-lg" />
                )}
                <span>{toastMessage}</span>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200 transition"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserCheck className="text-blue-600" /> My Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your profile and account settings
          </p>
        </div>
        <button
          onClick={() => navigate('/CustomerDashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white mx-auto">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shadow-lg">
                  <FaCamera className="text-sm" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-4">{profile.name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${getStatusBadge(profile.status)}`}>
                  {getStatusIcon(profile.status)}
                  {profile.status}
                </span>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Customer
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-500">Customer ID</span>
                  <span className="font-medium text-gray-700">#{profile.customerid}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-700">{profile.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-700">{profile.address || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-500">House No</span>
                  <span className="font-medium text-gray-700">{profile.houseno || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Update Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaUser className="text-blue-600" /> Profile Information
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUser className="inline mr-1 text-blue-500" /> Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`
                        w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                        ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
                      `}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaEnvelope className="inline mr-1 text-blue-500" /> Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      disabled={true}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaPhone className="inline mr-1 text-blue-500" /> Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`
                        w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                        ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
                      `}
                      placeholder="0712345678"
                      maxLength="10"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Exactly 10 digits (numbers only)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaHome className="inline mr-1 text-blue-500" /> Address
                  </label>
                  <div className="relative">
                    <FaHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`
                        w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                        ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
                      `}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaBuilding className="inline mr-1 text-blue-500" /> House Number
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="houseno"
                      value={profile.houseno}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`
                        w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                        ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
                      `}
                      placeholder="Enter house number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUserCheck className="inline mr-1 text-blue-500" /> Status
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.status || 'active'}
                      disabled={true}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed capitalize"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaLock className="text-blue-600" /> Change Password
            </h3>
            
            <form onSubmit={handleUpdatePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Enter new password (min 6 characters)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaLock />}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaIdCard className="text-blue-600" /> Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Customer ID</p>
                <p className="font-medium text-gray-800">#{profile.customerid}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-800">Customer</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(profile.status)}`}>
                  {getStatusIcon(profile.status)}
                  {profile.status}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="sm:col-span-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium text-gray-800">
                  {profile.address || 'N/A'} 
                  {profile.houseno && `, House ${profile.houseno}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
      `}</style>
    </CustomerSideNavbar>
  );
};

export default CustomerSettings;