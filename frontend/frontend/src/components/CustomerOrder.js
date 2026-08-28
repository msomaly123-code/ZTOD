// src/components/CustomerOrders.js
// src/components/CustomerOrders.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaEye,
  FaClock,
  FaMoneyBillWave,
  FaShoppingCart,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaInfoCircle,
  FaPrint,
  FaDownload,
  FaTimesCircle,
} from 'react-icons/fa';
import CustomerSideNavbar from './CustomerSideNavbar';


const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0,
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Get user data
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/CustomerLogin');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch orders for this customer
      const response = await fetch(`http://localhost:8000/api/orders/?customerid=${userData.id}`, {
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
          navigate('/CustomerLogin');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
      
      // Calculate stats
      const total = data.length;
      const pending = data.filter(o => o.status === 'pending').length;
      const processing = data.filter(o => o.status === 'processing').length;
      const completed = data.filter(o => o.status === 'completed').length;
      const cancelled = data.filter(o => o.status === 'cancelled').length;
      const totalSpent = data
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

      setStats({
        total,
        pending,
        processing,
        completed,
        cancelled,
        totalSpent,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToastNotification('Failed to load orders', 'danger');
      setLoading(false);
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
        o.serviceid?.servicename?.toLowerCase().includes(term) ||
        o.status?.toLowerCase().includes(term)
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

  const openViewModal = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/update_status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      showToastNotification('✅ Order cancelled successfully!', 'success');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToastNotification('❌ Failed to cancel order', 'danger');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Service', 'Amount', 'Status', 'Date'];
    const csvData = filteredOrders.map(o => [
      `#${o.orderid}`,
      o.serviceid?.servicename || 'N/A',
      parseFloat(o.totalAmount).toLocaleString(),
      o.status,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <CustomerSideNavbar activeMenu="orders">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="orders">
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
            <FaClipboardList className="text-blue-600" /> My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your bookings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <FaFileExport /> Export
          </button>
          <Link
            to="/CustomerServices"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <FaShoppingCart /> Book New Service
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
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
              <FaSpinner className="text-blue-600 text-sm sm:text-base animate-spin" />
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
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4">
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
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or service..."
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
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
              <p className="text-gray-400 text-sm mt-1">Start by booking a service</p>
              <Link
                to="/CustomerServices"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Book a Service
              </Link>
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
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="truncate max-w-[120px]">
                          {order.serviceid?.servicename || 'N/A'}
                        </span>
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
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => handleCancelOrder(order.orderid)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition group"
                            title="Cancel Order"
                          >
                            <FaTimes className="group-hover:scale-110 transition-transform" />
                          </button>
                        )}
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

      {/* ===== VIEW ORDER MODAL ===== */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" /> Order Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-lg font-bold text-gray-800">#{selectedOrder.orderid}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="font-medium text-gray-800">{selectedOrder.serviceid?.servicename || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold text-blue-600 text-lg">{formatPrice(selectedOrder.totalAmount)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium text-gray-800 capitalize">{selectedOrder.status}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleCancelOrder(selectedOrder.orderid);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <FaTimes /> Cancel Order
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
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
      `}</style>
    </CustomerSideNavbar>
  );
};

export default CustomerOrders;