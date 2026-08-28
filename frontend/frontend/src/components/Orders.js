// src/components/Orders.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClipboardList, FaCheckCircle, FaClock, FaTimesCircle, FaSignOutAlt, FaUser, FaConciergeBell } from 'react-icons/fa';
import axios from 'axios';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/CustomerLogin');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.get(`http://localhost:8000/api/orders/?customerid=${user.id}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/CustomerLogin');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaUser className="mr-1" /> Profile
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaConciergeBell className="mr-1" /> Services
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm"
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <FaClipboardList className="mr-3 text-blue-500" /> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Link to="/services" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderid} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">Order #{order.orderid}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">Service: {order.serviceid?.servicename || 'N/A'}</p>
                    <p className="text-gray-600 text-sm">Date: {new Date(order.orderdate).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-3 md:mt-0 text-right">
                    <p className="text-2xl font-bold text-blue-600">TSh {order.totalamount}</p>
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-semibold">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;