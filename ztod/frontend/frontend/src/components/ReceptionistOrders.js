// src/components/ReceptionistOrders.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaClipboardList,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport,
  FaUser,
  FaConciergeBell,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaFilter,
FaExclamationCircle,
  FaTimes,
} from 'react-icons/fa';
import RecepionistSideNavbar from './RecepionistSideNavbar';

const ReceptionistOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
    customerid: '',
    serviceid: '',
    totalAmount: '',
    status: 'pending',
  });

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    thisWeek: 0,
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];

  const getStatusColor = (status) => {
    const found = statusOptions.find(s => s.value === status);
    return found ? found.color : 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-yellow-500" />,
      processing: <FaSync className="text-blue-500" />,
      completed: <FaCheckCircle className="text-green-500" />,
      cancelled: <FaTimesCircle className="text-red-500" />,
    };
    return icons[status] || <FaClock />;
  };

  // Fetch data
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchServices();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/orders/', {
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
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToastNotification('Failed to load orders', 'danger');
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/customers/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/services/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/orders/stats/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Search and filter
  useEffect(() => {
    let result = orders;
    
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(o => 
        o.orderid?.toString().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.service_name?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'totalAmount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, orders, sortField, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate total amount when service is selected
    if (name === 'serviceid') {
      const selectedService = services.find(s => s.serviceid === parseInt(value));
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          totalAmount: selectedService.price
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerid: '',
      serviceid: '',
      totalAmount: '',
      status: 'pending',
    });
  };

  // Create Order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.customerid || !formData.serviceid || !formData.totalAmount) {
      showToastNotification('Please fill in all fields', 'danger');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerid: parseInt(formData.customerid),
          serviceid: parseInt(formData.serviceid),
          totalAmount: formData.totalAmount,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      showToastNotification('✅ Order created successfully!', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error creating order:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus) => {
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/orders/${selectedOrder.orderid}/update_status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      showToastNotification(`✅ Order status updated to ${newStatus}!`, 'success');
      setShowStatusModal(false);
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/orders/${selectedOrder.orderid}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }

      showToastNotification('✅ Order deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error deleting order:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openViewModal = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const openDeleteModal = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const formatPrice = (price) => {
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Service', 'Amount', 'Status', 'Date'];
    const csvData = filteredOrders.map(o => [
      `#${o.orderid}`,
      o.customer_name || 'N/A',
      o.service_name || 'N/A',
      parseFloat(o.totalAmount).toLocaleString(),
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="orders">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="orders">
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
            <FaClipboardList className="text-blue-600" /> Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all customer orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <FaFileExport /> Export
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus /> New Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.total}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-yellow-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Pending</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.pending}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-300/30 rounded-lg flex items-center justify-center">
              <FaClock className="text-yellow-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Processing</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.processing}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaSync className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Completed</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.completed}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Cancelled</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.cancelled}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-300/30 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-red-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Revenue</p>
              <h3 className="text-xs sm:text-sm font-bold">{formatPrice(stats.totalRevenue || 0)}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-purple-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="all">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Found <strong className="text-gray-700">{filteredOrders.length}</strong> orders
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('orderid')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Order ID
                      {sortField === 'orderid' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'orderid' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('customer_name')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Customer
                      {sortField === 'customer_name' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'customer_name' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    <button
                      onClick={() => handleSort('service_name')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Service
                      {sortField === 'service_name' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'service_name' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('totalAmount')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Amount
                      {sortField === 'totalAmount' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'totalAmount' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Date
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'created_at' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((order, index) => (
                  <tr 
                    key={order.orderid} 
                    className="hover:bg-gray-50 transition-all duration-200 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      #{order.orderid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {order.customer_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-[120px]">
                          {order.customer_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaConciergeBell className="text-gray-400 text-xs" />
                        <span className="truncate max-w-[100px]">{order.service_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-sm">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => openViewModal(order)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                          title="View Order"
                        >
                          <FaEye className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => openStatusModal(order)}
                          className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition group"
                          title="Update Status"
                        >
                          <FaSync className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(order)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition group"
                          title="Delete Order"
                        >
                          <FaTrash className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FaChevronLeft />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== CREATE ORDER MODAL ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaPlus className="text-blue-600" /> Create New Order
              </h3>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="customerid"
                    value={formData.customerid}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    <option value="">Select customer...</option>
                    {customers.map(customer => (
                      <option key={customer.customerid} value={customer.customerid}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceid"
                    value={formData.serviceid}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    <option value="">Select service...</option>
                    {services.map(service => (
                      <option key={service.serviceid} value={service.serviceid}>
                        {service.servicename} - {formatPrice(service.price)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">TSh</span>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Auto-calculated from service price</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaClipboardList />}
                  {saving ? 'Creating...' : 'Create Order'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW ORDER MODAL ===== */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEye className="text-blue-600" /> Order Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-bold text-gray-800">#{selectedOrder.orderid}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Customer</span>
                <span className="font-medium text-gray-800">{selectedOrder.customer_name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Service</span>
                <span className="font-medium text-gray-800">{selectedOrder.service_name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="font-bold text-blue-600">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-600">{formatDate(selectedOrder.created_at)}</span>
              </div>
              {selectedOrder.updated_at && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm text-gray-600">{formatDate(selectedOrder.updated_at)}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowViewModal(false); openStatusModal(selectedOrder); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <FaSync /> Update Status
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== UPDATE STATUS MODAL ===== */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaSync className="text-purple-600" /> Update Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Order #{selectedOrder.orderid} - Current status: <span className="font-medium">{selectedOrder.status}</span>
            </p>
            
            <div className="space-y-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleUpdateStatus(option.value)}
                  disabled={saving || option.value === selectedOrder.status}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg transition
                    ${option.value === selectedOrder.status 
                      ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                      : `hover:bg-gray-50 border border-gray-200`
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      option.value === 'pending' ? 'bg-yellow-500' :
                      option.value === 'processing' ? 'bg-blue-500' :
                      option.value === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></span>
                    {option.label}
                  </span>
                  {option.value === selectedOrder.status && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Order</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong className="text-gray-800">Order #{selectedOrder.orderid}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Customer: {selectedOrder.customer_name || 'N/A'}<br />
              Service: {selectedOrder.service_name || 'N/A'}<br />
              Amount: {formatPrice(selectedOrder.totalAmount)}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedOrder(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                {saving ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
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
      `}</style>
    </RecepionistSideNavbar>
  );
};

export default ReceptionistOrders;