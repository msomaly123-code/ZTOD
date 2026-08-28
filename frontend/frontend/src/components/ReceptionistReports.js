// src/components/ReceptionistReports.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  FaChartPie,
  FaChartBar,
  FaFileExport,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaPrint,
  FaMoneyBillWave,
  FaUsers,
  FaClipboardList,
  FaConciergeBell,
  FaTrophy, 
  FaClock,
  FaDollarSign,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import RecepionistSideNavbar from './RecepionistSideNavbar';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const ReceptionistReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalServices: 0,
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    orders: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  const [orderStatusData, setOrderStatusData] = useState({
    labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    data: [0, 0, 0, 0],
  });

  const [topServices, setTopServices] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [customersData, setCustomersData] = useState([]);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/RecipionistLogin');
        return;
      }

      // Fetch customers
      const customersRes = await fetch('http://localhost:8000/api/customers/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      const customersData = await customersRes.json();

      // Fetch orders
      const ordersRes = await fetch('http://localhost:8000/api/orders/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      const ordersData = await ordersRes.json();

      // Fetch services
      const servicesRes = await fetch('http://localhost:8000/api/services/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      const servicesData = await servicesRes.json();

      // Fetch payments
      const paymentsRes = await fetch('http://localhost:8000/api/payments/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      const paymentsData = await paymentsRes.json();

      // Calculate stats
      const activeCustomers = customersData.filter(c => c.status === 'active').length;
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const processingOrders = ordersData.filter(o => o.status === 'processing').length;
      const completedOrders = ordersData.filter(o => o.status === 'completed').length;
      const cancelledOrders = ordersData.filter(o => o.status === 'cancelled').length;

      // Calculate revenue
      const totalRevenue = paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Today's revenue
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = paymentsData
        .filter(p => p.status === 'completed' && new Date(p.date).toISOString().split('T')[0] === today)
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Week revenue
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekRevenue = paymentsData
        .filter(p => p.status === 'completed' && new Date(p.date) >= weekAgo)
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      // Month revenue
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthRevenue = paymentsData
        .filter(p => p.status === 'completed' && new Date(p.date) >= monthAgo)
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({
        totalCustomers: customersData.length,
        activeCustomers: activeCustomers,
        totalOrders: ordersData.length,
        pendingOrders: pendingOrders,
        processingOrders: processingOrders,
        completedOrders: completedOrders,
        cancelledOrders: cancelledOrders,
        totalRevenue: totalRevenue,
        todayRevenue: todayRevenue,
        weekRevenue: weekRevenue,
        monthRevenue: monthRevenue,
        totalServices: servicesData.length,
      });

      // Set order status data for chart
      setOrderStatusData({
        labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
        data: [pendingOrders, processingOrders, completedOrders, cancelledOrders],
      });

      // Calculate monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyOrders = new Array(12).fill(0);
      const monthlyRevenue = new Array(12).fill(0);

      ordersData.forEach(order => {
        const date = new Date(order.created_at);
        const month = date.getMonth();
        monthlyOrders[month]++;
      });

      paymentsData
        .filter(p => p.status === 'completed')
        .forEach(payment => {
          const date = new Date(payment.date);
          const month = date.getMonth();
          monthlyRevenue[month] += parseFloat(payment.amount || 0);
        });

      setMonthlyData({
        labels: months,
        orders: monthlyOrders,
        revenue: monthlyRevenue,
      });

      // Calculate top services
      const serviceCount = {};
      ordersData.forEach(order => {
        const serviceName = order.serviceid?.servicename || 'Unknown';
        if (!serviceCount[serviceName]) {
          serviceCount[serviceName] = { count: 0, revenue: 0 };
        }
        serviceCount[serviceName].count++;
        serviceCount[serviceName].revenue += parseFloat(order.totalAmount || 0);
      });

      const topServicesList = Object.entries(serviceCount)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopServices(topServicesList);

      // Recent activity
      const activities = [
        ...ordersData.map(o => ({
          type: 'order',
          message: `New order #${o.orderid} created`,
          date: o.created_at,
          icon: '📋',
        })),
        ...paymentsData.map(p => ({
          type: 'payment',
          message: `Payment of TSh ${parseFloat(p.amount).toLocaleString()} received`,
          date: p.date,
          icon: '💰',
        })),
        ...customersData.map(c => ({
          type: 'customer',
          message: `New customer registered: ${c.name}`,
          date: c.created_at || new Date().toISOString(),
          icon: '👤',
        })),
      ];

      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(activities.slice(0, 10));

      setCustomersData(customersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      showToastNotification('Failed to load report data', 'danger');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showToastNotification = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const formatPrice = (price) => {
    return `TSh ${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Metric', 'Value'];
    const data = [
      ['Total Customers', stats.totalCustomers],
      ['Active Customers', stats.activeCustomers],
      ['Total Orders', stats.totalOrders],
      ['Pending Orders', stats.pendingOrders],
      ['Completed Orders', stats.completedOrders],
      ['Cancelled Orders', stats.cancelledOrders],
      ['Total Revenue', formatPrice(stats.totalRevenue)],
      ['Today Revenue', formatPrice(stats.todayRevenue)],
      ['Week Revenue', formatPrice(stats.weekRevenue)],
      ['Month Revenue', formatPrice(stats.monthRevenue)],
      ['Total Services', stats.totalServices],
    ];
    
    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
        },
      },
    },
    cutout: '70%',
  };

  // Chart data
  const monthlyChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Orders',
        data: monthlyData.orders,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Revenue (TSh)',
        data: monthlyData.revenue.map(val => parseFloat(val).toFixed(2)),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const orderStatusChartData = {
    labels: orderStatusData.labels,
    datasets: [
      {
        data: orderStatusData.data,
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <RecepionistSideNavbar activeMenu="reports">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </RecepionistSideNavbar>
    );
  }

  return (
    <RecepionistSideNavbar activeMenu="reports">
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
              <button 
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200 transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartPie className="text-blue-600" /> Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View comprehensive business analytics and reports
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <FaFileExport /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Customers</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalCustomers}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-300/30 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Active</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.activeCustomers}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300/30 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-orange-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Orders</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalOrders}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-300/30 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-orange-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-purple-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Total Revenue</p>
              <h3 className="text-xs sm:text-sm font-bold">{formatPrice(stats.totalRevenue)}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-300/30 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="text-purple-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-teal-800">
              <p className="text-[10px] sm:text-xs font-medium opacity-70">Services</p>
              <h3 className="text-base sm:text-lg font-bold">{stats.totalServices}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-300/30 rounded-lg flex items-center justify-center">
              <FaConciergeBell className="text-teal-600 text-sm sm:text-base" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Monthly Orders & Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-500" /> Monthly Orders & Revenue
          </h3>
          <div className="h-[250px] sm:h-[300px]">
            <Bar data={monthlyChartData} options={barOptions} />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-blue-500" /> Order Status Distribution
          </h3>
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <Doughnut data={orderStatusChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Services & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> Top Services
          </h3>
          {topServices.length === 0 ? (
            <p className="text-gray-500 text-sm">No services data available</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{service.count} orders</p>
                    <p className="text-xs text-gray-500">{formatPrice(service.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-500" /> Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500">Today's Revenue</p>
              <p className="text-lg font-bold text-blue-600">{formatPrice(stats.todayRevenue)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-lg font-bold text-green-600">{formatPrice(stats.weekRevenue)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-lg font-bold text-purple-600">{formatPrice(stats.monthRevenue)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold text-orange-600">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaClock className="text-blue-500" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-50"
            >
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{activity.message}</p>
                <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activity.type === 'order' ? 'bg-blue-100 text-blue-700' :
                activity.type === 'payment' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {activity.type}
              </span>
            </div>
          ))}
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
      `}</style>
    </RecepionistSideNavbar>
  );
};

export default ReceptionistReports;