import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import Warranty from './pages/warranty/WarrantyPage';
import UserManagement from './pages/admin/UserManagementPage';
import Profile from './pages/profile/ProfilePage';
import Devices from './pages/devices/DevicePage';
import ServiceManagement from './pages/management/ServiceManagementPage';
import RepairTickets from './pages/repair/RepairTicketPage';
import CreateTicket from './pages/repair/CreateTicketPage';
import TicketDetail from './pages/repair/TicketDetailPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <MainLayout>{children}</MainLayout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
  if (roleName !== 'ADMIN') return <Navigate to="/" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
            <Route path="/services-management" element={<ProtectedRoute><ServiceManagement /></ProtectedRoute>} />
            <Route path="/repair-tickets" element={<ProtectedRoute><RepairTickets /></ProtectedRoute>} />
            <Route path="/repair-tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
            <Route path="/repair-tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/warranty" element={<ProtectedRoute><Warranty /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
