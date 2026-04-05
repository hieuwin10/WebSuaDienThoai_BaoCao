import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { User, Lock, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.username, values.password);
    setLoading(false);

    if (result.success) {
      toast.success('Đăng nhập thành công');
      navigate('/');
    } else {
      toast.error(
        result.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.'
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero__inner">
          <div className="auth-hero__badge">
            <Sparkles size={14} />
            Hệ thống quản lý xưởng
          </div>
          <h1>Phone Repair</h1>
          <p>
            Theo dõi phiếu sửa chữa, thiết bị, kho linh kiện và bảo hành — mọi thứ gọn trong một bảng điều khiển
            hiện đại.
          </p>
        </div>
      </div>
      <div className="auth-panel">
        <Card className="auth-card" bordered={false}>
          <div className="auth-card__logo">PR</div>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Title level={3} style={{ margin: 0, letterSpacing: '-0.03em' }}>
              Đăng nhập
            </Title>
            <Text type="secondary">Tiếp tục quản lý cửa hàng của bạn</Text>
          </div>

          <Form name="login_form" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              label={<span style={{ fontWeight: 600 }}>Tên đăng nhập</span>}
            >
              <Input
                prefix={<User size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />}
                placeholder="Nhập tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
            >
              <Input.Password
                prefix={<Lock size={18} style={{ color: 'rgba(15,23,42,0.35)' }} />}
                placeholder="••••••••"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Đăng nhập
              </Button>
            </Form.Item>

            <Divider plain>
              <Text type="secondary">Hoặc</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Chưa có tài khoản? </Text>
              <Link to="/register">Đăng ký ngay</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
