import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, Row, Col, Divider, Space } from 'antd';
import { ArrowLeft, Save, User, Phone, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const { Title } = Typography;
const { Option } = Select;

const buildComponentsUsed = (componentIds) => {
  const result = [];

  for (const componentId of componentIds) {
    result.push({
      component_id: componentId,
      quantity: 1,
    });
  }

  return result;
};

const buildTicketNote = (values) => {
  const noteLines = [];

  if (values.customerName) {
    noteLines.push(`Khách: ${values.customerName}`);
  }
  if (values.customerPhone) {
    noteLines.push(`SĐT: ${values.customerPhone}`);
  }
  if (values.issueDetails) {
    noteLines.push(`Lỗi báo cáo: ${values.issueDetails}`);
  }
  if (values.description) {
    noteLines.push(`Ghi chú: ${values.description}`);
  }

  return noteLines.join('\n');
};

const CreateTicketPage = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [services, setServices] = useState([]);
  const [components, setComponents] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const devRes = await api.get('/devices');
      const servRes = await api.get('/services');
      const compRes = await api.get('/components');

      setDevices(devRes.data);
      setServices(servRes.data);
      setComponents(compRes.data);
    } catch {
      toast.error('Lỗi khi tải dữ liệu phụ trợ');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const selectedServices = values.services || [];
      const selectedComponents = values.components || [];
      const componentsUsed = buildComponentsUsed(selectedComponents);
      const note = buildTicketNote(values);

      const payload = {
        ticket_code: `TK${Date.now()}`,
        device_id: values.device_id,
        services: selectedServices,
        components_used: componentsUsed,
        status: 'pending',
        note,
      };

      await api.post('/repair-tickets', payload);
      toast.success('Tạo phiếu sửa chữa thành công');
      navigate('/repair-tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo phiếu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} type="text">
          Quay lại
        </Button>
      </div>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}><Clipboard size={24} style={{ marginRight: 8 }} /> Tạo Phiếu Sửa Chữa Mới</Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ services: [], components: [] }}
        >
          <Title level={5}>1. Thông tin khách hàng (ghi chú)</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Họ tên khách hàng">
                <Input prefix={<User size={16} />} placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="Số điện thoại">
                <Input prefix={<Phone size={16} />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Title level={5}>2. Thông tin thiết bị và tình trạng</Title>
          <Form.Item name="device_id" label="Chọn thiết bị" rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
            <Select
              showSearch
              placeholder="Chọn hoặc tìm thiết bị theo IMEI"
              optionFilterProp="children"
            >
              {devices.map((dev) => (
                <Option key={dev._id} value={dev._id}>
                  {dev.model_name} - {dev.imei} ({dev.brand})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="issueDetails" label="Mô tả lỗi từ khách hàng">
            <Input.TextArea placeholder="Ví dụ: Màn hình bị sọc, không lên nguồn..." rows={3} />
          </Form.Item>

          <Divider />
          <Title level={5}>3. Dịch vụ và linh kiện</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="services" label="Chọn dịch vụ sửa chữa">
                <Select mode="multiple" placeholder="Chọn các dịch vụ áp dụng" style={{ width: '100%' }}>
                  {services.map((s) => (
                    <Option key={s._id} value={s._id}>{s.name} - {s.base_price?.toLocaleString()}đ</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="components" label="Linh kiện thay thế (mỗi loại mặc định SL=1)">
                <Select mode="multiple" placeholder="Chọn các linh kiện cần thay" style={{ width: '100%' }}>
                  {components.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name} - {c.price?.toLocaleString()}đ (Tồn: {c.stock_quantity})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Ghi chú kỹ thuật">
            <Input.TextArea placeholder="Ghi chú thêm về quy trình sửa chữa..." rows={2} />
          </Form.Item>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate(-1)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
                Tạo phiếu sửa chữa
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTicketPage;
