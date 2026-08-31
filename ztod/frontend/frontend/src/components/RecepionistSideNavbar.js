// src/components/ReceptionistSideNavbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUser,
  FaConciergeBell,
  FaClipboardList,
  FaMoneyBillWave,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaShoppingCart,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaUserPlus,
  FaSearch,
  FaCog,
  FaHome,
  FaChartPie,
  FaChevronDown,
  FaFire,
} from 'react-icons/fa';

const ReceptionistSideNavbar = ({ 
  children, 
  activeMenu: propActiveMenu,
  onMenuChange 
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState(propActiveMenu || 'dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Notifications data
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New customer registered: John Doe', time: '2 min ago', read: false, icon: <FaUserPlus className="text-green-500" /> },
    { id: 2, message: 'New order #1234 placed by Jane Smith', time: '15 min ago', read: false, icon: <FaShoppingCart className="text-blue-500" /> },
    { id: 3, message: 'Payment of TSh 250,000 received', time: '1 hour ago', read: false, icon: <FaMoneyBillWave className="text-green-500" /> },
    { id: 4, message: 'Order #1228 status updated to completed', time: '3 hours ago', read: true, icon: <FaCheckCircle className="text-purple-500" /> },
    { id: 5, message: 'New service added: VIP Conference Package', time: '5 hours ago', read: true, icon: <FaConciergeBell className="text-orange-500" /> },
  ]);

  // Menu items
 // src/components/ReceptionistSideNavbar.js
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: '/RecipionistDashboard' },
  { id: 'customers', label: 'Customers', icon: <FaUsers />, path: '/ReceptionistCustomers' },
  { id: 'orders', label: 'Orders', icon: <FaClipboardList />, path: '/ReceptionistOrders' },
  { id: 'services', label: 'Services', icon: <FaConciergeBell />, path: '/AdminService' },
  { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave />, path: '/ReceptionistPayments' },
  { id: 'reports', label: 'Reports', icon: <FaChartPie />, path: '/ReceptionistReports' },
  { id: 'settings', label: 'Settings', icon: <FaCog />, path: '/RecepionistSettings' },
];
  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Check if user is logged in
    if (!token || role !== 'receptionist') {
      navigate('/RecipionistLogin');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  // Update active menu from prop
  useEffect(() => {
    if (propActiveMenu) {
      setActiveMenu(propActiveMenu);
    }
  }, [propActiveMenu]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('toggle-btn');
        if (sidebar && !sidebar.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)) {
          setIsSidebarOpen(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      navigate('/RecipionistLogin');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (onMenuChange) {
      onMenuChange(menuId);
    }
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Format time
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        id="sidebar"
        className={`
          fixed lg:relative z-30 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          transition-all duration-300 ease-in-out
          w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
          h-full overflow-y-auto shadow-2xl
          flex-shrink-0
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link to="/RecipionistDashboard" className="flex items-center gap-2 text-xl font-bold no-underline hover:text-white">
            <FaChartLine className="text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ZITOD
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name || 'Receptionist'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'receptionist@email.com'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - No underlines */}
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${activeMenu === item.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                    no-underline
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {activeMenu === item.id && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout Button - No underline */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 no-underline"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ===== STICKY NAVBAR - No underlines ===== */}
        <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
          <div className="px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left section */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  id="toggle-btn"
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 no-underline"
                >
                  <FaBars className="text-lg sm:text-xl text-gray-600" />
                </button>
                <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-800">
                  Recepionist  Dashboard

                   <span className="text-xs text-gray-500" style={{marginLeft:'150px'}}>
                    {formatDate()} • {formatTime()}
                  </span>
                  </h1>
                 
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Date/Time - Mobile */}
                <div className="sm:hidden text-right">
                  <p className="text-xs font-medium text-gray-600">{formatTime()}</p>
                  <p className="text-[10px] text-gray-400">{formatDate().split(',')[0]}</p>
                </div>

                {/* Search - Desktop */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
                  <FaSearch className="text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none ml-2 text-sm w-32 lg:w-48"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 no-underline"
                  >
                    <FaBell className="text-lg sm:text-xl text-gray-600" />
                    {getUnreadCount() > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">
                        {getUnreadCount()}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 animate-slideDown">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-gray-800">Notifications</h3>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 transition no-underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 text-sm">
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`
                                p-3 border-b border-gray-50 hover:bg-gray-50 transition-all duration-200
                                ${!notif.read ? 'bg-blue-50/50' : ''}
                                cursor-pointer
                              `}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 mt-0.5 text-lg">
                                  {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-800">{notif.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{notif.time}</p>
                                </div>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-100 text-center">
                        <button className="text-xs text-blue-600 hover:text-blue-700 transition font-medium no-underline">
                          View all
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 no-underline"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <FaChevronDown className="text-gray-400 text-[10px] sm:text-xs hidden sm:block" />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 animate-slideDown">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-800 truncate">{user?.name || 'Receptionist'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'receptionist@email.com'}</p>
                      </div>
                      <div className="p-1">
                        
                        <Link
                          to="/RecepionistSettings"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm no-underline text-gray-700"
                        >
                          <FaCog className="text-gray-500 text-sm" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm text-red-500 no-underline"
                        >
                          <FaSignOutAlt className="text-sm" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== CHILDREN CONTENT ===== */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* ===== CSS ANIMATIONS ===== */}
      <style jsx>{`
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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
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
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Remove all underlines */
        a, button, .no-underline {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
};

export default ReceptionistSideNavbar;