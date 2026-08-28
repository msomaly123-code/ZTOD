// src/components/ServiceDetail.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
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
  FaShoppingCart,
  FaInfoCircle,
  FaTag,
  FaClock,
  FaList,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaSpinner,
  FaWallet,
  FaMobile,
  FaMoneyBill,
  FaUniversity,
  FaLock,
  FaShieldAlt,
  FaChevronLeft,
} from 'react-icons/fa';
import axios from 'axios';

const ServiceDetail = () => {
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'M-Pesa',
    phoneNumber: '',
    reference: '',
    notes: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const paymentMethods = [
    { id: 'M-Pesa', label: 'M-Pesa', icon: FaMobile, description: 'Pay using M-Pesa mobile money' },
    { id: 'Tigo Pesa', label: 'Tigo Pesa', icon: FaMobile, description: 'Pay using Tigo Pesa mobile money' },
    { id: 'Cash', label: 'Cash', icon: FaMoneyBill, description: 'Pay with cash at our office' },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: FaUniversity, description: 'Pay via bank transfer' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (token) {
      setIsLoggedIn(true);
    }
    fetchServiceDetails();
  }, [serviceId]);

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
      navigate('/CustomerLogin');
      return;
    }
    
    setBookingItem(item);
    setQuantity(1);
    setPaymentData({
      amount: item.price.toString(),
      paymentMethod: 'M-Pesa',
      phoneNumber: user?.phone || '',
      reference: `BOOK-${item.itemid}`,
      notes: ''
    });
    setPaymentSuccess(null);
    setShowBookingModal(true);
  };

  const handleBookAndPay = async () => {
    if (!bookingItem) return;
    
    setProcessingPayment(true);

    try {
      const token = localStorage.getItem('token');
      const totalAmount = parseFloat(paymentData.amount) || (bookingItem.price * quantity);

      const orderData = {
        customerid: user?.id,
        serviceid: serviceId,
        item: bookingItem.itemid,
        quantity: quantity,
        totalAmount: totalAmount,
        status: 'pending',
        notes: `Booking for ${bookingItem.itemname} (Quantity: ${quantity})\n${paymentData.notes}`
      };

      const orderResponse = await axios.post(
        'http://localhost:8000/api/orders/',
        orderData,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      const order = orderResponse.data;

      const paymentPayload = {
        orderid: order.orderid,
        customerid: user?.id,
        amount: totalAmount,
        paymentmethod: paymentData.paymentMethod,
        transaction_id: paymentData.reference || `PAY-${Date.now()}`,
        status: 'completed'
      };

      const paymentResponse = await axios.post(
        'http://localhost:8000/api/payments/',
        paymentPayload,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      setPaymentSuccess({
        message: 'Booking and payment completed successfully!',
        orderId: order.orderid,
        paymentId: paymentResponse.data.paymentid
      });

      setBookingStatus('success');
      setBookingMessage(`✅ Successfully booked ${bookingItem.itemname}!`);

      setTimeout(() => {
        setShowBookingModal(false);
        setBookingItem(null);
        setPaymentSuccess(null);
        navigate('/CustomerDashboard');
      }, 3000);

    } catch (error) {
      console.error('Error processing:', error);
      let errorMessage = 'Failed to process. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setBookingStatus('error');
      setBookingMessage(`❌ ${errorMessage}`);
      setTimeout(() => {
        setBookingStatus(null);
        setBookingMessage('');
      }, 5000);
    } finally {
      setProcessingPayment(false);
    }
  };

  const closeModal = () => {
    if (!isProcessing && !processingPayment) {
      setShowBookingModal(false);
      setBookingItem(null);
    }
  };

  const handleImageError = (e) => {
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
      <div className="d-flex flex-column min-vh-100">
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm sticky-top">
          <Container>
            <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
              <FaChartLine className="me-2" /> ZITOD
            </Navbar.Brand>
          </Container>
        </Navbar>
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ===== NAVBAR ===== */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm sticky-top glass-navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-5 brand">
            <FaChartLine className="me-2" /> ZITOD
          </Navbar.Brand>
          
          <div className="d-flex align-items-center gap-2">
            {isLoggedIn && user && (
              <div className="d-none d-lg-block">
                <Badge bg="info" className="d-flex align-items-center gap-1 px-2 py-1 small">
                  <FaUser size={12} /> {user.full_name || user.username}
                </Badge>
              </div>
            )}
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </div>
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-lg-center gap-2">
              <Nav.Link as={Link} to="/" className="nav-link-custom">
                <Button variant="outline-light" size="sm" className="nav-btn">
                  <FaArrowLeft className="me-1" /> Back
                </Button>
              </Nav.Link>
              
              {isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/CustomerDashboard" className="nav-link-custom">
                    <Button variant="success" size="sm" className="nav-btn">
                      <FaUser className="me-1 d-sm-none d-inline" /> 
                      <span className="d-none d-sm-inline"><FaUser className="me-1" />Dashboard</span>
                    </Button>
                  </Nav.Link>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="nav-btn"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      setUser(null);
                      navigate('/');
                    }}
                  >
                    <FaSignInAlt className="me-1 d-sm-none d-inline" /> 
                    <span className="d-none d-sm-inline"><FaSignInAlt className="me-1" />Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/CustomerLogin" className="nav-link-custom">
                    <Button variant="outline-light" size="sm" className="nav-btn">
                      <FaUser className="me-1 d-sm-none d-inline" /> 
                      <span className="d-none d-sm-inline"><FaUser className="me-1" />Login</span>
                    </Button>
                  </Nav.Link>
                  
                  <Nav.Link as={Link} to="/CustomerRegister" className="nav-link-custom">
                    <Button variant="primary" size="sm" className="nav-btn register-btn">
                      <FaUserPlus className="me-1 d-sm-none d-inline" /> 
                      <span className="d-none d-sm-inline"><FaUserPlus className="me-1" />Register</span>
                    </Button>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ===== MAIN CONTENT ===== */}
      <Container fluid className="flex-grow-1 py-3 py-md-4">
        <Row className="justify-content-center">
          <Col lg={11} xl={10} xxl={9}>
            
            {/* Back Button - Mobile Friendly */}
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="back-btn mb-3"
              onClick={() => navigate(-1)}
            >
              <FaChevronLeft className="me-1" /> Back
            </Button>

            {error && (
              <div className="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
                <FaExclamationTriangle className="text-warning" />
                <div>
                  <strong>Note:</strong> {error}
                </div>
              </div>
            )}
            
            {service && (
              <>
                {/* ===== SERVICE HEADER ===== */}
                <div className="service-header bg-white rounded-3 shadow-sm overflow-hidden mb-4">
                  <div className="service-header-grid">
                    <div className="service-header-image">
                      {service.image ? (
                        <img 
                          src={getImageUrl(service.image)} 
                          alt={service.servicename}
                          className="service-header-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="service-header-placeholder">
                          <div className="service-header-icon">{getCategoryIcon(service.category)}</div>
                          <p className="text-muted small">No Image Available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="service-header-info">
                      <div className="service-header-top">
                        <div>
                          <h1 className="service-header-title">{service.servicename}</h1>
                          <div className="service-header-badges">
                            <Badge bg={getCategoryColor(service.category)} className="badge-category">
                              {getCategoryIcon(service.category)} {getCategoryLabel(service.category)}
                            </Badge>
                            <Badge bg={getStatusColor(service.status)} className="badge-status">
                              {getStatusIcon(service.status)} {getStatusLabel(service.status)}
                            </Badge>
                          </div>
                        </div>
                        <Badge bg="info" className="badge-items-count">
                          <FaBox className="me-1" /> {items.length} Items
                        </Badge>
                      </div>
                      
                      {service.service_description && (
                        <div className="service-header-description">
                          <p>{service.service_description}</p>
                        </div>
                      )}
                      
                      <div className="service-header-meta">
                        <div className="meta-item">
                          <FaTag className="text-primary" />
                          <span>Category: <strong>{getCategoryLabel(service.category)}</strong></span>
                        </div>
                        <div className="meta-item">
                          <FaCalendarAlt className="text-primary" />
                          <span>Created: <strong>{formatDate(service.created_at)}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== TAB NAVIGATION ===== */}
                <div className="tab-navigation bg-white rounded-3 shadow-sm p-2 p-md-3 mb-4">
                  <div className="tab-buttons">
                    <Button 
                      variant={activeTab === 'items' ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('items')}
                      className="tab-btn"
                    >
                      <FaList className="me-1" /> All ({items.length})
                    </Button>
                    <Button 
                      variant={activeTab === 'active' ? 'success' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('active')}
                      className="tab-btn"
                    >
                      <FaCheckCircle className="me-1" /> Active ({activeItems})
                    </Button>
                    <Button 
                      variant={activeTab === 'inactive' ? 'danger' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setActiveTab('inactive')}
                      className="tab-btn"
                    >
                      <FaTimesCircle className="me-1" /> Inactive ({inactiveItems})
                    </Button>
                  </div>
                </div>

                {/* ===== ITEMS SECTION ===== */}
                {(activeTab === 'items' || activeTab === 'active' || activeTab === 'inactive') && (
                  <div className="items-section">
                    <div className="items-header">
                      <h5 className="items-title">
                        <FaBox className="text-primary me-2" /> 
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
                    
                    {items.filter(item => {
                      if (activeTab === 'active') return item.status === 'active';
                      if (activeTab === 'inactive') return item.status === 'inactive';
                      return true;
                    }).length === 0 ? (
                      <div className="empty-state">
                        <FaBox className="empty-icon" />
                        <p className="text-muted">No items available for this service.</p>
                      </div>
                    ) : (
                      <Row className="g-3">
                        {items
                          .filter(item => {
                            if (activeTab === 'active') return item.status === 'active';
                            if (activeTab === 'inactive') return item.status === 'inactive';
                            return true;
                          })
                          .map((item, index) => (
                          <Col xs={12} sm={6} lg={4} xl={3} key={item.itemid}>
                            <div 
                              className="item-wrapper"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <Card className={`item-card ${item.status === 'inactive' ? 'inactive-item' : ''}`}>
                                <div className="item-image-wrapper">
                                  {item.image_url ? (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.itemname}
                                      className="item-image"
                                      onError={handleImageError}
                                    />
                                  ) : null}
                                  <div 
                                    className="image-placeholder"
                                    style={{ display: item.image_url ? 'none' : 'flex' }}
                                  >
                                    <FaImage className="placeholder-icon" />
                                    <span className="placeholder-text">No Image</span>
                                  </div>
                                  
                                  <Badge 
                                    bg={getStatusColor(item.status)} 
                                    className="item-status-badge"
                                  >
                                    {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                                  </Badge>
                                </div>

                                <Card.Body className="item-body">
                                  <h6 className="item-name">{item.itemname}</h6>
                                  
                                  {item.description && (
                                    <p className="item-description">{item.description}</p>
                                  )}
                                  
                                  <div className="item-price-badge">
                                    <FaMoneyBillWave className="me-1" /> 
                                    Price: {formatPrice(item.price)}
                                  </div>
                                  
                                  <Button 
                                    variant={item.status === 'active' ? 'primary' : 'secondary'}
                                    size="sm" 
                                    className="book-btn"
                                    onClick={() => handleBookNow(item)}
                                    disabled={item.status === 'inactive' || isProcessing}
                                  >
                                    <FaShoppingCart className="me-1" /> Book Now
                                  </Button>
                                </Card.Body>
                              </Card>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                )}

                {/* ===== DETAILS TAB ===== */}
                {activeTab === 'details' && (
                  <div className="details-section bg-white rounded-3 shadow-sm p-3 p-md-4">
                    <h5 className="details-title">
                      <FaInfoCircle className="text-primary me-2" /> Complete Service Information
                    </h5>
                    
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Service ID</span>
                        <span className="detail-value">#{service.serviceid}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Service Name</span>
                        <span className="detail-value">{service.servicename}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Category</span>
                        <span className="detail-value">{getCategoryLabel(service.category)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <Badge bg={getStatusColor(service.status)} className="detail-status-badge">
                          {getStatusIcon(service.status)} {getStatusLabel(service.status)}
                        </Badge>
                      </div>
                      <div className="detail-item full-width">
                        <span className="detail-label">Description</span>
                        <span className="detail-value">{service.service_description || 'No description available'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created At</span>
                        <span className="detail-value">{formatDate(service.created_at)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Last Updated</span>
                        <span className="detail-value">{formatDate(service.updated_at)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Items</span>
                        <span className="detail-value">{totalItems}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Average Price</span>
                        <span className="detail-value">{formatPrice(avgPrice)}</span>
                      </div>
                    </div>
                  </div>
                )}
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
                <div className="payment-success">
                  <FaCheckCircle className="success-icon" />
                  <h5 className="success-title">Success!</h5>
                  <p className="success-message">{paymentSuccess.message}</p>
                  <p className="success-details">
                    Order #{paymentSuccess.orderId} • Payment #{paymentSuccess.paymentId}
                  </p>
                  <p className="success-redirect">Redirecting to dashboard...</p>
                </div>
              ) : (
                <>
                  <div className="booking-item-preview">
                    <div className="preview-image">
                      {bookingItem.image_url ? (
                        <img 
                          src={bookingItem.image_url} 
                          alt={bookingItem.itemname} 
                          className="preview-img"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="preview-placeholder">
                          <FaImage className="preview-icon" />
                        </div>
                      )}
                    </div>
                    <div className="preview-info">
                      <h6 className="preview-name">{bookingItem.itemname}</h6>
                      <p className="preview-service">{service?.servicename}</p>
                      <p className="preview-price">{formatPrice(bookingItem.price)}</p>
                    </div>
                  </div>

                  <div className="booking-form-grid">
                    <div className="booking-form-left">
                      <h6 className="form-section-title">Booking Details</h6>
                      
                      <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          max={bookingItem.quantity || 10}
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                          name="notes"
                          value={paymentData.notes}
                          onChange={handlePaymentChange}
                          rows="2"
                          className="form-textarea"
                          placeholder="Any special requests..."
                        />
                      </div>
                    </div>

                    <div className="booking-form-right">
                      <h6 className="form-section-title">Payment Details</h6>

                      <div className="form-group">
                        <label className="form-label">Amount (TSh)</label>
                        <input
                          type="number"
                          name="amount"
                          value={paymentData.amount}
                          onChange={handlePaymentChange}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <div className="payment-methods-grid">
                          {paymentMethods.map((method) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentData({ ...paymentData, paymentMethod: method.id })}
                              className={`payment-method-btn ${paymentData.paymentMethod === method.id ? 'active' : ''}`}
                            >
                              <method.icon className="payment-method-icon" />
                              <span className="payment-method-label">{method.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {(paymentData.paymentMethod === 'M-Pesa' || paymentData.paymentMethod === 'Tigo Pesa') && (
                        <div className="form-group">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={paymentData.phoneNumber}
                            onChange={handlePaymentChange}
                            className="form-input"
                            placeholder="e.g. 0712345678"
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Reference</label>
                        <input
                          type="text"
                          name="reference"
                          value={paymentData.reference}
                          onChange={handlePaymentChange}
                          className="form-input"
                          placeholder="Reference number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="security-notice">
                    <FaLock className="security-icon" />
                    <div>
                      <p className="security-title">Secure Payment</p>
                      <p className="security-text">Your information is encrypted and secure.</p>
                    </div>
                    <FaShieldAlt className="security-shield" />
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
                    disabled={isProcessing || processingPayment || !paymentData.amount}
                    className="modal-pay-btn"
                  >
                    {processingPayment ? (
                      <><FaSpinner className="spinner-border spinner-border-sm me-2" /> Processing...</>
                    ) : (
                      <><FaMoneyBillWave className="me-2" /> Book & Pay Now</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ===== GLASS NAVBAR ===== */
        .glass-navbar {
          background: rgba(33, 37, 41, 0.95) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .brand {
          transition: all 0.3s ease;
        }
        .brand:hover {
          transform: scale(1.02);
        }

        .nav-link-custom {
          padding: 0 !important;
        }

        .nav-btn {
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          white-space: nowrap;
        }

        .nav-btn:hover {
          transform: translateY(-2px) scale(1.04);
        }

        .register-btn {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          border: none;
        }

        .register-btn:hover {
          box-shadow: 0 4px 20px rgba(13, 110, 253, 0.3) !important;
        }

        /* ===== BACK BUTTON ===== */
        .back-btn {
          border-radius: 50px;
          padding: 0.3rem 1rem;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          transform: translateX(-3px);
        }

        /* ===== SERVICE HEADER ===== */
        .service-header {
          border-radius: 16px;
          overflow: hidden;
        }

        .service-header-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          min-height: 300px;
        }

        .service-header-image {
          position: relative;
          overflow: hidden;
          background: #f8f9fa;
          min-height: 300px;
        }

        .service-header-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          min-height: 300px;
        }

        .service-header-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 300px;
          background: #f8f9fa;
        }

        .service-header-icon {
          font-size: 4rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .service-header-info {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .service-header-top {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .service-header-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .service-header-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .badge-category {
          font-size: 0.75rem;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .badge-status {
          font-size: 0.75rem;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .badge-items-count {
          font-size: 0.7rem;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
        }

        .service-header-description {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        .service-header-description p {
          margin: 0;
        }

        .service-header-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 0.3rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .meta-item strong {
          color: #1a1a2e;
        }

        /* ===== TAB NAVIGATION ===== */
        .tab-navigation {
          border-radius: 12px;
        }

        .tab-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tab-btn {
          border-radius: 50px;
          padding: 0.3rem 1rem;
          font-size: 0.78rem;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          transform: translateY(-2px);
        }

        /* ===== ITEMS SECTION ===== */
        .items-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .items-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
          display: flex;
          align-items: center;
        }

        /* ===== ITEM CARD ===== */
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
          border: none;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          height: 100%;
        }

        .item-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.08);
        }

        .item-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .item-card:hover .item-image {
          transform: scale(1.05);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .placeholder-icon {
          font-size: 3rem;
          color: #d1d5db;
          margin-bottom: 0.3rem;
        }

        .placeholder-text {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .item-status-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 0.6rem;
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }

        .item-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .item-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .item-description {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-price-badge {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0dcaf0;
          background: rgba(13, 202, 240, 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
          width: fit-content;
        }

        .book-btn {
          border-radius: 50px;
          padding: 0.2rem 1rem;
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          margin-top: 0.3rem;
          width: fit-content;
        }

        .book-btn:hover {
          transform: translateX(3px);
        }

        .inactive-item {
          opacity: 0.7;
        }

        /* ===== EMPTY STATE ===== */
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .empty-icon {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 0.5rem;
        }

        /* ===== DETAILS SECTION ===== */
        .details-section {
          border-radius: 14px;
        }

        .details-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.8rem 1rem;
          background: #f8fafc;
          border-radius: 10px;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          font-size: 0.7rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 0.95rem;
        }

        .detail-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
          width: fit-content;
        }

        /* ===== MODAL STYLES ===== */
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
          padding: 1rem 1.2rem;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 1;
          border-radius: 16px 16px 0 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0 4px;
          line-height: 1;
        }

        .modal-close:hover {
          color: #1a1a2e;
        }

        .modal-body {
          padding: 1.2rem;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.8rem 1.2rem;
          border-top: 1px solid #e5e7eb;
          position: sticky;
          bottom: 0;
          background: white;
          border-radius: 0 0 16px 16px;
          flex-wrap: wrap;
        }

        .modal-cancel-btn {
          border-radius: 50px;
          font-size: 0.8rem;
          padding: 0.3rem 1.2rem;
        }

        .modal-pay-btn {
          border-radius: 50px;
          font-size: 0.8rem;
          padding: 0.3rem 1.2rem;
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          border: none;
        }

        .modal-pay-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 25px rgba(13, 110, 253, 0.3);
        }

        /* ===== BOOKING PREVIEW ===== */
        .booking-item-preview {
          display: flex;
          gap: 1rem;
          padding: 0.8rem;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 1.2rem;
        }

        .preview-image {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          background: #e5e7eb;
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
        }

        .preview-icon {
          font-size: 1.5rem;
          color: #9ca3af;
        }

        .preview-info {
          flex: 1;
          min-width: 0;
        }

        .preview-name {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 0.95rem;
          margin: 0;
        }

        .preview-service {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0.1rem 0;
        }

        .preview-price {
          font-weight: 600;
          color: #0d6efd;
          font-size: 0.9rem;
          margin: 0;
        }

        /* ===== BOOKING FORM ===== */
        .booking-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }

        .form-section-title {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 0.9rem;
          margin-bottom: 0.8rem;
        }

        .form-group {
          margin-bottom: 0.8rem;
        }

        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 0.2rem;
        }

        .form-input {
          width: 100%;
          padding: 0.4rem 0.8rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }

        .form-textarea {
          width: 100%;
          padding: 0.4rem 0.8rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          outline: none;
          resize: vertical;
          min-height: 60px;
          font-family: inherit;
        }

        .form-textarea:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }

        .payment-methods-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
        }

        .payment-method-btn {
          padding: 0.4rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          text-align: center;
          transition: all 0.2s ease;
          background: white;
          cursor: pointer;
        }

        .payment-method-btn:hover {
          border-color: #0d6efd;
          background: #f8fafc;
        }

        .payment-method-btn.active {
          border-color: #0d6efd;
          background: rgba(13, 110, 253, 0.05);
        }

        .payment-method-icon {
          font-size: 1.2rem;
          margin: 0 auto 0.1rem;
          display: block;
          color: #6b7280;
        }

        .payment-method-btn.active .payment-method-icon {
          color: #0d6efd;
        }

        .payment-method-label {
          font-size: 0.65rem;
          font-weight: 500;
          color: #4b5563;
        }

        .payment-method-btn.active .payment-method-label {
          color: #0d6efd;
        }

        /* ===== SECURITY NOTICE ===== */
        .security-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 0.8rem;
          background: rgba(13, 110, 253, 0.05);
          border: 1px solid rgba(13, 110, 253, 0.1);
          border-radius: 10px;
          margin-top: 1rem;
        }

        .security-icon {
          color: #0d6efd;
          margin-top: 0.1rem;
          flex-shrink: 0;
        }

        .security-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .security-text {
          font-size: 0.7rem;
          color: #6b7280;
          margin: 0;
        }

        .security-shield {
          color: #0d6efd;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* ===== PAYMENT SUCCESS ===== */
        .payment-success {
          text-align: center;
          padding: 2rem 1rem;
        }

        .success-icon {
          font-size: 4rem;
          color: #198754;
          margin-bottom: 0.8rem;
        }

        .success-title {
          font-weight: 700;
          color: #198754;
          font-size: 1.2rem;
          margin-bottom: 0.3rem;
        }

        .success-message {
          color: #198754;
          font-size: 0.95rem;
          margin-bottom: 0.3rem;
        }

        .success-details {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .success-redirect {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.15em;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 991.98px) {
          .service-header-grid {
            grid-template-columns: 1fr;
          }

          .service-header-image {
            min-height: 200px;
          }

          .service-header-img {
            min-height: 200px;
          }

          .service-header-placeholder {
            min-height: 200px;
          }

          .service-header-title {
            font-size: 1.5rem;
          }

          .details-grid {
            grid-template-columns: 1fr 1fr;
          }

          .booking-form-grid {
            grid-template-columns: 1fr;
          }

          .payment-methods-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 767.98px) {
          .service-header-info {
            padding: 1rem;
          }

          .service-header-title {
            font-size: 1.3rem;
          }

          .service-header-meta {
            gap: 0.8rem;
          }

          .meta-item {
            font-size: 0.75rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .tab-buttons {
            justify-content: center;
          }

          .tab-btn {
            font-size: 0.7rem;
            padding: 0.2rem 0.7rem;
          }

          .items-title {
            font-size: 1rem;
          }
        }

        @media (max-width: 575.98px) {
          .service-header-title {
            font-size: 1.1rem;
          }

          .service-header-badges {
            gap: 0.3rem;
          }

          .badge-category,
          .badge-status {
            font-size: 0.6rem;
            padding: 0.15rem 0.5rem;
          }

          .badge-items-count {
            font-size: 0.6rem;
            padding: 0.15rem 0.5rem;
          }

          .service-header-description {
            font-size: 0.85rem;
          }

          .service-header-meta {
            flex-direction: column;
            gap: 0.3rem;
          }

          .tab-btn {
            font-size: 0.65rem;
            padding: 0.15rem 0.5rem;
          }

          .item-image-wrapper {
            height: 150px;
          }

          .item-name {
            font-size: 0.85rem;
          }

          .item-description {
            font-size: 0.75rem;
          }

          .item-price-badge {
            font-size: 0.65rem;
          }

          .book-btn {
            font-size: 0.7rem;
            padding: 0.15rem 0.8rem;
          }

          .payment-methods-grid {
            grid-template-columns: 1fr 1fr;
          }

          .modal-content {
            max-height: 100vh;
            border-radius: 16px 16px 0 0;
            margin-top: auto;
          }

          .modal-overlay {
            align-items: flex-end;
            padding: 0;
          }

          .modal-header {
            border-radius: 16px 16px 0 0;
            padding: 0.8rem 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-footer {
            padding: 0.6rem 1rem;
            flex-direction: column-reverse;
          }

          .modal-cancel-btn,
          .modal-pay-btn {
            width: 100%;
            justify-content: center;
          }

          .booking-item-preview {
            padding: 0.6rem;
          }

          .preview-image {
            width: 50px;
            height: 50px;
          }

          .preview-name {
            font-size: 0.85rem;
          }

          .preview-price {
            font-size: 0.8rem;
          }

          .back-btn {
            font-size: 0.7rem;
            padding: 0.2rem 0.8rem;
          }

          .nav-btn {
            font-size: 0.6rem;
            padding: 0.15rem 0.4rem;
          }

          .nav-btn span {
            display: none !important;
          }
        }

        @media (max-width: 400px) {
          .service-header-title {
            font-size: 1rem;
          }

          .service-header-image {
            min-height: 150px;
          }

          .service-header-img {
            min-height: 150px;
          }

          .service-header-placeholder {
            min-height: 150px;
          }

          .service-header-icon {
            font-size: 3rem;
          }

          .item-image-wrapper {
            height: 120px;
          }

          .tab-btn {
            font-size: 0.6rem;
            padding: 0.1rem 0.4rem;
          }

          .tab-btn svg {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceDetail;