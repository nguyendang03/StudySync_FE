// // src/pages/FilesPage.jsx
// import React, { useRef } from "react";
// import Sidebar from "../../components/layout/Sidebar";
// import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
// import { motion as Motion } from "framer-motion";
// import FileUpload from "../../components/files/FileUpload";
// import FileList from "../../components/files/FileList";

// export default function FilesPage() {
//   const fileListRef = useRef(null);

//   const handleUploadSuccess = () => {
//     if (fileListRef.current?.fetchFiles) {
//       fileListRef.current.fetchFiles();
//     }
//   };

//   return (
//     <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #A640A0, #6D17AE)" }}>
//       <Sidebar />

//       <div className="flex-1">
//         <div className="p-8 min-h-full">
//           <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
//             <div className="flex flex-col items-center justify-center text-center mb-10">
//               <h1 className="text-4xl font-bold text-white tracking-tight mb-3">QUẢN LÝ FILE</h1>
//               <p className="text-white/80 text-lg max-w-2xl">Tải lên và xem lại các tài liệu học tập của bạn</p>
//             </div>
//           </Motion.div>

//           <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Upload Section */}
//             <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
//                   <UploadOutlined className="text-2xl" />
//                 </div>
//                 <h2 className="text-2xl font-semibold text-gray-800">Tải lên file</h2>
//               </div>
//               <FileUpload onUploadSuccess={handleUploadSuccess} />
//             </div>

//             {/* File List Section */}
//             <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
//                   <FileTextOutlined className="text-2xl" />
//                 </div>
//                 <h2 className="text-2xl font-semibold text-gray-800">Danh sách file</h2>
//               </div>

//               <FileList ref={fileListRef} />
//             </div>
//           </Motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }
