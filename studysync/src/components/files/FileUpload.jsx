// src/components/files/FileUpload.jsx
import React, { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Progress, message } from "antd";
import fileService from "../../services/fileService";

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      message.warning("Vui lòng chọn file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setProgress(0);

    try {
      await fileService.uploadFile(formData, (p) => setProgress(p));
      message.success("Tải file thành công!");
      setFile(null);
      setProgress(0);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Tải file thất bại!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleChange}
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
        disabled={!file}
        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 hover:opacity-90"
      >
        {uploading ? "Đang tải..." : "Tải lên"}
      </Button>
    </div>
  );
}