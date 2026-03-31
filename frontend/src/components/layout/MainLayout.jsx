import React from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import {
  LayoutDashboard,
  Users,
  Smartphone,
  ClipboardList,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  AlignJustify,
  PanelLeft,
  Hammer,
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;

  const menuItems = [
    {
      key: '/',
      icon: <LayoutDashboard size={20} />,
      label: 'Bảng điều khiển',
    },
    {
      key: '/repair-tickets',
      icon: <ClipboardList size={20} />,
      label: 'Phiếu sửa chữa',
    },
    {
      key: '/devices',
      icon: <Smartphone size={20} />,
      label: 'Thiết bị',
    },
    {
      key: '/services-management',
      icon: <Hammer size={20} />,
      label: 'Dịch vụ và linh kiện',
    },
    {
      key: '/warranty',
      icon: <ShieldCheck size={20} />,
      label: 'Tra cứu bảo hành',
    },
    ...(roleName === 'ADMIN'
      ? [
          {
            key: '/users',
            icon: <Users size={20} />,
            label: 'Quản lý người dùng',
          },
        ]
      : []),
    {
      key: '/profile',
      icon: <UserIcon size={20} />,
      label: 'Cá nhân',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: '1',
      label: <Link to="/profile">Thông tin cá nhân</Link>,
    },
    {
      key: '2',
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
      icon: <LogOut size={16} />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <h2 style={{ color: '#1890ff', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {collapsed ? 'PR' : 'PhoneRepair'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <AlignJustify size={20} /> : <PanelLeft size={20} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space size="large">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserIcon size={18} />} src={user?.profile?.avatar} />
                <span>{user?.fullName || user?.username || 'User'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
