import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Divider, Descriptions, Button, Upload, Image, Space, Select } from 'antd';
import { ArrowLeft, Printer, Image as ImageIcon, Plus, Trash2, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TicketDetailPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchTicketData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketRes, mediaRes] = await Promise.all([
        api.get(`/repair-tickets/${id}`),
        api.get(`/media/ticket/${id}`),
      ]);
      setTicket(ticketRes.data);
      setMedia(mediaRes.data);
    } catch {
      toast.error('L?i khi t?i thông tin phi?u');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/repair-tickets/${id}/status`, { status: newStatus });
      toast.success('C?p nh?t tr?ng thái thành công');
      fetchTicketData();
    } catch {
      toast.error('L?i khi c?p nh?t tr?ng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticket', id);
    formData.append('type', 'BEFORE');

    try {
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('T?i ?nh lên thành công');
      fetchTicketData();
      onSuccess('Ok');
    } catch (err) {
      toast.error('L?i khi t?i ?nh lên');
      onError(err);
    }
  };

  const deleteMedia = async (mediaId) => {
    try {
      await api.delete(`/media/${mediaId}`);
      toast.success('Ðã xóa ?nh');
      fetchTicketData();
    } catch {
      toast.error('L?i khi xóa ?nh');
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'warning', text: 'Ch? x? lý' },
      fixing: { color: 'processing', text: 'Ðang s?a ch?a' },
      repairing: { color: 'processing', text: 'Ðang s?a ch?a' },
      completed: { color: 'success', text: 'Hoàn thành' },
      canceled: { color: 'error', text: 'Ðã h?y' },
      delivered: { color: 'blue', text: 'Ðã giao' },
      ready_for_pickup: { color: 'purple', text: 'Ch? nh?n máy' },
    };
    const normalized = String(status || '').toLowerCase();
    const { color, text } = statusMap[normalized] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const mediaBaseUrl = useMemo(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
    return apiBase.replace(/\/api\/v1\/?$/, '');
  }, []);

  if (loading) return <div>Ðang t?i...</div>;
  if (!ticket) return <div>Không tìm th?y phi?u s?a ch?a</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} type="text">
          Quay l?i
        </Button>
        <Space>
          <Button icon={<Printer size={16} />}>In phi?u</Button>
          <Select
            value={ticket.status}
            onChange={handleStatusChange}
            loading={updating}
            style={{ width: 170 }}
          >
            <Select.Option value="pending">Ch? x? lý</Select.Option>
            <Select.Option value="fixing">S?a ch?a</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="ready_for_pickup">Ch? nh?n máy</Select.Option>
            <Select.Option value="canceled">H?y b?</Select.Option>
          </Select>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card
            title={
              <Space>
                <Clock size={20} style={{ color: '#1890ff' }} />
                <span>Chi ti?t s? {ticket.ticket_code || ticket._id.slice(-6).toUpperCase()}</span>
                {getStatusTag(ticket.status)}
              </Space>
            }
          >
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Thi?t b?" span={1}>{ticket.device_id?.model_name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="IMEI" span={1}>{ticket.device_id?.imei || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Ngày t?o" span={2}>{dayjs(ticket.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{ticket.note || 'Không có ghi chú'}</pre>
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>D?ch v? và linh ki?n</Title>
            <div style={{ marginBottom: 16 }}>
              {(ticket.services || []).map((s) => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text>{s.name}</Text>
                  <Text type="secondary">{(s.base_price || 0).toLocaleString()}d</Text>
                </div>
              ))}
              {(ticket.components_used || []).map((c, index) => (
                <div key={c._id || `${c.component_id?._id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text>Linh ki?n: {c.component_id?.name || 'N/A'} x {c.quantity || 1}</Text>
                  <Text type="secondary">{((c.component_id?.price || 0) * (c.quantity || 1)).toLocaleString()}d</Text>
                </div>
              ))}
            </div>

            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fafafa', padding: '12px' }}>
              <Title level={4} style={{ margin: 0 }}>T?ng c?ng:</Title>
              <Title level={4} style={{ margin: 0, color: '#f5222d' }}>{(ticket.total_cost || 0).toLocaleString()}d</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={<Space><ImageIcon size={20} /><span>Hình ?nh (Media)</span></Space>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 16 }}>
              <Image.PreviewGroup>
                {media.map((item) => (
                  <div key={item._id} style={{ position: 'relative' }}>
                    <Image
                      src={`${mediaBaseUrl}${item.url}`}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <Button
                      size="small"
                      shape="circle"
                      icon={<Trash2 size={10} />}
                      danger
                      style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, minWidth: 18 }}
                      onClick={() => deleteMedia(item._id)}
                    />
                  </div>
                ))}
              </Image.PreviewGroup>
              <Upload
                customRequest={handleUpload}
                showUploadList={false}
                multiple
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    border: '1px dashed #d9d9d9',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={24} style={{ color: '#8c8c8c' }} />
                  <span style={{ fontSize: '10px', color: '#8c8c8c' }}>T?i ?nh</span>
                </div>
              </Upload>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TicketDetailPage;




