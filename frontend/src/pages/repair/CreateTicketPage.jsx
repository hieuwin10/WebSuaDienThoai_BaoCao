import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, Row, Col, Divider, Space } from 'antd';
import { ArrowLeft, Save, User, Phone, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
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
      toast.error(getApiErrorMessage(err, 'Lỗi khi tạo phiếu. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root" style={{ maxWidth: 880, margin: '0 auto' }}>
      <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} type="link" style={{ marginBottom: 12, paddingLeft: 0 }}>
        Quay lại danh sách
      </Button>

      <Card className="surface-card" bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 14px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(13,148,136,0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488',
            }}
          >
            <Clipboard size={28} />
          </div>
          <Title level={3} style={{ margin: 0, letterSpacing: '-0.03em' }}>
            Tạo phiếu sửa chữa mới
          </Title>
          <Text type="secondary">Điền thông tin khách, thiết bị và dịch vụ — lưu một lần, theo dõi toàn bộ quy trình.</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ services: [], components: [] }}
          requiredMark={false}
        >
          <Title level={5} style={{ marginTop: 0 }}>1. Thông tin khách (ghi chú phiếu)</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label={<span style={{ fontWeight: 600 }}>Họ tên khách hàng</span>}>
                <Input prefix={<User size={16} />} placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}>
                <Input prefix={<Phone size={16} />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(15,23,42,0.06)' }} />
          <Title level={5}>2. Thiết bị &amp; tình trạng</Title>
          <Form.Item name="device_id" label={<span style={{ fontWeight: 600 }}>Chọn thiết bị</span>} rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
            <Select showSearch placeholder="Chọn hoặc tìm theo IMEI" optionFilterProp="children">
              {devices.map((dev) => (
                <Option key={dev._id} value={dev._id}>
                  {dev.model_name} — {dev.imei} ({dev.brand})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="issueDetails" label={<span style={{ fontWeight: 600 }}>Mô tả lỗi từ khách</span>}>
            <Input.TextArea placeholder="Ví dụ: Màn hình sọc, không lên nguồn..." rows={3} />
          </Form.Item>

          <Divider style={{ borderColor: 'rgba(15,23,42,0.06)' }} />
          <Title level={5}>3. Dịch vụ &amp; linh kiện</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="services" label={<span style={{ fontWeight: 600 }}>Dịch vụ áp dụng</span>}>
                <Select mode="multiple" placeholder="Chọn dịch vụ" style={{ width: '100%' }}>
                  {services.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name} — {s.base_price?.toLocaleString()}đ
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="components" label={<span style={{ fontWeight: 600 }}>Linh kiện thay thế (mỗi loại SL = 1)</span>}>
                <Select mode="multiple" placeholder="Chọn linh kiện" style={{ width: '100%' }}>
                  {components.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name} — {c.price?.toLocaleString()}đ (Tồn: {c.stock_quantity})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<span style={{ fontWeight: 600 }}>Ghi chú kỹ thuật</span>}>
            <Input.TextArea placeholder="Ghi chú nội bộ cho kỹ thuật viên..." rows={2} />
          </Form.Item>

          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate(-1)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<Save size={16} />}>
                Tạo phiếu
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTicketPage;
