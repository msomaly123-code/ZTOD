// src/components/CustomerPaymentConfirmation.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import CustomerSideNavbar from './CustomerSideNavbar';

const CustomerPaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('paymentId');

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    } else {
      navigate('/CustomerDashboard');
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:8000/api/payments/${paymentId}/`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      setPayment(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching payment:', error);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
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
      <CustomerSideNavbar activeMenu="payments">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </CustomerSideNavbar>
    );
  }

  if (error || !payment) {
    return (
      <CustomerSideNavbar activeMenu="payments">
        <div className="text-center py-12">
          <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{error || 'Payment not found'}</p>
          <button
            onClick={() => navigate('/CustomerPayments')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View All Payments
          </button>
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="payments">
      <div className="max-w-2xl mx-auto">
        {payment.status === 'completed' ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your payment has been completed successfully.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-medium">#{payment.paymentid}</span>
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-blue-600">{formatPrice(payment.amount)}</span>
                <span className="text-gray-500">Method:</span>
                <span>{payment.paymentmethod}</span>
                <span className="text-gray-500">Date:</span>
                <span>{formatDate(payment.date)}</span>
                <span className="text-gray-500">Status:</span>
                <span className="text-green-600 font-medium">{payment.status}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/CustomerDashboard')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/CustomerPayments')}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                View All Payments
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Your payment was not completed. Please try again.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-medium">#{payment.paymentid}</span>
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-blue-600">{formatPrice(payment.amount)}</span>
                <span className="text-gray-500">Status:</span>
                <span className="text-red-600 font-medium">{payment.status}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/CustomerPayment')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/CustomerDashboard')}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerSideNavbar>
  );
};

export default CustomerPaymentConfirmation;