import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { User, Lock, Mail, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: values.username,
        password: values.password,
        email: values.email,
        fullName: values.fullName,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero__inner">
          <div className="auth-hero__badge">
            <Sparkles size={14} />
            Tham gia nhanh chóng
          </div>
          <h1>Tạo tài khoản</h1>
          <p>
            Đồng bộ phiếu sửa chữa, lịch sử thiết bị và quy trình bảo hành — làm việc nhóm mượt mà hơn mỗi ngày.
          </p>
        </div>
      </div>
      <div className="auth-panel">
        <Card className="auth-card" bordered={false}>
          <div className="auth-card__logo">+</div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0, letterSpacing: '-0.03em' }}>
              Đăng ký
            </Title>
            <Text type="secondary">Hệ thống quản lý sửa chữa điện thoại</Text>
          </div>

          <Form name="register_form" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input prefix={<User size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />} placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 600 }}>Tên đăng nhập</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input prefix={<User size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600 }}>Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input prefix={<Mail size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />} placeholder="Ví dụ: ten@gmail.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
              ]}
            >
              <Input.Password
                prefix={<Lock size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />}
                placeholder="Tối thiểu 6 ký tự"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label={<span style={{ fontWeight: 600 }}>Xác nhận mật khẩu</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<Lock size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />}
                placeholder="Nhập lại mật khẩu"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" icon={<UserPlus size={18} />}>
                Đăng ký
              </Button>
            </Form.Item>

            <Divider plain>
              <Text type="secondary">Đã có tài khoản?</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login">Đăng nhập tại đây</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
