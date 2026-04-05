import React, { useState } from 'react';
import { Card, Input, Button, Typography, Descriptions, Tag, Empty, Space, Divider } from 'antd';
import { Search, ShieldCheck, Smartphone } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const WarrantyPage = () => {
  const [loading, setLoading] = useState(false);
  const [imei, setImei] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState(null);

  const handleSearch = async () => {
    if (!imei) return toast.warning('Vui lòng nhập số IMEI');
    setLoading(true);
    try {
      const devRes = await api.get('/devices');
      const device = devRes.data.find((d) => d.imei === imei);

      if (!device) {
        setWarrantyInfo(null);
        return toast.error('Không tìm thấy thiết bị với IMEI này trong hệ thống');
      }

      const warRes = await api.get('/warranty');
      const found = warRes.data.filter((w) => {
        const ticketDevice = typeof w.ticket?.device_id === 'object' ? w.ticket?.device_id?._id : w.ticket?.device_id;
        return String(ticketDevice) === String(device._id);
      });

      setWarrantyInfo({ device, warrants: found });
    } catch {
      toast.error('Lỗi khi tra cứu bảo hành');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root" style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="warranty-hero">
        <div className="warranty-hero__icon">
          <ShieldCheck size={36} strokeWidth={2} />
        </div>
        <Title level={2} style={{ margin: '0 0 8px', letterSpacing: '-0.03em' }}>
          Tra cứu bảo hành
        </Title>
        <Text type="secondary" style={{ display: 'block', maxWidth: 480, margin: '0 auto', fontSize: 15 }}>
          Nhập IMEI để xem thiết bị và bảo hành. Khách hàng chỉ tra cứu được máy đã đăng ký trên tài khoản của mình.
        </Text>
        <Space.Compact style={{ marginTop: 24, maxWidth: 460, width: '100%', display: 'flex' }}>
          <Input
            placeholder="Nhập 15 số IMEI..."
            size="large"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            onPressEnter={handleSearch}
            style={{ flex: 1 }}
          />
          <Button type="primary" size="large" icon={<Search size={18} />} onClick={handleSearch} loading={loading}>
            Tra cứu
          </Button>
        </Space.Compact>
      </div>

      {warrantyInfo ? (
        <Card
          className="surface-card"
          bordered={false}
          title={(
            <Space>
              <Smartphone size={20} style={{ color: '#0d9488' }} />
              <span>Thiết bị: {warrantyInfo.device.model_name || warrantyInfo.device.device_name}</span>
            </Space>
          )}
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
            <Descriptions.Item label="IMEI">{warrantyInfo.device.imei}</Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">{warrantyInfo.device.brand}</Descriptions.Item>
            <Descriptions.Item label="Mẫu máy" span={2}>
              {warrantyInfo.device.model_name || warrantyInfo.device.model}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ fontWeight: 600 }}>
            Lịch sử bảo hành
          </Divider>

          {warrantyInfo.warrants.length > 0 ? (
            warrantyInfo.warrants.map((war) => {
              const remains = dayjs(war.endDate).diff(dayjs(), 'days');
              const isExpired = remains < 0;

              return (
                <Card key={war._id} type="inner" className="surface-card" style={{ marginBottom: 14 }} bordered>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>Gói bảo hành tiêu chuẩn</Title>
                      <Text type="secondary">Kích hoạt: {dayjs(war.startDate).format('DD/MM/YYYY')}</Text>
                    </div>
                    <Tag color={isExpired ? 'error' : 'success'} style={{ margin: 0 }}>
                      {isExpired ? 'Đã hết hạn' : `Còn ${remains} ngày`}
                    </Tag>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Hết hạn">{dayjs(war.endDate).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Điều kiện">{war.note || 'Theo chính sách chung'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              );
            })
          ) : (
            <Empty description="Chưa có bản ghi bảo hành cho thiết bị này" />
          )}
        </Card>
      ) : (
        !loading && imei && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Empty description="Nhấn tra cứu để xem kết quả" />
          </div>
        )
      )}
    </div>
  );
};

export default WarrantyPage;
