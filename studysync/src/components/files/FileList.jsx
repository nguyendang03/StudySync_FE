import React, { useState, useEffect } from "react";
import {
  List,
  Button,
  message,
  Spin,
  Empty,
  Tag,
  Tooltip,
  Space,
  Card,
  Collapse,
} from "antd";
import {
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileOutlined,
  FolderOutlined,
  CloudUploadOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import FileUpload from "./FileUpload";
import fileService from "../../services/fileService";

const { Panel } = Collapse;

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [folderFiles, setFolderFiles] = useState({}); // 🔹 Lưu file con cho từng folder
  const [loading, setLoading] = useState(false);
  const [loadingFolder, setLoadingFolder] = useState({}); // 🔹 Loading riêng cho từng folder

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await fileService.getFiles();
      const arr = Array.isArray(data) ? data : Object.values(data || {});
      setFiles(arr);
    } catch {
      message.error("❌ Không thể tải danh sách file!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Lazy load khi mở folder
  const handleLoadFolder = async (folderId) => {
    if (folderFiles[folderId]) return; // nếu đã load rồi thì bỏ qua
    try {
      setLoadingFolder((prev) => ({ ...prev, [folderId]: true }));
      const data = await fileService.getFiles(folderId);
      const arr = Array.isArray(data) ? data : Object.values(data || {});
      setFolderFiles((prev) => ({ ...prev, [folderId]: arr }));
    } catch {
      message.error("❌ Không thể tải file trong thư mục!");
    } finally {
      setLoadingFolder((prev) => ({ ...prev, [folderId]: false }));
    }
  };

  const handleUploadSuccess = () => {
    message.success("✅ Upload thành công!");
    fetchFiles();
  };

  const handleDownload = async (file) => {
    if (file.isFolder) return message.info("📂 Thư mục không thể tải xuống trực tiếp.");
    try {
      await fileService.downloadFile(file.id);
    } catch {
      message.error("❌ Không thể tải file!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fileService.deleteFile(id);
      message.success("🗑️ Đã xoá!");
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      message.error("❌ Không thể xoá!");
    }
  };

  const folders = files.filter((f) => f.isFolder);
  const rootFiles = files.filter((f) => !f.isFolder && !f.parentId);

  return (
    <div className="space-y-6">
      {/* Upload */}
      <Card
        title={
          <Space>
            <CloudUploadOutlined /> Tải file lên
          </Space>
        }
      >
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </Card>

      {/* Danh sách */}
      <div className="flex justify-between mt-6">
        <h2 className="text-lg font-semibold">📁 Danh sách file</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchFiles} loading={loading}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <Spin size="large" className="flex justify-center py-10" />
      ) : files.length === 0 ? (
        <Empty description="Chưa có file nào" />
      ) : (
        <>
          {/* Folder */}
          {folders.length > 0 && (
            <Collapse
              accordion
              onChange={(keys) => {
                const folderId = Array.isArray(keys) ? keys[0] : keys;
                if (folderId) handleLoadFolder(folderId);
              }}
            >
              {folders.map((folder) => (
                <Panel
                  key={folder.id}
                  header={
                    <Space>
                      <FolderOutlined style={{ color: "#ffa500" }} />
                      <span>{folder.name}</span>
                      <Tag color="orange">{folder.type || "Folder"}</Tag>
                    </Space>
                  }
                  extra={
                    <Tooltip title="Xoá folder">
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(folder.id);
                        }}
                      />
                    </Tooltip>
                  }
                >
                  {loadingFolder[folder.id] ? (
                    <Spin />
                  ) : !folderFiles[folder.id] ? (
                    <Empty description="Chưa tải dữ liệu" />
                  ) : folderFiles[folder.id].length === 0 ? (
                    <Empty description="Thư mục trống" />
                  ) : (
                    <List
                      dataSource={folderFiles[folder.id]}
                      renderItem={(file) => (
                        <List.Item
                          actions={[
                            <Tooltip title="Tải xuống" key="download">
                              <Button
                                type="link"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(file)}
                              />
                            </Tooltip>,
                            <Tooltip title="Xoá file" key="delete">
                              <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(file.id)}
                              />
                            </Tooltip>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<FileOutlined style={{ fontSize: 22, color: "#1677ff" }} />}
                            title={file.name || "Không có tên"}
                            description={
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  📏{" "}
                                  {file.size
                                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                    : "Không rõ dung lượng"}
                                </div>
                                <div>
                                  <UserOutlined /> {file.uploaderId || "Không rõ người tạo"}
                                </div>
                                <div>
                                  <CalendarOutlined />{" "}
                                  {file.uploadedAt
                                    ? new Date(file.uploadedAt).toLocaleString("vi-VN")
                                    : "Không rõ thời gian"}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Panel>
              ))}
            </Collapse>
          )}

          {/* File không thuộc folder */}
          {rootFiles.length > 0 && (
            <Card title="Các file khác">
              <List
                dataSource={rootFiles}
                renderItem={(file) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(file)}
                      />,
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(file.id)}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileOutlined style={{ fontSize: 22, color: "#1677ff" }} />}
                      title={file.name}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
