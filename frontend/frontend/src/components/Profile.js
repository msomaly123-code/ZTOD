// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaHome, 
  FaBuilding,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaConciergeBell
} from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    houseno: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/CustomerLogin');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserData(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        houseno: userData.houseno || ''
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    setLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/customers/${userData.id}/`,
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );

      if (response.data) {
        const updatedUser = { ...userData, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        
        setToastVariant('success');
        setToastMessage('✅ Profile updated successfully!');
        setShowToast(true);
        setEditing(false);
        
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Update error:', error);
      setToastVariant('danger');
      setToastMessage('❌ Failed to update profile');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/CustomerLogin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            toastVariant === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {toastVariant === 'success' ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaTimes className="mr-2" />
                )}
                <span>{toastMessage}</span>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/services" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaConciergeBell className="mr-1" /> Services
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaClipboardList className="mr-1" /> My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm"
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                  <FaUserCircle size={40} />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold">{userData?.name}</h2>
                  <p className="text-gray-500 text-sm">{userData?.email}</p>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium mt-1 inline-block">
                    {userData?.status || 'Active'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
            
            {editing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-sm flex items-center">
                      <FaUser className="mr-1 text-blue-500" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-sm flex items-center">
                      <FaEnvelope className="mr-1 text-blue-500" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-sm flex items-center">
                      <FaPhone className="mr-1 text-blue-500" /> Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-sm flex items-center">
                      <FaHome className="mr-1 text-blue-500" /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-sm flex items-center">
                      <FaBuilding className="mr-1 text-blue-500" /> House Number
                    </label>
                    <input
                      type="text"
                      name="houseno"
                      value={formData.houseno}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Full Name</small>
                  <strong className="text-sm">{userData?.name}</strong>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Email Address</small>
                  <strong className="text-sm">{userData?.email}</strong>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Phone Number</small>
                  <strong className="text-sm">{userData?.phone || 'Not provided'}</strong>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Customer ID</small>
                  <strong className="text-sm">#{userData?.id}</strong>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Address</small>
                  <strong className="text-sm">{userData?.address || 'Not provided'}</strong>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">House Number</small>
                  <strong className="text-sm">{userData?.houseno || 'Not provided'}</strong>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Status</small>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {userData?.status || 'Active'}
                  </span>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <small className="text-gray-500 block text-xs">Role</small>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    Customer
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link to="/services" className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-blue-500 text-2xl mb-2"><FaConciergeBell /></div>
              <h4 className="font-semibold">View Services</h4>
              <p className="text-gray-500 text-sm">Browse available services</p>
            </Link>
            <Link to="/orders" className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-green-500 text-2xl mb-2"><FaClipboardList /></div>
              <h4 className="font-semibold">My Orders</h4>
              <p className="text-gray-500 text-sm">View your order history</p>
            </Link>
            <Link to="/" className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
              <div className="text-purple-500 text-2xl mb-2">🏠</div>
              <h4 className="font-semibold">Home</h4>
              <p className="text-gray-500 text-sm">Return to dashboard</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;