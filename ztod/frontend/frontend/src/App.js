import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Baseurl from './baseurls/baseurl';
import Home from './components/Home';
import CustomerLogin from './components/CustomerLogin';
import CustomerRegister from './components/CustomerRegister';
import RecipionistLogin from './components/RecipionistLogin';
import RecipionistDashboard from './components/RecipionistDashboard';
import RecepionistSideNavbar from './components/RecepionistSideNavbar';
import ReceptionistCustomers from './components/ReceptionistCustomers';
import RecepionistSettings from './components/RecepionistSettings';
import AdminService from './components/AdminService';
import ReceptionistOrders from './components/ReceptionistOrders';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerSideNavbar from './components/CustomerSideNavbar';
import CustomerService from './components/CustomerService';
import CustomerOrder from './components/CustomerOrder';
import ReceptionistPayments from './components/ReceptionistPayments';
import ReceptionistReports from './components/ReceptionistReports';
import CustomerPayments from './components/CustomerPayments';
import CustomerPaymentConfirmation from './components/CustomerPaymentConfirmation';
import CustomerSettings from './components/CustomerSettings';
import ServiceDetail from './components/ServiceDetail';
import AdminServicesItem from './components/AdminServicesItem';
import CustomerOrderDetail from './components/CustomerOrderDetail';
import ReceptionistCustomerDetail from './components/ReceptionistCustomerDetail';
import CustomerServiceDetails from './components/CustomerServiceDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CustomerLogin" element={<CustomerLogin />} />
          <Route path="/CustomerRegister" element={<CustomerRegister />} />
          <Route path="/RecipionistLogin" element={<RecipionistLogin />} />
          <Route path="/RecipionistDashboard" element={<RecipionistDashboard />} />
          <Route path="/RecepionistSideNavbar" element={<RecepionistSideNavbar />} />
          <Route path="/ReceptionistCustomers" element={<ReceptionistCustomers />} />

          <Route path="/RecepionistSettings" element={<RecepionistSettings />} />
          <Route path="/AdminService" element={<AdminService />} />

          <Route path="/ReceptionistOrders" element={<ReceptionistOrders />} />
          <Route path="/ReceptionistPayments" element={<ReceptionistPayments />} />
          <Route path="/ReceptionistReports" element={<ReceptionistReports />} />

          <Route path="/CustomerDashboard" element={<CustomerDashboard />} />
          <Route path="/CustomerSideNavbar" element={<CustomerSideNavbar />} />
          <Route path="/CustomerService" element={<CustomerService />} />
          <Route path="/CustomerOrder" element={<CustomerOrder />} />
          <Route path="/CustomerPayments" element={<CustomerPayments />} />
          <Route
            path="/CustomerPaymentConfirmation"
            element={<CustomerPaymentConfirmation />}
          />
          <Route path="/CustomerSettings" element={<CustomerSettings />} />

          <Route path="/services/:serviceId" element={<ServiceDetail />} />

<Route path="/CustomerServiceDetails/:serviceId" element={<CustomerServiceDetails />} />

         


          <Route
            path="/AdminServicesItem/:serviceId"
            element={<AdminServicesItem />}
          />
          <Route
            path="/CustomerOrderDetail/:orderId"
            element={<CustomerOrderDetail />}
          />
          <Route
            path="/ReceptionistCustomerDetail/:customerId"
            element={<ReceptionistCustomerDetail />}
          />

          <Route path="/baseurl" element={<Baseurl />} />

          {/* Redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
