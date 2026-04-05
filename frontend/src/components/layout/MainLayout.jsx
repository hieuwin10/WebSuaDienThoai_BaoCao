import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
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
import { mediaUrl, getMediaBase } from '../../utils/mediaUrl';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const mediaBase = getMediaBase();
  const headerAvatarSrc =
    mediaUrl(user?.profile?.avatar ?? user?.avatarUrl, mediaBase) || undefined;
  const navigate = useNavigate();
  const location = useLocation();

  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;

  const isStaff = roleName === 'ADMIN' || roleName === 'MODERATOR';

  const menuItems = [
    { key: '/', icon: <LayoutDashboard size={20} strokeWidth={2} />, label: 'Bảng điều khiển' },
    { key: '/repair-tickets', icon: <ClipboardList size={20} strokeWidth={2} />, label: 'Phiếu sửa chữa' },
    {
      key: '/devices',
      icon: <Smartphone size={20} strokeWidth={2} />,
      label: isStaff ? 'Thiết bị' : 'Thiết bị của tôi',
    },
    ...(isStaff
      ? [{ key: '/services-management', icon: <Hammer size={20} strokeWidth={2} />, label: 'Dịch vụ & linh kiện' }]
      : []),
    { key: '/warranty', icon: <ShieldCheck size={20} strokeWidth={2} />, label: 'Tra cứu bảo hành' },
    ...(roleName === 'ADMIN'
      ? [{ key: '/users', icon: <Users size={20} strokeWidth={2} />, label: 'Quản lý người dùng' }]
      : []),
    { key: '/profile', icon: <UserIcon size={20} strokeWidth={2} />, label: 'Cá nhân' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: '1', label: <Link to="/profile">Thông tin cá nhân</Link> },
    {
      key: '2',
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
      icon: <LogOut size={16} />,
    },
  ];

  const selectedKeys = menuItems.some((i) => i.key === location.pathname)
    ? [location.pathname]
    : [];

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={248}
        collapsedWidth={80}
        className="main-sider"
      >
        <div className="sider-brand">
          <div className="sider-brand__mark" aria-hidden>
            {collapsed ? 'PR' : 'PR'}
          </div>
          {!collapsed && (
            <div className="sider-brand__text">
              <p className="sider-brand__title">Phone Repair</p>
              <p className="sider-brand__sub">Workshop OS</p>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={selectedKeys}
          className="main-menu"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className="main-inner">
        <Header className="main-header">
          <Button
            type="text"
            icon={collapsed ? <AlignJustify size={22} /> : <PanelLeft size={22} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: 48, height: 48, color: '#334155' }}
            aria-label={collapsed ? 'Mở menu' : 'Thu menu'}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space size={12} className="main-header__user">
              <Avatar
                size={40}
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #0d9488)' }}
                src={headerAvatarSrc}
                icon={!headerAvatarSrc ? <UserIcon size={18} /> : undefined}
              />
              <div style={{ lineHeight: 1.25, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                  {user?.fullName || user?.username || 'Người dùng'}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {roleName || 'Thành viên'}
                </Text>
              </div>
            </Space>
          </Dropdown>
        </Header>
        <Content className="main-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
