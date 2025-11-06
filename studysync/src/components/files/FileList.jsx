// src/components/files/FileList.jsx
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { List, Button, message, Select, Pagination, Space } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import fileService from "../../services/fileService";

const { Option } = Select;

const FileList = forwardRef((props, ref) => {
  const defaultLimit = 20; // bạn chọn B = 20
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("personal");
  const [page, setPage] = useState(1);
  const [limit] = useState(defaultLimit);
  const [total, setTotal] = useState(0);

  // expose fetchFiles cho parent (FilesPage)
  useImperativeHandle(ref, () => ({
    fetchFiles,
  }));

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter]);

  async function fetchFiles() {
    setLoading(true);
    try {
      // query params: page, limit, type
      const { items, meta } = await fileService.getFiles({
        page,
        limit,
        type: typeFilter,
      });

      setFiles(items || []);
      setTotal(meta?.total || 0);
    } catch (err) {
      console.error("Lỗi khi tải danh sách file:", err);
      message.error("Không thể tải danh sách file!");
      setFiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file.id);
      message.success(`Đã bắt đầu tải: ${file.originalName || file.name || file.filename}`);
    } catch (err) {
      console.error(err);
      message.error("Tải xuống thất bại!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa file này?")) return;
    try {
      await fileService.deleteFile(id);
      message.success("Xóa file thành công!");
      // reload page 1 nếu sau xóa list rỗng? ta sẽ refresh current page
      fetchFiles();
    } catch (err) {
      console.error(err);
      message.error("Xóa file thất bại!");
    }
  };

  const handleTypeChange = (val) => {
    setTypeFilter(val);
    setPage(1); // đổi filter -> về trang 1
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="text-lg font-semibold">Danh sách file</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span>Loại:</span>
            <Select value={typeFilter} onChange={handleTypeChange} style={{ width: 140 }}>
              <Option value="personal">Personal</Option>
              <Option value="group">Group</Option>
            </Select>
          </div>
        </div>

        <List
          loading={loading}
          dataSource={files}
          locale={{ emptyText: "Chưa có file nào" }}
          renderItem={(file) => (
            <List.Item
              className="border border-gray-200 rounded-lg mb-3 px-4 py-3 hover:bg-gray-50 transition-all"
              actions={[
                <Button key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(file)} />,
                <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => handleDelete(file.id)} />,
              ]}
            >
              <List.Item.Meta
                title={<span className="font-semibold">{file.originalName || file.name || file.filename}</span>}
                description={
                  file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : file.mimeType || null
                }
              />
            </List.Item>
          )}
        />

        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            hideOnSinglePage={total <= limit}
          />
        </div>
      </Space>
    </div>
  );
});

export default FileList;