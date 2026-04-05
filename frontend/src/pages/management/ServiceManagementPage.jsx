import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Card, Typography, Tabs, InputNumber, Tag } from 'antd';
import { Plus, Edit, Trash2, Package, Hammer, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, componentsRes] = await Promise.all([
        api.get('/services'),
        api.get('/components'),
      ]);
      setServices(servicesRes.data);
      setComponents(componentsRes.data);
    } catch {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      price: item.base_price ?? item.price,
      stockCount: item.stock_quantity,
      sku: item.sku,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      try {
        const endpoint = activeTab === 'services' ? '/services' : '/components';
        await api.delete(`${endpoint}/${id}`);
        toast.success('Xóa thành công');
        fetchData();
      } catch {
        toast.error('Lỗi khi xóa dữ liệu');
      }
    }
  };

  const onFinish = async (values) => {
    try {
      const endpoint = activeTab === 'services' ? '/services' : '/components';
      const payload = activeTab === 'services'
        ? {
            name: values.name,
            description: values.description,
            base_price: Number(values.price || 0),
          }
        : {
            name: values.name,
            sku: values.sku || `SKU-${Date.now()}`,
            price: Number(values.price || 0),
            stock_quantity: Number(values.stockCount || 0),
          };

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem._id}`, payload);
        toast.success('Cập nhật thành công');
      } else {
        await api.post(endpoint, payload);
        toast.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra. Vui lòng thử lại.'));
    }
  };

  const serviceColumns = [
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Đơn giá (VNĐ)',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price) => (price || 0).toLocaleString(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<Edit size={16} />} onClick={() => handleEdit(record)} type="link" />
          {user?.role?.name === 'ADMIN' && (
            <Button icon={<Trash2 size={16} />} onClick={() => handleDelete(record._id)} danger type="link" />
          )}
        </Space>
      ),
    },
  ];

  const componentColumns = [
    { title: 'Tên linh kiện', dataIndex: 'name', key: 'name' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    {
      title: 'Đơn giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (price || 0).toLocaleString(),
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (count) => (
        <Tag color={count < 5 ? 'volcano' : 'green'}>{count}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<Edit size={16} />} onClick={() => handleEdit(record)} type="link" />
          {user?.role?.name === 'ADMIN' && (
            <Button icon={<Trash2 size={16} />} onClick={() => handleDelete(record._id)} danger type="link" />
          )}
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: 'services',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hammer size={16} /> Danh mục dịch vụ
        </span>
      ),
      children: (
        <Table
          columns={serviceColumns}
          dataSource={services}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      ),
    },
    {
      key: 'components',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={16} /> Kho linh kiện
        </span>
      ),
      children: (
        <Table
          columns={componentColumns}
          dataSource={components}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      ),
    },
  ];

  return (
    <div className="page-root">
      <header className="page-header">
        <div>
          <Title level={3} className="page-header__title">
            Dịch vụ &amp; linh kiện
          </Title>
          <p className="page-header__lead">Quản lý bảng giá dịch vụ và tồn kho linh kiện thay thế.</p>
        </div>
        <div className="page-toolbar">
          <Button icon={<RefreshCcw size={16} />} onClick={fetchData}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            Thêm {activeTab === 'services' ? 'dịch vụ' : 'linh kiện'}
          </Button>
        </div>
      </header>

      <Card className="surface-card" bordered={false}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          Chuyển tab để chỉnh sửa từng loại danh mục.
        </Text>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
      </Card>

      <Modal
        title={editingItem ? 'Cập nhật' : 'Thêm mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {activeTab === 'services' && (
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
          )}
          {activeTab === 'components' && (
            <Form.Item name="sku" label="SKU" rules={[{ required: !editingItem, message: 'Vui lòng nhập SKU cho linh kiện mới' }]}>
              <Input placeholder="Ví dụ: LCD-IP13PM" />
            </Form.Item>
          )}
          <Form.Item name="price" label="Đơn giá (VNĐ)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          {activeTab === 'components' && (
            <Form.Item name="stockCount" label="Số lượng tồn kho" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceManagementPage;
