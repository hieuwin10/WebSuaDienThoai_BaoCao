import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Space } from 'antd';
import { ClipboardList, Smartphone, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../services/api';
import { toast } from 'react-toastify';

const { Title } = Typography;
const STATUS_LABEL = {
  pending: 'Chờ xử lý',
  fixing: 'Đang sửa chữa',
  completed: 'Hoàn thành',
  canceled: 'Đã hủy',
  ready_for_pickup: 'Chờ nhận máy',
};

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
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalDevices: 0,
    totalUsers: 0,
    totalRevenue: 0,
    statusData: [],
    revenueData: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ticketsRes = await api.get('/repair-tickets');
      const devicesRes = await api.get('/devices');
      const usersRes = await api.get('/users');

      const tickets = ticketsRes.data || [];
      const devices = devicesRes.data || [];
      const users = usersRes.data || [];
      const totalRevenue = calculateTotalRevenue(tickets);
      const statusChartData = buildStatusChartData(tickets);

      const revenueChartData = [
        { name: 'Jan', revenue: totalRevenue * 0.1 },
        { name: 'Feb', revenue: totalRevenue * 0.2 },
        { name: 'Mar', revenue: totalRevenue * 0.4 },
        { name: 'Apr', revenue: totalRevenue * 0.3 },
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
      toast.error('Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Bảng điều khiển tổng quan</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card" loading={loading}>
            <Statistic
              title="Tổng số phiếu"
              value={stats.totalTickets}
              prefix={<ClipboardList size={20} style={{ marginRight: 8, color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card" loading={loading}>
            <Statistic
              title="Thiết bị khách hàng"
              value={stats.totalDevices}
              prefix={<Smartphone size={20} style={{ marginRight: 8, color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card" loading={loading}>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              suffix="đ"
              prefix={<DollarSign size={20} style={{ marginRight: 8, color: '#f5222d' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card" loading={loading}>
            <Statistic
              title="Người dùng hệ thống"
              value={stats.totalUsers}
              prefix={<Users size={20} style={{ marginRight: 8, color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Space><TrendingUp size={18} /><span>Xu hướng doanh thu</span></Space>} loading={loading}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1890ff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Space><AlertCircle size={18} /><span>Trạng thái sửa chữa</span></Space>} loading={loading}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#52c41a" radius={[4, 4, 0, 0]} />
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
