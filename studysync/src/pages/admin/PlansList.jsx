import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, Card, Button, Tag, Badge, Switch, Space, Tooltip, Statistic, Row, Col, Empty, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DollarOutlined, CheckCircleOutlined, ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import { CreditCard, Sparkles } from 'lucide-react';
import subscriptionAdminService from '../../services/subscriptionAdminService';
import { showToast } from '../../utils/toast';

const PlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter(p => p.active).length;
    const inactive = plans.filter(p => !p.active).length;
    const totalRevenue = plans.reduce((sum, p) => sum + (p.price || 0), 0);
    return { total, active, inactive, totalRevenue };
  }, [plans]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await subscriptionAdminService.listPlans();
      const data = res?.data?.data || res?.data || res || [];
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      showToast.error('Không tải được danh sách gói');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePlan = (plan) => {
    Modal.confirm({
      title: plan.active ? 'Ẩn gói subscription' : 'Kích hoạt gói subscription',
      content: `Bạn có chắc muốn ${plan.active ? 'ẩn' : 'kích hoạt'} gói "${plan.name || plan.planName}"?`,
      okText: 'Xác nhận',
      okType: plan.active ? 'default' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await subscriptionAdminService.togglePlan(plan.id, !plan.active);
          setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, active: !plan.active } : p));
          showToast.success('Cập nhật trạng thái gói thành công');
        } catch {
          showToast.error('Cập nhật thất bại');
        }
      },
    });
  };

  const formatPrice = (price) => {
    if (price == null || price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')} đ`;
  };

  const columns = [
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text || record.planName || record.id}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 4 }}>
              {text || record.planName || record.id}
            </div>
            {record.description && (
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {record.description}
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#7269ef', fontSize: '16px' }}>
            {formatPrice(price)}
          </div>
          {record.duration && (
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              / {record.duration}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: 'Quyền lợi',
      dataIndex: 'benefits',
      key: 'benefits',
      ellipsis: {
        showTitle: false,
      },
      render: (benefits, record) => {
        const benefitList = Array.isArray(benefits) ? benefits : (benefits ? [benefits] : []);
        return (
          <Space wrap size={[8, 8]}>
            {benefitList.length > 0 ? (
              benefitList.slice(0, 3).map((b, idx) => (
                <Tag key={idx} icon={<CheckCircleOutlined />} color="cyan" style={{ marginBottom: 4 }}>
                  {b}
                </Tag>
              ))
            ) : (
              <span style={{ color: '#8c8c8c' }}>Không có quyền lợi</span>
            )}
            {benefitList.length > 3 && (
              <Tag color="default">+{benefitList.length - 3} khác</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active) => (
        <Badge
          status={active ? 'success' : 'default'}
          text={active ? 'Đang bán' : 'Ẩn'}
        />
      ),
      filters: [
        { text: 'Đang bán', value: true },
        { text: 'Ẩn', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa gói">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showToast.info('Tính năng chỉnh sửa đang phát triển')}
            >
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title={record.active ? 'Ẩn gói' : 'Kích hoạt gói'}>
            <Switch
              checked={record.active}
              onChange={() => togglePlan(record)}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng gói"
                  value={stats.total}
                  prefix={<ShoppingOutlined style={{ color: '#7269ef' }} />}
                  valueStyle={{ color: '#7269ef', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Đang bán"
                  value={stats.active}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Đã ẩn"
                  value={stats.inactive}
                  prefix={<CheckCircleOutlined style={{ color: '#8c8c8c' }} />}
                  valueStyle={{ color: '#8c8c8c', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng giá trị"
                  value={stats.totalRevenue}
                  precision={0}
                  prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                  suffix="đ"
                  valueStyle={{ color: '#faad14', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card
          className="border-0 shadow-lg"
          title={
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Gói Subscriptions</h1>
                <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: '14px' }}>
                  Danh sách, tạo/sửa, bật/tắt.
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
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showToast.info('Tính năng tạo gói đang phát triển')}
              >
                Tạo gói
              </Button>
            </Space>
          }
          style={{ borderRadius: '16px' }}
        >
          <Table
            columns={columns}
            dataSource={plans}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} gói`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có gói nào"
                />
              ),
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default PlansList;
