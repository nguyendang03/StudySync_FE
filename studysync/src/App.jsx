import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import GuestFriendlyRoute from './components/GuestFriendlyRoute';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all page components
const Home = lazy(() => import('./pages/common/Home'));
const Login = lazy(() => import('./pages/common/Login'));
const Register = lazy(() => import('./pages/common/Register'));
const VerifyEmail = lazy(() => import('./pages/common/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/common/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/common/ResetPassword'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const GroupDiscovery = lazy(() => import('./pages/groups/GroupDiscovery'));
const GroupDetail = lazy(() => import('./pages/groups/GroupDetail'));
const MyGroups = lazy(() => import('./pages/groups/MyGroups'));
const GiaiDapThacMac = lazy(() => import('./pages/common/GiaiDapThacMac'));
const ChatBot = lazy(() => import('./pages/common/ChatBot'));
const Schedule = lazy(() => import('./pages/common/Schedule'));
const TaskDistribution = lazy(() => import('./pages/groups/TaskDistribution'));
const AgoraDebugTest = lazy(() => import('./pages/common/AgoraDebugTest'));
const VideoCall = lazy(() => import('./pages/common/VideoCall'));
const JoinCall = lazy(() => import('./pages/common/JoinCall'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersList = lazy(() => import('./pages/admin/UsersList'));
const ReviewsModeration = lazy(() => import('./pages/admin/ReviewsModeration'));
const PlansList = lazy(() => import('./pages/admin/PlansList'));
const PaymentsList = lazy(() => import('./pages/admin/PaymentsList'));
const Subscriptions = lazy(() => import('./pages/common/Subscriptions'));
const PaymentSuccess = lazy(() => import('./pages/common/PaymentSuccess'));
const Reviews = lazy(() => import('./pages/common/Reviews'));
const ContactSupport = lazy(() => import('./pages/common/ContactSupport'));
const Forbidden = lazy(() => import('./pages/common/Forbidden'));
const FilesPage = lazy(() => import("./pages/files/FilesPage"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense
            fallback={
              <LoadingSpinner
                size="large"
                fullScreen={true}
                message="Đang khởi tạo ứng dụng..."
              />
            }
          >
            <Routes>
              {/* Public Routes - Only accessible when not authenticated */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          fullScreen={true}
                          message="Đang tải trang đăng nhập..."
                        />
                      }
                    >
                      <Login />
                    </Suspense>
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          fullScreen={true}
                          message="Đang tải trang đăng ký..."
                        />
                      }
                    >
                      <Register />
                    </Suspense>
                  </PublicRoute>
                }
              />

              {/* Admin Routes - Protected with AdminLayout */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            fullScreen={true}
                            message="Đang tải trang quản trị..."
                          />
                        }
                      >
                        <AdminLayout />
                      </Suspense>
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route
                  path="dashboard"
                  element={
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          message="Đang tải dashboard..."
                        />
                      }
                    >
                      <AdminDashboard />
                    </Suspense>
                  }
                />
                {/* MVP admin routes */}
                <Route
                  path="users"
                  element={
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          message="Đang tải người dùng..."
                        />
                      }
                    >
                      <UsersList />
                    </Suspense>
                  }
                />
                <Route
                  path="reviews"
                  element={
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          message="Đang tải đánh giá..."
                        />
                      }
                    >
                      <ReviewsModeration />
                    </Suspense>
                  }
                />
                <Route
                  path="subscriptions"
                  element={
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          message="Đang tải gói..."
                        />
                      }
                    >
                      <PlansList />
                    </Suspense>
                  }
                />
                <Route
                  path="payments"
                  element={
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          message="Đang tải thanh toán..."
                        />
                      }
                    >
                      <PaymentsList />
                    </Suspense>
                  }
                />
                {/* Roles removed */}
                {/* Redirect /admin to /admin/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
              {/* Forbidden */}
              <Route
                path="/403"
                element={
                  <Suspense
                    fallback={
                      <LoadingSpinner
                        size="large"
                        fullScreen={true}
                        message="Đang tải..."
                      />
                    }
                  >
                    <Forbidden />
                  </Suspense>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải trang tệp..."
                          />
                        }
                      >
                        <FilesPage />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          fullScreen={true}
                          message="Đang tải xác thực email..."
                        />
                      }
                    >
                      <VerifyEmail />
                    </Suspense>
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          fullScreen={true}
                          message="Đang tải quên mật khẩu..."
                        />
                      }
                    >
                      <ForgotPassword />
                    </Suspense>
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <Suspense
                    fallback={
                      <LoadingSpinner
                        size="large"
                        fullScreen={true}
                        message="Đang tải đặt lại mật khẩu..."
                      />
                    }
                  >
                    <ResetPassword />
                  </Suspense>
                }
              />

              {/* Public Routes - Anyone can access these (guests and authenticated users) */}
              <Route 
                path="/home" 
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải trang chủ..." />}>
                        <Home />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route 
                path="/chatbot" 
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải chatbot..." />}>
                        <ChatBot />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route 
                path="/schedule" 
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải lịch học..." />}>
                        <Schedule />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route 
                path="/groups" 
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải danh sách nhóm..." />}>
                        <GroupDiscovery />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route
                path="/groups/:id"
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải thông tin nhóm..." />}>
                        <GroupDetail />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route
                path="/faq"
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải câu hỏi thường gặp..." />}>
                        <GiaiDapThacMac />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route
                path="/giai-dap-thac-mac"
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải câu hỏi thường gặp..." />}>
                        <GiaiDapThacMac />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route
                path="/reviews"
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải đánh giá..." />}>
                        <Reviews />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải trang liên hệ..." />}>
                        <ContactSupport />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route 
                path="/agora-debug" 
                element={
                  <Layout>
                    <Suspense
                      fallback={
                        <LoadingSpinner
                          size="large"
                          message="Đang tải debug..."
                        />
                      }
                    >
                      <AgoraDebugTest />
                    </Suspense>
                  </Layout>
                }
              />
              <Route
                path="/join-call/:callId"
                element={
                  <Suspense
                    fallback={
                      <LoadingSpinner
                        size="large"
                        fullScreen={true}
                        message="Đang tham gia cuộc gọi..."
                      />
                    }
                  >
                    <JoinCall />
                  </Suspense>
                }
              />

              {/* Protected Routes - Only authenticated users */}
              <Route
                path="/"
                element={
                  <GuestFriendlyRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải trang chủ..."
                          />
                        }
                      >
                        <Home />
                      </Suspense>
                    </Layout>
                  </GuestFriendlyRoute>
                } 
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải hồ sơ..."
                          />
                        }
                      >
                        <Profile />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-groups"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải nhóm của bạn..."
                          />
                        }
                      >
                        <MyGroups />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/task-distribution" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải phân công nhiệm vụ..."
                          />
                        }
                      >
                        <TaskDistribution />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải gói subscription..."
                          />
                        }
                      >
                        <Subscriptions />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/success/:orderCode"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải hóa đơn..."
                          />
                        }
                      >
                        <PaymentSuccess />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải cài đặt..."
                          />
                        }
                      >
                        <div>Settings Page - Coming Soon</div>
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video-call"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense
                        fallback={
                          <LoadingSpinner
                            size="large"
                            message="Đang tải cuộc gọi video..."
                          />
                        }
                      >
                        <VideoCall />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>

          {/* Sonner Toast Container with beautiful custom styling */}
          <Toaster
            position="bottom-right"
            expand={true}
            richColors
            closeButton
            duration={3000}
            toastOptions={{
              unstyled: false,
              classNames: {
                toast: "sonner-toast-custom",
                title: "sonner-toast-title",
                description: "sonner-toast-description",
                success: "sonner-toast-success",
                error: "sonner-toast-error",
                warning: "sonner-toast-warning",
                info: "sonner-toast-info",
              },
              style: {
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow:
                  "0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                borderRadius: "12px",
                padding: "16px 20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#1e293b",
                minWidth: "320px",
                maxWidth: "420px",
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
