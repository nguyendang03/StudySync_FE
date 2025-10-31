import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Card, Input, Select, Button, Tag, Avatar, Tooltip, Space, Badge, Statistic, Row, Col, Empty, Modal } from 'antd';
import { SearchOutlined, LockOutlined, UnlockOutlined, KeyOutlined, UserOutlined, TeamOutlined, UserSwitchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Users, Shield } from 'lucide-react';
import usersAdminService from '../../services/usersAdminService';
import { showToast } from '../../utils/toast';

const { Option } = Select;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [roleEditing, setRoleEditing] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => `${u.username || ''} ${u.email || ''}`.toLowerCase().includes(q));
  }, [users, query]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status !== 'SUSPENDED').length;
    const suspended = users.filter(u => u.status === 'SUSPENDED').length;
    const admins = users.filter(u => u.role === 'ADMIN' || u.roles?.includes('ADMIN')).length;
    return { total, active, suspended, admins };
  }, [users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAdminService.listUsers({ limit: 50 });
      const raw = res?.data?.data || res?.data || res?.items || res || [];
      const normalized = Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object' && Object.keys(raw).every(k => /^\d+$/.test(k))
            ? Object.values(raw)
            : []);
      setUsers(normalized);
      setPagination(prev => ({ ...prev, total: normalized.length }));
    } catch (e) {
      showToast.error('Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onChangeRole = async (userId, role) => {
    try {
      setRoleEditing(prev => ({ ...prev, [userId]: true }));
      await usersAdminService.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      showToast.success('Cập nhật vai trò thành công');
    } catch (e) {
      showToast.error('Cập nhật vai trò thất bại');
    } finally {
      setRoleEditing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const onToggleStatus = (record) => {
    Modal.confirm({
      title: record.status === 'SUSPENDED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      content: `Bạn có chắc muốn ${record.status === 'SUSPENDED' ? 'mở khóa' : 'khóa'} tài khoản ${record.username || record.email}?`,
      okText: 'Xác nhận',
      okType: record.status === 'SUSPENDED' ? 'default' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const next = record.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        try {
          await usersAdminService.updateUserStatus(record.id, next);
          setUsers(prev => prev.map(u => u.id === record.id ? { ...u, status: next } : u));
          showToast.success('Cập nhật trạng thái thành công');
        } catch (e) {
          showToast.error('Cập nhật trạng thái thất bại');
        }
      },
    });
  };

  const onResetPassword = (record) => {
    Modal.confirm({
      title: 'Đặt lại mật khẩu',
      content: `Bạn có chắc muốn gửi yêu cầu đặt lại mật khẩu cho ${record.username || record.email}?`,
      okText: 'Gửi yêu cầu',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await usersAdminService.resetUserPassword(record.id);
          showToast.success('Đã gửi yêu cầu đặt lại mật khẩu');
        } catch (e) {
          showToast.error('Thao tác thất bại');
        }
      },
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'red',
      MOD: 'orange',
      SUPPORT: 'blue',
      USER: 'default',
    };
    return colors[role] || 'default';
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      render: (text, record) => (
        <Space>
          <Avatar
            size="default"
            style={{ backgroundColor: '#7269ef', fontSize: '14px' }}
            icon={<UserOutlined />}
            src={record.avatar}
          >
            {(text || record.name || '?').toString().charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>{text || record.name || record.id}</div>
            {record.email && <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role, record) => (
        <Select
          value={role || 'USER'}
          onChange={(val) => onChangeRole(record.id, val)}
          loading={roleEditing[record.id]}
          style={{ width: 100 }}
          size="small"
          disabled={loading}
        >
          <Option value="ADMIN">
            <Tag color="red">ADMIN</Tag>
          </Option>
          <Option value="MOD">
            <Tag color="orange">MOD</Tag>
          </Option>
          <Option value="SUPPORT">
            <Tag color="blue">SUPPORT</Tag>
          </Option>
          <Option value="USER">
            <Tag>USER</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Badge
          status={status === 'SUSPENDED' ? 'error' : 'success'}
          text={status === 'SUSPENDED' ? 'Đã khóa' : 'Hoạt động'}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.status === 'SUSPENDED' ? 'Mở khóa' : 'Khóa tài khoản'}>
            <Button
              type={record.status === 'SUSPENDED' ? 'default' : 'dashed'}
              icon={record.status === 'SUSPENDED' ? <UnlockOutlined /> : <LockOutlined />}
              size="small"
              onClick={() => onToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="primary"
              icon={<KeyOutlined />}
              size="small"
              onClick={() => onResetPassword(record)}
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
                  title="Tổng người dùng"
                  value={stats.total}
                  prefix={<TeamOutlined style={{ color: '#7269ef' }} />}
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
                  title="Đang hoạt động"
                  value={stats.active}
                  prefix={<UserOutlined style={{ color: '#52c41a' }} />}
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
                  title="Đã khóa"
                  value={stats.suspended}
                  prefix={<LockOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
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
                  title="Quản trị viên"
                  value={stats.admins}
                  prefix={<Shield size={20} style={{ color: '#faad14' }} />}
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
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Quản lý người dùng</h1>
                <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: '14px' }}>
                  Danh sách, tìm kiếm, lọc, đổi vai trò, khóa/mở khóa.
                </p>
              </div>
            </div>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadUsers}
                loading={loading}
              >
                Làm mới
              </Button>
              <Input
                placeholder="Tìm theo tên/email"
                prefix={<SearchOutlined />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
            </Space>
          }
          style={{ borderRadius: '16px' }}
        >
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={(pagination) => setPagination(pagination)}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có người dùng nào"
                />
              ),
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default UsersList;
