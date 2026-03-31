import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Select, Tag, Card, Typography } from 'antd';
import { Edit, RefreshCcw, Lock, Unlock } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const { Title } = Typography;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch {
      toast.error('Lỗi khi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      role: user.role?._id || user.role,
    });
    setIsModalVisible(true);
  };

  const handleToggleLock = async (user) => {
    try {
      await api.patch(`/users/${user._id}/lock`);
      toast.success(user.lockTime ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      fetchData();
    } catch {
      toast.error('Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  const handleUpdateRole = async (values) => {
    try {
      await api.put(`/users/${editingUser._id}`, { role: values.role });
      toast.success('Cập nhật quyền thành công');
      setIsModalVisible(false);
      fetchData();
    } catch {
      toast.error('Lỗi khi cập nhật quyền');
    }
  };

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleName = typeof role === 'object' ? role?.name : roles.find((r) => r._id === role)?.name || 'N/A';
        let color = 'blue';
        if (roleName === 'ADMIN') color = 'volcano';
        if (roleName === 'TECHNICIAN') color = 'green';
        return <Tag color={color}>{roleName}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        record.lockTime ? <Tag color="error">Đã khóa</Tag> : <Tag color="success">Hoạt động</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
            type="text"
          >
            Sửa quyền
          </Button>
          <Button
            icon={record.lockTime ? <Unlock size={16} /> : <Lock size={16} />}
            onClick={() => handleToggleLock(record)}
            danger={!record.lockTime}
            type="text"
          >
            {record.lockTime ? 'Mở khóa' : 'Khóa'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Quản lý Người dùng</Title>
        <Button icon={<RefreshCcw size={16} />} onClick={fetchData} loading={loading}>Làm mới</Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Cập nhật quyền hạn"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleUpdateRole} layout="vertical">
          <Form.Item name="role" label="Vai trò mới" rules={[{ required: true }]}>
            <Select>
              {roles.map((role) => (
                <Select.Option key={role._id} value={role._id}>{role.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
