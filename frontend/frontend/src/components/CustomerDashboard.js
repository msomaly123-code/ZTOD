// src/components/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaClipboardList,
  FaConciergeBell,
  FaMoneyBillWave,
  FaUser,
  FaShoppingCart,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowRight,
  FaStar,
  FaPercent,
  FaDollarSign,
  FaTrophy,
  FaFire,
  FaSpinner,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEye,
  FaWallet,
} from 'react-icons/fa';
import axios from 'axios';
import CustomerSideNavbar from './CustomerSideNavbar';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  // Stats data
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    activeServices: 0,
    totalPayments: 0,
    pendingPayments: 0,
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Get user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'customer') {
      navigate('/CustomerLogin');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchCustomerData();
  }, [navigate]);

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Fetch customer orders, payments and stats
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !userData.id) {
        setLoading(false);
        return;
      }

      // Fetch orders for this customer
      const ordersResponse = await axios.get(
        `http://localhost:8000/api/orders/?customerid=${userData.id}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      const ordersData = ordersResponse.data;
      setOrders(ordersData);

      // Fetch payments for this customer
      const paymentsResponse = await axios.get(
        `http://localhost:8000/api/payments/?customerid=${userData.id}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      const paymentsData = paymentsResponse.data;
      setPayments(paymentsData);
      
      // Calculate stats
      const total = ordersData.length;
      const pending = ordersData.filter(o => o.status === 'pending').length;
      const processing = ordersData.filter(o => o.status === 'processing').length;
      const completed = ordersData.filter(o => o.status === 'completed').length;
      const cancelled = ordersData.filter(o => o.status === 'cancelled').length;
      const paid = ordersData.filter(o => o.status === 'paid').length;
      
      const totalSpent = ordersData
        .filter(o => o.status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

      const totalPayments = paymentsData.length;
      const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;

      // Get unique services count
      const uniqueServices = new Set(ordersData.map(o => o.serviceid)).size;

      setStats({
        totalOrders: total,
        pendingOrders: pending + processing,
        processingOrders: processing,
        completedOrders: completed,
        cancelledOrders: cancelled,
        paidOrders: paid,
        totalSpent: totalSpent,
        activeServices: uniqueServices || 0,
        totalPayments: totalPayments,
        pendingPayments: pendingPayments,
      });

      // Get recent orders (last 3)
      const sortedOrders = [...ordersData].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentOrders(sortedOrders.slice(0, 3));

      // Get recent payments (last 3)
      const sortedPayments = [...paymentsData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setRecentPayments(sortedPayments.slice(0, 3));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      showToastNotification('Failed to load dashboard data', 'danger');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      paid: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-yellow-500" />,
      processing: <FaSpinner className="text-blue-500 animate-spin" />,
      completed: <FaCheckCircle className="text-green-500" />,
      cancelled: <FaTimesCircle className="text-red-500" />,
      paid: <FaMoneyBillWave className="text-purple-500" />,
    };
    return icons[status] || <FaClock />;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatPrice = (price) => {
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewOrder = (orderId) => {
    navigate(`/CustomerOrderDetail/${orderId}`);
  };

  if (loading) {
    return (
      <CustomerSideNavbar activeMenu="dashboard">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="dashboard">
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
                  <FaTimesCircle className="mr-2 text-lg" />
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

      {/* Welcome Section */}
      <div className="mb-4 sm:mb-6 animate-fadeInUp">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                Welcome back, {user?.name?.split(' ')[0] || 'Customer'}! 👋
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Here's what's happening with your bookings
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 self-start sm:self-auto">
              <FaFire className="text-yellow-400" />
              <span className="text-sm font-medium">{stats.pendingOrders} orders pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Orders</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalOrders}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-100">
          <div className="flex items-center justify-between">
            <div className="text-yellow-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Pending</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.pendingOrders}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-300/30 rounded-lg flex items-center justify-center">
              <FaClock className="text-yellow-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-200">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Completed</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.completedOrders}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-300">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Spent</p>
              <h3 className="text-xs sm:text-sm font-bold">{formatPrice(stats.totalSpent)}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-purple-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-400">
          <div className="flex items-center justify-between">
            <div className="text-pink-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Services</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.activeServices}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-300/30 rounded-lg flex items-center justify-center">
              <FaConciergeBell className="text-pink-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-500">
          <div className="flex items-center justify-between">
            <div className="text-orange-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Payments</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalPayments}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-300/30 rounded-lg flex items-center justify-center">
              <FaWallet className="text-orange-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp animate-delay-600">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-500" /> Recent Orders
            </h3>
            <Link
              to="/CustomerOrders"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition no-underline"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link
                to="/CustomerServices"
                className="text-sm text-blue-600 hover:text-blue-700 transition no-underline"
              >
                Book your first service →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order, index) => (
                <div
                  key={order.orderid}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-50 cursor-pointer"
                  onClick={() => handleViewOrder(order.orderid)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FaShoppingCart className="text-blue-600 text-xs sm:text-sm" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                        Order #{order.orderid}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {order.serviceid?.servicename || 'Service'} • {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp animate-delay-700">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/CustomerServices"
              className="flex flex-col items-center p-3 sm:p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group no-underline"
            >
              <FaConciergeBell className="text-lg sm:text-xl text-blue-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">Book Service</span>
            </Link>
            <Link
              to="/CustomerOrders"
              className="flex flex-col items-center p-3 sm:p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200 group no-underline"
            >
              <FaClipboardList className="text-lg sm:text-xl text-green-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">My Orders</span>
            </Link>
            <Link
              to="/CustomerPayment"
              className="flex flex-col items-center p-3 sm:p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200 group no-underline"
            >
              <FaMoneyBillWave className="text-lg sm:text-xl text-purple-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">Make Payment</span>
            </Link>
            <Link
              to="/CustomerSettings"
              className="flex flex-col items-center p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group no-underline"
            >
              <FaUser className="text-lg sm:text-xl text-gray-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">Profile</span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Active Orders</span>
              <span className="font-semibold text-blue-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
              <span className="text-gray-500">Completed</span>
              <span className="font-semibold text-green-600">{stats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
              <span className="text-gray-500">Total Spent</span>
              <span className="font-semibold text-purple-600">{formatPrice(stats.totalSpent)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
              <span className="text-gray-500">Total Payments</span>
              <span className="font-semibold text-orange-600">{stats.totalPayments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="mt-4 sm:mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp animate-delay-800">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaWallet className="text-purple-500" /> Recent Payments
            </h3>
            <Link
              to="/CustomerPayments"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition no-underline"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <FaWallet className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment, index) => (
                <div
                  key={payment.paymentid}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <FaMoneyBillWave className="text-purple-600 text-xs sm:text-sm" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                        Payment #{payment.paymentid}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {payment.paymentmethod} • {formatDate(payment.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      {formatPrice(payment.amount)}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] rounded-full ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status === 'completed' ? <FaCheckCircle className="text-green-500" /> : <FaClock className="text-yellow-500" />}
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar - Additional Info */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-900">
          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Rating</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">4.8/5.0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-1000">
          <div className="flex items-center gap-2">
            <FaPercent className="text-green-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Completion</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {stats.totalOrders > 0 
                  ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-1100">
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-blue-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Avg Order</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {stats.totalOrders > 0 
                  ? formatPrice(stats.totalSpent / stats.totalOrders)
                  : 'TSh 0'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-1200">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-purple-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Member Since</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        .animate-delay-100 { animation-delay: 0.05s; }
        .animate-delay-200 { animation-delay: 0.1s; }
        .animate-delay-300 { animation-delay: 0.15s; }
        .animate-delay-400 { animation-delay: 0.2s; }
        .animate-delay-500 { animation-delay: 0.25s; }
        .animate-delay-600 { animation-delay: 0.3s; }
        .animate-delay-700 { animation-delay: 0.35s; }
        .animate-delay-800 { animation-delay: 0.4s; }
        .animate-delay-900 { animation-delay: 0.45s; }
        .animate-delay-1000 { animation-delay: 0.5s; }
        .animate-delay-1100 { animation-delay: 0.55s; }
        .animate-delay-1200 { animation-delay: 0.6s; }
      `}</style>
    </CustomerSideNavbar>
  );
};

export default CustomerDashboard;