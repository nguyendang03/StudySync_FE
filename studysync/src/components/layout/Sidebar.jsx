import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Target,
  Search,
  Users,
  Calendar,
  MessageSquare,
  Bot,
  User,
  Settings,
  Home,
  Menu,
  Crown,
  Upload,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 lg:flex flex-col max-h-screen sticky top-0 hidden">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Content */}
        <div
          className={`lg:relative fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col max-h-screen transform transition-transform lg:transform-none ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Navigation Links */}
          <div className="flex-1 p-6">
            <div className="space-y-3">
              <Link
                to="/home"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/home"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Trang chủ</span>
              </Link>
              <Link
                to="/groups"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/groups"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Khám phá nhóm</span>
              </Link>
              <Link
                to="/my-groups"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/my-groups"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Nhóm của tôi</span>
              </Link>
              <Link
                to="/schedule"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/schedule"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Thời khóa biểu</span>
              </Link>
              <Link
                to="/task-distribution"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/task-distribution"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Phân chia Task</span>
              </Link>
              <Link
                to="/files"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/files"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Upload File</span>
              </Link>
              <Link
                to="/chatbot"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/chatbot"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">AI Trợ lý</span>
              </Link>

              <Link
                to="/subscriptions"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/subscriptions"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Gói dịch vụ</span>
              </Link>

              <div className="border-t border-white/20 my-4"></div>

              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === "/profile"
                    ? "text-white bg-white/20 border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/20"
                }`}
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Hồ sơ</span>
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all group">
                <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Cài đặt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-lg"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
