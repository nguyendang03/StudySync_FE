import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Button, Descriptions } from 'antd';
import { CheckCircle } from 'lucide-react';
import paymentService from '../../services/paymentService';

const PaymentSuccess = () => {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await paymentService.getPaymentDetails(orderCode);
        const data = result?.data || result;
        setPayment(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Không thể tải hóa đơn');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert type="error" message="Lỗi" description={error} showIcon />
        <div className="mt-4">
          <Button onClick={() => navigate('/subscriptions')}>Quay lại gói dịch vụ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-semibold">Thanh toán thành công</h1>
          </div>

          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã đơn hàng">{payment?.orderCode}</Descriptions.Item>
            <Descriptions.Item label="Gói dịch vụ">{payment?.planName || payment?.plan?.planName}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {new Intl.NumberFormat('vi-VN').format(payment?.amount || 0)} VND
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{payment?.status || 'PAID'}</Descriptions.Item>
            {payment?.timestamp && (
              <Descriptions.Item label="Thời gian">
                {new Date(payment.timestamp).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div className="mt-6 flex gap-3">
            <Button type="primary" onClick={() => navigate('/subscriptions')}>Về trang gói dịch vụ</Button>
            <Button onClick={() => navigate('/')}>Về trang chủ</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;


