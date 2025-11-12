import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, Card, Button, Tag, Badge, Space, Modal, Tooltip, Statistic, Row, Col, Empty, Avatar } from 'antd';
import { DownloadOutlined, ReloadOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { CreditCard, RefreshCw, TrendingUp } from 'lucide-react';
import paymentService from '../../services/paymentService';
import { showToast } from '../../utils/toast';
import dayjs from 'dayjs';

const PaymentsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const stats = useMemo(() => {
    const total = items.length;
    // Case-insensitive status comparison
    const paid = items.filter(p => (p.status || '').toString().toUpperCase() === 'PAID').length;
    const refunded = items.filter(p => (p.status || '').toString().toUpperCase() === 'REFUNDED').length;
    const pending = items.filter(p => (p.status || '').toString().toUpperCase() === 'PENDING').length;
    const totalRevenue = items
      .filter(p => (p.status || '').toString().toUpperCase() === 'PAID')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const refundedAmount = items
      .filter(p => (p.status || '').toString().toUpperCase() === 'REFUNDED')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return { total, paid, refunded, pending, totalRevenue, refundedAmount };
  }, [items]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getPaymentHistory();
      const data = res?.data?.data || res?.data || res || [];
      setItems(Array.isArray(data) ? data : []);
      console.log('Loaded payments:', data);
    } catch {
      showToast.error('Không tải được lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCSV = async () => {
    try {
      setExporting(true);
      const blob = await paymentService.exportPaymentsCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast.success('Xuất CSV thành công');
    } catch {
      showToast.error('Xuất CSV thất bại');
    } finally {
      setExporting(false);
    }
  };

  const refund = (payment) => {
    // Get display name using the same logic
    const displayName = payment.user?.username || 
                       payment.user?.email || 
                       payment.userEmail || 
                       payment.username || 
                       payment.email ||
                       payment.user?.name ||
                       payment.user?.fullName ||
                       '-';
    

                       c
    Modal.confirm({
      title: 'Xác nhận hoàn tiền',
      content: (
        <div>
          <p>Bạn có chắc muốn hoàn tiền cho đơn hàng này?</p>
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px' }}><strong>Mã đơn:</strong> {payment.orderCode || payment.id}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Số tiền:</strong> {formatAmount(payment.amount)}</p>
          </div>
          <p style={{ marginTop: '12px', color: '#ff4d4f', fontSize: '12px', fontWeight: 500 }}>
            Lưu ý: Hành động này không thể hoàn tác
          </p>
        </div>
      ),
      okText: 'Hoàn tiền',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: async () => {
        try {
          await paymentService.refundPayment(payment.orderCode || payment.id);
          showToast.success('Đã gửi yêu cầu hoàn tiền');
          load();
        } catch {
          showToast.error('Hoàn tiền thất bại');
        }
      },
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      PAID: { color: 'success', text: 'Đã thanh toán', icon: <CheckCircleOutlined /> },
      REFUNDED: { color: 'warning', text: 'Đã hoàn tiền', icon: <RefreshCw size={14} /> },
      PENDING: { color: 'processing', text: 'Đang chờ', icon: <ClockCircleOutlined /> },
      FAILED: { color: 'error', text: 'Thất bại', icon: <CloseCircleOutlined /> },
    };
    return configs[status] || { color: 'default', text: status, icon: null };
  };

  const formatAmount = (amount) => {
    if (amount == null) return '-';
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const columns = [
    {
      title: 'Mã đơn',  
      dataIndex: 'orderCode',
      key: 'orderCode',
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text || record.id}>
          <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '13px' }}>
            {text || record.id}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      render: (amount) => (
        <div style={{ fontWeight: 700, color: '#52c41a', fontSize: '15px' }}>
          {formatAmount(amount)}
        </div>
      ),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Badge
            status={config.color}
            text={
              <span style={{ fontSize: '13px' }}>
                {config.icon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
                {config.text}
              </span>
            }
          />
        );
      },
      filters: [
        { text: 'Đã thanh toán', value: 'PAID' },
        { text: 'Đã hoàn tiền', value: 'REFUNDED' },
        { text: 'Đang chờ', value: 'PENDING' },
        { text: 'Thất bại', value: 'FAILED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      ellipsis: {
        showTitle: false,
      },
      render: (date) => (
        <Tooltip title={formatDate(date)}>
          <div style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
            <ClockCircleOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
            {dayjs(date).format('DD/MM/YY HH:mm')}
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ borderRadius: '12px', border: '1px solid #e8e8e8' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Tổng giao dịch</span>}
                  value={stats.total}
                  prefix={<CreditCard className="w-5 h-5" style={{ color: '#7269ef' }} />}
                  valueStyle={{ color: '#262626', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ borderRadius: '12px', border: '1px solid #e8e8e8' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Doanh thu</span>}
                  value={stats.totalRevenue}
                  precision={0}
                  prefix={<DollarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                  suffix="đ"
                  valueStyle={{ color: '#262626', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ borderRadius: '12px', border: '1px solid #e8e8e8' }}
              >
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Đã thanh toán</span>}
                  value={stats.paid}
                  prefix={<CheckCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                  valueStyle={{ color: '#262626', fontWeight: 700, fontSize: '28px' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
            </motion.div>
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card
          className="shadow-sm"
          style={{ borderRadius: '12px', border: '1px solid #e8e8e8' }}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#262626' }}>
                  Thanh toán
                </h1>
                <p style={{ margin: '2px 0 0 0', color: '#8c8c8c', fontSize: '13px', fontWeight: 400 }}>
                  Lịch sử, trạng thái, hoàn tiền, xuất CSV
                </p>
              </div>
            </div>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={load}
                loading={loading}
                style={{ borderRadius: '8px' }}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportCSV}
                loading={exporting}
                style={{ borderRadius: '8px' }}
              >
                Xuất CSV
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={items}
            loading={loading}
            rowKey={(record) => record.orderCode || record.id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có giao dịch nào"
                />
              ),
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentsList;
