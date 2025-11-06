import React, { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Progress, message } from "antd";

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      message.warning("Vui lòng chọn file!");
      return;
    }

    setUploading(true);
    setProgress(0);

    // Giả lập tiến trình upload
    const interval = setInterval(() => {
      setProgress((old) => {
        const next = old + 10;
        if (next >= 100) {
          clearInterval(interval);
          message.success("Tải file thành công!");
          setUploading(false);
          setFile(null);
          setProgress(0);
          if (onUploadSuccess) onUploadSuccess();
        }
        return next;
      });
    }, 200);
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
