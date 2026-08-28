// src/components/CustomerServices.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaConciergeBell,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaBuilding,
  FaBed,
  FaUtensils,
  FaTshirt,
  FaInfoCircle,
  FaEye,
  FaImage,
  FaUserPlus,
  FaSignInAlt,
  FaFire,
  FaStar,
  FaArrowRight,
} from 'react-icons/fa';
import CustomerSideNavbar from './CustomerSideNavbar';
import axios from 'axios';

const CustomerServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Service categories with icons
  const categories = [
    { value: 'all', label: 'All Services', icon: <FaConciergeBell /> },
    { value: 'laundry', label: 'Laundry', icon: <FaTshirt /> },
    { value: 'conferences', label: 'Conferences', icon: <FaBuilding /> },
    { value: 'catering', label: 'Catering', icon: <FaUtensils /> },
    { value: 'room_booking', label: 'Room Booking', icon: <FaBed /> },
  ];

  // Service icons mapping
  const serviceIcons = {
    'laundry': <FaTshirt className="text-purple-500" />,
    'conferences': <FaBuilding className="text-blue-500" />,
    'catering': <FaUtensils className="text-orange-500" />,
    'room_booking': <FaBed className="text-green-500" />,
  };

  const serviceColors = {
    'laundry': 'border-purple-500 from-purple-50 to-purple-100',
    'conferences': 'border-blue-500 from-blue-50 to-blue-100',
    'catering': 'border-orange-500 from-orange-50 to-orange-100',
    'room_booking': 'border-green-500 from-green-50 to-green-100',
  };

  const categoryLabels = {
    'laundry': '🧺 Laundry',
    'conferences': '🏢 Conferences',
    'catering': '🍽️ Catering',
    'room_booking': '🛏️ Room Booking',
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch popular services after services are loaded
  useEffect(() => {
    if (services.length > 0) {
      fetchPopularServices();
    }
  }, [services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Token ${token}` } : {};

      const response = await axios.get('http://localhost:8000/api/services/', {
        headers: headers
      });

      const servicesWithCount = await Promise.all(
        response.data.map(async (service) => {
          try {
            const itemsResponse = await axios.get(
              `http://localhost:8000/api/services/${service.serviceid}/service_items/`,
              { headers: headers }
            );
            return {
              ...service,
              item_count: itemsResponse.data.length,
              items: itemsResponse.data,
            };
          } catch (error) {
            return {
              ...service,
              item_count: 0,
              items: [],
            };
          }
        })
      );

      setServices(servicesWithCount);
      setFilteredServices(servicesWithCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      showToastNotification('Failed to load services', 'danger');
      setLoading(false);
    }
  };

  // ✅ Fetch popular services based on real order data
  const fetchPopularServices = async () => {
    try {
      setLoadingPopular(true);
      const token = localStorage.getItem('token');
      
      // If not logged in, use item_count as popularity
      if (!token) {
        const popular = services
          .filter(s => s.status === 'active' && s.item_count > 0)
          .sort((a, b) => b.item_count - a.item_count)
          .slice(0, 4)
          .map(s => ({ ...s, order_count: 0 }));
        setPopularServices(popular);
        setLoadingPopular(false);
        return;
      }

      // Fetch all orders to calculate popularity
      const ordersRes = await axios.get('http://localhost:8000/api/orders/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      const orders = ordersRes.data;
      
      // Count orders per service (only completed and paid orders)
      const serviceOrderCount = {};
      orders.forEach(order => {
        const serviceId = order.serviceid;
        if (serviceId && (order.status === 'completed' || order.status === 'paid')) {
          serviceOrderCount[serviceId] = (serviceOrderCount[serviceId] || 0) + 1;
        }
      });

      // Sort services by order count
      const popular = services
        .filter(s => s.status === 'active' && s.item_count > 0)
        .map(s => ({
          ...s,
          order_count: serviceOrderCount[s.serviceid] || 0
        }))
        .sort((a, b) => b.order_count - a.order_count)
        .slice(0, 4);

      // If no orders, fallback to most items
      if (popular.every(s => s.order_count === 0)) {
        const fallback = services
          .filter(s => s.status === 'active' && s.item_count > 0)
          .sort((a, b) => b.item_count - a.item_count)
          .slice(0, 4)
          .map(s => ({ ...s, order_count: 0 }));
        setPopularServices(fallback);
      } else {
        setPopularServices(popular);
      }

      setLoadingPopular(false);
    } catch (error) {
      console.error('Error fetching popular services:', error);
      // Fallback: Use services with most items
      const fallback = services
        .filter(s => s.status === 'active' && s.item_count > 0)
        .sort((a, b) => b.item_count - a.item_count)
        .slice(0, 4)
        .map(s => ({ ...s, order_count: 0 }));
      setPopularServices(fallback);
      setLoadingPopular(false);
    }
  };

  // Search and filter
  useEffect(() => {
    let result = services;
    
    if (filterCategory !== 'all') {
      result = result.filter(s => s.category === filterCategory);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(s => 
        s.servicename.toLowerCase().includes(term) ||
        s.category?.toLowerCase().includes(term) ||
        s.service_description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredServices(result);
  }, [searchTerm, filterCategory, services]);

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/media/')) return `http://localhost:8000${image}`;
    if (image.startsWith('media/')) return `http://localhost:8000/${image}`;
    return `http://localhost:8000/media/services/${image}`;
  };

  const getServiceIcon = (category) => {
    return serviceIcons[category] || <FaConciergeBell className="text-gray-500" />;
  };

  const getServiceColor = (category) => {
    return serviceColors[category] || 'border-gray-500 from-gray-50 to-gray-100';
  };

  const getCategoryLabel = (category) => {
    return categoryLabels[category] || category;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'danger';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />;
  };

  const handleViewDetails = (serviceId) => {
    navigate(`/CustomerServiceDetails/${serviceId}`);
  };

  // Render popular services
  const renderPopularServices = () => {
    if (loadingPopular) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-3 animate-pulse h-20"></div>
          ))}
        </div>
      );
    }

    if (popularServices.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No popular services yet
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {popularServices.map((service) => (
          <div
            key={service.serviceid}
            onClick={() => handleViewDetails(service.serviceid)}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 text-center cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-blue-100 group relative"
          >
            {/* Popular Badge */}
            {service.order_count > 0 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                <FaFire size={8} /> {service.order_count}
              </div>
            )}
            {service.order_count === 0 && service.item_count >= 3 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                <FaStar size={8} /> New
              </div>
            )}
            
            <div className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-300">
              {getServiceIcon(service.category)}
            </div>
            <p className="text-xs font-medium text-gray-700 truncate">{service.servicename}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{service.item_count} items</span>
              {service.order_count > 0 && (
                <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
                  {service.order_count} bookings
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <CustomerSideNavbar activeMenu="services">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="services">
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
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaConciergeBell className="text-blue-600" /> Our Services
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a service to view available items and book
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{filteredServices.length}</span> services
          </span>
        </div>
      </div>

      {/* ✅ Popular Services - Real Data */}
      {popularServices.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaFire className="text-orange-500" />
            <h3 className="font-semibold text-gray-700">Popular Services</h3>
            <span className="text-xs text-gray-400">| Most booked by customers</span>
          </div>
          {renderPopularServices()}
        </div>
      )}

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${
              filterCategory === cat.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Found <strong className="text-gray-700">{filteredServices.length}</strong> services
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
            }}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="text-8xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg font-medium">No services found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your filters'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map((service) => {
            const hasItems = service.item_count > 0;
            const isActive = service.status === 'active';
            
            return (
              <div
                key={service.serviceid}
                className={`bg-gradient-to-br ${getServiceColor(service.category)} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${
                  isActive ? 'border-green-500' : 'border-red-400'
                } ${!isActive ? 'opacity-75' : ''}`}
              >
                {/* Service Image */}
                <div className="relative h-40 bg-white/50">
                  {service.image ? (
                    <img 
                      src={getImageUrl(service.image)} 
                      alt={service.servicename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.querySelector('.image-placeholder').style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="image-placeholder w-full h-full flex items-center justify-center"
                    style={{ display: service.image ? 'none' : 'flex' }}
                  >
                    <div className="text-center">
                      <div className="text-6xl text-gray-400">{getServiceIcon(service.category)}</div>
                      <p className="text-xs text-gray-400 mt-1">No Image</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-${getStatusColor(service.status)}-100 text-${getStatusColor(service.status)}-700`}>
                    {getStatusIcon(service.status)}
                    {getStatusLabel(service.status)}
                  </div>
                  
                  {/* Item Count Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                    {service.item_count} items
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {service.servicename}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {getCategoryLabel(service.category)}
                      </p>
                    </div>
                  </div>

                  {service.service_description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {service.service_description}
                    </p>
                  )}

                  <button
                    onClick={() => handleViewDetails(service.serviceid)}
                    disabled={!isActive || !hasItems}
                    className={`w-full mt-4 py-2.5 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 ${
                      isActive && hasItems
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaEye /> 
                    {!isActive ? 'Unavailable' : !hasItems ? 'No Items' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </CustomerSideNavbar>
  );
};

export default CustomerServices;