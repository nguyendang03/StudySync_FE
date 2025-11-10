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
  const [loading, setLoading] = useState(false);

  // 🔄 Lấy danh sách file/folder
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await fileService.getFiles();
      // đảm bảo data là object hoặc array
      const filesArray = Array.isArray(data) ? data : Object.values(data || {});
      setFiles(filesArray);
    } catch (error) {
      console.error(error);
      message.error("❌ Không thể tải danh sách file!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ⬆️ Upload thành công → refresh list
  const handleUploadSuccess = () => {
    message.success("✅ Upload thành công!");
    fetchFiles();
  };

  // ⬇️ Tải file
  const handleDownload = async (file) => {
    if (file.isFolder) {
      message.info("📂 Thư mục không thể tải xuống trực tiếp.");
      return;
    }
    try {
      message.info(`⬇️ Đang tải xuống: ${file.name}`);
      await fileService.downloadFile(file.id);
    } catch (error) {
      console.error(error);
      message.error("❌ Không thể tải file!");
    }
  };

  // ❌ Xoá file/folder
  const handleDelete = async (id) => {
    try {
      await fileService.deleteFile(id);
      message.success("🗑️ Đã xoá!");
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error(error);
      message.error("❌ Không thể xoá!");
    }
  };

  // 🔹 Nhóm folder và file con
  const folders = files.filter((f) => f.isFolder);

  const getFilesByFolder = (folderId) =>
    files.filter((f) => f.parentId === folderId && !f.isFolder);

  // File root (không thuộc folder)
  const rootFiles = files.filter(
    (f) => !f.isFolder && (f.parentId === null || f.parentId === undefined)
  );

  return (
    <div className="space-y-6">
      {/* 📤 Upload */}
      <Card
        title={
          <Space>
            <CloudUploadOutlined /> Tải file lên
          </Space>
        }
        className="shadow-sm rounded-lg"
      >
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </Card>

      {/* 📂 Danh sách file */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold">📁 Danh sách file</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchFiles} loading={loading}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : files.length === 0 ? (
        <Empty description="Chưa có file nào" />
      ) : (
        <>
          {/* 🔹 Folders */}
          {folders.length > 0 && (
<Collapse defaultActiveKey={folders.map((f) => String(f.id))}>
  {folders.map((folder) => (
    <Panel
      key={String(folder.id)}  // ✅ Đảm bảo là string
      header={
        <Space>
          <FolderOutlined style={{ color: "#FFA500" }} />
          <span className="font-semibold">{folder.name}</span>
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
                  {getFilesByFolder(folder.id).length === 0 ? (
                    <Empty description="Chưa có file nào" />
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={getFilesByFolder(folder.id)}
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
                            title={file.name || file.originalName || "Không có tên"}
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

          {/* 🔹 Files không thuộc folder */}
          {rootFiles.length > 0 && (
            <Card title="Các file khác">
              <List
                itemLayout="horizontal"
                dataSource={rootFiles}
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
                      title={file.name || file.originalName || "Không có tên"}
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
            </Card>
          )}
        </>
      )}
    </div>
  );
}
