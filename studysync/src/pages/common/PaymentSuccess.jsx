import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Button, Descriptions, Badge, Tag } from 'antd';
import { CheckCircle } from 'lucide-react';
import paymentService from '../../services/paymentService';

const PaymentSuccess = () => {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  const getStatusTag = (status) => {
    const statusUpper = status?.toString().toUpperCase();
    const statusMap = {
      'PAID': { color: 'success', text: 'Đã thanh toán' },
      'SUCCESS': { color: 'success', text: 'Thành công' },
      'COMPLETED': { color: 'success', text: 'Hoàn thành' },
      'PENDING': { color: 'warning', text: 'Đang chờ' },
      'CANCELLED': { color: 'error', text: 'Đã hủy' },
      'CANCELED': { color: 'error', text: 'Đã hủy' },
      'FAILED': { color: 'error', text: 'Thất bại' },
    };
    const config = statusMap[statusUpper] || { color: 'default', text: status || 'Không xác định' };
    return <Tag color={config.color} style={{ fontSize: '14px', padding: '4px 12px' }}>{config.text}</Tag>;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Use getTransactionDetails to get real-time status from PayOS
        const result = await paymentService.getTransactionDetails(orderCode);
        const transaction = result?.data?.data || result?.data || result;
        
        console.log('📦 Transaction data:', transaction);
        
        // Map the transaction data properly
        const paymentData = {
          orderCode: transaction?.orderCode,
          planName: transaction?.paymentRecord?.planName || transaction?.planName,
          amount: transaction?.amount,
          status: transaction?.status || transaction?.paymentRecord?.status,
          paidAt: transaction?.paymentRecord?.paidAt,
          timestamp: transaction?.paymentRecord?.createdAt || transaction?.createdAt,
        };
        
        setPayment(paymentData);
      } catch (e) {
        console.error('❌ Load payment error:', e);
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
            <Descriptions.Item label="Mã đơn hàng">
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{payment?.orderCode}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Gói dịch vụ">
              <span style={{ fontWeight: 500 }}>{payment?.planName || payment?.plan?.planName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <span style={{ fontWeight: 600, color: '#52c41a', fontSize: '16px' }}>
                {new Intl.NumberFormat('vi-VN').format(payment?.amount || 0)} VND
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(payment?.status || 'PAID')}
            </Descriptions.Item>
            {payment?.paidAt && (
              <Descriptions.Item label="Thời gian thanh toán">
                {new Date(payment.paidAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
            {payment?.timestamp && (
              <Descriptions.Item label="Thời gian tạo">
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


