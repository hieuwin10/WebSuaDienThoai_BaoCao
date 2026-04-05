import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Card, Typography, Tooltip } from 'antd';
import { Plus, Edit, Trash2, Smartphone, Search, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';

const { Title, Text } = Typography;

const DevicePage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const { user, isStaff } = useAuth();

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/devices');
      setDevices(res.data);
    } catch {
      toast.error('Lỗi khi tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAdd = () => {
    setEditingDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    form.setFieldsValue({
      imei: device.imei,
      brand: device.brand,
      model_name: device.model_name || device.model,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        await api.delete(`/devices/${id}`);
        toast.success('Xóa thiết bị thành công');
        fetchDevices();
      } catch {
        toast.error('Lỗi khi xóa thiết bị');
      }
    }
  };

  const onFinish = async (values) => {
    const payload = {
      imei: values.imei,
      brand: values.brand,
      model_name: values.model_name,
      customer_id: editingDevice?.customer_id?._id || editingDevice?.customer_id || user?._id,
    };

    try {
      if (editingDevice) {
        await api.put(`/devices/${editingDevice._id}`, payload);
        toast.success('Cập nhật thiết bị thành công');
      } else {
        await api.post('/devices', payload);
        toast.success('Thêm thiết bị mới thành công');
      }
      setIsModalVisible(false);
      fetchDevices();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra. Vui lòng thử lại.'));
    }
  };

  const filteredDevices = devices.filter((device) => {
    const imei = String(device.imei || '');
    const modelName = String(device.model_name || device.device_name || '');
    const q = searchText.toLowerCase();
    return imei.toLowerCase().includes(q) || modelName.toLowerCase().includes(q);
  });

  const columns = [
    {
      title: 'Tên thiết bị',
      key: 'model_name',
      render: (_, record) => record.model_name || record.device_name || 'Không có',
      sorter: (a, b) => String(a.model_name || '').localeCompare(String(b.model_name || '')),
    },
    {
      title: 'IMEI',
      dataIndex: 'imei',
      key: 'imei',
      render: (text) => <code>{text}</code>,
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {isStaff ? (
            <Tooltip title="Chỉnh sửa">
              <Button icon={<Edit size={16} />} onClick={() => handleEdit(record)} type="link" />
            </Tooltip>
          ) : null}
          {user?.role?.name === 'ADMIN' && (
            <Tooltip title="Xóa">
              <Button
                icon={<Trash2 size={16} />}
                onClick={() => handleDelete(record._id)}
                danger
                type="link"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-root">
      <header className="page-header">
        <div>
          <Title level={3} className="page-header__title">
            {isStaff ? 'Quản lý thiết bị' : 'Thiết bị của tôi'}
          </Title>
          <p className="page-header__lead">
            {isStaff
              ? 'Danh sách máy khách — tìm nhanh theo IMEI hoặc model.'
              : 'Đăng ký máy của bạn để tạo phiếu sửa chữa và tra cứu bảo hành.'}
          </p>
        </div>
        <div className="page-toolbar">
          <Input
            allowClear
            placeholder="Tìm theo IMEI hoặc model..."
            prefix={<Search size={16} style={{ color: 'rgba(15,23,42,0.35)' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
          />
          <Button icon={<RefreshCcw size={16} />} onClick={fetchDevices}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            Thêm thiết bị
          </Button>
        </div>
      </header>

      <Card className="surface-card" bordered={false}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {filteredDevices.length} / {devices.length} thiết bị hiển thị
        </Text>
        <Table
          columns={columns}
          dataSource={filteredDevices}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingDevice ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="model_name" label="Model thiết bị" rules={[{ required: true, message: 'Vui lòng nhập model thiết bị' }]}>
            <Input prefix={<Smartphone size={16} />} placeholder="Ví dụ: iPhone 13 Pro Max" />
          </Form.Item>
          <Form.Item name="imei" label="Số IMEI" rules={[{ required: true, message: 'Vui lòng nhập IMEI' }]}>
            <Input placeholder="Nhập 15 số IMEI" />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}>
            <Input placeholder="Ví dụ: Apple" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DevicePage;
