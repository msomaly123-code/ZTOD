// src/api/customerRegisterApi.js
import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a new customer
 * @param {Object} userData - Customer registration data
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password (min 6 chars)
 * @param {string} userData.phone - Phone number
 * @param {string} userData.address - Physical address
 * @param {string} userData.houseno - House number
 * @param {string} userData.role - User role (default: 'customer')
 * @returns {Object} { success, data, message, fieldErrors }
 */
export const registerCustomer = async (userData) => {
  try {
    // Make the API call
    const response = await apiClient.post('/register/', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      address: userData.address,
      houseno: userData.houseno,
      role: userData.role || 'customer'
    });

    // Check if registration was successful
    if (response.data && response.data.token) {
      // Save token and user data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('role', 'customer');
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful!'
      };
    } else {
      return {
        success: false,
        message: 'Registration failed. No token received.'
      };
    }
  } catch (error) {
    console.error('Registration API Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // outside of the 2xx range
      const status = error.response.status;
      const data = error.response.data;
      
      // Handle specific status codes
      if (status === 400) {
        // Bad request - validation errors
        if (data.error && data.error.includes('Email already exists')) {
          return {
            success: false,
            message: 'Customer with this email already exists!',
            fieldErrors: { email: 'Email already registered' }
          };
        }
        
        // Handle field-specific validation errors
        if (data.errors) {
          const fieldErrors = {};
          Object.keys(data.errors).forEach(key => {
            fieldErrors[key] = data.errors[key][0] || 'Invalid input';
          });
          return {
            success: false,
            message: 'Please check your input.',
            fieldErrors: fieldErrors
          };
        }
        
        return {
          success: false,
          message: data.error || data.message || 'Invalid input. Please check your data.'
        };
      } else if (status === 500) {
        return {
          success: false,
          message: 'Server error. Please try again later.'
        };
      } else {
        return {
          success: false,
          message: data.error || data.message || 'Registration failed. Please try again.'
        };
      }
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        message: 'Network error. Please check your internet connection.'
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }
};

/**
 * Alternative: Register customer using fetch API (if you prefer not to use axios)
 */
export const registerCustomerWithFetch = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        address: userData.address,
        houseno: userData.houseno,
        role: userData.role || 'customer'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw { response: { status: response.status, data } };
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', 'customer');
      
      return {
        success: true,
        data: data,
        message: 'Registration successful!'
      };
    } else {
      return {
        success: false,
        message: 'Registration failed. No token received.'
      };
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Registration failed. Please try again.'
    };
  }
};

/**
 * Check if email already exists
 */
export const checkEmailExists = async (email) => {
  try {
    const response = await apiClient.get(`/check-email/?email=${email}`);
    return response.data.exists;
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
};

/**
 * Get registration form configuration
 */
export const getRegistrationConfig = () => {
  return {
    passwordMinLength: 6,
    phoneRegex: /^(0[0-9]{9}|255[0-9]{9})$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    requiredFields: ['name', 'email', 'password', 'phone', 'address', 'houseno']
  };
};

/**
 * Validate registration data locally (optional, can be used before API call)
 */
export const validateRegistrationData = (data) => {
  const errors = {};
  const config = getRegistrationConfig();

  // Validate name
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  // Validate email
  if (!data.email || !config.emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  if (!data.password || data.password.length < config.passwordMinLength) {
    errors.password = `Password must be at least ${config.passwordMinLength} characters`;
  }

  // Validate phone
  if (!data.phone || !config.phoneRegex.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Enter a valid phone number (e.g., 0712345678 or 255712345678)';
  }

  // Validate address
  if (!data.address || data.address.trim() === '') {
    errors.address = 'Address is required';
  }

  // Validate houseno
  if (!data.houseno || data.houseno.trim() === '') {
    errors.houseno = 'House number is required';
  }

  return errors;
};