import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Button, Divider } from 'antd';
import { CheckCircle, Home, Package, Calendar, CreditCard, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import paymentService from '../../services/paymentService';

const PaymentSuccess = () => {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  const getStatusBadge = (status) => {
    const statusUpper = status?.toString().toUpperCase();
    const statusMap = {
      'PAID': { color: '#52c41a', text: 'Đã thanh toán' },
      'SUCCESS': { color: '#52c41a', text: 'Thành công' },
      'COMPLETED': { color: '#52c41a', text: 'Hoàn thành' },
      'PENDING': { color: '#faad14', text: 'Đang chờ' },
      'CANCELLED': { color: '#ff4d4f', text: 'Đã hủy' },
      'CANCELED': { color: '#ff4d4f', text: 'Đã hủy' },
      'FAILED': { color: '#ff4d4f', text: 'Thất bại' },
    };
    const config = statusMap[statusUpper] || { color: '#8c8c8c', text: status || 'Không xác định' };
    return (
      <span style={{ 
        color: config.color, 
        fontWeight: 600,
        fontSize: '14px',
      }}>
        {config.text}
      </span>
    );
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
        const errorMessage = e?.response?.data?.message || e.message || 'Không thể tải hóa đơn';
        
        // Handle specific PayOS error code 101 (transaction not found)
        if (errorMessage.includes('code: 101') || errorMessage.includes('không tồn tại')) {
          setError('Giao dịch không tồn tại hoặc đã hết hạn. Vui lòng kiểm tra lại mã giao dịch hoặc thử thanh toán mới.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Alert 
            type="error" 
            message="Lỗi" 
            description={error} 
            showIcon 
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" block onClick={() => navigate('/subscriptions')}>
            Quay lại gói dịch vụ
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl w-full"
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-6 shadow-lg">
              <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={2.5} />
            </div>
          </div>

          {/* Main Card */}
          <Card 
            className="shadow-lg"
            style={{
              borderRadius: '16px',
              border: 'none',
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600">
                Cảm ơn bạn đã tin tưởng sử dụng dịch vụ
              </p>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* Payment Details */}
            <div>
              {/* Amount Highlight */}
              <div className="text-center mb-8 p-6 rounded-xl bg-green-50 border border-green-200">
                <div className="text-gray-600 text-sm mb-2 flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Số tiền thanh toán
                </div>
                <div className="text-4xl font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN').format(payment?.amount || 0)} đ
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <Package className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Gói dịch vụ</div>
                    <div className="font-semibold text-gray-900">
                      {payment?.planName || payment?.plan?.planName || 'Premium Plan'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Mã đơn hàng</div>
                    <div className="font-mono font-semibold text-gray-900">
                      {payment?.orderCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Trạng thái</div>
                    <div>{getStatusBadge(payment?.status || 'PAID')}</div>
                  </div>
                </div>

                {(payment?.paidAt || payment?.timestamp) && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">Thời gian thanh toán</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(payment.paidAt || payment.timestamp).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => navigate('/subscriptions')}
                className="h-11"
                icon={<Package className="w-4 h-4" />}
              >
                Xem các gói dịch vụ khác
              </Button>
              <Button
                size="large"
                block
                onClick={() => navigate('/')}
                className="h-11"
                icon={<Home className="w-4 h-4" />}
              >
                Về trang chủ
              </Button>
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              <p className="mt-1">Có thắc mắc? Liên hệ hỗ trợ: support@studysync.com</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;


