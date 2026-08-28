// src/components/CustomerLogin.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaLock, 
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaCheckCircle,
  FaUserPlus,
  FaUser,
} from 'react-icons/fa';
import axios from 'axios';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('danger');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email: formData.email.trim(),
        password: formData.password,
        role: 'customer'
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', 'customer');
        
        setToastVariant('success');
        setToastMessage('Citizen Login successful!');
        setShowToast(true);
        
        setTimeout(() => {
          navigate('/CustomerDashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.error) {
          setToastVariant('danger');
          setToastMessage(` ${errorData.error}`);
          setShowToast(true);
        } else {
          setToastVariant('danger');
          setToastMessage(' Invalid email or password');
          setShowToast(true);
        }
      } else {
        setToastVariant('danger');
        setToastMessage(' Network error. Please check your connection.');
        setShowToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form - Reduced Size */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* Glass Container - Reduced padding */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-6 border border-white/20 animate-float">
            
            {/* Header - Smaller */}
            <div className="text-center mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30 animate-pulse-slow">
                <FaUser size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Customer Login</h2>
              <p className="text-white/60 text-xs">Login to book and manage services</p>
            </div>

            {/* Error Messages */}
            {errors.general && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 px-3 py-1.5 rounded-lg text-xs flex items-center mb-3">
                <FaExclamationCircle className="mr-1.5" /> {errors.general}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Field */}
              <div>
                <label className="font-semibold text-xs flex items-center text-white/80 mb-1">
                  <FaEnvelope className="mr-1.5 text-blue-400" /> Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.email ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 group-hover:border-white/40`}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500 ${
                    formData.email ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                  }}></div>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="font-semibold text-xs flex items-center text-white/80 mb-1">
                  <FaLock className="mr-1.5 text-blue-400" /> Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm rounded-xl bg-white/5 backdrop-blur-sm border ${
                      errors.password ? 'border-red-400/50' : 'border-white/20'
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 group-hover:border-white/40 pr-10`}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500 ${
                    formData.password ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                  }}></div>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>
                )}
              </div>

              {/* Submit Button - Smaller */}
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
                    Logging in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-1.5" size={14} /> Login
                  </>
                )}
              </button>

              {/* Registration Link */}
              <div className="text-center mt-2">
                <p className="text-white/60 text-xs">
                  Don't have an account?{' '}
                  <Link 
                    to="/CustomerRegister" 
                    className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200 inline-flex items-center gap-1 text-xs"
                  >
                    <FaUserPlus size={12} /> Register here
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
          50% { transform: translateY(-6px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out forwards; }

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

export default CustomerLogin;