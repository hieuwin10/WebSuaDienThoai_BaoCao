import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, Row, Col, Typography, Divider, Spin } from 'antd';
import { User, Phone, MapPin, Upload as UploadIcon, Save } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { mediaUrl, getMediaBase } from '../../utils/mediaUrl';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const { user, refreshUser } = useAuth();

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
    // Ant Design Upload truyền object có originFileObj; multer cần Blob/File thật
    const rawFile = file?.originFileObj ?? file;
    if (!(rawFile instanceof Blob)) {
      onError(new Error('Không đọc được tệp ảnh.'));
      toast.error('Không đọc được tệp ảnh. Vui lòng chọn lại.');
      return;
    }
    const formData = new FormData();
    formData.append('image', rawFile, rawFile.name || 'image');
    formData.append('type', type);

    setUploading(true);
    try {
      // Không set Content-Type thủ công — axios tự thêm boundary cho FormData
      const res = await api.post('/profiles/upload-image', formData);
      toast.success(`Cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} thành công`);
      setProfile(res.data.profile);
      await refreshUser();
      onSuccess('Ok');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Lỗi khi tải ảnh lên. Vui lòng thử lại.'));
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const mediaBase = getMediaBase();

  if (!profile) {
    return (
      <div className="app-loading" style={{ minHeight: 320 }}>
        <Spin size="large" />
        <span>Đang tải hồ sơ...</span>
      </div>
    );
  }

  return (
    <div className="page-root" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header className="page-header">
        <div>
          <Title level={3} className="page-header__title">
            Hồ sơ cá nhân
          </Title>
          <p className="page-header__lead">Cập nhật ảnh đại diện, ảnh bìa và thông tin liên hệ.</p>
        </div>
      </header>

      <Card
        className="surface-card"
        bordered={false}
        styles={{ body: { padding: 0 } }}
        cover={(
          <div className="profile-cover">
            {profile.cover_image && (
              <img src={mediaUrl(profile.cover_image, mediaBase)} alt="Ảnh bìa" />
            )}
            <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 2 }}>
              <Upload
                customRequest={(options) => handleUpload(options, 'cover')}
                showUploadList={false}
                disabled={uploading}
              >
                <Button icon={<UploadIcon size={16} />} loading={uploading} style={{ borderRadius: 10 }}>
                  Đổi ảnh bìa
                </Button>
              </Upload>
            </div>
          </div>
        )}
      >
        <div style={{ padding: '8px 24px 28px' }}>
          <Row gutter={24}>
            <Col xs={24} md={8} style={{ textAlign: 'center', marginTop: -56 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={120}
                  src={mediaUrl(profile.avatar, mediaBase) || undefined}
                  icon={<User size={56} strokeWidth={1.75} />}
                  style={{
                    border: '4px solid #fff',
                    boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
                  }}
                />
                <div style={{ position: 'absolute', bottom: 4, right: 4 }}>
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
              <Title level={5} style={{ marginTop: 8 }}>Chi tiết</Title>
              <Divider style={{ margin: '12px 0' }} />
              <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="full_name" label={<span style={{ fontWeight: 600 }}>Họ và tên</span>} rules={[{ required: true }]}>
                      <Input prefix={<User size={16} />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}>
                      <Input prefix={<Phone size={16} />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="address" label={<span style={{ fontWeight: 600 }}>Địa chỉ</span>}>
                      <Input prefix={<MapPin size={16} />} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" icon={<Save size={16} />} loading={loading}>
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
