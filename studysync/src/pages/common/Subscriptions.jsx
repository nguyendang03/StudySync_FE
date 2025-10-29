import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, X, Loader, CreditCard, Crown, Zap, 
  Shield, Infinity, ArrowRight, Camera, Sparkles, Calendar
} from 'lucide-react';
import { Card, Modal, Button, Badge, Spin, Alert } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const paymentPopupRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        paymentService.getSubscriptionPlans(),
        paymentService.getCurrentSubscription()
      ]);

      // Debug: Log the response to see what we're getting
      console.log('📦 Plans response:', plansResponse);
      console.log('👤 Subscription response:', subscriptionResponse);

      // Handle nested data structure: response.data.data or response.data
      const plansData = plansResponse?.data?.data || plansResponse?.data || plansResponse;
      const currentSub = subscriptionResponse?.data?.data || subscriptionResponse?.data || subscriptionResponse;
      
      // Ensure we have an array
      const plansArray = Array.isArray(plansData) ? plansData : [];
      
      console.log('✅ Parsed plans:', plansArray);
      console.log('📊 Number of plans:', plansArray.length);
      
      setPlans(plansArray);
      setCurrentPlan(currentSub);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải thông tin gói subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan) => {
    try {
      setPurchasing(true);
      setSelectedPlan(plan);
      
      const userInfo = {
        name: user?.username || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        phone: user?.phone || ''
      };

      console.log('👤 User info for payment:', userInfo);

      const result = await paymentService.purchaseSubscription(plan.id, userInfo);
      console.log('📦 Raw payment response:', result);

      // Normalize nested response: { data: { data: {...} } } or { data: {...} }
      const outer = result || {};
      const normalized = outer?.data?.data || outer?.data || outer;
      const checkoutUrl = normalized?.checkoutUrl;
      const orderCode = normalized?.orderCode;
      console.log('💳 Extracted:', { checkoutUrl, orderCode, normalized });

      if (checkoutUrl) {
        // Open PayOS checkout in new window and keep a reference
        paymentPopupRef.current = window.open(checkoutUrl, '_blank', 'width=600,height=700');
        setPaymentData(normalized);
        setShowModal(true);
        console.log("orderCode", orderCode)
        // Poll for payment status with correct orderCode
        if (orderCode) {
          pollPaymentStatus(orderCode);
        }
        
        toast.success('Vui lòng hoàn tất thanh toán trong cửa sổ mới');
      } else {
        console.error('❌ Missing checkoutUrl in response:', normalized);
        throw new Error('Không nhận được link thanh toán');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại!');
    } finally {
      setPurchasing(false);
    }
  };

  const pollPaymentStatus = async (orderCode) => {
    let attempts = 0;
    const maxAttempts = 60; // Poll for 5 minutes
    
    const interval = setInterval(async () => {
      try {
        const result = await paymentService.getPaymentDetails(orderCode);
        const payment = result?.data || result;
        console.log("payment", payment)
        if (payment?.data?.status === 'PAID' || payment?.data?.status === 'success') {
          clearInterval(interval);
          setPaymentStatus('PAID');
          setPaymentData(payment?.data);
          
          // Update modal content to success and navigate to bill
          toast.success('Thanh toán thành công! Gói đã được kích hoạt.');
          // Refresh subscription data
          await fetchData();
          // Close popup if still open
          try {
            if (paymentPopupRef.current && !paymentPopupRef.current.closed) {
              paymentPopupRef.current.close();
            }
          } catch {}
          setShowModal(false);
          if (payment?.data?.orderCode) {
            navigate(`/payment/success/${payment.orderCode}`);
          }
        } else if (payment?.data?.status === 'CANCELLED' || payment?.data?.status === 'cancelled') {
          clearInterval(interval);
          setPaymentStatus('CANCELLED');
          toast.error('Thanh toán đã bị hủy');
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 5000); // Check every 5 seconds
  };

  const getPlanIcon = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('pro max') || name.includes('promax')) return <Crown className="w-8 h-8" />;
    if (name.includes('pro')) return <Zap className="w-8 h-8" />;
    return <Shield className="w-8 h-8" />;
  };

  const getPlanColor = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('pro max') || name.includes('promax')) return 'bg-gradient-to-br from-purple-600 to-pink-600';
    if (name.includes('pro')) return 'bg-gradient-to-br from-blue-600 to-purple-600';
    return 'bg-gradient-to-br from-gray-600 to-gray-800';
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const isCurrentPlan = (plan) => {
    if (!currentPlan) return false;
    return currentPlan.planId === plan.id || currentPlan.plan?.id === plan.id;
  };

  const getUsagePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    const percentage = (used / limit) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn Gói Subscription
          </h1>
          <p className="text-xl text-gray-600">
            Nâng cấp trải nghiệm học tập của bạn
          </p>
        </motion.div>

        {/* Current Subscription */}
        {currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-blue-500 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Badge status="success" className="mr-2" />
                  <span className="font-semibold text-lg">Gói hiện tại: {currentPlan.plan?.planName || 'Free'}</span>
                  {currentPlan.endDate && (
                    <p className="text-gray-600 text-sm mt-1">
                      Hết hạn: {new Date(currentPlan.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
                {currentPlan.plan && (
                  <div className="flex gap-4">
                    <div className="text-center">
                      <Camera className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">
                        Video: {currentPlan.usageVideoMinutes} / {currentPlan.plan.videoCallMinutesLimit || '∞'}
                      </p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${getUsagePercentage(currentPlan.usageVideoMinutes, currentPlan.plan.videoCallMinutesLimit)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <Sparkles className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">
                        AI: {currentPlan.usageAiQueries} / {currentPlan.plan.aiQueriesLimit || '∞'}
                      </p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${getUsagePercentage(currentPlan.usageAiQueries, currentPlan.plan.aiQueriesLimit)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không có gói subscription nào khả dụng</p>
            <p className="text-gray-400 text-sm mt-2">Vui lòng kiểm tra cấu hình backend</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            console.log(`🎁 Rendering plan ${index}:`, plan);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${getPlanColor(plan.planName)} rounded-2xl p-8 text-white transform transition-all duration-300 hover:scale-105 shadow-2xl ${
                  isCurrentPlan(plan) ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
              {isCurrentPlan(plan) && (
                <div className="absolute top-4 right-4">
                  <Badge status="success" text="Đang sử dụng" />
                </div>
              )}
              
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4">{getPlanIcon(plan.planName)}</div>
                <h3 className="text-2xl font-bold mb-2">{plan.planName}</h3>
                <div className="text-4xl font-bold mb-4">
                  {formatPrice(plan.price)}
                </div>
                {plan.durationDays > 0 && (
                  <p className="text-sm opacity-90">
                    Trong {plan.durationDays} ngày
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {plan.aiQueriesLimit || 'Không giới hạn'} truy vấn AI/tháng
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {plan.videoCallMinutesLimit || 'Không giới hạn'} phút video call
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {plan.personalStorageLimitMb}MB lưu trữ
                  </span>
                </li>
              </ul>

              {!isCurrentPlan(plan) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CreditCard className="w-4 h-4" />}
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasing}
                  className="bg-white text-purple-600 hover:bg-gray-100 border-none"
                >
                  {purchasing && selectedPlan?.id === plan.id ? (
                    <>
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                    Thanh toán
                    </>
                  )}
                </Button>
              )}
              </motion.div>
            );
          })}
        </div>

        {/* Payment Modal */}
        <Modal
          title={paymentStatus === 'PAID' ? 'Thanh toán thành công' : 'Hoàn tất thanh toán'}
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={
            paymentStatus === 'PAID' && paymentData?.orderCode
              ? [
                  <Button key="bill" type="primary" onClick={() => window.location.assign(`/payment/success/${paymentData.orderCode}`)}>
                    Xem hóa đơn
                  </Button>,
                  <Button key="close" onClick={() => setShowModal(false)}>
                    Đóng
                  </Button>,
                ]
              : [
                  <Button key="close" onClick={() => setShowModal(false)}>
                    Đóng
                  </Button>,
                ]
          }
        >
          {paymentStatus === 'PAID' && paymentData ? (
            <div className="text-center">
              <Alert
                message="Thanh toán thành công"
                description="Gói subscription của bạn đã được kích hoạt. Bạn có thể xem hóa đơn."
                type="success"
                showIcon
                className="mb-4"
              />
              <div className="space-y-1 text-sm text-gray-700">
                <p>Mã đơn hàng: <span className="font-medium">{paymentData.orderCode}</span></p>
                <p>Gói: <span className="font-medium">{paymentData.planName || paymentData?.plan?.planName}</span></p>
                <p>Số tiền: <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(paymentData.amount || 0)} VND</span></p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Alert
                message="Vui lòng hoàn tất thanh toán trong cửa sổ mới đã mở"
                description="Sau khi thanh toán thành công, gói subscription sẽ được kích hoạt tự động"
                type="info"
                showIcon
                className="mb-4"
              />
              <p className="text-gray-600 mt-4">
                Đang chờ xác nhận thanh toán...
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Subscriptions;

