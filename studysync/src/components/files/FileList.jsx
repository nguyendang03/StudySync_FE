import React, { useState } from "react";
import { List, Button, message } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";

export default function FileList() {
  const [files, setFiles] = useState([
    { id: 1, name: "BaiTapReact.docx", size: 5242880 },
    { id: 2, name: "Slide_GioiThieu.pdf", size: 3145728 },
  ]);

  const handleDownload = (file) => {
    message.info(`Đang tải xuống: ${file.name}`);
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    message.success("Đã xoá file!");
  };

  return (
    <List
      dataSource={files}
      locale={{ emptyText: "Chưa có file nào" }}
      renderItem={(file) => (
        <List.Item
          className="border border-gray-200 rounded-lg mb-3 px-4 py-3 hover:bg-gray-50 transition-all"
          actions={[
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(file)}
            />,
            <Button
              key="delete"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(file.id)}
            />,
          ]}
        >
          <List.Item.Meta
            title={<span className="font-semibold">{file.name}</span>}
            description={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
          />
        </List.Item>
      )}
    />
  );
}
