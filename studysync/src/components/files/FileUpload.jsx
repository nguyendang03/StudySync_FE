import React, { useState, useEffect } from "react";
import { UploadOutlined, FolderAddOutlined } from "@ant-design/icons";
import { Button, Progress, message, Select, Input, Modal, Space } from "antd";
import fileService from "../../services/fileService";

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderType, setFolderType] = useState("personal");
  const [groupId, setGroupId] = useState(null);
  const [groups, setGroups] = useState([]);

  // Load danh sách thư mục
  const fetchFolders = async () => {
    try {
      const res = await fileService.getFiles();
      const folderList = (res || []).filter((item) => item.isFolder);
      setFolders(folderList);

      if (folderList.length && !selectedFolder) {
        setSelectedFolder(folderList[0].id);
        setFolderType(folderList[0].type || "personal");
        setGroupId(folderList[0].groupId || null);
      }
    } catch (error) {
      console.error("Lỗi fetchFolders:", error);
      message.error("❌ Không thể tải danh sách thư mục!");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Load danh sách nhóm từ API
  const fetchGroups = async () => {
    try {
      const res = await fileService.getMyGroups();
      setGroups(res);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nhóm:", error);
      message.error("Không thể tải danh sách nhóm!");
    }
  };

  // Tạo thư mục
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.warning("Vui lòng nhập tên thư mục!");
      return;
    }

    try {
      const createdFolder = await fileService.createFolder({
        name: newFolderName.trim(),
        type: folderType,
        parentId: null,
        groupId: folderType === "group" ? groupId : null,
      });

      message.success("📂 Tạo thư mục thành công!");
      setShowFolderModal(false);
      setNewFolderName("");

      await fetchFolders();

      setSelectedFolder(createdFolder.id);
      setFolderType(createdFolder.type);
      setGroupId(createdFolder.groupId || null);
    } catch (error) {
      message.error(error.message || "❌ Không thể tạo thư mục!");
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      message.warning("Vui lòng chọn file!");
      return;
    }
    if (!selectedFolder) {
      message.warning("Vui lòng chọn thư mục!");
      return;
    }

    const folder = folders.find((f) => f.id === selectedFolder);
    const type = folder?.type || "personal";
    const gid = folder?.groupId || null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("parentId", selectedFolder);
    formData.append("type", type);
    formData.append("customName", file.name);
    if (type === "group" && gid) {
      formData.append("groupId", gid);
    }

    setUploading(true);
    setProgress(0);

    try {
      await fileService.uploadFile(formData, (percent) => setProgress(percent));

      message.success(`🎉 File "${file.name}" tải lên thành công!`);

      Modal.success({
        title: "Upload thành công",
        content: (
          <div>
            File <strong>{file.name}</strong> đã được tải lên thư mục.
          </div>
        ),
        okText: "Đóng",
      });

      setFile(null);
      setProgress(0);
      if (onUploadSuccess) onUploadSuccess();
      await fetchFolders();
    } catch (error) {
      console.error("❌ Lỗi khi tải file lên (FileUpload):", error);
      const errMsg = error?.message || "❌ Không thể tải file!";
      message.error(errMsg);
      Modal.error({
        title: "Lỗi tải lên",
        content: <div>{errMsg}</div>,
        okText: "Đóng",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleChangeFile = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="space-y-4">
      {/* Chọn thư mục */}
      <div className="flex items-center gap-2">
        <Select
          placeholder="Chọn thư mục lưu file"
          style={{ flex: 1 }}
          value={selectedFolder}
          onChange={(value) => setSelectedFolder(value)}
          options={folders.map((f) => ({
            label: `${f.name} (${f.type})`,
            value: f.id,
          }))}
        />
        <Button
          icon={<FolderAddOutlined />}
          onClick={() => {
            if (folderType === "group") fetchGroups(); // Load nhóm khi mở modal
            setShowFolderModal(true);
          }}
        >
          Tạo thư mục
        </Button>
      </div>

      {/* Chọn file */}
      <input
        type="file"
        onChange={handleChangeFile}
        className="border border-gray-300 rounded-lg w-full py-2 px-3 cursor-pointer"
      />

      {uploading && (
        <Progress percent={progress} status="active" strokeColor="#7B61FF" />
      )}

      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={handleUpload}
        loading={uploading}
        disabled={!file || !selectedFolder}
        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 hover:opacity-90"
      >
        {uploading ? "Đang tải..." : "Tải lên"}
      </Button>

      {/* Modal tạo thư mục */}
      <Modal
        title="📁 Tạo thư mục mới"
        open={showFolderModal}
        onOk={handleCreateFolder}
        onCancel={() => setShowFolderModal(false)}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Space direction="vertical" className="w-full">
          <Input
            placeholder="Nhập tên thư mục"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />

          <Select
            value={folderType}
            onChange={(val) => {
              setFolderType(val);
              if (val === "group") fetchGroups(); // load nhóm khi chọn "Nhóm"
            }}
            options={[
              { label: "Cá nhân", value: "personal" },
              { label: "Nhóm", value: "group" },
            ]}
          />

          {folderType === "group" && (
            <Select
              placeholder="Chọn nhóm"
              value={groupId || undefined}
              onChange={(val) => setGroupId(val)}
              options={groups.map((g) => ({
                label: `${g.groupName} (${g.subject})`,
                value: g.id,
              }))}
            />
          )}
        </Space>
      </Modal>
    </div>
  );
}
