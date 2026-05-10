import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Table, Tag } from 'antd';
import { ClipboardList, Smartphone, Users, DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';
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
  const { user } = useAuth(); // Lấy thông tin người dùng đang đăng nhập từ Context

  // 1. Phân tích quyền hạn của User (ADMIN/MODERATOR mới xem được danh sách User khác)
  const roleName = useMemo(
    () => (typeof user?.role === 'string' ? user.role : user?.role?.name),
    [user]
  );
  const canListAllUsers = roleName === 'ADMIN' || roleName === 'MODERATOR';

  // 2. Khởi tạo State để lưu trữ dữ liệu thống kê từ API gửi về
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalDevices: 0,
    totalUsers: 0,
    totalRevenue: 0,
    statusData: [], // Lưu dữ liệu vẽ biểu đồ trạng thái (Biểu đồ cột)
    revenueData: [], // Lưu dữ liệu vẽ xu hướng doanh thu (Biểu đồ đường)
    recentTickets: [], // Lưu 5 phiếu gần nhất
  });
  const [loading, setLoading] = useState(false); // Quản lý trạng thái đang tải dữ liệu

  useEffect(() => {
    let cancelled = false;

    // Hàm gọi API đồng thời để lấy dữ liệu trang Dashboard
    const fetchDashboardData = async () => {
      setLoading(true); // Hiển thị biểu tượng đang tải (Loading)
      try {
        // Gọi đồng thời các API phiếu sửa chữa và thiết bị
        const ticketsRes = await api.get('/repair-tickets');
        const devicesRes = await api.get('/devices');

        let users = [];
        // Chỉ gọi API /users nếu người dùng có đủ quyền (Admin/Mod)
        if (canListAllUsers) {
          const usersRes = await api.get('/users');
          users = usersRes.data || [];
        }

        if (cancelled) return; // Nếu Component đã bị đóng thì không cập nhật state nữa

        const tickets = ticketsRes.data || [];
        const devices = devicesRes.data || [];

        // 3. Xử lý dữ liệu thô sang định dạng biểu đồ (Stats & Charts)
        const totalRevenue = calculateTotalRevenue(tickets);
        const statusChartData = buildStatusChartData(tickets);

        // Tạo dữ liệu giả lập cho biểu đồ xu hướng theo tháng
        const revenueChartData = [
          { name: 'Tháng 1', revenue: totalRevenue * 0.1 },
          { name: 'Tháng 2', revenue: totalRevenue * 0.2 },
          { name: 'Tháng 3', revenue: totalRevenue * 0.4 },
          { name: 'Tháng 4', revenue: totalRevenue * 0.3 },
        ];

        // Cập nhật tất cả dữ liệu vào State để React render lại giao diện
        setStats({
          totalTickets: tickets.length,
          totalDevices: devices.length,
          totalUsers: users.length,
          totalRevenue,
          statusData: statusChartData,
          revenueData: revenueChartData,
          recentTickets: tickets.slice(0, 5),
        });
      } catch {
        if (!cancelled) {
          toast.error('Lỗi khi tải dữ liệu thống kê'); // Hiển thị thông báo lỗi (Toast)
        }
      } finally {
        if (!cancelled) {
          setLoading(false); // Tắt biểu tượng đang tải
        }
      }
    };

    if (user) {
      fetchDashboardData(); // Chỉ gọi API khi đã xác thực được User
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

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card
            className="surface-card"
            title={
              <Space>
                <Clock size={18} color="#0d9488" />
                <span>Phiếu sửa chữa gần đây</span>
              </Space>
            }
            loading={loading}
          >
            <Table
              dataSource={stats.recentTickets}
              rowKey="_id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mã phiếu',
                  key: 'ticket_code',
                  render: (_, record) => <code>{record.ticket_code || record._id.slice(-6).toUpperCase()}</code>,
                },
                {
                  title: 'Thiết bị',
                  key: 'device',
                  render: (_, record) => record.device_id?.model || 'Không có',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const statusMap = {
                      pending: { color: 'warning', text: 'Chờ xử lý' },
                      fixing: { color: 'processing', text: 'Đang sửa chữa' },
                      repairing: { color: 'processing', text: 'Đang sửa chữa' },
                      completed: { color: 'success', text: 'Hoàn thành' },
                      canceled: { color: 'error', text: 'Đã hủy' },
                      delivered: { color: 'blue', text: 'Đã giao' },
                      ready_for_pickup: { color: 'purple', text: 'Chờ nhận máy' },
                    };
                    const normalized = String(status || '').toLowerCase();
                    const { color, text } = statusMap[normalized] || { color: 'default', text: status };
                    return <Tag color={color}>{text}</Tag>;
                  },
                },
                {
                  title: 'Tổng tiền',
                  dataIndex: 'total_cost',
                  key: 'total_cost',
                  render: (price) => <strong style={{ color: '#0f172a' }}>{(price || 0).toLocaleString()}đ</strong>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
