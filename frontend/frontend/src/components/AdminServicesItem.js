// src/components/AdminServicesItem.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaSave,
  FaTimes,
  FaBox,
  FaImage,
  FaMoneyBillWave,
  FaWeightHanging,
  FaCalendarAlt,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaList,
  FaConciergeBell,
} from 'react-icons/fa';
import axios from 'axios';
import RecepionistSideNavbar from './RecepionistSideNavbar'; // ✅ FIXED: Use the correct filename

const AdminServicesItem = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Item form data
  const [itemForm, setItemForm] = useState({
    itemname: '',
    description: '',
    price: '',
    quantity: 1,
    status: 'active',
    image: null,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
      fetchItems();
    } else {
      navigate('/AdminService');
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/services/${serviceId}/`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      showToastNotification('Failed to load service details', 'danger');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/services/${serviceId}/service_items/`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      
      const processedItems = response.data.map(item => ({
        ...item,
        image_url: getImageUrl(item.image)
      }));
      
      setItems(processedItems);
      setFilteredItems(processedItems);
      
      const active = processedItems.filter(i => i.status === 'active').length;
      const inactive = processedItems.filter(i => i.status === 'inactive').length;
      const totalRevenue = processedItems
        .filter(i => i.status === 'active')
        .reduce((sum, i) => sum + parseFloat(i.price || 0), 0);
      
      setStats({
        total: processedItems.length,
        active: active,
        inactive: inactive,
        totalRevenue: totalRevenue,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      showToastNotification('Failed to load items', 'danger');
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/media/')) return `http://localhost:8000${imagePath}`;
    if (imagePath.startsWith('media/')) return `http://localhost:8000/${imagePath}`;
    return `http://localhost:8000/media/services/${imagePath}`;
  };

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
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
    setItemForm(prev => ({ ...prev, image: null }));
  };

  const resetForm = () => {
    setItemForm({
      itemname: '',
      description: '',
      price: '',
      quantity: 1,
      status: 'active',
      image: null,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedItem(null);
  };

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
      formData.append('service', serviceId);
      formData.append('itemname', itemForm.itemname);
      formData.append('description', itemForm.description || '');
      formData.append('price', itemForm.price);
      formData.append('quantity', itemForm.quantity || 1);
      formData.append('status', itemForm.status);
      if (selectedImage) formData.append('image', selectedImage);

      await axios.post(
        'http://localhost:8000/api/service-items/',
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      showToastNotification('✅ Item added successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      showToastNotification('❌ Failed to add item', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('service', serviceId);
      formData.append('itemname', itemForm.itemname);
      formData.append('description', itemForm.description || '');
      formData.append('price', itemForm.price);
      formData.append('quantity', itemForm.quantity || 1);
      formData.append('status', itemForm.status);
      if (selectedImage) formData.append('image', selectedImage);

      await axios.put(
        `http://localhost:8000/api/service-items/${selectedItem.itemid}/`,
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      showToastNotification('✅ Item updated successfully!', 'success');
      setShowEditModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      showToastNotification('❌ Failed to update item', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/api/service-items/${selectedItem.itemid}/`,
        { headers: { 'Authorization': `Token ${token}` } }
      );

      showToastNotification('✅ Item deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      showToastNotification('❌ Failed to delete item', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setItemForm({
      itemname: item.itemname || '',
      description: item.description || '',
      price: item.price || '',
      quantity: item.quantity || 1,
      status: item.status || 'active',
      image: null,
    });
    setImagePreview(item.image ? getImageUrl(item.image) : null);
    setSelectedImage(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
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
    if (!price) return 'N/A';
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

  // Search and filter
  useEffect(() => {
    let result = items;
    
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        item.itemname.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(result);
  }, [searchTerm, filterStatus, items]);

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/AdminService')}
              className="text-gray-600 hover:text-gray-800 transition p-2 hover:bg-gray-100 rounded-lg"
              title="Back to Services"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaBox className="text-blue-600" /> Service Items
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {service?.servicename} - Manage all items
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Items</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.total}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaBox className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Active</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.active}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Inactive</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.inactive}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-300/30 rounded-lg flex items-center justify-center">
              <FaTimesCircle className="text-red-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Revenue</p>
              <h3 className="text-xs sm:text-sm font-bold">{formatPrice(stats.totalRevenue)}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-purple-600 text-sm sm:text-base" />
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
              placeholder="Search items..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Found <strong className="text-gray-700">{filteredItems.length}</strong> items
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="text-blue-600 hover:text-blue-700 transition"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No items found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first item for this service</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus className="inline mr-2" /> Add Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.itemid}
              className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 ${
                item.status === 'active' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              {/* Item Image */}
              <div className="relative h-48 bg-gray-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.itemname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.no-image').style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="no-image w-full h-full flex items-center justify-center flex-col text-gray-400"
                  style={{ display: item.image_url ? 'none' : 'flex' }}
                >
                  <FaImage size={48} />
                  <span className="text-sm mt-2">No Image</span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-800 text-lg truncate">{item.itemname}</h4>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    <FaMoneyBillWave /> {formatPrice(item.price)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    <FaWeightHanging /> Qty: {item.quantity}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <FaCalendarAlt className="inline mr-1" />
                    {formatDate(item.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openViewModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                      title="View Details"
                    >
                      <FaEye className="group-hover:scale-110 transition-transform" size={14} />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition group"
                      title="Edit"
                    >
                      <FaEdit className="group-hover:scale-110 transition-transform" size={14} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition group"
                      title="Delete"
                    >
                      <FaTrash className="group-hover:scale-110 transition-transform" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== ADD ITEM MODAL ===== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaPlus className="text-blue-600" /> Add New Item
              </h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={itemForm.status}
                    onChange={handleItemFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1 text-blue-500" /> Item Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="item-image-input"
                        />
                        <label
                          htmlFor="item-image-input"
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
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT ITEM MODAL ===== */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-green-600" /> Edit Item
              </h3>
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={itemForm.status}
                    onChange={handleItemFormChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaImage className="inline mr-1 text-blue-500" /> Item Image
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="edit-item-image-input"
                        />
                        <label
                          htmlFor="edit-item-image-input"
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
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? 'Saving...' : 'Update Item'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW ITEM MODAL ===== */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" /> Item Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.itemname}
                    className="w-32 h-32 object-cover rounded-full border-4 border-blue-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl text-gray-400">
                    <FaImage />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Item ID</p>
                  <p className="font-medium text-gray-800">#{selectedItem.itemid}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    selectedItem.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {getStatusIcon(selectedItem.status)} {getStatusLabel(selectedItem.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Item Name</p>
                  <p className="font-medium text-gray-800 text-lg">{selectedItem.itemname}</p>
                </div>
                {selectedItem.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-700">{selectedItem.description}</p>
                  </div>
                )}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-bold text-blue-600 text-lg">{formatPrice(selectedItem.price)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-800">{selectedItem.quantity}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Total Price</p>
                  <p className="font-bold text-purple-600">{formatPrice(selectedItem.totalprice || selectedItem.price)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedItem.created_at)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedItem.updated_at)}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setShowViewModal(false); openEditModal(selectedItem); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <FaEdit /> Edit Item
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeInUp p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationCircle className="text-red-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Item</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong className="text-gray-800">{selectedItem.itemname}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Price: {formatPrice(selectedItem.price)}<br />
              Status: {selectedItem.status}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedItem(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                {saving ? 'Deleting...' : 'Delete Item'}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </RecepionistSideNavbar>
  );
};

export default AdminServicesItem;