// src/components/AdminService.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaBed,
  FaUtensils,
  FaTshirt,
  FaConciergeBell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaSave,
  FaTimes,
  FaFileExport,
  FaChevronLeft,
  FaChevronRight,
  FaBox,
  FaList,
  FaLayerGroup,
  FaImage,
  FaCloudUploadAlt,
} from 'react-icons/fa';
import RecepionistSideNavbar from './RecepionistSideNavbar';

const AdminService = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('serviceid');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [showItems, setShowItems] = useState(false);
  
  const imageInputRef = useRef(null);
  const editImageInputRef = useRef(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form data for Service
  const [serviceForm, setServiceForm] = useState({
    servicename: '',
    category: 'laundry',
    service_description: '',
    status: 'active',
    image: null,
  });

  // Form data for Item
  const [itemForm, setItemForm] = useState({
    itemname: '',
    description: '',
    price: '',
    quantity: 1,
    status: 'active',
    image: null,
    service: null,
  });

  // Stats
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    totalItems: 0,
    activeItems: 0,
    inactiveItems: 0,
  });

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Service categories
  const categories = [
    { value: 'laundry', label: '🧺 Laundry' },
    { value: 'conferences', label: '🏢 Conferences' },
    { value: 'catering', label: '🍽️ Catering' },
    { value: 'room_booking', label: '🛏️ Room Booking' },
  ];

  // Service icons mapping
  const serviceIcons = {
    'laundry': <FaTshirt className="text-purple-500" />,
    'conferences': <FaBuilding className="text-blue-500" />,
    'catering': <FaUtensils className="text-orange-500" />,
    'room_booking': <FaBed className="text-green-500" />,
  };

  const getServiceIcon = (category) => {
    return serviceIcons[category] || <FaConciergeBell className="text-gray-500" />;
  };

  const getCategoryLabel = (category) => {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  };

  // Fetch services and items
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch services
      const servicesRes = await fetch('http://localhost:8000/api/services/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (!servicesRes.ok) {
        if (servicesRes.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch services');
      }

      const servicesData = await servicesRes.json();
      setServices(servicesData);
      setFilteredServices(servicesData);

      // Fetch all items
      const itemsRes = await fetch('http://localhost:8000/api/service-items/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      let itemsData = [];
      if (itemsRes.ok) {
        itemsData = await itemsRes.json();
        setItems(itemsData);
      }

      // Calculate stats
      const activeServices = servicesData.filter(s => s.status === 'active').length;
      const inactiveServices = servicesData.filter(s => s.status === 'inactive').length;
      const activeItems = itemsData ? itemsData.filter(i => i.status === 'active').length : 0;
      const inactiveItems = itemsData ? itemsData.filter(i => i.status === 'inactive').length : 0;

      setStats({
        totalServices: servicesData.length,
        activeServices: activeServices,
        inactiveServices: inactiveServices,
        totalItems: itemsData ? itemsData.length : 0,
        activeItems: activeItems,
        inactiveItems: inactiveItems,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToastNotification('Failed to load data', 'danger');
      setLoading(false);
    }
  };

  const fetchItemsForService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/services/${serviceId}/service_items/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setSelectedServiceId(serviceId);
        setShowItems(true);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showToastNotification('Failed to load items', 'danger');
    }
  };

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

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(file);
        setImagePreview(reader.result);
        setServiceForm(prev => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(file);
        setImagePreview(reader.result);
        setItemForm(prev => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setServiceForm(prev => ({ ...prev, image: null }));
    setItemForm(prev => ({ ...prev, image: null }));
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (editImageInputRef.current) editImageInputRef.current.value = '';
  };

  const resetServiceForm = () => {
    setServiceForm({
      servicename: '',
      category: 'laundry',
      service_description: '',
      status: 'active',
      image: null,
    });
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (editImageInputRef.current) editImageInputRef.current.value = '';
  };

  const resetItemForm = () => {
    setItemForm({
      itemname: '',
      description: '',
      price: '',
      quantity: 1,
      status: 'active',
      image: null,
      service: selectedServiceId,
    });
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (editImageInputRef.current) editImageInputRef.current.value = '';
  };

  // Add Service
  const handleAddService = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!serviceForm.servicename.trim()) {
      showToastNotification('Service name is required', 'danger');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('servicename', serviceForm.servicename);
      formData.append('category', serviceForm.category);
      formData.append('service_description', serviceForm.service_description || '');
      formData.append('status', serviceForm.status);
      if (selectedImage) formData.append('image', selectedImage);

      const response = await fetch('http://localhost:8000/api/services/', {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add service');
      }

      showToastNotification('✅ Service added successfully!', 'success');
      setShowAddModal(false);
      resetServiceForm();
      fetchAllData();
    } catch (error) {
      console.error('Error adding service:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!itemForm.itemname.trim()) {
      showToastNotification('Item name is required', 'danger');
      setSaving(false);
      return;
    }

    if (!itemForm.price) {
      showToastNotification('Price is required', 'danger');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('service', selectedServiceId || itemForm.service);
      formData.append('itemname', itemForm.itemname);
      formData.append('description', itemForm.description || '');
      formData.append('price', itemForm.price);
      formData.append('quantity', itemForm.quantity || 1);
      formData.append('status', itemForm.status);
      if (selectedImage) formData.append('image', selectedImage);

      const response = await fetch('http://localhost:8000/api/service-items/', {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      showToastNotification('✅ Item added successfully!', 'success');
      setShowAddItemModal(false);
      resetItemForm();
      fetchAllData();
      if (selectedServiceId) fetchItemsForService(selectedServiceId);
    } catch (error) {
      console.error('Error adding item:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Edit Service
  const handleEditService = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('servicename', serviceForm.servicename);
      formData.append('category', serviceForm.category);
      formData.append('service_description', serviceForm.service_description || '');
      formData.append('status', serviceForm.status);
      if (selectedImage) formData.append('image', selectedImage);

      const response = await fetch(`http://localhost:8000/api/services/${selectedService.serviceid}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service');
      }

      showToastNotification('✅ Service updated successfully!', 'success');
      setShowEditModal(false);
      resetServiceForm();
      fetchAllData();
    } catch (error) {
      console.error('Error updating service:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Edit Item
  const handleEditItem = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('service', selectedServiceId || selectedItem.service);
      formData.append('itemname', itemForm.itemname);
      formData.append('description', itemForm.description || '');
      formData.append('price', itemForm.price);
      formData.append('quantity', itemForm.quantity || 1);
      formData.append('status', itemForm.status);
      if (selectedImage) formData.append('image', selectedImage);

      const response = await fetch(`http://localhost:8000/api/service-items/${selectedItem.itemid}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      showToastNotification('✅ Item updated successfully!', 'success');
      setShowEditItemModal(false);
      resetItemForm();
      fetchAllData();
      if (selectedServiceId) fetchItemsForService(selectedServiceId);
    } catch (error) {
      console.error('Error updating item:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Delete Service
  const handleDeleteService = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/services/${selectedService.serviceid}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }

      showToastNotification('✅ Service deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedService(null);
      fetchAllData();
      if (selectedServiceId) setShowItems(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/service-items/${selectedItem.itemid}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      showToastNotification('✅ Item deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchAllData();
      if (selectedServiceId) fetchItemsForService(selectedServiceId);
    } catch (error) {
      console.error('Error deleting item:', error);
      showToastNotification(`❌ ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setServiceForm({
      servicename: service.servicename || '',
      category: service.category || 'laundry',
      service_description: service.service_description || '',
      status: service.status || 'active',
      image: null,
    });
    setImagePreview(service.image ? `http://localhost:8000${service.image}` : null);
    setSelectedImage(null);
    setShowEditModal(true);
  };

  const openEditItemModal = (item) => {
    setSelectedItem(item);
    setItemForm({
      itemname: item.itemname || '',
      description: item.description || '',
      price: item.price || '',
      quantity: item.quantity || 1,
      status: item.status || 'active',
      image: null,
      service: item.service,
    });
    setImagePreview(item.image ? `http://localhost:8000${item.image}` : null);
    setSelectedImage(null);
    setShowEditItemModal(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const openDeleteItemModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const openViewModal = (service) => {
    setSelectedService(service);
    setShowViewModal(true);
  };

  const openAddModal = () => {
    resetServiceForm();
    setShowAddModal(true);
  };

  const openAddItemModal = (serviceId) => {
    setSelectedServiceId(serviceId);
    resetItemForm();
    setItemForm(prev => ({ ...prev, service: serviceId }));
    setShowAddItemModal(true);
  };

  // ✅ Navigate to AdminServicesItem page to view all items
  const handleViewItems = (serviceId) => {
    navigate(`/AdminServicesItem/${serviceId}`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Status', 'Items Count'];
    const csvData = filteredServices.map(s => [
      s.serviceid,
      s.servicename,
      getCategoryLabel(s.category),
      s.status,
      items.filter(i => i.service === s.serviceid).length
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />;
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:8000${image}`;
  };

  // Search and filter
  useEffect(() => {
    let result = services;
    
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }
    
    if (filterCategory !== 'all') {
      result = result.filter(s => s.category === filterCategory);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(s => 
        s.servicename.toLowerCase().includes(term) ||
        s.category?.toLowerCase().includes(term) ||
        s.service_description?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredServices(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, services, sortField, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="services">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="services">
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
              <button onClick={() => setShowToast(false)} className="ml-4 text-white hover:text-gray-200 transition">
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
            <FaConciergeBell className="text-blue-600" /> Services Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage main services and their items
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            <FaFileExport /> Export
          </button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <FaPlus /> Add Service
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Services</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalServices}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaConciergeBell className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Active Services</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.activeServices}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Inactive Services</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.inactiveServices}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-300/30 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-red-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Items</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalItems}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaBox className="text-purple-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-orange-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Active Items</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.activeItems}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-orange-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-pink-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Inactive Items</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.inactiveItems}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-300/30 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-pink-600 text-sm sm:text-base" />
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
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
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Found <strong className="text-gray-700">{filteredServices.length}</strong> services
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterCategory('all');
            }}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <FaConciergeBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No services found</p>
              <button onClick={openAddModal} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <FaPlus className="inline mr-2" /> Add Your First Service
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('serviceid')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      ID {sortField === 'serviceid' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'serviceid' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('servicename')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      Name {sortField === 'servicename' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'servicename' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-gray-800 transition">
                      Category {sortField === 'category' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'category' && <FaSort className="text-gray-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((service, index) => {
                  const serviceItems = items.filter(i => i.service === service.serviceid);
                  return (
                    <tr key={service.serviceid} className="hover:bg-gray-50 transition-all duration-200 animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-4 py-3 text-sm text-gray-600">#{service.serviceid}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getServiceIcon(service.category)}</span>
                          <span className="font-medium text-gray-800">{service.servicename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                        {getCategoryLabel(service.category)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <button
                          onClick={() => handleViewItems(service.serviceid)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                        >
                          <FaBox /> {serviceItems.length} items
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(service.status)}`}>
                          {getStatusIcon(service.status)} {service.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          {/* 👁️ VIEW ITEMS - Navigate to AdminServicesItem */}
                          <button
                            onClick={() => handleViewItems(service.serviceid)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                            title="View All Items"
                          >
                            <FaEye className="group-hover:scale-110 transition-transform" />
                          </button>
                          
                          {/* ✏️ EDIT SERVICE */}
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition group"
                            title="Edit Service"
                          >
                            <FaEdit className="group-hover:scale-110 transition-transform" />
                          </button>
                          
                          {/* 🗑️ DELETE SERVICE */}
                          <button
                            onClick={() => openDeleteModal(service)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition group"
                            title="Delete Service"
                          >
                            <FaTrash className="group-hover:scale-110 transition-transform" />
                          </button>
                          
                          {/* ➕ ADD ITEM */}
                          <button
                            onClick={() => openAddItemModal(service.serviceid)}
                            className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition group"
                            title="Add Item"
                          >
                            <FaPlus className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredServices.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length} services
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
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
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== VIEW ITEMS SECTION ===== */}
      {showItems && selectedServiceId && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaBox className="text-blue-600" /> Items for {services.find(s => s.serviceid === selectedServiceId)?.servicename}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setShowItems(false)} className="text-sm text-gray-500 hover:text-gray-700 transition">
                Close <FaTimes className="inline ml-1" />
              </button>
            </div>
          </div>

          {items.filter(i => i.service === selectedServiceId).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaBox className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No items available for this service</p>
              <button onClick={() => openAddItemModal(selectedServiceId)} className="mt-2 text-sm text-blue-600 hover:text-blue-700 transition">
                Add your first item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {items.filter(i => i.service === selectedServiceId).map((item) => (
                <div key={item.itemid} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.itemname} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaImage size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.itemname}</p>
                      {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-xs font-semibold text-blue-600">{formatPrice(item.price)}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditItemModal(item)} className="p-1 text-green-600 hover:bg-green-50 rounded transition" title="Edit">
                        <FaEdit size={12} />
                      </button>
                      <button onClick={() => openDeleteItemModal(item)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ADD SERVICE MODAL ===== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaPlus className="text-blue-600" /> Add New Service
              </h3>
              <button onClick={() => { setShowAddModal(false); resetServiceForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddService}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="servicename"
                    value={serviceForm.servicename}
                    onChange={handleServiceFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={serviceForm.category}
                    onChange={handleServiceFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="service_description"
                    value={serviceForm.service_description}
                    onChange={handleServiceFormChange}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Service description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1 text-blue-500" /> Service Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          id="image-input"
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleServiceImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-input"
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition group"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <FaCloudUploadAlt className="text-3xl text-gray-400 group-hover:text-blue-500 transition" />
                            <span className="text-sm text-gray-500 group-hover:text-blue-500 transition">Click to upload image</span>
                            <span className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="relative flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500" />
                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={serviceForm.status}
                    onChange={handleServiceFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Adding...' : 'Add Service'}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); resetServiceForm(); }} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ADD ITEM MODAL ===== */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaPlus className="text-purple-600" /> Add New Item
              </h3>
              <button onClick={() => { setShowAddItemModal(false); resetItemForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemname"
                    value={itemForm.itemname}
                    onChange={handleItemFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={itemForm.description}
                    onChange={handleItemFormChange}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="Item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (TSh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={itemForm.price}
                    onChange={handleItemFormChange}
                    required
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={itemForm.quantity}
                    onChange={handleItemFormChange}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1 text-purple-500" /> Item Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          id="item-image-input"
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleItemImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="item-image-input"
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition group"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <FaCloudUploadAlt className="text-3xl text-gray-400 group-hover:text-purple-500 transition" />
                            <span className="text-sm text-gray-500 group-hover:text-purple-500 transition">Click to upload image</span>
                            <span className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="relative flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-purple-500" />
                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={itemForm.status}
                    onChange={handleItemFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Adding...' : 'Add Item'}
                </button>
                <button type="button" onClick={() => { setShowAddItemModal(false); resetItemForm(); }} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT SERVICE MODAL ===== */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-green-600" /> Edit Service
              </h3>
              <button onClick={() => { setShowEditModal(false); resetServiceForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleEditService}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="servicename"
                    value={serviceForm.servicename}
                    onChange={handleServiceFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={serviceForm.category}
                    onChange={handleServiceFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="service_description"
                    value={serviceForm.service_description}
                    onChange={handleServiceFormChange}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1 text-blue-500" /> Service Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          id="edit-image-input"
                          ref={editImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleServiceImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-image-input"
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition group"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <FaCloudUploadAlt className="text-3xl text-gray-400 group-hover:text-blue-500 transition" />
                            <span className="text-sm text-gray-500 group-hover:text-blue-500 transition">
                              {imagePreview ? 'Change image' : 'Click to upload image'}
                            </span>
                            <span className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="relative flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500" />
                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={serviceForm.status}
                    onChange={handleServiceFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Saving...' : 'Update Service'}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); resetServiceForm(); }} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT ITEM MODAL ===== */}
      {showEditItemModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-purple-600" /> Edit Item
              </h3>
              <button onClick={() => { setShowEditItemModal(false); resetItemForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleEditItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemname"
                    value={itemForm.itemname}
                    onChange={handleItemFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={itemForm.description}
                    onChange={handleItemFormChange}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (TSh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={itemForm.price}
                    onChange={handleItemFormChange}
                    required
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={itemForm.quantity}
                    onChange={handleItemFormChange}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1 text-purple-500" /> Item Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          id="edit-item-image-input"
                          ref={editImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleItemImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-item-image-input"
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition group"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <FaCloudUploadAlt className="text-3xl text-gray-400 group-hover:text-purple-500 transition" />
                            <span className="text-sm text-gray-500 group-hover:text-purple-500 transition">
                              {imagePreview ? 'Change image' : 'Click to upload image'}
                            </span>
                            <span className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="relative flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-purple-500" />
                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={itemForm.status}
                    onChange={handleItemFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Saving...' : 'Update Item'}
                </button>
                <button type="button" onClick={() => { setShowEditItemModal(false); resetItemForm(); }} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW SERVICE MODAL ===== */}
      {showViewModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEye className="text-blue-600" /> Service Details
              </h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                {selectedService.image ? (
                  <img src={getImageUrl(selectedService.image)} alt={selectedService.servicename} className="w-24 h-24 object-cover rounded-full border-4 border-blue-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
                    {getServiceIcon(selectedService.category)}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Service ID</p>
                  <p className="font-medium text-gray-800">#{selectedService.serviceid}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedService.status)}`}>
                    {getStatusIcon(selectedService.status)} {selectedService.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Service Name</p>
                  <p className="font-medium text-gray-800 text-lg">{selectedService.servicename}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium text-gray-800">{getCategoryLabel(selectedService.category)}</p>
                </div>
                {selectedService.service_description && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-700">{selectedService.service_description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Items</p>
                  <p className="font-medium text-gray-800">{items.filter(i => i.service === selectedService.serviceid).length} items</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => { setShowViewModal(false); openAddItemModal(selectedService.serviceid); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                <FaPlus /> Add Item
              </button>
              <button onClick={() => { setShowViewModal(false); openEditModal(selectedService); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <FaEdit /> Edit
              </button>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteModal && (selectedService || selectedItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationCircle className="text-red-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete {selectedItem ? 'Item' : 'Service'}</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong className="text-gray-800">
                {selectedItem ? selectedItem.itemname : selectedService?.servicename}
              </strong>?
            </p>
            {selectedService && (
              <p className="text-sm text-gray-500 mb-6">
                Category: {getCategoryLabel(selectedService.category)}<br />
                Status: {selectedService.status}
              </p>
            )}
            {selectedItem && (
              <p className="text-sm text-gray-500 mb-6">
                Price: {formatPrice(selectedItem.price)}<br />
                Status: {selectedItem.status}
              </p>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setSelectedService(null); setSelectedItem(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={selectedItem ? handleDeleteItem : handleDeleteService} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {saving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                {saving ? 'Deleting...' : `Delete ${selectedItem ? 'Item' : 'Service'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out forwards; }
      `}</style>
    </RecepionistSideNavbar>
  );
};

export default AdminService;