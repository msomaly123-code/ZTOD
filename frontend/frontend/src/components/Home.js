// src/components/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { 
  FaUser, 
  FaSignInAlt, 
  FaUserPlus, 
  FaConciergeBell,
  FaBed,
  FaUtensils,
  FaTshirt,
  FaArrowRight,
  FaBuilding,
  FaChartLine,
  FaStar,
  FaClock,
  FaShieldAlt,
  FaHeadset,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronDown,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaUsers,
  FaImage,
  FaArrowDown,
  FaSpinner,
} from 'react-icons/fa';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredServiceItems, setHoveredServiceItems] = useState([]);
  const [hoveredServiceData, setHoveredServiceData] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    fetchServices();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:8000/api/services/', {
        timeout: 10000
      });
      
      // Process services with image URLs - same approach as ServiceDetail
      const processedServices = response.data.map(service => ({
        ...service,
        image_url: getImageUrl(service.image)
      }));
      
      setServices(processedServices);
      setFilteredServices(processedServices);
      setError(null);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Unable to load services. Please try again later.');
      
      const fallback = getFallbackServices();
      setServices(fallback);
      setFilteredServices(fallback);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAME getImageUrl function as ServiceDetail.js
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    console.log('🖼️ Original image path:', imagePath);
    
    // If it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('✅ Full URL detected:', imagePath);
      return imagePath;
    }
    
    // If it starts with /services/ - just add the base URL
    if (imagePath.startsWith('/services/')) {
      const url = `http://localhost:8000${imagePath}`;
      console.log('✅ Services path:', url);
      return url;
    }
    
    // If it starts with /media/
    if (imagePath.startsWith('/media/')) {
      const url = `http://localhost:8000${imagePath}`;
      console.log('✅ Media path:', url);
      return url;
    }
    
    // If it starts with media/
    if (imagePath.startsWith('media/')) {
      const url = `http://localhost:8000/${imagePath}`;
      console.log('✅ Media path without slash:', url);
      return url;
    }
    
    // If it starts with services/ (no leading slash)
    if (imagePath.startsWith('services/')) {
      const url = `http://localhost:8000/${imagePath}`;
      console.log('✅ Services without slash:', url);
      return url;
    }
    
    // Default: assume it's just a filename in media/services/
    const url = `http://localhost:8000/media/services/${imagePath}`;
    console.log('✅ Assumed path:', url);
    return url;
  };

  const fetchServiceItems = async (serviceId) => {
    try {
      setLoadingItems(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Token ${token}` } : {};
      
      const response = await axios.get(
        `http://localhost:8000/api/services/${serviceId}/service_items/`,
        { headers, timeout: 5000 }
      );
      
      // ✅ SAME processing as ServiceDetail.js - using getImageUrl for each item
      const processedItems = response.data.map(item => ({
        ...item,
        image_url: getImageUrl(item.image)
      }));
      
      console.log('📦 Fetched items with images:', processedItems);
      setHoveredServiceItems(processedItems);
    } catch (error) {
      console.error('Error fetching service items:', error);
      setHoveredServiceItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const getFallbackServices = () => {
    return [
      {
        serviceid: 1,
        servicename: 'Conference Hall Booking',
        category: 'conferences',
        service_description: 'State-of-the-art conference facilities for your business meetings and events.',
        status: 'active',
        item_count: 3,
        image: null,
        image_url: null
      },
      {
        serviceid: 2,
        servicename: 'Room Booking',
        category: 'room_booking',
        service_description: 'Comfortable and luxurious rooms for your stay.',
        status: 'active',
        item_count: 5,
        image: null,
        image_url: null
      },
      {
        serviceid: 3,
        servicename: 'Catering Services',
        category: 'catering',
        service_description: 'Delicious and professional catering for all your events.',
        status: 'active',
        item_count: 4,
        image: null,
        image_url: null
      },
      {
        serviceid: 4,
        servicename: 'Laundry Services',
        category: 'laundry',
        service_description: 'Professional laundry and dry cleaning services.',
        status: 'active',
        item_count: 3,
        image: null,
        image_url: null
      }
    ];
  };

  const handleServiceHover = (category) => {
    if (window.innerWidth <= 991) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    const service = services.find(s => s.category === category && s.status === 'active');
    
    if (service) {
      setHoveredService(category);
      setHoveredServiceData(service);
      fetchServiceItems(service.serviceid);
    } else {
      setHoveredService(null);
      setHoveredServiceItems([]);
      setHoveredServiceData(null);
    }
  };

  const handleServiceClick = (category) => {
    if (window.innerWidth <= 991) {
      if (hoveredService === category) {
        setHoveredService(null);
        setHoveredServiceItems([]);
        setHoveredServiceData(null);
      } else {
        const service = services.find(s => s.category === category && s.status === 'active');
        if (service) {
          setHoveredService(category);
          setHoveredServiceData(service);
          fetchServiceItems(service.serviceid);
        }
      }
    }
  };

  const handleServiceLeave = () => {
    if (window.innerWidth <= 991) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredService(null);
      setHoveredServiceItems([]);
      setHoveredServiceData(null);
    }, 300);
  };

  const handleDropdownEnter = () => {
    if (window.innerWidth <= 991) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredServices(services);
      setShowSearchResults(false);
      return;
    }
    
    const results = services.filter(service => 
      service.servicename.toLowerCase().includes(term.toLowerCase()) ||
      service.category?.toLowerCase().includes(term.toLowerCase()) ||
      service.service_description?.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredServices(results);
    setShowSearchResults(true);
  };

  const handleViewDetails = (serviceId) => {
    navigate(`/services/${serviceId}`);
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
      'laundry': '#0d6efd',
      'conferences': '#198754',
      'catering': '#ffc107',
      'room_booking': '#0dcaf0'
    };
    return colors[category] || '#6c757d';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'danger';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />;
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Available' : 'Unavailable';
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const navMenus = [
    { category: 'conferences', label: 'Conferences', icon: <FaBuilding /> },
    { category: 'laundry', label: 'Laundry', icon: <FaTshirt /> },
    { category: 'catering', label: 'Catering', icon: <FaUtensils /> },
    { category: 'room_booking', label: 'Room Booking', icon: <FaBed /> },
  ];

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
          <Container>
            <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
              <FaChartLine className="me-2" /> ZITOD
            </Navbar.Brand>
          </Container>
        </Navbar>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" size="lg" />
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
            <Nav className="mx-auto align-items-lg-center gap-2 w-100">
              {/* ===== SERVICES DROPDOWN MENUS ===== */}
              <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap w-100 w-lg-auto nav-menus-center">
                {navMenus.map((menu) => {
                  const isHovered = hoveredService === menu.category;
                  const serviceData = hoveredServiceData;
                  
                  return (
                    <div 
                      key={menu.category}
                      className="position-relative nav-dropdown-wrapper"
                      ref={dropdownRef}
                      onMouseEnter={() => handleServiceHover(menu.category)}
                      onMouseLeave={handleServiceLeave}
                      onClick={() => handleServiceClick(menu.category)}
                    >
                      <Button 
                        variant="outline-light" 
                        size="sm" 
                        className={`d-flex align-items-center gap-1 nav-dropdown-btn ${isHovered ? 'active' : ''}`}
                      >
                        {menu.icon} <span className="d-none d-sm-inline">{menu.label}</span>
                        <FaChevronDown size={10} className={`dropdown-arrow-icon ${isHovered ? 'rotated' : ''}`} />
                      </Button>
                      
                      {isHovered && serviceData && (
                        <div 
                          className="carpet-dropdown open"
                          onMouseEnter={handleDropdownEnter}
                          onMouseLeave={handleServiceLeave}
                        >
                          <div className="carpet-header">
                            <div className="carpet-header-content">
                              <div className="carpet-header-image-wrapper">
                                {serviceData.image_url ? (
                                  <img 
                                    src={serviceData.image_url} 
                                    alt={serviceData.servicename}
                                    className="carpet-header-image"
                                    loading="lazy"
                                    onError={(e) => {
                                      console.log('❌ Service image failed:', e.target.src);
                                      e.target.style.display = 'none';
                                      e.target.parentElement.querySelector('.carpet-header-icon').style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="carpet-header-icon" style={{ display: serviceData.image_url ? 'none' : 'flex' }}>
                                  {getCategoryIcon(serviceData.category)}
                                </div>
                              </div>
                              <div className="carpet-header-text">
                                <h6 className="text-white fw-bold mb-0">{serviceData.servicename}</h6>
                                <p className="text-secondary small mb-0">{serviceData.service_description}</p>
                                <Badge bg={getStatusColor(serviceData.status)} className="mt-1">
                                  {getStatusIcon(serviceData.status)} {getStatusLabel(serviceData.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="carpet-body">
                            {loadingItems ? (
                              <div className="carpet-loading">
                                <FaSpinner className="spinner" />
                                <span>Loading items...</span>
                              </div>
                            ) : hoveredServiceItems.length > 0 ? (
                              <div className="carpet-items-grid">
                                {hoveredServiceItems.map((item) => (
                                  <div key={item.itemid} className="carpet-item">
                                    <div className="carpet-item-inner">
                                      <div className="carpet-item-image">
                                        {item.image_url ? (
                                          <img 
                                            src={item.image_url} 
                                            alt={item.itemname}
                                            className="carpet-item-img"
                                            loading="lazy"
                                            onError={(e) => {
                                              console.log('❌ Item image failed:', e.target.src);
                                              e.target.style.display = 'none';
                                              const placeholder = e.target.parentElement.querySelector('.carpet-item-placeholder');
                                              if (placeholder) placeholder.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div className="carpet-item-placeholder" style={{ display: item.image_url ? 'none' : 'flex' }}>
                                          <FaImage size={18} className="text-secondary" />
                                        </div>
                                      </div>
                                      <div className="carpet-item-info">
                                        <div className="carpet-item-name">{item.itemname}</div>
                                        <div className="carpet-item-price">{formatPrice(item.price)}</div>
                                      </div>
                                      <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="carpet-item-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/services/${serviceData.serviceid}`);
                                          setHoveredService(null);
                                        }}
                                      >
                                        Book
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="carpet-empty">
                                <FaConciergeBell className="text-secondary mb-2" size={32} />
                                <p className="text-secondary small mb-0">No items available</p>
                              </div>
                            )}
                          </div>

                          <div className="carpet-footer">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="carpet-footer-btn"
                              onClick={() => {
                                handleViewDetails(serviceData.serviceid);
                                setHoveredService(null);
                              }}
                            >
                              <FaEye className="me-1" /> View All
                            </Button>
                            <Button 
                              variant="outline-light" 
                              size="sm" 
                              className="carpet-footer-btn"
                              onClick={() => {
                                navigate('/CustomerServices');
                                setHoveredService(null);
                              }}
                            >
                              All Services
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ===== SEARCH BOX ===== */}
              <div className="position-relative nav-search-wrapper" ref={searchRef}>
                <div className="nav-search-input">
                  <FaSearch className="text-white/50 me-2" size={14} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={() => searchTerm.trim() && setShowSearchResults(true)}
                    className="nav-search-field"
                    aria-label="Search services"
                  />
                  {searchTerm && (
                    <button 
                      className="search-clear"
                      onClick={() => {
                        setSearchTerm('');
                        setFilteredServices(services);
                        setShowSearchResults(false);
                      }}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {showSearchResults && filteredServices.length > 0 && (
                  <div className="search-results-dropdown">
                    <div className="search-results-header">Results for "{searchTerm}"</div>
                    {filteredServices.slice(0, 10).map(service => (
                      <div 
                        key={service.serviceid} 
                        className="search-result-item"
                        onClick={() => { 
                          handleViewDetails(service.serviceid); 
                          setShowSearchResults(false); 
                          setSearchTerm(''); 
                        }}
                      >
                        <div className="text-warning">{getCategoryIcon(service.category)}</div>
                        <div className="search-result-info">
                          <div className="text-white text-sm">{service.servicename}</div>
                          <div className="text-secondary small">{service.category}</div>
                        </div>
                        <Badge bg={service.status === 'active' ? 'success' : 'danger'} className="text-xs">
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* ===== NAVBAR BUTTONS ===== */}
              <div className="nav-actions">
                {isLoggedIn ? (
                  <>
                    <Nav.Link as={Link} to="/CustomerDashboard" className="nav-action-link">
                      <Button variant="success" size="sm" className="nav-action-btn">
                        <FaUser className="me-1 d-sm-none d-inline" /> <span className="d-none d-sm-inline"><FaUser className="me-1" />Dashboard</span>
                      </Button>
                    </Nav.Link>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="nav-action-btn"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsLoggedIn(false);
                        setUser(null);
                        navigate('/');
                      }}
                    >
                      <FaSignInAlt className="me-1 d-sm-none d-inline" /> <span className="d-none d-sm-inline"><FaSignInAlt className="me-1" />Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/RecipionistLogin" className="nav-action-link">
                      <Button variant="warning" size="sm" className="nav-action-btn staff-btn">
                        <FaUser className="me-1 d-sm-none d-inline" /> <span className="d-none d-sm-inline"><FaUser className="me-1" />Staff</span>
                      </Button>
                    </Nav.Link>

                    <Nav.Link as={Link} to="/CustomerLogin" className="nav-action-link">
                      <Button variant="outline-light" size="sm" className="nav-action-btn">
                        <FaUser className="me-1 d-sm-none d-inline" /> <span className="d-none d-sm-inline"><FaUser className="me-1" />Login</span>
                      </Button>
                    </Nav.Link>

                    <Nav.Link as={Link} to="/CustomerRegister" className="nav-action-link">
                      <Button variant="primary" size="sm" className="nav-action-btn register-btn">
                        <FaUserPlus className="me-1 d-sm-none d-inline" /> <span className="d-none d-sm-inline"><FaUserPlus className="me-1" />Register</span>
                      </Button>
                    </Nav.Link>
                  </>
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-image-wrapper">
            <img 
              src="/body.png" 
              alt="ZITOD - Premium Services Platform" 
              className="hero-image"
            />
            <div className="hero-overlay"></div>
          </div>
          
          <Container className="hero-container">
            <Row className="align-items-center min-vh-70">
              <Col lg={7} className="hero-content">
                <div className="hero-badge">Welcome to ZITOD</div>
                <h1 className="hero-title">
                  Everything You Need<br />
                  <span className="highlight">For a Better Experience</span>
                </h1>
                <p className="hero-description">
                  ZITOD is a convenient platform for discovering and booking quality services 
                  in one place. Book rooms, conference halls, catering, and laundry services 
                  quickly and easily.
                </p>
                
                <div className="hero-buttons">
                  <Button 
                    variant="primary" 
                    className="hero-btn-primary"
                    onClick={() => navigate('/CustomerServices')}
                  >
                    Explore Services <FaArrowRight className="ms-2" />
                  </Button>
                  <Button 
                    variant="outline-light" 
                    className="hero-btn-secondary"
                    onClick={() => navigate('/CustomerRegister')}
                  >
                    <FaUserPlus className="me-2" /> Register Now
                  </Button>
                </div>

                <div className="hero-features">
                  <div className="hero-feature">
                    <FaCheckCircle className="text-success me-1" />
                    <span>Easy Booking</span>
                  </div>
                  <div className="hero-feature">
                    <FaShieldAlt className="text-primary me-1" />
                    <span>Reliable</span>
                  </div>
                  <div className="hero-feature">
                    <FaStar className="text-warning me-1" />
                    <span>Secure</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section className="services-section py-5">
        <Container>
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Book what you need. When you need it.</p>
          </div>

          {error && (
            <div className="alert alert-warning text-center" role="alert">
              <FaExclamationTriangle className="me-2" /> {error}
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="text-center py-5">
              <FaConciergeBell className="display-1 text-muted mb-3" />
              <p className="text-muted">No services available at the moment.</p>
            </div>
          ) : (
            <Row className="g-4">
              {filteredServices.slice(0, 4).map((service) => (
                <Col xs={12} sm={6} lg={3} key={service.serviceid}>
                  <div className="service-wrapper">
                    <Card className={`service-card h-100 ${service.status === 'inactive' ? 'inactive-service' : ''}`}>
                      <div className="position-relative">
                        {service.image_url ? (
                          <Card.Img 
                            variant="top" 
                            src={service.image_url} 
                            alt={service.servicename}
                            className="service-card-image"
                            loading="lazy"
                            onError={(e) => {
                              console.log('❌ Service card image failed:', e.target.src);
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.service-card-placeholder').style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="service-card-placeholder d-flex align-items-center justify-content-center"
                          style={{ height: '180px', display: service.image_url ? 'none' : 'flex' }}
                        >
                          <span className="text-muted">No Image</span>
                        </div>
                        
                        <Badge 
                          bg={getStatusColor(service.status)} 
                          className="position-absolute top-0 start-0 m-2 status-badge"
                        >
                          {getStatusIcon(service.status)} {getStatusLabel(service.status)}
                        </Badge>
                        
                        <Badge 
                          style={{ backgroundColor: getCategoryColor(service.category) }} 
                          className="position-absolute top-0 end-0 m-2 category-badge"
                        >
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </div>
                      
                      <Card.Body className="p-3">
                        <Card.Title className="service-card-title">{service.servicename}</Card.Title>
                        <Card.Text className="service-card-description">
                          {service.service_description 
                            ? service.service_description.substring(0, 60) + '...' 
                            : 'No description available'}
                        </Card.Text>
                        <div className="d-flex gap-1 flex-wrap">
                          {service.item_count > 0 && (
                            <Badge bg="info" className="mb-1">
                              {service.item_count} items available
                            </Badge>
                          )}
                          {service.status === 'active' && (
                            <Badge bg="success" className="mb-1">
                              <FaCheckCircle size={10} className="me-1" />
                              Available
                            </Badge>
                          )}
                        </div>
                      </Card.Body>
                      
                      <Card.Footer className="bg-transparent border-0 text-center p-2">
                        <Button 
                          variant={service.status === 'active' ? 'primary' : 'secondary'}
                          size="sm" 
                          className="view-details-btn"
                          onClick={() => handleViewDetails(service.serviceid)}
                          disabled={service.status === 'inactive'}
                        >
                          <FaEye className="me-1" /> View Details
                        </Button>
                      </Card.Footer>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {filteredServices.length > 4 && (
            <div className="text-center mt-4">
              <Button 
                variant="primary" 
                className="view-all-btn"
                onClick={() => navigate('/CustomerServices')}
              >
                View All Services <FaArrowRight className="ms-2" />
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* ===== ABOUT ZITOD SECTION ===== */}
      <section id="about" className="about-section py-5 bg-light">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="about-image-wrapper">
                <div className="about-image-placeholder">
                  <FaChartLine className="about-image-icon" />
                  <span className="about-image-text">ZITOD</span>
                </div>
                <div className="about-image-badge">
                  <FaStar className="text-warning" /> 4.8/5 Rating
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="about-content">
                <div className="about-badge">About ZITOD</div>
                <h2 className="about-title">We Make Service Booking Simple, Convenient and Accessible</h2>
                <p className="about-description">
                  ZITOD brings services, availability and booking management together to provide 
                  customers with a simple and convenient experience. Whether you need a room, 
                  conference hall, catering, or laundry services, we've got you covered.
                </p>
                <div className="about-features">
                  <div className="about-feature">
                    <FaCheckCircle className="text-success me-2" />
                    <span>Easy booking process</span>
                  </div>
                  <div className="about-feature">
                    <FaCheckCircle className="text-success me-2" />
                    <span>Quality services guaranteed</span>
                  </div>
                  <div className="about-feature">
                    <FaCheckCircle className="text-success me-2" />
                    <span>Convenient management</span>
                  </div>
                  <div className="about-feature">
                    <FaCheckCircle className="text-success me-2" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  className="about-btn"
                  onClick={() => navigate('/CustomerRegister')}
                >
                  Get Started <FaArrowRight className="ms-2" />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section py-5">
        <Container>
          <div className="cta-wrapper text-center">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">
              Join thousands of satisfied customers who trust ZITOD for their service bookings.
            </p>
            <div className="cta-buttons">
              <Button 
                variant="light" 
                className="cta-btn"
                onClick={() => navigate('/CustomerRegister')}
              >
                <FaUserPlus className="me-2" /> Create Account
              </Button>
              <Button 
                variant="outline-light" 
                className="cta-btn-outline"
                onClick={() => navigate('/CustomerLogin')}
              >
                <FaSignInAlt className="me-2" /> Login
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer-section bg-dark text-white py-4">
        <Container>
          <Row className="g-4">
            <Col lg={4} md={6}>
              <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
                <FaChartLine className="text-primary" /> ZITOD
              </h6>
              <p className="text-secondary small">
                Your convenient platform for discovering and booking quality services in one place.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-secondary hover-text-primary"><FaFacebook size={18} /></a>
                <a href="#" className="text-secondary hover-text-primary"><FaTwitter size={18} /></a>
                <a href="#" className="text-secondary hover-text-primary"><FaInstagram size={18} /></a>
                <a href="#" className="text-secondary hover-text-primary"><FaYoutube size={18} /></a>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <h6 className="fw-bold small mb-3">Services</h6>
              <ul className="list-unstyled small footer-links">
                <li><Link to="/services/rooms" className="text-secondary hover-text-white">Rooms</Link></li>
                <li><Link to="/services/conferences" className="text-secondary hover-text-white">Conference</Link></li>
                <li><Link to="/services/catering" className="text-secondary hover-text-white">Catering</Link></li>
                <li><Link to="/services/laundry" className="text-secondary hover-text-white">Laundry</Link></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h6 className="fw-bold small mb-3">Company</h6>
              <ul className="list-unstyled small footer-links">
                <li><Link to="/about" className="text-secondary hover-text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-secondary hover-text-white">Contact</Link></li>
                <li><Link to="/faq" className="text-secondary hover-text-white">FAQ</Link></li>
                <li><Link to="/terms" className="text-secondary hover-text-white">Terms</Link></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h6 className="fw-bold small mb-3">Contact</h6>
              <ul className="list-unstyled small">
                <li className="text-secondary"><FaEnvelope className="me-2" /> info@zitod.com</li>
                <li className="text-secondary"><FaPhone className="me-2" /> +255 123 456 789</li>
                <li className="text-secondary"><FaMapMarkerAlt className="me-2" /> Dar es Salaam, Tanzania</li>
              </ul>
            </Col>
          </Row>
          <hr className="bg-secondary my-3" />
          <div className="text-center text-secondary small">
            © 2026 ZITOD. All rights reserved.
          </div>
        </Container>
      </footer>

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

        /* ===== NAV MENUS ===== */
        .nav-menus-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .nav-dropdown-wrapper {
          position: relative;
        }

        .nav-dropdown-btn {
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 8px;
          padding: 0.3rem 0.7rem;
          font-size: 0.8rem;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.03);
          border-color: transparent;
        }

        .nav-dropdown-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-1px);
        }

        .nav-dropdown-btn.active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .dropdown-arrow-icon {
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          margin-left: 2px;
        }

        .dropdown-arrow-icon.rotated {
          transform: rotate(180deg);
        }

        /* ===== CARPET DROPDOWN ===== */
        .carpet-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%) scaleY(0) scaleX(0.85);
          transform-origin: top center;
          background: rgba(28, 30, 36, 0.98);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
          min-width: 580px;
          max-width: 650px;
          width: max-content;
          z-index: 1000;
          padding: 0;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: 
            opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
            visibility 0.35s ease;
        }

        .carpet-dropdown.open {
          opacity: 1;
          visibility: visible;
          pointer-events: all;
          transform: translateX(-50%) scaleY(1) scaleX(1);
        }

        .nav-dropdown-wrapper:hover .carpet-dropdown,
        .carpet-dropdown:hover {
          opacity: 1;
          visibility: visible;
          pointer-events: all;
          transform: translateX(-50%) scaleY(1) scaleX(1);
        }

        .carpet-dropdown .carpet-item {
          opacity: 0;
          transform: translateY(12px) scale(0.92);
          transition: 
            opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .carpet-dropdown.open .carpet-item,
        .nav-dropdown-wrapper:hover .carpet-dropdown .carpet-item,
        .carpet-dropdown:hover .carpet-item {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .carpet-dropdown .carpet-item:nth-child(1) { transition-delay: 0.02s; }
        .carpet-dropdown .carpet-item:nth-child(2) { transition-delay: 0.04s; }
        .carpet-dropdown .carpet-item:nth-child(3) { transition-delay: 0.06s; }
        .carpet-dropdown .carpet-item:nth-child(4) { transition-delay: 0.08s; }
        .carpet-dropdown .carpet-item:nth-child(5) { transition-delay: 0.10s; }
        .carpet-dropdown .carpet-item:nth-child(6) { transition-delay: 0.12s; }

        .carpet-header {
          padding: 1rem 1.2rem;
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.10), rgba(13, 110, 253, 0.02));
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .carpet-header-content {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .carpet-header-image-wrapper {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .carpet-header-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carpet-header-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #ffc107;
        }

        .carpet-header-text {
          flex: 1;
          min-width: 0;
        }

        .carpet-header-text h6 {
          font-size: 0.85rem;
          margin-bottom: 0.1rem;
        }

        .carpet-header-text p {
          font-size: 0.75rem;
          margin: 0.1rem 0 0.2rem 0;
          opacity: 0.7;
        }

        .carpet-body {
          padding: 0.8rem 1.2rem;
          max-height: 280px;
          overflow-y: auto;
        }

        .carpet-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          padding: 1.5rem 0;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }

        .carpet-loading .spinner {
          animation: spin 0.8s linear infinite;
          font-size: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .carpet-items-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
        }

        .carpet-item-inner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          border: 1px solid transparent;
        }

        .carpet-item-inner:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateX(3px) scale(1.02);
        }

        .carpet-item-image {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
        }

        .carpet-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .carpet-item-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.15);
        }

        .carpet-item-info {
          flex: 1;
          min-width: 0;
        }

        .carpet-item-name {
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .carpet-item-price {
          color: #0dcaf0;
          font-size: 0.65rem;
          font-weight: 500;
        }

        .carpet-item-btn {
          font-size: 0.6rem;
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          flex-shrink: 0;
          opacity: 0;
          transform: scale(0.85);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          border: none;
        }

        .carpet-item-inner:hover .carpet-item-btn {
          opacity: 1;
          transform: scale(1);
        }

        .carpet-empty {
          text-align: center;
          padding: 1.5rem 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
        }

        .carpet-footer {
          padding: 0.5rem 1.2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          background: rgba(0, 0, 0, 0.15);
        }

        .carpet-footer-btn {
          font-size: 0.7rem;
          padding: 0.2rem 1rem;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .carpet-footer-btn:hover {
          transform: translateY(-2px) scale(1.04);
        }

        /* ===== SEARCH ===== */
        .nav-search-wrapper {
          flex: 1;
          min-width: 140px;
          max-width: 240px;
        }

        .nav-search-input {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 0.2rem 0.7rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid transparent;
        }

        .nav-search-input:focus-within {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 20px rgba(13, 110, 253, 0.05);
          transform: scale(1.01);
        }

        .nav-search-field {
          background: transparent;
          border: none;
          color: #ffffff;
          padding: 0.25rem 0;
          width: 100%;
          font-size: 0.78rem;
          outline: none;
        }

        .nav-search-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-clear {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          padding: 0 0.2rem;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }

        .search-clear:hover {
          color: #ffffff;
        }

        .search-results-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.4rem;
          background: rgba(28, 30, 36, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          padding: 0.4rem;
          min-width: 280px;
          max-height: 350px;
          overflow-y: auto;
          z-index: 1000;
          animation: searchSlideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes searchSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .search-results-header {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem 0.4rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .search-result-item:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(3px);
        }

        .search-result-info {
          flex: 1;
          min-width: 0;
        }

        /* ===== NAV ACTIONS ===== */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .nav-action-link {
          padding: 0 !important;
        }

        .nav-action-btn {
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          white-space: nowrap;
        }

        .nav-action-btn:hover {
          transform: translateY(-2px) scale(1.04);
        }

        .staff-btn {
          background: linear-gradient(135deg, #ffc107, #f0b400);
          border: none;
          color: #1a1a2e;
          font-weight: 600;
        }

        .staff-btn:hover {
          background: linear-gradient(135deg, #ffd633, #ffc107);
          box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3) !important;
        }

        .register-btn {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          border: none;
        }

        .register-btn:hover {
          box-shadow: 0 4px 20px rgba(13, 110, 253, 0.3) !important;
        }

        /* ===== HERO SECTION ===== */
        .hero-section {
          position: relative;
          min-height: 75vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          inset: 0;
        }

        .hero-image-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(10, 10, 26, 0.8) 0%,
            rgba(10, 10, 26, 0.5) 50%,
            rgba(10, 10, 26, 0.8) 100%
          );
        }

        .hero-container {
          position: relative;
          z-index: 2;
          padding: 3rem 0;
        }

        .hero-content {
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-badge {
          display: inline-block;
          background: rgba(13, 110, 253, 0.2);
          border: 1px solid rgba(13, 110, 253, 0.3);
          border-radius: 50px;
          padding: 0.25rem 1rem;
          color: #8bb9fe;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 1px;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 0.8rem;
        }

        .hero-title .highlight {
          background: linear-gradient(135deg, #ffc107, #f0b400);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 500px;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .hero-btn-primary {
          border-radius: 50px;
          padding: 0.5rem 1.8rem;
          font-size: 0.9rem;
          font-weight: 600;
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          border: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .hero-btn-primary:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 30px rgba(13, 110, 253, 0.4);
        }

        .hero-btn-secondary {
          border-radius: 50px;
          padding: 0.5rem 1.8rem;
          font-size: 0.9rem;
          font-weight: 600;
          border-color: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .hero-btn-secondary:hover {
          transform: translateY(-3px) scale(1.04);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero-features {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .hero-feature {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
        }

        .min-vh-70 {
          min-height: 70vh;
        }

        /* ===== SERVICES SECTION ===== */
        .services-section {
          background: #f8fafc;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .section-subtitle {
          font-size: 1rem;
          color: #6b7280;
        }

        .service-wrapper {
          animation: floatIn 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .service-wrapper:nth-child(1) { animation-delay: 0.05s; }
        .service-wrapper:nth-child(2) { animation-delay: 0.1s; }
        .service-wrapper:nth-child(3) { animation-delay: 0.15s; }
        .service-wrapper:nth-child(4) { animation-delay: 0.2s; }

        @keyframes floatIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .service-card {
          border: none;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          height: 100%;
        }

        .service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 1.5rem 3rem rgba(0, 0, 0, 0.08);
        }

        .service-card-image {
          height: 180px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .service-card:hover .service-card-image {
          transform: scale(1.05);
        }

        .service-card-placeholder {
          height: 180px;
          background: #f0f0f0;
        }

        .service-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
        }

        .service-card-description {
          font-size: 0.85rem;
          color: #6b7280;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .status-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          border-radius: 50px;
        }

        .category-badge {
          font-size: 0.6rem;
          padding: 0.15rem 0.5rem;
          border-radius: 50px;
        }

        .view-details-btn {
          border-radius: 50px;
          padding: 0.2rem 1rem;
          font-size: 0.75rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .view-details-btn:hover {
          transform: translateX(3px);
        }

        .view-all-btn {
          border-radius: 50px;
          padding: 0.5rem 1.8rem;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .view-all-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 30px rgba(13, 110, 253, 0.3);
        }

        .inactive-service {
          opacity: 0.7;
        }

        /* ===== ABOUT SECTION ===== */
        .about-section {
          background: #ffffff;
        }

        .about-image-wrapper {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(13, 110, 253, 0.15);
        }

        .about-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .about-image-icon {
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .about-image-text {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 4px;
        }

        .about-image-badge {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          color: #1a1a2e;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: inline-flex;
          align-items: center;
        }

        .about-content {
          padding: 0.5rem 0;
        }

        .about-badge {
          display: inline-block;
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          border-radius: 50px;
          padding: 0.15rem 0.8rem;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.8rem;
        }

        .about-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.8rem;
        }

        .about-description {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .about-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .about-feature {
          display: inline-flex;
          align-items: center;
          color: #374151;
          font-size: 0.9rem;
        }

        .about-btn {
          border-radius: 50px;
          padding: 0.5rem 1.8rem;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .about-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 30px rgba(13, 110, 253, 0.3);
        }

        /* ===== CTA SECTION ===== */
        .cta-section {
          background: linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%);
        }

        .cta-wrapper {
          padding: 2.5rem 2rem;
        }

        .cta-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.6rem;
        }

        .cta-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1rem;
          max-width: 500px;
          margin: 0 auto 1.5rem;
        }

        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          justify-content: center;
        }

        .cta-btn {
          border-radius: 50px;
          padding: 0.5rem 2rem;
          font-size: 0.9rem;
          font-weight: 600;
          background: #ffffff;
          color: #0a0a1a;
          border: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .cta-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
        }

        .cta-btn-outline {
          border-radius: 50px;
          padding: 0.5rem 2rem;
          font-size: 0.9rem;
          font-weight: 600;
          border-color: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .cta-btn-outline:hover {
          transform: translateY(-3px) scale(1.04);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* ===== FOOTER ===== */
        .footer-section {
          background: #0a0a1a !important;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .footer-links li {
          margin-bottom: 0.2rem;
        }

        .footer-links a {
          transition: all 0.2s ease;
          font-size: 0.85rem;
        }

        .footer-links a:hover {
          color: #ffffff !important;
          padding-left: 4px;
        }

        .hover-text-white:hover {
          color: #ffffff !important;
        }

        .hover-text-primary:hover {
          color: #0d6efd !important;
        }

        .text-xs {
          font-size: 0.6rem;
        }

        .text-sm {
          font-size: 0.8rem;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1199.98px) {
          .carpet-dropdown {
            min-width: 500px;
            max-width: 550px;
          }
          .nav-search-wrapper {
            max-width: 180px;
          }
        }

        @media (max-width: 991.98px) {
          .navbar .navbar-nav {
            flex-direction: column;
            align-items: stretch;
            gap: 0.3rem;
          }
          
          .nav-menus-center {
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .nav-dropdown-wrapper {
            width: auto;
          }
          
          .nav-dropdown-btn {
            width: auto;
            justify-content: center;
            padding: 0.25rem 0.6rem;
            font-size: 0.75rem;
          }
          
          .nav-search-wrapper {
            max-width: 100%;
            width: 100%;
            margin: 0.3rem 0;
          }
          
          .nav-actions {
            width: 100%;
            justify-content: center;
            gap: 0.3rem;
          }
          
          .nav-action-btn {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }

          .search-results-dropdown {
            min-width: 100%;
            left: 0;
            right: 0;
          }

          .carpet-dropdown {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            transform: translateX(0) translateY(100%);
            transform-origin: bottom center;
            min-width: unset;
            max-width: 100%;
            width: 100%;
            border-radius: 16px 16px 0 0;
            max-height: 75vh;
            transition: 
              transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              visibility 0.4s ease;
          }

          .carpet-dropdown.open,
          .nav-dropdown-wrapper:hover .carpet-dropdown,
          .carpet-dropdown:hover {
            transform: translateX(0) translateY(0);
          }

          .carpet-dropdown::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 50%;
            transform: translateX(-50%);
            width: 35px;
            height: 3px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.15);
            z-index: 10;
          }

          .carpet-items-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .carpet-body {
            max-height: 45vh;
          }
          
          .carpet-header {
            padding: 0.8rem 1rem;
          }
          
          .carpet-body {
            padding: 0.6rem 1rem;
          }
          
          .carpet-footer {
            padding: 0.5rem 1rem;
            flex-wrap: wrap;
          }
          
          .carpet-footer-btn {
            flex: 1;
            min-width: 80px;
          }
          
          .carpet-item-btn {
            opacity: 1;
            transform: scale(1);
          }

          .hero-title {
            font-size: 2.2rem;
          }
          .hero-description {
            font-size: 0.95rem;
          }
          .about-title {
            font-size: 1.6rem;
          }
          .about-image-wrapper {
            min-height: 280px;
          }
          .cta-title {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 575.98px) {
          .nav-actions {
            flex-wrap: wrap;
            gap: 0.2rem;
          }
          
          .nav-action-btn {
            font-size: 0.6rem;
            padding: 0.15rem 0.4rem;
          }
          
          .nav-dropdown-btn {
            font-size: 0.65rem;
            padding: 0.2rem 0.4rem;
          }
          
          .nav-dropdown-btn svg {
            font-size: 0.7rem;
          }

          .search-results-dropdown {
            min-width: 100%;
            left: 0;
            right: 0;
          }

          .carpet-dropdown {
            max-height: 85vh;
          }
          .carpet-items-grid {
            grid-template-columns: 1fr;
          }
          .carpet-header-image-wrapper {
            width: 36px;
            height: 36px;
          }
          .carpet-header-icon {
            font-size: 1.1rem;
          }
          .carpet-header-text h6 {
            font-size: 0.8rem;
          }
          .carpet-header-text p {
            font-size: 0.65rem;
          }
          .carpet-dropdown {
            border-radius: 14px 14px 0 0;
          }

          .hero-title {
            font-size: 1.6rem;
          }
          .hero-description {
            font-size: 0.85rem;
          }
          .hero-buttons {
            flex-direction: column;
          }
          .hero-btn-primary,
          .hero-btn-secondary {
            width: 100%;
            justify-content: center;
            font-size: 0.8rem;
          }
          .hero-features {
            gap: 0.8rem;
          }
          .hero-feature {
            font-size: 0.75rem;
          }
          .min-vh-70 {
            min-height: 60vh;
          }

          .section-title {
            font-size: 1.6rem;
          }
          .section-subtitle {
            font-size: 0.85rem;
          }

          .service-card-image {
            height: 150px;
          }
          .service-card-placeholder {
            height: 150px;
          }

          .about-features {
            grid-template-columns: 1fr;
          }
          .about-image-wrapper {
            min-height: 200px;
          }
          .about-image-icon {
            font-size: 3.5rem;
          }
          .about-image-text {
            font-size: 1.5rem;
          }
          .about-title {
            font-size: 1.4rem;
          }
          .about-description {
            font-size: 0.85rem;
          }

          .cta-title {
            font-size: 1.4rem;
          }
          .cta-subtitle {
            font-size: 0.85rem;
          }
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          .cta-btn,
          .cta-btn-outline {
            width: 100%;
            justify-content: center;
            font-size: 0.8rem;
          }
          .cta-wrapper {
            padding: 1.5rem;
          }
        }

        /* ===== SCROLLBAR ===== */
        .carpet-body::-webkit-scrollbar,
        .search-results-dropdown::-webkit-scrollbar {
          width: 3px;
        }

        .carpet-body::-webkit-scrollbar-track,
        .search-results-dropdown::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 2px;
        }

        .carpet-body::-webkit-scrollbar-thumb,
        .search-results-dropdown::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 2px;
        }

        .carpet-body::-webkit-scrollbar-thumb:hover,
        .search-results-dropdown::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Home;