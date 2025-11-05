// import axios from "axios";
// import API_BASE_URL from "../config/api.js";
// import authService from "./authService.js";

// const axiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     timeout: 10000,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// // 🔐 Thêm interceptor để tự động gắn token
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const token = authService.getAccessToken();
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // 🔄 Tự động refresh token khi gặp lỗi 401
// axiosInstance.interceptors.response.use(
//     (response) => response,
//     async(error) => {
//         const originalRequest = error.config;
//         if (error.response ?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             try {
//                 await authService.refreshToken();
//                 const newToken = authService.getAccessToken();
//                 if (newToken) {
//                     originalRequest.headers.Authorization = `Bearer ${newToken}`;
//                     return axiosInstance(originalRequest);
//                 }
//             } catch (refreshError) {
//                 authService.logout();
//                 window.location.href = "/login";
//                 return Promise.reject(refreshError);
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// class FileService {
//     // 📄 Lấy danh sách file
//     async getFiles() {
//         try {
//             const response = await axiosInstance.get("/files");
//             return response.data;
//         } catch (error) {
//             console.error("❌ Lỗi khi lấy danh sách file:", error);
//             throw error;
//         }
//     }

//     // 📤 Upload file
//     async uploadFile(formData, onProgress) {
//         try {
//             const response = await axiosInstance.post("/files/upload", formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//                 onUploadProgress: (event) => {
//                     if (onProgress) {
//                         const percent = Math.round((event.loaded * 100) / event.total);
//                         onProgress(percent);
//                     }
//                 },
//             });
//             return response.data;
//         } catch (error) {
//             console.error("❌ Lỗi khi tải file lên:", error);
//             const msg =
//                 error.response ?.data ?.message ||
//                 "Không thể tải file. Vui lòng thử lại.";
//             throw new Error(msg);
//         }
//     }

//     // ⬇️ Tải file xuống
//     async downloadFile(fileId) {
//         try {
//             const response = await axiosInstance.get(`/files/${fileId}/download`, {
//                 responseType: "blob",
//             });

//             // 🔗 Tạo link tải xuống
//             const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement("a");
//             const disposition = response.headers["content-disposition"];
//             const filenameMatch = disposition ?.match(/filename="?(.+)"?/);
//             const filename = filenameMatch ? filenameMatch[1] : `file_${fileId}`;

//             link.href = blobUrl;
//             link.setAttribute("download", filename);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//         } catch (error) {
//             console.error("❌ Lỗi khi tải file:", error);
//             throw error;
//         }
//     }

//     // Xóa file
//     async deleteFile(fileId) {
//         try {
//             const response = await axiosInstance.delete(`/files/${fileId}`);
//             return response.data;
//         } catch (error) {
//             console.error("❌ Lỗi khi xóa file:", error);
//             const msg =
//                 error.response ?.data ?.message ||
//                 "Không thể xóa file. Vui lòng thử lại.";
//             throw new Error(msg);
//         }
//     }
// }

// const fileService = new FileService();
// export default fileService;
