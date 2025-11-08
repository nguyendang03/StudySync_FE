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
  const pollIntervalRef = useRef(null);

  const normalizeApiResponse = (payload) => payload?.data?.data || payload?.data || payload;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    try {
      if (paymentPopupRef.current && !paymentPopupRef.current.closed) {
        paymentPopupRef.current.close();
      }
    } catch (error) {
      console.warn('Unable to close payment popup on cleanup:', error);
    }
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
      const normalized = normalizeApiResponse(result);
      console.log('📦 Normalized response:', normalized);
      
      const checkoutUrl = normalized?.checkoutUrl;
      const orderCode = normalized?.orderCode;
      console.log('💳 Extracted:', { checkoutUrl, orderCode, normalized });

      if (!checkoutUrl) {
        console.error('❌ Missing checkoutUrl in response:', normalized);
        throw new Error('Không nhận được link thanh toán từ server');
      }

      if (!orderCode) {
        console.error('❌ Missing orderCode in response:', normalized);
        throw new Error('Không nhận được mã đơn hàng từ server');
      }

      // Open PayOS checkout in new window and keep a reference
      paymentPopupRef.current = window.open(checkoutUrl, '_blank', 'width=600,height=700');
      setPaymentData(normalized);
      setShowModal(true);
      console.log("✅ Opening payment window with orderCode:", orderCode);
      
      // Poll for payment status with correct orderCode
      pollPaymentStatus(orderCode);
      
      toast.success('Vui lòng hoàn tất thanh toán trong cửa sổ mới');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại!');
    } finally {
      setPurchasing(false);
    }
  };

  const pollPaymentStatus = async (orderCode) => {
    if (!orderCode) {
      console.error('❌ Cannot poll: orderCode is missing');
      return;
    }

    console.log('📊 Starting to poll for orderCode:', orderCode);

    // Reset previous polling if needed
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setPaymentStatus('PENDING');

    let attempts = 0;
    const maxAttempts = 60; // Poll for 5 minutes

    pollIntervalRef.current = setInterval(async () => {
      try {
        attempts += 1;
        console.log(`🔁 Polling attempt ${attempts}/${maxAttempts} for order: ${orderCode}`);
        
        // Use transaction endpoint which checks PayOS directly for real-time status
        const result = await paymentService.getTransactionDetails(orderCode);
        const transaction = normalizeApiResponse(result);
        
        // PayOS returns status directly in the transaction object
        const status = (transaction?.status || transaction?.paymentRecord?.status || '').toString().toUpperCase();

        console.log('🔁 Polling status:', status, 'Full transaction:', transaction);

        if (['PAID', 'SUCCESS', 'COMPLETED'].includes(status)) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;

          setPaymentStatus('PAID');
          setPaymentData(transaction);

          toast.success('Thanh toán thành công! Gói đã được kích hoạt.');
          await fetchData();

          try {
            if (paymentPopupRef.current && !paymentPopupRef.current.closed) {
              paymentPopupRef.current.close();
            }
          } catch (error) {
            console.warn('Không thể đóng cửa sổ thanh toán:', error);
          }

          // Close modal first to ensure UI is responsive
          setShowModal(false);

          // Small delay before navigation to ensure state updates
          setTimeout(() => {
            const successOrderCode = transaction?.orderCode || orderCode;
            navigate(`/payment/success/${successOrderCode}`);
          }, 100);
          return;
        }

        if (['CANCELLED', 'CANCELED', 'FAILED'].includes(status)) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPaymentStatus('CANCELLED');
          toast.error('Thanh toán đã bị hủy');

          try {
            if (paymentPopupRef.current && !paymentPopupRef.current.closed) {
              paymentPopupRef.current.close();
            }
          } catch (error) {
            console.warn('Không thể đóng cửa sổ thanh toán:', error);
          }

          setShowModal(false);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          toast.error('Không thể xác nhận trạng thái thanh toán. Vui lòng kiểm tra lại sau.');
        }
      } catch (error) {
        console.error('❌ Poll error:', error);
        
        // If error is 404 or transaction not found, payment might not be created yet
        // Continue polling for a while
        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          toast.error('Không thể xác nhận trạng thái thanh toán. Vui lòng kiểm tra email hoặc lịch sử giao dịch.');
        }
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

  const isCheaperThanCurrent = (plan) => {
    if (!currentPlan || !currentPlan.plan) return false;
    const currentPrice = currentPlan.plan.price || 0;
    const planPrice = plan.price || 0;
    return planPrice < currentPrice;
  };

  const canPurchasePlan = (plan) => {
    // Can't purchase if it's the current plan
    if (isCurrentPlan(plan)) return false;
    // Can't purchase if it's cheaper than current plan
    if (isCheaperThanCurrent(plan)) return false;
    return true;
  };

  const getUsagePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    const percentage = (used / limit) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Chọn Gói Phù Hợp Với Bạn
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Nâng cấp trải nghiệm học tập với các tính năng cao cấp và không giới hạn
          </p>
        </motion.div>

        {/* Plans Grid */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg">Không có gói subscription nào khả dụng</p>
            <p className="text-purple-200 text-sm mt-2">Vui lòng kiểm tra cấu hình backend</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const isCurrent = isCurrentPlan(plan);
            const isCheaper = isCheaperThanCurrent(plan);
            const canPurchase = canPurchasePlan(plan);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={!isCheaper ? { y: -8, scale: 1.02 } : {}}
              >
                <div 
                  className={`relative backdrop-blur-md rounded-3xl p-8 text-white transition-all duration-500 shadow-2xl ${
                    isCheaper 
                      ? 'opacity-50 bg-white/5 border-2 border-white/10' 
                      : 'bg-white/15 border-2 border-white/40 hover:bg-white/20 hover:border-white/60 hover:shadow-purple-500/50'
                  }`}
                  style={{ minHeight: '520px' }}
                >
                  {/* Decorative gradient overlay */}
                  {!isCheaper && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
                  )}
                  
                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <motion.div 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-5 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        Gói hiện tại
                      </span>
                    </motion.div>
                  )}

                  {/* Unavailable Badge for Cheaper Plans */}
                  {isCheaper && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gray-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        Không khả dụng
                      </span>
                    </div>
                  )}

                  {/* Plan Title */}
                  <div className="text-center mb-8 relative z-10">
                    <h3 className="text-2xl font-bold mb-6 leading-tight tracking-wide">
                      {plan.planName}
                    </h3>
                    
                    {/* Price */}
                    <div className="mb-4">
                      {plan.price && plan.price > 0 ? (
                        <div>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold">
                              {new Intl.NumberFormat('vi-VN').format(plan.price)}
                            </span>
                            <span className="text-xl">đ</span>
                          </div>
                          <p className="text-sm text-white/70 mt-2">/ tháng</p>
                          {plan.priceUSD && (
                            <p className="text-xs text-white/60 mt-1">
                              (~{plan.priceUSD} USD)
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl font-bold">Miễn phí</p>
                          <p className="text-sm text-white/70 mt-2">Tính năng cơ bản</p>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-16 h-0.5 bg-white/30 mx-auto mt-6"></div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 mb-12 text-left relative z-10">
                    {plan.aiQueriesLimit && (
                      <li className="flex items-start group">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm leading-relaxed text-white/90">
                          {plan.aiQueriesLimit === 0 || plan.aiQueriesLimit === null 
                            ? 'Miễn phí (0đ)' 
                            : `${plan.aiQueriesLimit} truy vấn AI/tháng`}
                        </span>
                      </li>
                    )}
                    
                    {plan.personalStorageLimitMb > 0 && (
                      <li className="flex items-start group">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm leading-relaxed text-white/90">
                          Lưu trữ {plan.personalStorageLimitMb >= 1024 
                            ? `${(plan.personalStorageLimitMb / 1024).toFixed(0)}GB` 
                            : `${plan.personalStorageLimitMb}MB`}
                        </span>
                      </li>
                    )}
                    
                    {plan.videoCallMinutesLimit && (
                      <li className="flex items-start group">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm leading-relaxed text-white/90">
                          {plan.videoCallMinutesLimit === 0 
                            ? 'Không giới hạn phút video call' 
                            : `${plan.videoCallMinutesLimit} phút video call`}
                        </span>
                      </li>
                    )}

                    {plan.description && (
                      <li className="flex items-start group">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm leading-relaxed text-white/90">
                          {plan.description}
                        </span>
                      </li>
                    )}

                    {plan.durationDays > 0 && (
                      <li className="flex items-start group">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm leading-relaxed text-white/90">
                          Thời hạn: {plan.durationDays > 30 ? `${Math.floor(plan.durationDays / 30)} tháng` : `${plan.durationDays} ngày`}
                        </span>
                      </li>
                    )}

                    {plan.planName?.toLowerCase().includes('freemium') && (
                      <>
                        <li className="flex items-start group">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm leading-relaxed text-white/90">Dùng AI cơ bản</span>
                        </li>
                        <li className="flex items-start group">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm leading-relaxed text-white/90">Tạo tối đa 6 nhóm</span>
                        </li>
                        <li className="flex items-start group">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm leading-relaxed text-white/90">Tải file lên 100MB, lưu trữ 2GB</span>
                        </li>
                        <li className="flex items-start group">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm leading-relaxed text-white/90">Phù hợp: Học đơn giản, nhu cầu cơ bản</span>
                        </li>
                      </>
                    )}
                  </ul>

                  {/* Purchase Button */}
                  {!isCurrent && (
                    <div className="absolute bottom-8 left-8 right-8 z-10">
                      {isCheaperThanCurrent(plan) ? (
                        <div className="text-center">
                          <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-3.5 cursor-not-allowed opacity-50">
                            <span className="text-white/60 font-semibold text-sm">
                              Không thể hạ cấp
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-2.5">
                            Bạn đang sử dụng gói cao hơn
                          </p>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handlePurchase(plan)}
                          disabled={purchasing}
                          className={`w-full bg-white hover:bg-gray-50 text-purple-700 font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                            purchasing ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl'
                          }`}
                        >
                          {purchasing && selectedPlan?.id === plan.id ? (
                            <>
                              <Loader className="animate-spin w-5 h-5" />
                              <span>Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              <span>{plan.price === 0 ? 'Dùng miễn phí' : 'Thanh toán ngay'}</span>
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Lưu ý quan trọng</h3>
            </div>
            <ul className="space-y-3 text-white/90 text-sm leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 flex-shrink-0">•</span>
                <span>Quyền của gói sẽ tự bị dừng lại sau ngày hết hạn.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 flex-shrink-0">•</span>
                <span>Vào thư mục <strong>My Group</strong> để tạo nhóm (nhấn nút Create Group và chọn group cho phép tạo file kèm nội dung Upload).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 flex-shrink-0">•</span>
                <span>Nhấn vào file của nhóm, nhấn nút upload để tải file lên. Mỗi nhóm chỉ có thể upload bốn loại file sau: <strong>.txt, .word, .excel</strong> (tối đa 5MB).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 flex-shrink-0">•</span>
                <span>Liên hệ <strong className="text-white">studysync@studysync.vn</strong> hoặc qua trang phản hồi để báo lỗi, yêu cầu hỗ trợ hoặc hoàn tiền khi có vấn đề xảy ra.</span>
              </li>
            </ul>
          </div>
        </motion.div>

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

