import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, Row, Col, Typography, Divider } from 'antd';
import { User, Phone, MapPin, Upload as UploadIcon, Save } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/profiles/me');
      setProfile(res.data);
      form.setFieldsValue({
        full_name: res.data.full_name,
        phone: res.data.phone,
        address: res.data.address,
      });
    } catch {
      toast.error('Lỗi khi tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put('/profiles/me', values);
      toast.success('Cập nhật thông tin thành công');
      fetchProfile();
    } catch {
      toast.error('Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (options, type) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    setUploading(true);
    try {
      const res = await api.post('/profiles/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} thành công`);
      setProfile(res.data.profile);
      onSuccess('Ok');
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div>Đang tải...</div>;

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
  const mediaBase = apiBase.replace(/\/api\/v1\/?$/, '');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card
        cover={
          <div style={{ position: 'relative', height: 200, background: '#e6f7ff', overflow: 'hidden' }}>
            {profile.cover_image && (
              <img
                src={`${mediaBase}${profile.cover_image}`}
                alt="cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
              <Upload
                customRequest={(options) => handleUpload(options, 'cover')}
                showUploadList={false}
                disabled={uploading}
              >
                <Button icon={<UploadIcon size={16} />} size="small" loading={uploading}>Đổi ảnh bìa</Button>
              </Upload>
            </div>
          </div>
        }
      >
        <Row gutter={24}>
          <Col xs={24} md={8} style={{ textAlign: 'center', marginTop: -60 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={120}
                src={profile.avatar ? `${mediaBase}${profile.avatar}` : null}
                icon={<User size={64} />}
                style={{ border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <div style={{ position: 'absolute', bottom: 5, right: 5 }}>
                <Upload
                  customRequest={(options) => handleUpload(options, 'avatar')}
                  showUploadList={false}
                  disabled={uploading}
                >
                  <Button shape="circle" icon={<UploadIcon size={14} />} size="small" type="primary" loading={uploading} />
                </Upload>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Title level={4} style={{ margin: 0 }}>{profile.full_name || user?.username}</Title>
              <Text type="secondary">{user?.role?.name || 'Thành viên'}</Text>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Title level={4}>Thông tin chi tiết</Title>
            <Divider style={{ margin: '12px 0' }} />
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
                    <Input prefix={<User size={16} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại">
                    <Input prefix={<Phone size={16} />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input prefix={<MapPin size={16} />} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<Save size={16} />} loading={loading}>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProfilePage;
