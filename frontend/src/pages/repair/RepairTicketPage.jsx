import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Typography, Tag, Input, Select } from 'antd';
import { Plus, Eye, Search, RefreshCcw, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RepairTicketPage = () => {
  const { isStaff } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/repair-tickets');
      setTickets(res.data);
    } catch {
      toast.error('Lỗi khi tải danh sách phiếu sửa chữa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusTag = (status) => {
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
  };

  const filteredTickets = tickets.filter((ticket) => {
    const deviceName = ticket.device_id?.model_name || '';
    const code = ticket.ticket_code || '';
    const matchesSearch =
      code.toLowerCase().includes(searchText.toLowerCase()) ||
      deviceName.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket._id.includes(searchText);

    const matchesStatus = statusFilter === 'ALL' || String(ticket.status).toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Mã phiếu',
      key: 'ticket_code',
      render: (_, record) => <code>{record.ticket_code || record._id.slice(-6).toUpperCase()}</code>,
    },
    {
      title: 'Thiết bị',
      key: 'device',
      render: (_, record) => record.device_id?.model_name || 'Không có',
    },
    {
      title: 'IMEI',
      key: 'imei',
      render: (_, record) => record.device_id?.imei || 'Không có',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (price) => <strong style={{ color: '#0f172a' }}>{(price || 0).toLocaleString()}đ</strong>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<Eye size={16} />}
          onClick={() => navigate(`/repair-tickets/${record._id}`)}
          type="primary"
          ghost
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="page-root">
      <header className="page-header">
        <div>
          <Title level={3} className="page-header__title">
            {isStaff ? 'Phiếu sửa chữa' : 'Phiếu sửa chữa của tôi'}
          </Title>
          <p className="page-header__lead">
            {isStaff
              ? 'Lọc theo trạng thái, tìm nhanh theo mã phiếu hoặc thiết bị.'
              : 'Theo dõi tiến độ sửa chữa các máy bạn đã đăng ký.'}
          </p>
        </div>
        <div className="page-toolbar">
          <Input
            allowClear
            placeholder="Mã phiếu, thiết bị..."
            prefix={<Search size={16} style={{ color: 'rgba(15,23,42,0.35)' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 190 }}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ xử lý' },
              { value: 'fixing', label: 'Đang sửa chữa' },
              { value: 'completed', label: 'Hoàn thành' },
              { value: 'canceled', label: 'Đã hủy' },
              { value: 'ready_for_pickup', label: 'Chờ nhận máy' },
            ]}
          />
          <Button icon={<RefreshCcw size={16} />} onClick={fetchTickets}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/repair-tickets/create')}>
            Tạo phiếu mới
          </Button>
        </div>
      </header>

      <Card className="surface-card" bordered={false}>
        <Space align="center" style={{ marginBottom: 12 }} wrap>
          <ClipboardList size={18} style={{ color: '#0d9488' }} />
          <Text type="secondary">
            {filteredTickets.length} / {tickets.length} phiếu
          </Text>
        </Space>
        <Table
          columns={columns}
          dataSource={filteredTickets}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};

export default RepairTicketPage;
