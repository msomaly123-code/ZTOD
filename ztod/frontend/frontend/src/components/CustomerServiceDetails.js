// src/components/CustomerServiceDetails.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Row, Col, Card, Badge, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { 
  FaUser, 
  FaSignInAlt, 
  FaUserPlus, 
  FaConciergeBell,
  FaBed,
  FaUtensils,
  FaTshirt,
  FaArrowLeft,
  FaBuilding,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaArrowRight,
  FaImage,
  FaWeightHanging,
  FaShoppingCart,
  FaInfoCircle,
  FaTag,
  FaClock,
  FaEdit,
  FaList,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaClipboardList,
  FaSpinner,
  FaWallet,
  FaMobile,
  FaLock,
  FaShieldAlt,
  FaBell,
} from 'react-icons/fa';
import axios from 'axios';
import CustomerSideNavbar from './CustomerSideNavbar';

const CustomerServiceDetails = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingItem, setBookingItem] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    variant: 'success',
    icon: null
  });

  // Payment states - Only Tigo Pesa and Airtel Money
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'tigo_pesa',
    phoneNumber: '',
    notes: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Payment methods - Only Tigo Pesa and Airtel Money
  const paymentMethods = [
    { id: 'tigo_pesa', label: 'Tigo Pesa', icon: FaMobile, description: 'Pay using Tigo Pesa mobile money', color: '#E60000' },
    { id: 'airtel_money', label: 'Airtel Money', icon: FaMobile, description: 'Pay using Airtel Money mobile money', color: '#FF0000' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchServiceDetails();
  }, [serviceId]);

  // Show notification helper
  const showToastNotification = (title, message, variant = 'success', icon = null) => {
    setNotification({
      title,
      message,
      variant,
      icon: icon || (variant === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />)
    });
    setShowNotification(true);
  };

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Token ${token}` } : {};
      
      const serviceResponse = await axios.get(
        `http://localhost:8000/api/services/${serviceId}/`,
        { headers, timeout: 10000 }
      );
      setService(serviceResponse.data);
      
      const itemsResponse = await axios.get(
        `http://localhost:8000/api/services/${serviceId}/service_items/`,
        { headers, timeout: 10000 }
      );
      
      const processedItems = itemsResponse.data.map(item => ({
        ...item,
        image_url: getImageUrl(item.image)
      }));
      
      setItems(processedItems);
      setError(null);
    } catch (error) {
      console.error('Error fetching service details:', error);
      
      let errorMessage = 'Failed to load service details. ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please check your connection.';
      } else if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Service not found.';
        } else {
          errorMessage += `Server error (${error.response.status}). Please try again later.`;
        }
      } else if (error.request) {
        errorMessage += 'Cannot connect to server. Please make sure the backend is running.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      setError(errorMessage);
      showToastNotification('Error', errorMessage, 'danger');
      
      if (!service) {
        setService(getFallbackService());
      }
      if (items.length === 0) {
        setItems(getFallbackItems());
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/services/')) {
      return `http://localhost:8000${imagePath}`;
    }
    
    if (imagePath.startsWith('/media/')) {
      return `http://localhost:8000${imagePath}`;
    }
    
    if (imagePath.startsWith('media/')) {
      return `http://localhost:8000/${imagePath}`;
    }
    
    if (imagePath.startsWith('services/')) {
      return `http://localhost:8000/${imagePath}`;
    }
    
    return `http://localhost:8000/media/services/${imagePath}`;
  };

  const getFallbackService = () => {
    return {
      serviceid: parseInt(serviceId),
      servicename: 'Service Details',
      category: 'general',
      service_description: 'Service details are currently unavailable.',
      status: 'active',
      image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const getFallbackItems = () => {
    return [
      {
        itemid: 1,
        itemname: 'Basic Package',
        description: 'Standard service package with essential features',
        image: null,
        image_url: null,
        price: 50000,
        quantity: 1,
        totalprice: 50000,
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        itemid: 2,
        itemname: 'Premium Package',
        description: 'Premium service with additional features',
        image: null,
        image_url: null,
        price: 100000,
        quantity: 1,
        totalprice: 100000,
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        itemid: 3,
        itemname: 'Deluxe Package',
        description: 'Deluxe service with all premium features',
        image: null,
        image_url: null,
        price: 150000,
        quantity: 1,
        totalprice: 150000,
        status: 'inactive',
        created_at: new Date().toISOString()
      }
    ];
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'laundry': 'Laundry',
      'conferences': 'Conferences',
      'catering': 'Catering',
      'room_booking': 'Room Booking'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'laundry': 'primary',
      'conferences': 'success',
      'catering': 'warning',
      'room_booking': 'info'
    };
    return colors[category] || 'secondary';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'laundry': <FaTshirt />,
      'conferences': <FaBuilding />,
      'catering': <FaUtensils />,
      'room_booking': <FaBed />
    };
    return icons[category] || <FaConciergeBell />;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'danger';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />;
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
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
      minute: '2-digit'
    });
  };

  // ===== HELPER: Clean phone number for Tanzania =====
  const cleanPhoneNumber = (phone) => {
    if (!phone) return null;
    
    // Remove spaces, dashes, plus signs
    let cleaned = phone.replace(/[\s\-+]/g, '');
    
    // If starts with 0, replace with 255
    if (cleaned.startsWith('0')) {
      if (cleaned.length === 10) {
        return `255${cleaned.substring(1)}`;
      }
      return null;
    }
    
    // If starts with 255 and length is 12, keep as is
    if (cleaned.startsWith('255') && cleaned.length === 12) {
      return cleaned;
    }
    
    // If starts with 71, 75, 76, 77, 78 and length is 9, add 255
    if (/^7[15678]\d{7}$/.test(cleaned) && cleaned.length === 9) {
      return `255${cleaned}`;
    }
    
    return null;
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 1;
    setQuantity(qty);
    if (bookingItem) {
      setPaymentData(prev => ({
        ...prev,
        amount: (bookingItem.price * qty).toString()
      }));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookNow = (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToastNotification('Login Required', 'Please login to book this service', 'warning');
      navigate('/CustomerLogin');
      return;
    }
    
    setBookingItem(item);
    setQuantity(1);
    setPaymentData({
      amount: item.price.toString(),
      paymentMethod: 'tigo_pesa',
      phoneNumber: user?.phone || '',
      notes: ''
    });
    setPaymentSuccess(null);
    setPaymentError(null);
    setShowBookingModal(true);
  };

  // ===== UPDATED: ClickPesa Payment Integration =====
  const handleBookAndPay = async () => {
    if (!bookingItem) return;
    
    // Validate phone number
    const cleanedPhone = cleanPhoneNumber(paymentData.phoneNumber);
    if (!cleanedPhone) {
      showToastNotification(
        'Invalid Phone Number', 
        'Please enter a valid Tanzania phone number (e.g., 0712345678)',
        'danger',
        <FaTimesCircle />
      );
      setPaymentError('Invalid phone number format. Please use format: 0712345678');
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem('token');
      const totalAmount = parseFloat(paymentData.amount) || (bookingItem.price * quantity);

      // 1. Create Order
      const orderData = {
        service_id: serviceId,
        item_id: bookingItem.itemid,
        quantity: quantity,
        total_amount: totalAmount,
        booking_date: new Date().toISOString(),
        notes: paymentData.notes
      };

      console.log('📝 Creating order:', orderData);

      const orderResponse = await axios.post(
        'http://localhost:8000/api/orders/create/',
        orderData,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || 'Failed to create order');
      }

      const order = orderResponse.data.data;
      console.log('✅ Order created:', order);

      // 2. Initiate ClickPesa Payment
      const paymentPayload = {
        order_id: order.order_id,
        payment_method: paymentData.paymentMethod,
        mobile_number: cleanedPhone
      };

      console.log('💳 Initiating payment:', paymentPayload);

      const paymentResponse = await axios.post(
        'http://localhost:8000/api/payments/initiate/',
        paymentPayload,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      console.log('✅ Payment response:', paymentResponse.data);

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.error || 'Payment initiation failed');
      }

      const paymentResult = paymentResponse.data.data;

      // Show success notification
      showToastNotification(
        'Payment Initiated', 
        `Payment of ${formatPrice(totalAmount)} has been initiated. Check your phone for the USSD prompt.`,
        'info',
        <FaWallet />
      );

      // Handle payment URL or redirect
      if (paymentResult.payment_url) {
        // Open payment URL in new window
        const paymentWindow = window.open(paymentResult.payment_url, '_blank');
        
        // If popup was blocked, show message
        if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
          showToastNotification(
            'Popup Blocked', 
            'Please allow popups for this site or click the link in the modal to complete payment.',
            'warning',
            <FaExclamationTriangle />
          );
          // Show a direct link in the modal
          setPaymentSuccess({
            message: 'Click the link below to complete your payment:',
            orderId: order.order_id,
            transactionId: paymentResult.transaction_id,
            paymentUrl: paymentResult.payment_url
          });
          setProcessingPayment(false);
          return;
        }
        
        setPaymentSuccess({
          message: 'Payment initiated! Please complete the payment in the popup window.',
          orderId: order.order_id,
          transactionId: paymentResult.transaction_id
        });

        // Poll for payment status
        let attempts = 0;
        const maxAttempts = 24; // 24 * 5 seconds = 2 minutes
        
        const checkPaymentStatus = setInterval(async () => {
          attempts++;
          console.log(`🔄 Checking payment status (${attempts}/${maxAttempts})...`);
          
          try {
            const statusResponse = await axios.get(
              `http://localhost:8000/api/payments/verify/${paymentResult.transaction_id}/`,
              { headers: { 'Authorization': `Token ${token}` } }
            );
            
            console.log('📊 Status response:', statusResponse.data);
            
            if (statusResponse.data.status === 'completed') {
              clearInterval(checkPaymentStatus);
              if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
              
              setPaymentSuccess({
                message: '✅ Payment completed successfully!',
                orderId: order.order_id,
                transactionId: paymentResult.transaction_id
              });
              
              showToastNotification(
                'Payment Successful', 
                `Your payment of ${formatPrice(totalAmount)} for ${bookingItem.itemname} was successful!`,
                'success',
                <FaCheckCircle />
              );
              
              // Update booking status
              setBookingStatus('success');
              setBookingMessage(`✅ Successfully booked ${bookingItem.itemname}!`);
              
              setTimeout(() => {
                setShowBookingModal(false);
                setBookingItem(null);
                setPaymentSuccess(null);
                navigate('/CustomerDashboard');
              }, 3000);
              
            } else if (statusResponse.data.status === 'failed') {
              clearInterval(checkPaymentStatus);
              if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
              
              setPaymentError('Payment failed. Please try again.');
              showToastNotification(
                'Payment Failed', 
                'Your payment could not be processed. Please try again.',
                'danger',
                <FaTimesCircle />
              );
            }
          } catch (err) {
            console.error('Status check error:', err);
          }
          
          // If max attempts reached, stop polling
          if (attempts >= maxAttempts) {
            clearInterval(checkPaymentStatus);
            showToastNotification(
              'Payment Timeout', 
              'Payment is taking longer than expected. Please check your dashboard for status.',
              'warning',
              <FaExclamationTriangle />
            );
          }
        }, 5000);

      } else if (paymentResult.redirect_url) {
        // Redirect to payment page
        window.location.href = paymentResult.redirect_url;
        
      } else {
        // Payment created without redirect
        setPaymentSuccess({
          message: 'Booking created successfully! Payment is being processed.',
          orderId: order.order_id,
          transactionId: paymentResult.transaction_id
        });
        
        showToastNotification(
          'Booking Created', 
          `Your booking for ${bookingItem.itemname} has been created.`,
          'success',
          <FaCheckCircle />
        );
        
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingItem(null);
          setPaymentSuccess(null);
          navigate('/CustomerDashboard');
        }, 3000);
      }

    } catch (error) {
      console.error('❌ Error processing:', error);
      let errorMessage = error.message || 'Failed to process. Please try again.';
      
      // Extract error from response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      // Handle specific errors
      if (errorMessage.includes('insufficient balance') || errorMessage.includes('balance')) {
        errorMessage = 'Insufficient balance. Please check your mobile money account.';
      } else if (errorMessage.includes('phone number') || errorMessage.includes('mobile number')) {
        errorMessage = 'Invalid phone number. Please check and try again.';
      } else if (errorMessage.includes('KYC')) {
        errorMessage = 'KYC verification is pending. Please complete KYC on ClickPesa.';
      }
      
      setPaymentError(errorMessage);
      showToastNotification(
        'Payment Failed', 
        errorMessage,
        'danger',
        <FaTimesCircle />
      );
      
      setBookingStatus('error');
      setBookingMessage(`❌ ${errorMessage}`);
      
      setTimeout(() => {
        setBookingStatus(null);
        setBookingMessage('');
        setPaymentError(null);
      }, 8000);
    } finally {
      setProcessingPayment(false);
    }
  };

  const closeModal = () => {
    if (!isProcessing && !processingPayment) {
      setShowBookingModal(false);
      setBookingItem(null);
      setPaymentError(null);
    }
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', e.target.src);
    e.target.style.display = 'none';
    const placeholder = e.target.parentElement?.querySelector('.image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  const totalItems = items.length;
  const activeItems = items.filter(i => i.status === 'active').length;
  const inactiveItems = items.filter(i => i.status === 'inactive').length;
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const avgPrice = totalItems > 0 ? totalPrice / totalItems : 0;

  if (loading) {
    return (
      <CustomerSideNavbar activeMenu="services">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </CustomerSideNavbar>
    );
  }

  return (
    <CustomerSideNavbar activeMenu="services">
      {/* Toast Notifications - Top Right */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={showNotification} 
          onClose={() => setShowNotification(false)} 
          delay={6000} 
          autohide
          bg={notification.variant}
        >
          <Toast.Header>
            <span className="me-2">{notification.icon}</span>
            <strong className="me-auto">{notification.title}</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body className={notification.variant === 'success' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Container fluid className="flex-grow-1 py-4">
        <Row className="justify-content-center">
          <Col lg={11} xl={10} xxl={9}>
            
            {/* Back Button */}
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="d-inline-flex align-items-center gap-2 mb-4"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> Back to Services
            </Button>

            {error && !bookingStatus && (
              <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                <FaExclamationTriangle className="text-warning" />
                <div>
                  <strong>Note:</strong> {error}
                </div>
              </div>
            )}

            {service && (
              <>
                {/* Service Header */}
                <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-4">
                  <div className="row g-0">
                    <div className="col-md-4" style={{ minHeight: '300px' }}>
                      {service.image ? (
                        <img 
                          src={getImageUrl(service.image)} 
                          alt={service.servicename}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover', minHeight: '300px' }}
                          onError={(e) => {
                            console.log('❌ Service image failed to load');
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-light" style={{ minHeight: '300px' }}>
                          <div className="text-center">
                            <div className="display-1 text-secondary">{getCategoryIcon(service.category)}</div>
                            <p className="text-muted">No Image Available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-8 p-4">
                      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                        <div>
                          <h2 className="fw-bold mb-2">{service.servicename}</h2>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <Badge bg={getCategoryColor(service.category)} className="d-flex align-items-center gap-1 px-3 py-2">
                              {getCategoryIcon(service.category)} {getCategoryLabel(service.category)}
                            </Badge>
                            <Badge bg={getStatusColor(service.status)} className="d-flex align-items-center gap-1 px-3 py-2">
                              {getStatusIcon(service.status)} {getStatusLabel(service.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Badge bg="info" className="d-flex align-items-center gap-1 px-3 py-2">
                            <FaBox /> {items.length} Items
                          </Badge>
                        </div>
                      </div>
                      
                      {service.service_description && (
                        <div className="mb-3">
                          <h6 className="fw-bold d-flex align-items-center gap-2">
                            <FaInfoCircle className="text-primary" /> Description
                          </h6>
                          <p className="text-muted mb-0">{service.service_description}</p>
                        </div>
                      )}
                      
                      <div className="row g-2 mt-3">
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <FaIdCard className="text-primary" />
                            <span>Service ID: <strong>#{service.serviceid}</strong></span>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <FaTag className="text-primary" />
                            <span>Category: <strong>{getCategoryLabel(service.category)}</strong></span>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <FaCalendarAlt className="text-primary" />
                            <span>Created: <strong>{formatDate(service.created_at)}</strong></span>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <FaEdit className="text-primary" />
                            <span>Updated: <strong>{formatDate(service.updated_at)}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Statistics */}
                <Row className="g-3 mb-4">
                  <Col xs={6} md={3}>
                    <div className="bg-white rounded-3 shadow-sm p-3 text-center">
                      <div className="display-6 text-primary">{totalItems}</div>
                      <p className="text-muted small mb-0">Total Items</p>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="bg-white rounded-3 shadow-sm p-3 text-center">
                      <div className="display-6 text-success">{activeItems}</div>
                      <p className="text-muted small mb-0">Active Items</p>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="bg-white rounded-3 shadow-sm p-3 text-center">
                      <div className="display-6 text-danger">{inactiveItems}</div>
                      <p className="text-muted small mb-0">Inactive Items</p>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="bg-white rounded-3 shadow-sm p-3 text-center">
                      <div className="display-6 text-warning">{formatPrice(avgPrice)}</div>
                      <p className="text-muted small mb-0">Average Price</p>
                    </div>
                  </Col>
                </Row>

                {/* Tab Navigation */}
                <div className="bg-white rounded-3 shadow-sm p-3 mb-4">
                  <div className="d-flex gap-2 flex-wrap">
                    <Button 
                      variant={activeTab === 'items' ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('items')}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaList /> All Items ({items.length})
                    </Button>
                    <Button 
                      variant={activeTab === 'active' ? 'success' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('active')}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaCheckCircle /> Active ({activeItems})
                    </Button>
                    <Button 
                      variant={activeTab === 'inactive' ? 'danger' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('inactive')}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaTimesCircle /> Inactive ({inactiveItems})
                    </Button>
                    <Button 
                      variant={activeTab === 'details' ? 'info' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('details')}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaInfoCircle /> Service Details
                    </Button>
                  </div>
                </div>

                {/* Items Tab Content */}
                {(activeTab === 'items' || activeTab === 'active' || activeTab === 'inactive') && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                      <h5 className="d-flex align-items-center gap-2 mb-0">
                        <FaBox className="text-primary" /> 
                        {activeTab === 'items' && 'All Items'}
                        {activeTab === 'active' && 'Active Items'}
                        {activeTab === 'inactive' && 'Inactive Items'}
                        <Badge bg="secondary" pill className="ms-2">
                          {activeTab === 'items' && items.length}
                          {activeTab === 'active' && activeItems}
                          {activeTab === 'inactive' && inactiveItems}
                        </Badge>
                      </h5>
                    </div>
                    
                    {items.length === 0 ? (
                      <div className="text-center py-4 bg-white rounded-3 shadow-sm">
                        <FaBox className="display-3 text-muted mb-3" />
                        <p className="text-muted">No items available for this service.</p>
                      </div>
                    ) : (
                      <div className="services-container">
                        <Row className="g-3">
                          {items
                            .filter(item => {
                              if (activeTab === 'active') return item.status === 'active';
                              if (activeTab === 'inactive') return item.status === 'inactive';
                              return true;
                            })
                            .map((item, index) => (
                            <Col xs={12} sm={6} lg={4} key={item.itemid}>
                              <div 
                                className="item-wrapper"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <Card className={`shadow-sm h-100 item-card ${item.status === 'inactive' ? 'inactive-item' : ''}`}>
                                  <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                                    {item.image_url ? (
                                      <img 
                                        src={item.image_url} 
                                        alt={item.itemname}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                        onError={handleImageError}
                                      />
                                    ) : null}
                                    
                                    <div 
                                      className="image-placeholder w-100 h-100 d-flex align-items-center justify-content-center flex-column"
                                      style={{ 
                                        display: item.image_url ? 'none' : 'flex',
                                        backgroundColor: '#f8f9fa',
                                      }}
                                    >
                                      <FaImage className="display-3 text-secondary mb-2" />
                                      <p className="text-muted small mb-0">No Image</p>
                                    </div>
                                    
                                    <Badge 
                                      bg={getStatusColor(item.status)} 
                                      className="position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1"
                                    >
                                      {getStatusIcon(item.status)}
                                      {getStatusLabel(item.status)}
                                    </Badge>
                                  </div>

                                  <Card.Body className="p-3">
                                    <h6 className="fw-bold mb-1">{item.itemname}</h6>
                                    
                                    {item.description && (
                                      <p className="text-muted small mb-2">{item.description}</p>
                                    )}
                                    
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                      {item.price && (
                                        <Badge bg="info" className="d-flex align-items-center gap-1">
                                          <FaMoneyBillWave /> Price: {formatPrice(item.price)}
                                        </Badge>
                                      )}
                                      {item.quantity && (
                                        <Badge bg="secondary" className="d-flex align-items-center gap-1">
                                          <FaWeightHanging /> Qty: {item.quantity}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                                      <div>
                                        <span className="text-muted small">Total:</span>
                                        <span className="fw-bold text-primary ms-1">
                                          {formatPrice(item.totalprice || item.price)}
                                        </span>
                                      </div>
                                      <Button 
                                        variant={item.status === 'active' ? 'primary' : 'secondary'}
                                        size="sm" 
                                        className="rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                        onClick={() => handleBookNow(item)}
                                        disabled={item.status === 'inactive' || isProcessing}
                                      >
                                        <FaShoppingCart /> Book Now
                                      </Button>
                                    </div>
                                  </Card.Body>
                                  
                                  <Card.Footer className="bg-transparent border-0 p-2">
                                    <small className="text-muted d-flex align-items-center gap-1">
                                      <FaCalendarAlt size={10} />
                                      Added: {formatDate(item.created_at)}
                                    </small>
                                  </Card.Footer>
                                </Card>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <FaInfoCircle className="text-primary" /> Complete Service Information
                    </h5>
                    
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Service ID</p>
                          <p className="fw-bold mb-0">#{service.serviceid}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Service Name</p>
                          <p className="fw-bold mb-0">{service.servicename}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Category</p>
                          <p className="fw-bold mb-0">{getCategoryLabel(service.category)}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Status</p>
                          <Badge bg={getStatusColor(service.status)} className="d-flex align-items-center gap-1">
                            {getStatusIcon(service.status)} {getStatusLabel(service.status)}
                          </Badge>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Description</p>
                          <p className="mb-0">{service.service_description || 'No description available'}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Created At</p>
                          <p className="fw-bold mb-0">{formatDate(service.created_at)}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Last Updated</p>
                          <p className="fw-bold mb-0">{formatDate(service.updated_at)}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Total Items</p>
                          <p className="fw-bold mb-0">{totalItems}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded-3">
                          <p className="text-muted small mb-1">Average Price</p>
                          <p className="fw-bold mb-0">{formatPrice(avgPrice)}</p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Back to Home */}
                <Row className="mb-3">
                  <Col>
                    <div className="text-center">
                      <Button 
                        variant="outline-secondary" 
                        className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                        onClick={() => navigate('/')}
                      >
                        <FaArrowLeft /> Back to Home
                      </Button>
                    </div>
                  </Col>
                </Row>
              </>
            )}

          </Col>
        </Row>
      </Container>

      {/* ===== BOOKING MODAL ===== */}
      {showBookingModal && bookingItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Book & Pay</h5>
              <button className="modal-close" onClick={closeModal} disabled={isProcessing || processingPayment}>×</button>
            </div>
            <div className="modal-body">
              {paymentSuccess ? (
                <div className="text-center p-4">
                  <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
                  <h5 className="fw-bold text-green-700">Success!</h5>
                  <p className="text-green-600">{paymentSuccess.message}</p>
                  {paymentSuccess.orderId && (
                    <p className="text-sm text-green-500">
                      Order #{paymentSuccess.orderId} {paymentSuccess.transactionId && `• Transaction #${paymentSuccess.transactionId}`}
                    </p>
                  )}
                  {paymentSuccess.paymentUrl && (
                    <div className="mt-3">
                      <a 
                        href={paymentSuccess.paymentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Click here to complete payment
                      </a>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                </div>
              ) : (
                <>
                  {/* Payment Error */}
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-600 text-sm font-medium">❌ {paymentError}</p>
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      {bookingItem.image_url ? (
                        <img 
                          src={bookingItem.image_url} 
                          alt={bookingItem.itemname} 
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FaImage className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h6 className="fw-bold mb-0">{bookingItem.itemname}</h6>
                        <p className="text-sm text-gray-500">{service?.servicename}</p>
                        <p className="text-sm font-semibold text-blue-600">{formatPrice(bookingItem.price)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LEFT - Booking Details */}
                    <div>
                      <h6 className="fw-semibold text-gray-800 mb-2">Booking Details</h6>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          max={bookingItem.quantity || 10}
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          name="notes"
                          value={paymentData.notes}
                          onChange={handlePaymentChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Any special requests..."
                        />
                      </div>
                    </div>

                    {/* RIGHT - Payment Details */}
                    <div>
                      <h6 className="fw-semibold text-gray-800 mb-2">Payment Details</h6>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (TSh)</label>
                        <input
                          type="number"
                          name="amount"
                          value={paymentData.amount}
                          onChange={handlePaymentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          {paymentMethods.map((method) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentData({ ...paymentData, paymentMethod: method.id })}
                              className={`p-3 border-2 rounded-lg text-center transition ${
                                paymentData.paymentMethod === method.id 
                                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <method.icon 
                                className={`text-2xl mx-auto ${paymentData.paymentMethod === method.id ? 'text-blue-500' : 'text-gray-400'}`} 
                                style={{ color: paymentData.paymentMethod === method.id ? method.color : '' }}
                              />
                              <p className={`text-sm font-medium mt-1 ${paymentData.paymentMethod === method.id ? 'text-blue-600' : 'text-gray-700'}`}>
                                {method.label}
                              </p>
                              <p className="text-xs text-gray-400">{method.description}</p>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <FaShieldAlt className="inline mr-1" /> Payments are processed securely via ClickPesa
                        </p>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaPhone className="inline mr-1" /> Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={paymentData.phoneNumber}
                          onChange={handlePaymentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 0712345678"
                          required
                          maxLength="10"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Enter the phone number registered with {paymentData.paymentMethod === 'tigo_pesa' ? 'Tigo Pesa' : 'Airtel Money'}
                        </p>
                        <p className="text-xs text-green-500 mt-1">
                          💡 Format: 0712345678 (without spaces or special characters)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 rounded-lg p-3 flex items-start border border-blue-100 mt-4">
                    <FaLock className="text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Secure Payment</p>
                      <p className="text-xs text-gray-500">Your payment is processed securely via ClickPesa. You will receive a confirmation once complete.</p>
                    </div>
                    <FaShieldAlt className="text-blue-600 ml-auto" />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {!paymentSuccess && (
                <>
                  <Button variant="secondary" onClick={closeModal} disabled={isProcessing || processingPayment} className="modal-cancel-btn">
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleBookAndPay}
                    disabled={isProcessing || processingPayment || !paymentData.amount || !paymentData.phoneNumber}
                    className="modal-pay-btn"
                  >
                    {processingPayment ? (
                      <><FaSpinner className="spinner-border spinner-border-sm me-2" /> Processing...</>
                    ) : (
                      <><FaMoneyBillWave className="me-2" /> Pay with {paymentData.paymentMethod === 'tigo_pesa' ? 'Tigo Pesa' : 'Airtel Money'}</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== STYLES ===== */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 1rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 700px;
          width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 1;
          border-radius: 16px 16px 0 0;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6b7280;
          padding: 0 4px;
          line-height: 1;
        }

        .modal-close:hover {
          color: #1a1a2e;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid #e5e7eb;
          position: sticky;
          bottom: 0;
          background: white;
          border-radius: 0 0 16px 16px;
          flex-wrap: wrap;
        }

        .modal-cancel-btn {
          border-radius: 50px;
          font-size: 0.85rem;
          padding: 0.4rem 1.2rem;
        }

        .modal-pay-btn {
          border-radius: 50px;
          font-size: 0.85rem;
          padding: 0.4rem 1.2rem;
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          border: none;
        }

        .modal-pay-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 25px rgba(13, 110, 253, 0.3);
        }

        .modal-pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.15em;
        }

        .item-wrapper {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .item-card {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
          border: 2px solid transparent;
          border-radius: 12px;
          overflow: hidden;
        }

        .item-card:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.12) !important;
          border-color: rgba(13, 110, 253, 0.3);
        }

        .item-wrapper:nth-child(1) .item-card { animation: floatItem 4s ease-in-out infinite; }
        .item-wrapper:nth-child(2) .item-card { animation: floatItem 4.5s ease-in-out infinite 0.5s; }
        .item-wrapper:nth-child(3) .item-card { animation: floatItem 5s ease-in-out infinite 1s; }
        .item-wrapper:nth-child(4) .item-card { animation: floatItem 4.2s ease-in-out infinite 1.5s; }
        .item-wrapper:nth-child(5) .item-card { animation: floatItem 4.8s ease-in-out infinite 0.3s; }
        .item-wrapper:nth-child(6) .item-card { animation: floatItem 5.2s ease-in-out infinite 0.8s; }

        @keyframes floatItem {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.005); }
          100% { transform: translateY(0px) scale(1); }
        }

        .item-card:hover {
          animation-play-state: paused !important;
          transform: translateY(-8px) scale(1.015) !important;
        }

        .inactive-item {
          opacity: 0.7;
          filter: grayscale(0.2);
        }

        .inactive-item .item-card {
          border-color: rgba(220, 53, 69, 0.2);
        }

        .inactive-item .item-card:hover {
          animation-play-state: paused !important;
          transform: translateY(-3px) scale(1.005) !important;
          border-color: rgba(220, 53, 69, 0.4);
        }

        .image-placeholder {
          background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        }

        /* Toast Notifications */
        .toast-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 9999;
        }

        .toast {
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          min-width: 320px;
        }

        .toast-header {
          border-bottom: none;
          padding: 12px 16px;
        }

        .toast-body {
          padding: 12px 16px 16px;
          font-size: 14px;
        }

        .bg-success .toast-header {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .bg-danger .toast-header {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .bg-warning .toast-header {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .bg-info .toast-header {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        @media (max-width: 576px) {
          .modal-overlay {
            align-items: flex-end;
            padding: 0;
          }
          
          .modal-content {
            max-height: 100vh;
            border-radius: 16px 16px 0 0;
            margin-top: auto;
          }
          
          .modal-header {
            border-radius: 16px 16px 0 0;
          }
          
          .modal-footer {
            flex-direction: column-reverse;
          }
          
          .modal-cancel-btn,
          .modal-pay-btn {
            width: 100%;
            justify-content: center;
          }
          
          .item-wrapper:nth-child(n) .item-card {
            animation: floatItem 3s ease-in-out infinite !important;
          }

          .toast {
            min-width: unset;
            width: 100%;
          }

          .toast-container {
            right: 10px;
            left: 10px;
            width: calc(100% - 20px);
          }
        }

        @media (max-width: 400px) {
          .modal-body {
            padding: 12px;
          }
          
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </CustomerSideNavbar>
  );
};

export default CustomerServiceDetails;