import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Divider, Descriptions, Button, Upload, Image, Space, Select, Spin } from 'antd';
import { ArrowLeft, Printer, Image as ImageIcon, Plus, Trash2, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MSG = {
  loadErr: '\u004c\u1ed7i khi t\u1ea3i th\u00f4ng tin phi\u1ebfu',
  statusOk: 'C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i th\u00e0nh c\u00f4ng',
  statusErr: '\u004c\u1ed7i khi c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i',
  uploadOk: 'T\u1ea3i \u1ea3nh l\u00ean th\u00e0nh c\u00f4ng',
  uploadErr: '\u004c\u1ed7i khi t\u1ea3i \u1ea3nh l\u00ean',
  delOk: '\u0110\u00e3 x\u00f3a \u1ea3nh',
  delErr: '\u004c\u1ed7i khi x\u00f3a \u1ea3nh',
  loading: '\u0110ang t\u1ea3i phi\u1ebfu...',
  notFound: 'Kh\u00f4ng t\u00ecm th\u1ea5y phi\u1ebfu s\u1eeda ch\u1eefa ho\u1eb7c b\u1ea1n kh\u00f4ng c\u00f3 quy\u1ec1n xem.',
  back: 'Quay l\u1ea1i',
  print: 'In phi\u1ebfu',
  mediaHintStaff:
    '\u1ea2nh tr\u01b0\u1edbc/sau s\u1eeda ch\u1eefa gi\u00fap l\u01b0u b\u1eb1ng ch\u1ee9ng v\u00e0 h\u1ed7 tr\u1ee3 b\u1ea3o h\u00e0nh.',
  mediaHintUser:
    '\u1ea2nh do c\u1eeda h\u00e0ng c\u1eadp nh\u1eadt khi ti\u1ebfp nh\u1eadn v\u00e0 s\u1eeda ch\u1eefa.',
};

const STATUS_UI = {
  pending: { color: 'warning', text: 'Ch\u1edd x\u1eed l\u00fd' },
  fixing: { color: 'processing', text: '\u0110ang s\u1eeda ch\u1eefa' },
  repairing: { color: 'processing', text: '\u0110ang s\u1eeda ch\u1eefa' },
  completed: { color: 'success', text: 'Ho\u00e0n th\u00e0nh' },
  canceled: { color: 'error', text: '\u0110\u00e3 h\u1ee7y' },
  delivered: { color: 'blue', text: '\u0110\u00e3 giao' },
  ready_for_pickup: { color: 'purple', text: 'Ch\u1edd nh\u1eadn m\u00e1y' },
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const { isStaff } = useAuth();
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
      toast.error(MSG.loadErr);
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
      toast.success(MSG.statusOk);
      fetchTicketData();
    } catch {
      toast.error(MSG.statusErr);
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
      toast.success(MSG.uploadOk);
      fetchTicketData();
      onSuccess('Ok');
    } catch (err) {
      toast.error(MSG.uploadErr);
      onError(err);
    }
  };

  const deleteMedia = async (mediaId) => {
    try {
      await api.delete(`/media/${mediaId}`);
      toast.success(MSG.delOk);
      fetchTicketData();
    } catch {
      toast.error(MSG.delErr);
    }
  };

  const getStatusTag = (status) => {
    const normalized = String(status || '').toLowerCase();
    const { color, text } = STATUS_UI[normalized] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const mediaBaseUrl = useMemo(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
    return apiBase.replace(/\/api\/v1\/?$/, '');
  }, []);

  const lbDevice = 'Thi\u1ebft b\u1ecb';
  const lbImei = 'IMEI';
  const lbCreated = 'Ng\u00e0y t\u1ea1o';
  const lbNote = 'Ghi ch\u00fa';
  const none = 'Kh\u00f4ng c\u00f3';
  const noneNote = 'Kh\u00f4ng c\u00f3 ghi ch\u00fa';
  const svcTitle = 'D\u1ecbch v\u1ee5 & linh ki\u1ec7n';
  const totalLabel = 'T\u1ed5ng c\u1ed9ng';
  const imgTitle = 'H\u00ecnh \u1ea3nh';
  const uploadLabel = 'T\u1ea3i \u1ea3nh';
  const dong = '\u0111';

  if (loading) {
    return (
      <div className="app-loading" style={{ minHeight: 320 }}>
        <Spin size="large" />
        <span>{MSG.loading}</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-root">
        <Text type="secondary">{MSG.notFound}</Text>
      </div>
    );
  }

  return (
    <div className="page-root" style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} type="link" style={{ paddingLeft: 0 }}>
          {MSG.back}
        </Button>
        <Space wrap>
          <Button icon={<Printer size={16} />}>{MSG.print}</Button>
          {isStaff ? (
            <Select
              value={ticket.status}
              onChange={handleStatusChange}
              loading={updating}
              style={{ minWidth: 180 }}
            >
              <Select.Option value="pending">{STATUS_UI.pending.text}</Select.Option>
              <Select.Option value="fixing">{'\u0110ang s\u1eeda'}</Select.Option>
              <Select.Option value="completed">{STATUS_UI.completed.text}</Select.Option>
              <Select.Option value="ready_for_pickup">{STATUS_UI.ready_for_pickup.text}</Select.Option>
              <Select.Option value="canceled">{STATUS_UI.canceled.text}</Select.Option>
            </Select>
          ) : null}
        </Space>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card
            className="surface-card"
            bordered={false}
            title={(
              <Space wrap>
                <Clock size={20} style={{ color: '#0d9488' }} />
                <span>
                  {'Phi\u1ebfu '}
                  {ticket.ticket_code || ticket._id.slice(-6).toUpperCase()}
                </span>
                {getStatusTag(ticket.status)}
              </Space>
            )}
          >
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label={lbDevice}>{ticket.device_id?.model_name || none}</Descriptions.Item>
              <Descriptions.Item label={lbImei}>{ticket.device_id?.imei || none}</Descriptions.Item>
              <Descriptions.Item label={lbCreated} span={2}>
                {dayjs(ticket.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label={lbNote} span={2}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {ticket.note || noneNote}
                </pre>
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>{svcTitle}</Title>
            <div style={{ marginBottom: 8 }}>
              {(ticket.services || []).map((s) => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                  <Text>{s.name}</Text>
                  <Text type="secondary">{(s.base_price || 0).toLocaleString('vi-VN')}{dong}</Text>
                </div>
              ))}
              {(ticket.components_used || []).map((c, index) => (
                <div
                  key={c._id || `${c.component_id?._id}-${index}`}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(15,23,42,0.06)' }}
                >
                  <Text>
                    {'Linh ki\u1ec7n: '}
                    {c.component_id?.name || none}
                    {' \u00d7 '}
                    {c.quantity || 1}
                  </Text>
                  <Text type="secondary">{((c.component_id?.price || 0) * (c.quantity || 1)).toLocaleString('vi-VN')}{dong}</Text>
                </div>
              ))}
            </div>

            <Divider />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(90deg, rgba(13,148,136,0.08), rgba(8,145,178,0.06))',
                border: '1px solid rgba(13,148,136,0.2)',
              }}
            >
              <Title level={4} style={{ margin: 0 }}>{totalLabel}</Title>
              <Title level={4} style={{ margin: 0, color: '#0f766e' }}>
                {(ticket.total_cost || 0).toLocaleString('vi-VN')}
                {dong}
              </Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="surface-card"
            bordered={false}
            title={(
              <Space>
                <ImageIcon size={20} style={{ color: '#0d9488' }} />
                <span>{imgTitle}</span>
              </Space>
            )}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
              <Image.PreviewGroup>
                {media.map((item) => (
                  <div key={item._id} style={{ position: 'relative' }}>
                    <Image
                      src={`${mediaBaseUrl}${item.url}`}
                      width={88}
                      height={88}
                      style={{ objectFit: 'cover', borderRadius: 12 }}
                    />
                    {isStaff ? (
                      <Button
                        size="small"
                        shape="circle"
                        icon={<Trash2 size={10} />}
                        danger
                        style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, minWidth: 22 }}
                        onClick={() => deleteMedia(item._id)}
                      />
                    ) : null}
                  </div>
                ))}
              </Image.PreviewGroup>
              {isStaff ? (
                <Upload customRequest={handleUpload} showUploadList={false} multiple>
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      border: '2px dashed rgba(13,148,136,0.35)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'rgba(13,148,136,0.04)',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <Plus size={22} style={{ color: '#0d9488' }} />
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{uploadLabel}</span>
                  </div>
                </Upload>
              ) : null}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isStaff ? MSG.mediaHintStaff : MSG.mediaHintUser}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TicketDetailPage;
