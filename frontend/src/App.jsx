import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
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

const LoadingScreen = () => (
  <div className="app-loading">
    <Spin size="large" />
    <span>Đang tải...</span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  return <MainLayout>{children}</MainLayout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
  if (roleName !== 'ADMIN') return <Navigate to="/" replace />;
  return <MainLayout>{children}</MainLayout>;
};

const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
  if (roleName !== 'ADMIN' && roleName !== 'MODERATOR') return <Navigate to="/" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0d9488',
          colorInfo: '#0891b2',
          colorSuccess: '#059669',
          colorWarning: '#d97706',
          colorError: '#e11d48',
          borderRadius: 10,
          borderRadiusLG: 16,
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          colorBgLayout: '#f1f5f9',
        },
        components: {
          Button: { fontWeight: 600 },
          Card: { paddingLG: 22 },
          Table: {
            headerBg: 'rgba(248, 250, 252, 0.98)',
            headerSplitColor: 'transparent',
            rowHoverBg: 'rgba(13, 148, 136, 0.045)',
          },
          Menu: {
            itemMarginInline: 4,
            iconSize: 20,
            collapsedIconSize: 20,
          },
          Layout: {
            headerHeight: 64,
            headerBg: 'transparent',
            bodyBg: 'transparent',
          },
          Input: { controlHeightLG: 44 },
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
            <Route path="/services-management" element={<StaffRoute><ServiceManagement /></StaffRoute>} />
            <Route path="/repair-tickets" element={<ProtectedRoute><RepairTickets /></ProtectedRoute>} />
            <Route path="/repair-tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
            <Route path="/repair-tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/warranty" element={<ProtectedRoute><Warranty /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" theme="colored" toastStyle={{ borderRadius: 12 }} />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
