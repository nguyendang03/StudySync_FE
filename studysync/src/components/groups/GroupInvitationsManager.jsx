import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Modal, Spin } from 'antd';
import { 
  UserAddOutlined, 
  CheckOutlined, 
  CloseOutlined,
  ReloadOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { showToast } from '../../utils/toast';
import groupService from '../../services/groupService';

export default function GroupInvitationsManager({ groupId, refreshTrigger = 0 }) {
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchJoinRequests();
    }
  }, [groupId, refreshTrigger]);

  const fetchJoinRequests = async () => {
    if (!groupId) return;
    
    setLoadingRequests(true);
    try {
      const response = await groupService.getJoinRequests(groupId);
      const data = response?.data || response;
      console.log('📥 Join requests:', data);
      
      // Convert object to array if needed, or use empty array as fallback
      let requests = [];
      if (Array.isArray(data)) {
        requests = data;
      } else if (data && typeof data === 'object') {
        // If data is an object like {0: {...}, 1: {...}}, convert to array
        requests = Object.values(data);
      }
      console.log('📋 Parsed join requests array:', requests);
      setJoinRequests(requests);
    } catch (error) {
      console.error('❌ Error fetching join requests:', error);
      showToast.error(error.message || 'Không thể tải danh sách yêu cầu tham gia');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId, userName) => {
    console.log('🔵 Approve button clicked for:', { requestId, userName });
    
    setProcessingId(requestId);
    try {
      console.log('📤 Calling approveJoinRequest API...');
      const result = await groupService.approveJoinRequest(requestId);
      console.log('✅ Approve result:', result);
      showToast.success(`Đã chấp nhận yêu cầu của ${userName}`);
      await fetchJoinRequests();
    } catch (error) {
      console.error('❌ Error approving request:', error);
      showToast.error(error.message || 'Không thể duyệt yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDenyRequest = async (requestId, userName) => {
    console.log('🔴 Deny button clicked for:', { requestId, userName });
    
    setProcessingId(requestId);
    try {
      console.log('📤 Calling denyJoinRequest API...');
      const result = await groupService.denyJoinRequest(requestId);
      console.log('✅ Deny result:', result);
      showToast.success(`Đã từ chối yêu cầu của ${userName}`);
      await fetchJoinRequests();
    } catch (error) {
      console.error('❌ Error denying request:', error);
      showToast.error(error.message || 'Không thể từ chối yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefresh = () => {
    fetchJoinRequests();
  };

  const joinRequestsColumns = [
    {
      title: 'Người yêu cầu',
      dataIndex: 'requesterName',
      key: 'requester',
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.requesterName || 'N/A'}</div>
          <div className="text-sm text-gray-500">{record.requesterEmail || 'N/A'}</div>
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
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A',
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
            onClick={() => handleApproveRequest(record.id, record.requesterName)}
            loading={processingId === record.id}
            className="bg-green-500 hover:bg-green-600 border-0"
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleDenyRequest(record.id, record.requesterName)}
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
          <span className="text-lg font-semibold flex items-center gap-2">
            <UserAddOutlined />
            Yêu cầu tham gia ({joinRequests.length})
          </span>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loadingRequests}
          >
            Làm mới
          </Button>
        </div>
      }
      className="shadow-lg"
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
    </Card>
  );
}
