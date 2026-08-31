// src/components/ReceptionistCustomerDetail.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSpinner,
  FaBox,
  FaEye,
  FaShoppingCart,
  FaWallet,
  FaClock,
} from 'react-icons/fa';
import axios from 'axios';
import RecepionistSideNavbar from './RecepionistSideNavbar';

const ReceptionistCustomerDetail = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalPayments: 0,
  });

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch customer details
      const customerRes = await axios.get(
        `http://localhost:8000/api/customers/${customerId}/`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      setCustomer(customerRes.data);

      // Fetch customer orders
      const ordersRes = await axios.get(
        `http://localhost:8000/api/orders/?customerid=${customerId}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      const ordersData = ordersRes.data;
      setOrders(ordersData);

      // Fetch customer payments
      const paymentsRes = await axios.get(
        `http://localhost:8000/api/payments/?customerid=${customerId}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      const paymentsData = paymentsRes.data;
      setPayments(paymentsData);

      // Calculate stats
      const totalOrders = ordersData.length;
      const totalSpent = ordersData
        .filter(o => o.status === 'paid' || o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
      const pendingOrders = ordersData.filter(o => o.status === 'pending' || o.status === 'processing').length;
      const completedOrders = ordersData.filter(o => o.status === 'completed' || o.status === 'paid').length;
      const totalPayments = paymentsData.length;

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        completedOrders,
        totalPayments,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer details:', error);
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

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="customers">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  if (!customer) {
    return (
      <RecepionistSideNavbar activeMenu="customers">
        <div className="text-center py-12">
          <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Customer not found</p>
          <button
            onClick={() => navigate('/ReceptionistCustomers')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Customers
          </button>
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="customers">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ReceptionistCustomers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-4"
        >
          <FaArrowLeft /> Back to Customers
        </button>

        {/* Customer Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUser /> Customer Profile
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800">{customer.name}</h3>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-blue-500" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-blue-500" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <span>{customer.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaBuilding className="text-blue-500" />
                    <span>House: {customer.houseno || 'N/A'}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${getStatusColor(customer.status)}`}>
                    {customer.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                    Status: {customer.status}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    Member since: {formatDate(customer.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700/70">Total Orders</p>
                <h3 className="text-2xl font-bold text-blue-800">{stats.totalOrders}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700/70">Total Spent</p>
                <h3 className="text-sm font-bold text-green-800">{formatPrice(stats.totalSpent)}</h3>
              </div>
              <div className="w-10 h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700/70">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-800">{stats.pendingOrders}</h3>
              </div>
              <div className="w-10 h-10 bg-yellow-300/30 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700/70">Payments</p>
                <h3 className="text-2xl font-bold text-purple-800">{stats.totalPayments}</h3>
              </div>
              <div className="w-10 h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
                <FaWallet className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" /> Orders ({orders.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <FaBox className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.orderid} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">#{order.orderid}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {order.serviceid?.servicename || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {orders.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 transition">
                  View all {orders.length} orders
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payments Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaWallet className="text-purple-600" /> Payments ({payments.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No payments found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.slice(0, 5).map((payment) => (
                    <tr key={payment.paymentid} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">#{payment.paymentid}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {payment.paymentmethod}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatPrice(payment.amount)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {payments.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 transition">
                  View all {payments.length} payments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RecepionistSideNavbar>
  );
};

export default ReceptionistCustomerDetail;