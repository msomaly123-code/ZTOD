// src/components/CustomerOrderDetail.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClipboardList,
  FaInfoCircle,
  FaPrint,
  FaShoppingCart,
} from 'react-icons/fa';
import axios from 'axios';
import CustomerSideNavbar from './CustomerSideNavbar';

const CustomerOrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/CustomerLogin');
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/orders/${orderId}/`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      setOrder(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      paid: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      paid: 'Paid',
    };
    return labels[status] || status;
  };

  const formatPrice = (price) => {
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (error || !order) {
    return (
      <CustomerSideNavbar activeMenu="orders">
        <div className="text-center py-12">
          <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/CustomerOrders')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Orders
          </button>
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="orders">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/CustomerOrders')}
              className="text-gray-600 hover:text-gray-800 transition p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaClipboardList className="text-blue-600" /> Order Details
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Order #{order.orderid} • {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <FaPrint /> Print
          </button>
        </div>

        {/* Order Status */}
        <div className={`p-4 rounded-xl border-2 mb-6 ${getStatusColor(order.status)}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getStatusIcon(order.status)}</div>
            <div>
              <p className="font-semibold">Order Status: {getStatusLabel(order.status)}</p>
              <p className="text-sm opacity-75">
                Last updated: {formatDate(order.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FaUser className="text-gray-400" />
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-800">{order.customerid?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-800">{order.customerid?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-800">{order.customerid?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" /> Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-800">#{order.orderid}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-800">{order.serviceid?.servicename || 'N/A'}</span>
              </div>
              {order.item && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium text-gray-800">{order.item?.itemname || 'N/A'}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-800">{order.quantity || 1}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-600 font-semibold">Total Amount:</span>
                <span className="font-bold text-blue-600 text-lg">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" /> Notes
            </h3>
            <p className="text-gray-600 text-sm">{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/CustomerOrders')}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Orders
          </button>
          {(order.status === 'pending' || order.status === 'processing') && (
            <button
              onClick={() => navigate(`/CustomerPayment?orderId=${order.orderid}`)}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaMoneyBillWave className="inline mr-2" /> Make Payment
            </button>
          )}
          <button
            onClick={() => navigate('/CustomerServices')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaShoppingCart className="inline mr-2" /> Book Another Service
          </button>
        </div>
      </div>
    </CustomerSideNavbar>
  );
};

export default CustomerOrderDetail;