// src/components/ReceptionistCustomers.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport,
  FaTimes,
  FaSave,
  FaHome,
  FaBuilding,
  FaUser,
  FaLock,
  FaClipboardList,
  FaMoneyBillWave,
  FaCalendarAlt,
} from 'react-icons/fa';
import RecepionistSideNavbar from './RecepionistSideNavbar';

const ReceptionistCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [inactiveCustomers, setInactiveCustomers] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/customers/', {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
      
      const active = data.filter(c => c.status === 'active').length;
      const inactive = data.filter(c => c.status === 'inactive').length;
      setTotalCustomers(data.length);
      setActiveCustomers(active);
      setInactiveCustomers(inactive);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let result = customers;
    
    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(customer => {
        switch(searchType) {
          case 'name':
            return customer.name.toLowerCase().includes(term);
          case 'email':
            return customer.email.toLowerCase().includes(term);
          case 'phone':
            return customer.phone.toLowerCase().includes(term);
          default:
            return (
              customer.name.toLowerCase().includes(term) ||
              customer.email.toLowerCase().includes(term) ||
              customer.phone.toLowerCase().includes(term)
            );
        }
      });
    }
    
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchTerm, searchType, customers, sortField, sortDirection, filterStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/customers/${selectedCustomer.customerid}/`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      fetchCustomers();
      showToastNotification('✅ Customer deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToastNotification('❌ Failed to delete customer', 'danger');
    }
  };

  // ✅ Navigate to Customer Details Page
  const handleViewCustomer = (customerId) => {
    navigate(`/ReceptionistCustomerDetail/${customerId}`);
  };

  const handleEditCustomer = (customerId) => {
    navigate(`/receptionist/customers/edit/${customerId}`);
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getStatusIcon = (status) => {
    return status === 'active' 
      ? <FaCheckCircle className="text-green-500" /> 
      : <FaTimesCircle className="text-red-500" />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'House No', 'Status', 'Created At'];
    const csvData = filteredCustomers.map(c => [
      c.customerid,
      c.name,
      c.email,
      c.phone,
      c.address || 'N/A',
      c.houseno || 'N/A',
      c.status,
      formatDate(c.created_at)
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="customers">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="customers">
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
                  <FaExclamationTriangle className="mr-2 text-lg" />
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
            <FaUsers className="text-blue-600" /> Customers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all registered customers
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700/70">Total Customers</p>
              <h3 className="text-2xl font-bold text-blue-800">{totalCustomers}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700/70">Active</p>
              <h3 className="text-2xl font-bold text-green-800">{activeCustomers}</h3>
            </div>
            <div className="w-10 h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-700/70">Inactive</p>
              <h3 className="text-2xl font-bold text-red-800">{inactiveCustomers}</h3>
            </div>
            <div className="w-10 h-10 bg-red-300/30 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-red-600" />
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
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Found <strong className="text-gray-700">{filteredCustomers.length}</strong> customers
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setSearchType('all');
            }}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No customers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('customerid')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      ID
                      {sortField === 'customerid' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'customerid' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      Name
                      {sortField === 'name' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'name' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      Email
                      {sortField === 'email' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'email' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    <button onClick={() => handleSort('phone')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      Phone
                      {sortField === 'phone' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'phone' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                    Created
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
                {currentItems.map((customer) => (
                  <tr key={customer.customerid} className="hover:bg-gray-50 transition-all duration-200">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">
                      #{customer.customerid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaEnvelope className="text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaPhone className="text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-500">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(customer.status)}`}>
                        {getStatusIcon(customer.status)}
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {/* ✅ Eye Icon - View Customer Details */}
                        <button
                          onClick={() => handleViewCustomer(customer.customerid)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                          title="View Customer Details"
                        >
                          <FaEye className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition group"
                          title="Delete Customer"
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
        {filteredCustomers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Customer</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong className="text-gray-800">{selectedCustomer.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Email: {selectedCustomer.email}<br />
              Phone: {selectedCustomer.phone}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCustomer(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaTrash className="mr-2" /> Delete Customer
              </button>
            </div>
          </div>
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
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </RecepionistSideNavbar>
  );
};

export default ReceptionistCustomers;