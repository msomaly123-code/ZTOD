// src/components/CustomerPayment.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaSignOutAlt, 
  FaHome,
  FaUserCircle,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobile,
  FaMoneyBill,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaShieldAlt,
  FaReceipt,
  FaSpinner,
  FaWallet,
  FaUniversity,
  FaClipboardList,
  FaInfoCircle,
} from 'react-icons/fa';
import axios from 'axios';
import CustomerSideNavbar from './CustomerSideNavbar';

const CustomerPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'M-Pesa',
    phoneNumber: '',
    reference: '',
    notes: ''
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('bookingId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    if (!token || !userStr) {
      navigate('/CustomerLogin');
      return;
    }

    if (role !== 'customer') {
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/CustomerLogin');
      return;
    }

    if (bookingId) {
      fetchBookingDetails(bookingId);
    }
  }, [navigate, bookingId]);

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const fetchBookingDetails = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:8000/api/bookings/${id}/`,
        {
          headers: { 'Authorization': `Token ${token}` }
        }
      );
      
      setBooking(response.data);
      setPaymentData({
        ...paymentData,
        amount: response.data.total_amount || response.data.amount || '',
        reference: `BOOK-${response.data.id}`
      });
      
    } catch (error) {
      console.error('Error fetching booking:', error);
      showToastNotification('Failed to load booking details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccess(null);

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      showToastNotification('Please enter a valid amount', 'danger');
      setProcessing(false);
      return;
    }

    if (!paymentData.paymentMethod) {
      showToastNotification('Please select a payment method', 'danger');
      setProcessing(false);
      return;
    }

    if (paymentData.paymentMethod === 'M-Pesa' || paymentData.paymentMethod === 'Tigo Pesa') {
      if (!paymentData.phoneNumber || paymentData.phoneNumber.length < 10) {
        showToastNotification('Please enter a valid phone number', 'danger');
        setProcessing(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr);

      const paymentPayload = {
        booking_id: bookingId || booking?.id,
        customer_id: userData.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.paymentMethod,
        phone_number: paymentData.phoneNumber,
        reference: paymentData.reference,
        notes: paymentData.notes,
        status: 'pending'
      };

      const response = await axios.post(
        'http://localhost:8000/api/payments/create/',
        paymentPayload,
        {
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToastNotification('✅ Payment initiated successfully!', 'success');
      setSuccess({
        message: 'Payment initiated successfully!',
        paymentId: response.data.payment_id || response.data.id
      });

      setTimeout(() => {
        navigate(`/customer-payment-confirmation?paymentId=${response.data.payment_id || response.data.id}`);
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      if (error.response) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      showToastNotification(`❌ ${errorMessage}`, 'danger');
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://localhost:8000/api/logout/', {}, {
          headers: { 'Authorization': `Token ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      navigate('/CustomerLogin');
    }
  };

  const paymentMethods = [
    { id: 'M-Pesa', label: 'M-Pesa', icon: FaMobile, description: 'Pay using M-Pesa mobile money' },
    { id: 'Tigo Pesa', label: 'Tigo Pesa', icon: FaMobile, description: 'Pay using Tigo Pesa mobile money' },
    { id: 'Cash', label: 'Cash', icon: FaMoneyBill, description: 'Pay with cash at our office' },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: FaUniversity, description: 'Pay via bank transfer' }
  ];

  const formatPrice = (price) => {
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  return (
    <CustomerSideNavbar activeMenu="payments">
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
            <FaMoneyBillWave className="text-blue-600" /> Make Payment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete your payment securely
          </p>
        </div>
        <Link
          to="/CustomerDashboard"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm no-underline"
        >
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Booking Details */}
        {booking && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" /> Booking Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Booking ID</p>
                <p className="font-medium text-gray-800">#{booking.id}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium text-gray-800">{booking.service_name || booking.service?.name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-800">{booking.booking_date ? formatDate(booking.booking_date) : 'N/A'}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-bold text-blue-600 text-lg">{formatPrice(booking.total_amount || booking.amount || '0')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaWallet className="text-blue-600" /> Payment Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">Complete your payment securely</p>
          </div>

          <div className="p-6">
            <form onSubmit={handlePayment}>
              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (TSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    TSh
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-16 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Enter amount"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData, paymentMethod: method.id })}
                      className={`p-4 border-2 rounded-xl text-left transition-all duration-200 no-underline ${
                        paymentData.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <method.icon className={`text-2xl ${
                          paymentData.paymentMethod === method.id ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                        <div className="ml-3">
                          <p className={`font-medium ${
                            paymentData.paymentMethod === method.id ? 'text-blue-600' : 'text-gray-700'
                          }`}>
                            {method.label}
                          </p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              {(paymentData.paymentMethod === 'M-Pesa' || paymentData.paymentMethod === 'Tigo Pesa') && (
                <div className="mb-4 animate-slideDown">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={paymentData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="e.g. 0712345678"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the phone number registered with {paymentData.paymentMethod}
                  </p>
                </div>
              )}

              {/* Reference */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference (Optional)
                </label>
                <input
                  type="text"
                  name="reference"
                  value={paymentData.reference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="e.g. Booking #123"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Any additional information"
                  rows="2"
                />
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start border border-blue-100">
                <FaLock className="text-blue-600 mt-1 mr-3 text-lg" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Secure Payment</p>
                  <p className="text-xs text-gray-500">
                    Your payment information is secure and encrypted. We do not store your payment details.
                  </p>
                </div>
                <FaShieldAlt className="text-blue-600 ml-auto text-lg" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center no-underline ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                }`}
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave className="mr-2" />
                    Pay Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </CustomerSideNavbar>
  );
};

export default CustomerPayment;