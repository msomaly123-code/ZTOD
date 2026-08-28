// src/components/Services.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaBed, FaUtensils, FaTshirt, FaConciergeBell, FaSignOutAlt, FaUser, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/CustomerLogin');
      return;
    }

    fetchServices();
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/services/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
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

  const serviceIcons = {
    'Conferences': <FaBuilding className="text-4xl text-blue-500" />,
    'Booking Room': <FaBed className="text-4xl text-blue-500" />,
    'Catering': <FaUtensils className="text-4xl text-blue-500" />,
    'Laundry': <FaTshirt className="text-4xl text-blue-500" />
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading services...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
            <Link to="/orders" className="text-gray-600 hover:text-gray-900 flex items-center">
              <FaClipboardList className="mr-1" /> My Orders
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
          <FaConciergeBell className="mr-3 text-blue-500" /> Our Services
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6 text-center">
                <div className="mb-4">
                  {serviceIcons[service.servicename] || <FaBuilding className="text-4xl text-blue-500" />}
                </div>
                <h3 className="text-xl font-bold mb-2">{service.servicename}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description || 'Premium service'}</p>
                <p className="text-green-600 font-bold text-lg mb-4">TSh {service.price}</p>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;