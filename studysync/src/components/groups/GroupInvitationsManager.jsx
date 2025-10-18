import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Table, Tag, Space, Modal, message, Spin } from 'antd';
import { 
  SendOutlined, 
  UserAddOutlined, 
  CheckOutlined, 
  CloseOutlined,
  ReloadOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import groupService from '../../services/groupService';

const { TabPane } = Tabs;

export default function GroupInvitationsManager({ groupId }) {
  const [sentInvitations, setSentInvitations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('sent');

  useEffect(() => {
    if (groupId) {
      fetchJoinRequests();
    }
    fetchSentInvitations();
  }, [groupId]);

  const fetchSentInvitations = async () => {
    setLoadingSent(true);
    try {
      const response = await groupService.getSentInvitations();
      const data = response?.data || response;
      console.log('📤 Sent invitations:', data);
      
      // Filter by groupId if provided
      const invitations = Array.isArray(data) ? data : [];
      const filtered = groupId 
        ? invitations.filter(inv => inv.group?.id === groupId)
        : invitations;
      
      setSentInvitations(filtered);
    } catch (error) {
      console.error('❌ Error fetching sent invitations:', error);
      message.error(error.message || 'Không thể tải danh sách lời mời đã gửi');
    } finally {
      setLoadingSent(false);
    }
  };

  const fetchJoinRequests = async () => {
    if (!groupId) return;
    
    setLoadingRequests(true);
    try {
      const response = await groupService.getJoinRequests(groupId);
      const data = response?.data || response;
      console.log('📥 Join requests:', data);
      setJoinRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching join requests:', error);
      message.error(error.message || 'Không thể tải danh sách yêu cầu tham gia');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId, userName) => {
    Modal.confirm({
      title: 'Duyệt yêu cầu tham gia',
      content: `Bạn có chắc muốn chấp nhận yêu cầu của "${userName}"?`,
      okText: 'Chấp nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setProcessingId(requestId);
        try {
          await groupService.approveJoinRequest(requestId);
          message.success(`Đã chấp nhận yêu cầu của ${userName}`);
          await fetchJoinRequests();
        } catch (error) {
          console.error('❌ Error approving request:', error);
          message.error(error.message || 'Không thể duyệt yêu cầu');
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleDenyRequest = async (requestId, userName) => {
    Modal.confirm({
      title: 'Từ chối yêu cầu tham gia',
      content: `Bạn có chắc muốn từ chối yêu cầu của "${userName}"?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setProcessingId(requestId);
        try {
          await groupService.denyJoinRequest(requestId);
          message.success(`Đã từ chối yêu cầu của ${userName}`);
          await fetchJoinRequests();
        } catch (error) {
          console.error('❌ Error denying request:', error);
          message.error(error.message || 'Không thể từ chối yêu cầu');
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleRefresh = () => {
    if (activeTab === 'sent') {
      fetchSentInvitations();
    } else {
      fetchJoinRequests();
    }
  };

  const sentInvitationsColumns = [
    {
      title: 'Người nhận',
      dataIndex: ['invitee', 'username'],
      key: 'invitee',
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.invitee?.username || 'N/A'}</div>
          <div className="text-sm text-gray-500">{record.invitee?.email}</div>
        </div>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: ['group', 'groupName'],
      key: 'group',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Lời nhắn',
      dataIndex: 'message',
      key: 'message',
      render: (text) => text || <span className="text-gray-400 italic">Không có</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ phản hồi' },
          accepted: { color: 'green', text: 'Đã chấp nhận' },
          declined: { color: 'red', text: 'Đã từ chối' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
  ];

  const joinRequestsColumns = [
    {
      title: 'Người yêu cầu',
      dataIndex: ['user', 'username'],
      key: 'user',
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.user?.username || 'N/A'}</div>
          <div className="text-sm text-gray-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Lời nhắn',
      dataIndex: 'message',
      key: 'message',
      render: (text) => text || <span className="text-gray-400 italic">Không có</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => handleApproveRequest(record.id, record.user?.username)}
            loading={processingId === record.id}
            className="bg-green-500 hover:bg-green-600 border-0"
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleDenyRequest(record.id, record.user?.username)}
            loading={processingId === record.id}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">
            Quản lý lời mời & Yêu cầu tham gia
          </span>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={activeTab === 'sent' ? loadingSent : loadingRequests}
          >
            Làm mới
          </Button>
        </div>
      }
      className="shadow-lg"
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <SendOutlined />
              Lời mời đã gửi ({sentInvitations.length})
            </span>
          }
          key="sent"
        >
          {loadingSent ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={sentInvitationsColumns}
              dataSource={sentInvitations}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: (
                  <div className="py-8">
                    <SendOutlined className="text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">Chưa gửi lời mời nào</p>
                  </div>
                ),
              }}
            />
          )}
        </TabPane>
        
        {groupId && (
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <UserAddOutlined />
                Yêu cầu tham gia ({joinRequests.length})
              </span>
            }
            key="requests"
          >
            {loadingRequests ? (
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={joinRequestsColumns}
                dataSource={joinRequests}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: (
                    <div className="py-8">
                      <ClockCircleOutlined className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">Không có yêu cầu tham gia nào</p>
                    </div>
                  ),
                }}
              />
            )}
          </TabPane>
        )}
      </Tabs>
    </Card>
  );
}
