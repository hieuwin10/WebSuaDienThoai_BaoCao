import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Space } from 'antd';
import { ClipboardList, Smartphone, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const STATUS_LABEL = {
  pending: 'Chờ xử lý',
  fixing: 'Đang sửa chữa',
  repairing: 'Đang sửa chữa',
  completed: 'Hoàn thành',
  canceled: 'Đã hủy',
  delivered: 'Đã giao',
  ready_for_pickup: 'Chờ nhận máy',
  unknown: 'Không xác định',
};

const CHART_PRIMARY = '#0d9488';
const CHART_BAR = '#14b8a6';

const calculateTotalRevenue = (tickets) => {
  let total = 0;
  for (const ticket of tickets) {
    total += ticket.total_cost || 0;
  }
  return total;
};

const buildStatusChartData = (tickets) => {
  const statusCounts = {};

  for (const ticket of tickets) {
    const statusKey = String(ticket.status || 'unknown').toLowerCase();

    if (!statusCounts[statusKey]) {
      statusCounts[statusKey] = 0;
    }
    statusCounts[statusKey] += 1;
  }

  const chartData = [];
  for (const key in statusCounts) {
    chartData.push({
      name: STATUS_LABEL[key] || key,
      value: statusCounts[key],
    });
  }

  return chartData;
};

const Dashboard = () => {
  const { user } = useAuth();
  const roleName = useMemo(
    () => (typeof user?.role === 'string' ? user.role : user?.role?.name),
    [user]
  );
  /** Backend: GET /users chỉ cho ADMIN, MODERATOR */
  const canListAllUsers = roleName === 'ADMIN' || roleName === 'MODERATOR';

  const [stats, setStats] = useState({
    totalTickets: 0,
    totalDevices: 0,
    totalUsers: 0,
    totalRevenue: 0,
    statusData: [],
    revenueData: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const ticketsRes = await api.get('/repair-tickets');
        const devicesRes = await api.get('/devices');

        let users = [];
        if (canListAllUsers) {
          const usersRes = await api.get('/users');
          users = usersRes.data || [];
        }

        if (cancelled) return;

        const tickets = ticketsRes.data || [];
        const devices = devicesRes.data || [];
        const totalRevenue = calculateTotalRevenue(tickets);
        const statusChartData = buildStatusChartData(tickets);

        const revenueChartData = [
          { name: 'Tháng 1', revenue: totalRevenue * 0.1 },
          { name: 'Tháng 2', revenue: totalRevenue * 0.2 },
          { name: 'Tháng 3', revenue: totalRevenue * 0.4 },
          { name: 'Tháng 4', revenue: totalRevenue * 0.3 },
        ];

        setStats({
          totalTickets: tickets.length,
          totalDevices: devices.length,
          totalUsers: users.length,
          totalRevenue,
          statusData: statusChartData,
          revenueData: revenueChartData,
        });
      } catch {
        if (!cancelled) {
          toast.error('Lỗi khi tải dữ liệu thống kê');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchDashboardData();
    }

    return () => {
      cancelled = true;
    };
  }, [user, canListAllUsers]);

  const statCol = canListAllUsers
    ? { xs: 24, sm: 12, lg: 6 }
    : { xs: 24, sm: 12, lg: 8 };

  return (
    <div className="page-root">
      <header className="page-header">
        <div>
          <Title level={3} className="page-header__title">
            Bảng điều khiển
          </Title>
          <p className="page-header__lead">
            {canListAllUsers
              ? 'Tổng quan phiếu sửa chữa, thiết bị và doanh thu — ưu tiên thông tin quan trọng phía trên.'
              : 'Tổng quan phiếu và thiết bị gắn với tài khoản của bạn.'}
          </p>
        </div>
      </header>

      <Row gutter={[16, 16]} className="stat-bento">
        <Col {...statCol}>
          <Card bordered={false} loading={loading}>
            <div className="stat-bento__icon stat-bento__icon--teal">
              <ClipboardList size={22} />
            </div>
            <Statistic title={canListAllUsers ? 'Tổng số phiếu' : 'Phiếu của tôi'} value={stats.totalTickets} />
          </Card>
        </Col>
        <Col {...statCol}>
          <Card bordered={false} loading={loading}>
            <div className="stat-bento__icon stat-bento__icon--emerald">
              <Smartphone size={22} />
            </div>
            <Statistic title={canListAllUsers ? 'Thiết bị khách hàng' : 'Thiết bị của tôi'} value={stats.totalDevices} />
          </Card>
        </Col>
        <Col {...statCol}>
          <Card bordered={false} loading={loading}>
            <div className="stat-bento__icon stat-bento__icon--rose">
              <DollarSign size={22} />
            </div>
            <Statistic
              title={canListAllUsers ? 'Tổng doanh thu' : 'Chi phí phiếu (ước tính)'}
              value={stats.totalRevenue}
              suffix="đ"
            />
          </Card>
        </Col>
        {canListAllUsers ? (
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} loading={loading}>
              <div className="stat-bento__icon stat-bento__icon--violet">
                <Users size={22} />
              </div>
              <Statistic title="Người dùng hệ thống" value={stats.totalUsers} />
            </Card>
          </Col>
        ) : null}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={16}>
          <Card
            className="surface-card chart-card"
            title={
              <Space>
                <TrendingUp size={18} color={CHART_PRIMARY} />
                <span>Xu hướng doanh thu (minh họa theo tổng hiện tại)</span>
              </Space>
            }
            loading={loading}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Biểu đồ phân bổ minh họa từ tổng doanh thu các phiếu — có thể nối API theo tháng sau.
            </Text>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,42,0.08)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: CHART_PRIMARY }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            className="surface-card chart-card"
            title={
              <Space>
                <AlertCircle size={18} color={CHART_BAR} />
                <span>Trạng thái sửa chữa</span>
              </Space>
            }
            loading={loading}
          >
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={56} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,42,0.08)' }}
                  />
                  <Bar dataKey="value" fill={CHART_BAR} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
