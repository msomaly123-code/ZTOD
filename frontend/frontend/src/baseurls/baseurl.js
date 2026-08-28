// src/services/baseurl.js

// Base URL configuration
const BASE_URL = 'http://localhost:8000/api';

// API Endpoints
const API = {
  // Authentication
  LOGIN: `${BASE_URL}/login/`,
  REGISTER: `${BASE_URL}/register/`,
  LOGOUT: `${BASE_URL}/logout/`,
  CURRENT_USER: `${BASE_URL}/me/`,
  
  // Customers
  CUSTOMERS: `${BASE_URL}/customers/`,
  CUSTOMER_DETAIL: (id) => `${BASE_URL}/customers/${id}/`,
  CUSTOMER_ORDERS: (id) => `${BASE_URL}/customers/${id}/orders/`,
  
  // Services
  SERVICES: `${BASE_URL}/services/`,
  SERVICE_DETAIL: (id) => `${BASE_URL}/services/${id}/`,
  SERVICES_AVAILABLE: `${BASE_URL}/services/available/`,
  
  // Orders
  ORDERS: `${BASE_URL}/orders/`,
  ORDER_DETAIL: (id) => `${BASE_URL}/orders/${id}/`,
  ORDER_UPDATE_STATUS: (id) => `${BASE_URL}/orders/${id}/update_status/`,
  ORDER_STATS: `${BASE_URL}/orders/stats/`,
  
  // Notifications
  NOTIFICATIONS: `${BASE_URL}/notifications/`,
  NOTIFICATION_DETAIL: (id) => `${BASE_URL}/notifications/${id}/`,
  
  // Receptionists
  RECEPTIONISTS: `${BASE_URL}/recepionists/`,
  RECEPTIONIST_DETAIL: (id) => `${BASE_URL}/recepionists/${id}/`,
  
  // Payments
  PAYMENTS: `${BASE_URL}/payments/`,
  PAYMENT_DETAIL: (id) => `${BASE_URL}/payments/${id}/`,
  PROCESS_PAYMENT: `${BASE_URL}/payments/process_payment/`,
  
  // Profile
  UPDATE_PASSWORD: `${BASE_URL}/update-password/`,
  UPDATE_PROFILE: `${BASE_URL}/receptionist/profile/`,
};

export default API;
export { BASE_URL, API };