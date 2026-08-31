// src/components/CustomerRegister.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaHome, 
  FaBuilding,
  FaUser,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaUserCheck,
  FaIdCard,
  FaTimes,
  FaArrowLeft,
} from 'react-icons/fa';
import axios from 'axios';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('danger');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredCustomer, setRegisteredCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    houseno: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    houseno: '',
    general: ''
  });

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const re = /^(0[0-9]{9}|255[0-9]{9})$/;
    return re.test(cleanPhone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    let isValid = true;
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number';
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    if (!formData.houseno.trim()) {
      newErrors.houseno = 'House number is required';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        houseno: formData.houseno.trim(),
        role: 'customer'
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', 'customer');
        
        setRegisteredCustomer(response.data.user);
        setShowSuccessModal(true);
        
        setToastVariant('success');
        setToastMessage('Citizen Registration successful!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (errorData.error && errorData.error.includes('Email already exists')) {
          setToastVariant('danger');
          setToastMessage(' Customer with this email already exists!');
          setShowToast(true);
        } else if (errorData.error) {
          setToastVariant('danger');
          setToastMessage(`❌ ${errorData.error}`);
          setShowToast(true);
        } else {
          setToastVariant('danger');
          setToastMessage('Registration failed. Please try again.');
          setShowToast(true);
        }
      } else {
        setToastVariant('danger');
        setToastMessage('Network error. Please check your connection.');
        setShowToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setRegisteredCustomer(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      houseno: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/body.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            toastVariant === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {toastVariant === 'success' ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaExclamationCircle className="mr-2" />
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

     
           
                    

             
            
            

     

      {/* Registration Form - Reduced Size */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-lg">
          {/* Glass Container - Reduced padding */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-5 border border-white/20 animate-float">
            
            {/* Header - Smaller */}
            <div className="text-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/30 animate-pulse-slow">
                <FaUserPlus size={26} />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-white/60 text-xs">Register as a customer to book services</p>
            </div>

            {/* Error Messages */}
            {errors.general && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 px-3 py-1.5 rounded-lg text-xs flex items-center mb-3">
                <FaExclamationCircle className="mr-1.5" /> {errors.general}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Full Name */}
                <div>
                  <label className="font-semibold text-xs flex items-center text-white/80 mb-0.5">
                    <FaUser className="mr-1.5 text-blue-400" /> Full Name <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.name ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300`}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="font-semibold text-xs flex items-center text-white/80 mb-0.5">
                    <FaEnvelope className="mr-1.5 text-blue-400" /> Email <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.email ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300`}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Password */}
                <div>
                  <label className="font-semibold text-xs flex items-center text-white/80 mb-0.5">
                    <FaLock className="mr-1.5 text-blue-400" /> Password <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-1.5 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                        errors.password ? 'border-red-400/50' : 'border-white/20'
                      } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 pr-9`}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80"
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="font-semibold text-xs flex items-center text-white/80 mb-0.5">
                    <FaPhone className="mr-1.5 text-blue-400" /> Phone <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="0712345678"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="12"
                    className={`w-full px-3 py-1.5 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.phone ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300`}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* Address */}
                <div>
                  <label className="font-semibold text-xs flex items-center text-white/80 mb-0.5">
                    <FaHome className="mr-1.5 text-blue-400" /> Address <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.address ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300`}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  {errors.address && <p className="text-red-400 text-xs mt-0.5">{errors.address}</p>}
                </div>

                {/* House Number */}
                <div>
                  <label className="font-semibold text-xs flex items-center text-white/80 mb-0.5">
                    <FaBuilding className="mr-1.5 text-blue-400" /> House No <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="houseno"
                    placeholder="House number"
                    value={formData.houseno}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.houseno ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300`}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  {errors.houseno && <p className="text-red-400 text-xs mt-0.5">{errors.houseno}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-1.5" size={14} /> Create Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center mt-3">
                <p className="text-white/60 text-xs">
                  Already have an account?{' '}
                  <Link to="/CustomerLogin" className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200 text-xs">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.05) inset !important;
          -webkit-text-fill-color: white !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
          background-clip: text !important;
        }
      `}</style>
    </div>
  );
};

export default CustomerRegister;