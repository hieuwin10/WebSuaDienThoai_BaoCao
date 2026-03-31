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
        return ticketDevice === device._id;
      });

      setWarrantyInfo({ device, warrants: found });
    } catch {
      toast.error('Lỗi khi tra cứu bảo hành');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ textAlign: 'center', marginBottom: 24, padding: '20px 0' }}>
        <ShieldCheck size={48} style={{ color: '#52c41a', marginBottom: 16 }} />
        <Title level={2}>Tra cứu Bảo hành</Title>
        <Text type="secondary">Nhập số IMEI của thiết bị để kiểm tra thời hạn và lịch sử bảo hành</Text>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Input
            placeholder="Nhập 15 số IMEI..."
            size="large"
            style={{ maxWidth: 400 }}
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" size="large" icon={<Search size={18} />} onClick={handleSearch} loading={loading}>
            Tra cứu
          </Button>
        </div>
      </Card>

      {warrantyInfo ? (
        <Card title={<Space><Smartphone size={20} /><span>Thông tin thiết bị: {warrantyInfo.device.model_name || warrantyInfo.device.device_name}</span></Space>}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="IMEI">{warrantyInfo.device.imei}</Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">{warrantyInfo.device.brand}</Descriptions.Item>
            <Descriptions.Item label="Model">{warrantyInfo.device.model_name || warrantyInfo.device.model}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Lịch sử bảo hành</Divider>

          {warrantyInfo.warrants.length > 0 ? (
            warrantyInfo.warrants.map((war) => {
              const remains = dayjs(war.endDate).diff(dayjs(), 'days');
              const isExpired = remains < 0;

              return (
                <Card key={war._id} type="inner" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>Gói bảo hành: Tiêu chuẩn</Title>
                      <Text type="secondary">Ngày kích hoạt: {dayjs(war.startDate).format('DD/MM/YYYY')}</Text>
                    </div>
                    <Tag color={isExpired ? 'error' : 'success'}>
                      {isExpired ? 'Đã hết hạn' : `Còn lại ${remains} ngày`}
                    </Tag>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Ngày hết hạn">{dayjs(war.endDate).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Điều kiện">{war.note || 'Theo chính sách chung'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              );
            })
          ) : (
            <Empty description="Không có dữ liệu bảo hành cho thiết bị này" />
          )}
        </Card>
      ) : (
        !loading && imei && <div style={{ textAlign: 'center', padding: 40 }}><Empty description="Nhấn tra cứu để xem kết quả" /></div>
      )}
    </div>
  );
};

export default WarrantyPage;
