// src/components/ReceptionistPayments.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMoneyBillWave,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaInfoCircle,
  FaTimesCircle,
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMobileAlt,
  FaWallet,
  FaUniversity, // ✅ Changed from FaBank to FaUniversity
  FaCreditCard,
  FaFilter,
  FaPrint,
  FaDownload,
} from 'react-icons/fa';
import RecepionistSideNavbar from './RecepionistSideNavbar';

const ReceptionistPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    todayAmount: 0,
    weekAmount: 0,
    monthAmount: 0,
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  
// Payment methods
const paymentMethods = [
  { id: 'M-Pesa', icon: <FaMobileAlt className="text-green-500" />, label: 'M-Pesa' },
  { id: 'Tigo Pesa', icon: <FaMobileAlt className="text-blue-500" />, label: 'Tigo Pesa' },
  { id: 'Airtel Money', icon: <FaMobileAlt className="text-red-500" />, label: 'Airtel Money' },
  { id: 'Bank Transfer', icon: <FaUniversity className="text-purple-500" />, label: 'Bank Transfer' }, // ✅ Changed from FaBank
  { id: 'Cash', icon: <FaWallet className="text-orange-500" />, label: 'Cash' },
  { id: 'Credit Card', icon: <FaCreditCard className="text-blue-600" />, label: 'Credit Card' },
];

  // Fetch payments
  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/RecipionistLogin');
        return;
      }

      const response = await fetch('http://localhost:8000/api/payments/', {
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
          navigate('/RecipionistLogin');
          return;
        }
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data);
      setFilteredPayments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showToastNotification('Failed to load payments', 'danger');
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/payments/stats/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  // Search, filter and sort
  useEffect(() => {
    let result = payments;
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }
    
    // Filter by payment method
    if (filterMethod !== 'all') {
      result = result.filter(p => p.paymentmethod === filterMethod);
    }
    
    // Filter by date range
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter(p => new Date(p.date) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      result = result.filter(p => new Date(p.date) <= endDate);
    }
    
    // Search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        p.paymentid?.toString().includes(term) ||
        p.order_id?.toString().includes(term) ||
        p.customer_name?.toLowerCase().includes(term) ||
        p.status?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (sortField === 'date') {
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
    
    setFilteredPayments(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterMethod, dateRange, payments, sortField, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

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
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <FaCheckCircle className="text-green-500" />,
      pending: <FaClock className="text-yellow-500" />,
      failed: <FaTimesCircle className="text-red-500" />,
      refunded: <FaArrowRight className="text-purple-500" />,
    };
    return icons[status] || <FaClock />;
  };

  const getPaymentMethodIcon = (method) => {
    const found = paymentMethods.find(m => m.id === method);
    return found ? found.icon : <FaMoneyBillWave className="text-gray-500" />;
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

  const openViewModal = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const openRefundModal = (payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/payments/${selectedPayment.paymentid}/refund/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Refund failed');
      }

      showToastNotification('✅ Payment refunded successfully!', 'success');
      setShowRefundModal(false);
      setSelectedPayment(null);
      fetchPayments();
      fetchPaymentStats();
    } catch (error) {
      console.error('Error processing refund:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Payment ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'];
    const csvData = filteredPayments.map(p => [
      `#${p.paymentid}`,
      `#${p.order_id || 'N/A'}`,
      p.customer_name || 'N/A',
      parseFloat(p.amount).toLocaleString(),
      p.paymentmethod || 'N/A',
      p.status,
      new Date(p.date).toLocaleDateString(),
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterMethod('all');
    setDateRange({ start: '', end: '' });
  };

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="payments">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="payments">
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
            <FaMoneyBillWave className="text-blue-600" /> Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all customer payments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <FaFileExport /> Export
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <FaFilter /> Clear Filters
          </button>
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
              <FaMoneyBillWave className="text-blue-600 text-sm sm:text-base" />
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
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Revenue</p>
              <h3 className="text-xs sm:text-sm font-bold">{formatPrice(stats.totalAmount)}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaWallet className="text-purple-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Refunded</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.refunded || 0}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-300/30 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-red-600 text-sm sm:text-base" />
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
              placeholder="Search by payment ID, order ID, or customer..."
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="all">All Methods</option>
            {paymentMethods.map(method => (
              <option key={method.id} value={method.id}>{method.label}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear dates
            </button>
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Found <strong className="text-gray-700">{filteredPayments.length}</strong> payments
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payments found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('paymentid')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      ID
                      {sortField === 'paymentid' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'paymentid' && <FaSort className="text-gray-300" />}
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
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Amount
                      {sortField === 'amount' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'amount' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-gray-800 transition"
                    >
                      Date
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortField !== 'date' && <FaSort className="text-gray-300" />}
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
                {currentItems.map((payment, index) => (
                  <tr 
                    key={payment.paymentid} 
                    className="hover:bg-gray-50 transition-all duration-200 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      #{payment.paymentid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {payment.customer_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-[120px]">
                          {payment.customer_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                      #{payment.order_id || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-sm">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getPaymentMethodIcon(payment.paymentmethod)}
                        <span>{payment.paymentmethod || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => openViewModal(payment)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                          title="View Payment"
                        >
                          <FaEye className="group-hover:scale-110 transition-transform" />
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => openRefundModal(payment)}
                            className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition group"
                            title="Refund Payment"
                          >
                            <FaArrowRight className="group-hover:scale-110 transition-transform" />
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
        {filteredPayments.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayments.length)} of {filteredPayments.length} payments
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

      {/* ===== VIEW PAYMENT MODAL ===== */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" /> Payment Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Payment ID</p>
                  <p className="text-lg font-bold text-gray-800">#{selectedPayment.paymentid}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusIcon(selectedPayment.status)}
                  {selectedPayment.status}
                </span>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Customer</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FaUser className="text-gray-400 text-xs" />
                    <span className="font-medium text-gray-800">{selectedPayment.customer_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-800">#{selectedPayment.order_id || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold text-blue-600 text-lg">{formatPrice(selectedPayment.amount)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPaymentMethodIcon(selectedPayment.paymentmethod)}
                    <span className="font-medium text-gray-800">{selectedPayment.paymentmethod || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedPayment.date)}</p>
                </div>
                {selectedPayment.transaction_id && (
                  <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-800">{selectedPayment.transaction_id}</p>
                  </div>
                )}
                {selectedPayment.order_service && (
                  <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-medium text-gray-800">{selectedPayment.order_service}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                {selectedPayment.status === 'completed' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openRefundModal(selectedPayment);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <FaArrowRight /> Refund Payment
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

      {/* ===== REFUND MODAL ===== */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaArrowRight className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Refund Payment</h3>
                <p className="text-sm text-gray-500">Process a refund for this payment</p>
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Payment #{selectedPayment.paymentid}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Customer:</span> {selectedPayment.customer_name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Amount:</span> {formatPrice(selectedPayment.amount)}
              </p>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to refund this payment? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRefundModal(false); setSelectedPayment(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaArrowRight />}
                {saving ? 'Processing...' : 'Confirm Refund'}
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
      `}</style>
    </RecepionistSideNavbar>
  );
};

export default ReceptionistPayments;