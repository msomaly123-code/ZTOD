// src/components/ReceptionistDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaConciergeBell,
  FaClipboardList,
  FaMoneyBillWave,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaUserPlus,
  FaShoppingCart,
  FaFire,
  FaPercent,
  FaDollarSign,
  FaTrophy,
  FaSpinner,
} from 'react-icons/fa';
import RecepionistSideNavbar from './RecepionistSideNavbar';

const ReceptionistDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stats data
  const [stats, setStats] = useState({
    totalCustomers: 1247,
    activeCustomers: 856,
    totalOrders: 342,
    pendingOrders: 23,
    totalRevenue: 28475000,
    todayRevenue: 1250000,
    totalServices: 12,
    newCustomers: 45,
    completedOrders: 198,
    cancelledOrders: 19,
  });

  // Get user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:8000/api/customers/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const active = data.filter(c => c.status === 'active').length;
          
          setStats(prev => ({
            ...prev,
            totalCustomers: data.length,
            activeCustomers: active,
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="dashboard">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="dashboard">
      {/* Welcome Section */}
      <div className="mb-4 sm:mb-6 animate-fadeInUp">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                Welcome back, {user?.name?.split(' ')[0] || 'Receptionist'}! 👋
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Here's what's happening with your hotel today
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 self-start sm:self-auto">
              <FaFire className="text-yellow-400" />
              <span className="text-sm font-medium">3 tasks pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Total Customers - Light Blue */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Customers</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalCustomers.toLocaleString()}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-blue-300/30">
            <p className="text-[10px] text-blue-700/70">+{stats.newCustomers} this week</p>
          </div>
        </div>

        {/* Active Customers - Light Green */}
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-100">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Active</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.activeCustomers.toLocaleString()}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-green-300/30">
            <p className="text-[10px] text-green-700/70">{Math.round((stats.activeCustomers/stats.totalCustomers)*100)}% active</p>
          </div>
        </div>

        {/* Total Orders - Light Orange */}
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-200">
          <div className="flex items-center justify-between">
            <div className="text-orange-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Orders</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalOrders}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-300/30 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-orange-600 text-sm sm:text-base" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-orange-300/30">
            <p className="text-[10px] text-orange-700/70">{stats.pendingOrders} pending</p>
          </div>
        </div>

        {/* Revenue - Light Purple */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-300">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Revenue</p>
              <h3 className="text-xs sm:text-sm font-bold">TSh {Math.round(stats.totalRevenue/1000000)}M</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-purple-600 text-sm sm:text-base" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-purple-300/30">
            <p className="text-[10px] text-purple-700/70">+TSh {Math.round(stats.todayRevenue/1000)}K today</p>
          </div>
        </div>

        {/* Services - Light Pink */}
        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-400">
          <div className="flex items-center justify-between">
            <div className="text-pink-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Services</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalServices}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-300/30 rounded-lg flex items-center justify-center">
              <FaConciergeBell className="text-pink-600 text-sm sm:text-base" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-pink-300/30">
            <p className="text-[10px] text-pink-700/70">All active</p>
          </div>
        </div>

        {/* Completed - Light Teal */}
        <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp animate-delay-500">
          <div className="flex items-center justify-between">
            <div className="text-teal-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Completed</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.completedOrders}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-300/30 rounded-lg flex items-center justify-center">
              <FaTrophy className="text-teal-600 text-sm sm:text-base" />
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-teal-300/30">
            <p className="text-[10px] text-teal-700/70">{Math.round((stats.completedOrders/stats.totalOrders)*100)}% rate</p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp animate-delay-600">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-500" /> Recent Orders
            </h3>
            <Link
              to="/receptionist/orders"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition no-underline"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { id: '#1245', customer: 'John Doe', service: 'Conference Hall', amount: 'TSh 500K', status: 'Completed' },
              { id: '#1244', customer: 'Jane Smith', service: 'Room Booking', amount: 'TSh 250K', status: 'Pending' },
              { id: '#1243', customer: 'Mike Johnson', service: 'Catering', amount: 'TSh 75K', status: 'Processing' },
              { id: '#1242', customer: 'Sarah Wilson', service: 'Laundry', amount: 'TSh 25K', status: 'Completed' },
            ].map((order, index) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-50"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FaClipboardList className="text-blue-600 text-xs sm:text-sm" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">{order.customer}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{order.service}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">{order.amount}</p>
                  <span className={`
                    text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full
                    ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : ''}
                  `}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fadeInUp animate-delay-700">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FaFire className="text-orange-500" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/receptionist/customers/add"
              className="flex flex-col items-center p-3 sm:p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group no-underline"
            >
              <FaUserPlus className="text-lg sm:text-xl text-blue-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">Add Customer</span>
            </Link>
            <Link
              to="/receptionist/orders/create"
              className="flex flex-col items-center p-3 sm:p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200 group no-underline"
            >
              <FaShoppingCart className="text-lg sm:text-xl text-green-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">New Order</span>
            </Link>
            <Link
              to="/receptionist/payments/create"
              className="flex flex-col items-center p-3 sm:p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200 group no-underline"
            >
              <FaMoneyBillWave className="text-lg sm:text-xl text-purple-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">Payment</span>
            </Link>
            <Link
              to="/receptionist/services"
              className="flex flex-col items-center p-3 sm:p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 group no-underline"
            >
              <FaConciergeBell className="text-lg sm:text-xl text-orange-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1.5 text-center">Services</span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Pending Approval</span>
              <span className="font-semibold text-orange-600">12</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
              <span className="text-gray-500">Unread Messages</span>
              <span className="font-semibold text-blue-600">5</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
              <span className="text-gray-500">Tasks Today</span>
              <span className="font-semibold text-green-600">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Additional Info */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-800">
          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Rating</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">4.8/5.0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-900">
          <div className="flex items-center gap-2">
            <FaPercent className="text-green-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Completion</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">78%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-1000">
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-blue-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Avg Order</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">TSh 83K</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp animate-delay-1100">
          <div className="flex items-center gap-2">
            <FaClock className="text-purple-500 text-sm sm:text-base" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Response</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">2.4 min</p>
            </div>
          </div>
        </div>
      </div>
    </RecepionistSideNavbar>
  );
};

export default ReceptionistDashboard;