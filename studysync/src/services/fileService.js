import axios from "axios";
import API_BASE_URL from "../config/api.js";
import authService from "./authService.js";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Gắn token tự động
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token nếu 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await authService.refreshToken();
        const newToken = authService.getAccessToken();
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(original);
        }
      } catch {
        authService.logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

class FileService {
  // Lấy danh sách file + folder
async getFiles(parentId = null, params = {}) {
  try {
    const query = parentId ? { ...params, parentId } : params;
    console.log("📡 API Request:", { parentId, query });
    const res = await axiosInstance.get("/files", { params: query });
    console.log("📡 API Response (full):", res.data);
    
    // Try different paths based on API response structure
    let data = res.data?.data?.data || res.data?.data || res.data;
    
    // ✅ Luôn trả về mảng
    const items = Array.isArray(data) ? data : [];
    console.log("📂 getFiles:", parentId ? `Folder ${parentId}` : "Root", `(${items.length} items)`, items);
    return items;
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách file:", err);
    throw new Error("Không thể tải danh sách file!");
  }
}

  // Tạo thư mục
  async createFolder(folderData) {
    try {
      const payload = {
        name: folderData.name,
        type: folderData.type || "personal",
        parentId: folderData.parentId || null,
        groupId: folderData.groupId || null,
      };

      const res = await axiosInstance.post("/files/folders", payload);
      const folder = res.data?.data?.data || res.data?.data;
      if (!folder || !folder.id) {
        throw new Error("API không trả về dữ liệu thư mục hợp lệ!");
      }
      return folder;
    } catch (err) {
      console.error("❌ Lỗi khi tạo thư mục:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Không thể tạo thư mục.";
      throw new Error(msg);
    }
  }

  // Upload file
  async uploadFile(formData, onProgress) {
    try {
      const res = await axiosInstance.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            onProgress(percent);
          }
        },
      });
      const uploaded = res.data?.data?.data || res.data?.data;
      console.log("✅ File đã tải lên:", uploaded);
      return uploaded;
    } catch (err) {
      console.error("❌ Lỗi khi tải file lên:", err);
      const msg =
        err.response?.data?.message ||
        "Không thể tải file. Vui lòng kiểm tra lại thư mục.";
      throw new Error(msg);
    }
  }

  // Download file
  async downloadFile(fileId) {
    try {
      const res = await axiosInstance.get(`/files/${fileId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const name = res.headers["content-disposition"]
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || "file";
      link.href = url;
      link.download = decodeURIComponent(name);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Lỗi khi tải file:", err);
      throw err;
    }
  }

  // Xoá file
  async deleteFile(id) {
    try {
      const res = await axiosInstance.delete(`/files/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      console.error("❌ Lỗi khi xóa file:", err);
      const msg = err.response?.data?.message || "Không thể xóa file.";
      throw new Error(msg);
    }
  }

  // Dung lượng đã dùng
  async getStorage(type = "personal") {
    try {
      const res = await axiosInstance.get(`/files/storage`, {
        params: { type },
      });
      return res.data?.data || res.data;
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin storage:", err);
      throw err;
    }
  }

  // Chi tiết file
  async getFileById(id) {
    try {
      const res = await axiosInstance.get(`/files/${id}`);
      return res.data?.data?.data || res.data?.data || res.data;
    } catch (err) {
      throw new Error("Không thể lấy thông tin file!");
    }
  }
}

export default new FileService();
