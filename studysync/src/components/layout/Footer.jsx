import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';

export default function Footer() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/authLogo.png" 
                alt="StudySync Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="ml-3 text-xl font-bold">StudySync</span>
            </div>
            <p className="text-gray-400 mb-4">
              Ứng dụng công nghệ AI mang lại hiệu quả học tập tốt hơn cho mọi người.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/groups" className="hover:text-white transition-colors">
                  Nhóm học
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Liên hệ 
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Giải đáp thắc mắc
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setPrivacyModalOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTermsModalOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Điều khoản sử dụng
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 StudySync. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Modal
        title={<span className="text-xl font-bold text-purple-700">Chính sách bảo mật</span>}
        open={privacyModalOpen}
        onCancel={() => setPrivacyModalOpen(false)}
        footer={null}
        width={800}
        className="privacy-modal"
      >
        <div className="space-y-4 text-gray-700 max-h-[60vh] overflow-y-auto pr-4">
          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">1. Thu thập thông tin</h3>
            <p className="mb-2">
              StudySync thu thập các thông tin cá nhân mà bạn cung cấp khi đăng ký tài khoản, bao gồm:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Họ và tên</li>
              <li>Địa chỉ email</li>
              <li>Thông tin hồ sơ người dùng</li>
              <li>Dữ liệu học tập và hoạt động trên nền tảng</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">2. Sử dụng thông tin</h3>
            <p className="mb-2">Chúng tôi sử dụng thông tin của bạn để:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Cung cấp và cải thiện dịch vụ học tập</li>
              <li>Cá nhân hóa trải nghiệm người dùng</li>
              <li>Gửi thông báo về tính năng mới và cập nhật</li>
              <li>Hỗ trợ khách hàng và giải đáp thắc mắc</li>
              <li>Phân tích và cải thiện hiệu suất hệ thống</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">3. Bảo mật thông tin</h3>
            <p>
              StudySync cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp bảo mật tiên tiến.
              Chúng tôi sử dụng mã hóa SSL/TLS cho tất cả dữ liệu truyền tải và lưu trữ an toàn trên 
              các máy chủ được bảo vệ.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">4. Chia sẻ thông tin</h3>
            <p className="mb-2">
              Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. 
              Thông tin chỉ được chia sẻ trong các trường hợp:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Có sự đồng ý của bạn</li>
              <li>Tuân thủ yêu cầu pháp lý</li>
              <li>Bảo vệ quyền và an toàn của StudySync và người dùng</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">5. Quyền của người dùng</h3>
            <p className="mb-2">Bạn có quyền:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Truy cập và cập nhật thông tin cá nhân</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu</li>
              <li>Từ chối nhận email marketing</li>
              <li>Xuất dữ liệu cá nhân</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">6. Cookies</h3>
            <p>
              StudySync sử dụng cookies để cải thiện trải nghiệm người dùng, phân tích lưu lượng 
              truy cập và cá nhân hóa nội dung. Bạn có thể quản lý cookies thông qua cài đặt trình duyệt.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">7. Liên hệ</h3>
            <p>
              Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ chúng tôi qua email: 
              <span className="font-semibold text-purple-600"> noreply@studysync.com</span>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-6 pt-4 border-t">
            Cập nhật lần cuối: Tháng 11, 2025
          </p>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        title={<span className="text-xl font-bold text-purple-700">Điều khoản sử dụng</span>}
        open={termsModalOpen}
        onCancel={() => setTermsModalOpen(false)}
        footer={null}
        width={800}
        className="terms-modal"
      >
        <div className="space-y-4 text-gray-700 max-h-[60vh] overflow-y-auto pr-4">
          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">1. Chấp nhận điều khoản</h3>
            <p>
              Bằng việc truy cập và sử dụng StudySync, bạn đồng ý tuân thủ các điều khoản và điều kiện 
              được nêu trong tài liệu này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">2. Tài khoản người dùng</h3>
            <p className="mb-2">Khi tạo tài khoản, bạn cam kết:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Cung cấp thông tin chính xác và đầy đủ</li>
              <li>Bảo mật thông tin đăng nhập của bạn</li>
              <li>Chịu trách nhiệm về mọi hoạt động dưới tài khoản của bạn</li>
              <li>Thông báo ngay cho chúng tôi về bất kỳ vi phạm bảo mật nào</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">3. Sử dụng dịch vụ</h3>
            <p className="mb-2">Bạn đồng ý không:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
              <li>Vi phạm quyền sở hữu trí tuệ của StudySync hoặc bên thứ ba</li>
              <li>Tải lên nội dung có hại, spam hoặc không phù hợp</li>
              <li>Can thiệp vào hoạt động bình thường của hệ thống</li>
              <li>Thu thập thông tin người dùng khác mà không có sự đồng ý</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">4. Nội dung người dùng</h3>
            <p className="mb-2">
              Khi đăng tải nội dung lên StudySync, bạn:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Vẫn giữ quyền sở hữu đối với nội dung của mình</li>
              <li>Cấp cho StudySync quyền sử dụng nội dung để cung cấp dịch vụ</li>
              <li>Chịu trách nhiệm về tính hợp pháp của nội dung</li>
              <li>Đảm bảo không vi phạm quyền của bên thứ ba</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">5. Thanh toán và hoàn tiền</h3>
            <p className="mb-2">
              Đối với các gói dịch vụ trả phí:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Phí dịch vụ được thanh toán trước cho chu kỳ đăng ký</li>
              <li>Gia hạn tự động trừ khi bạn hủy trước khi hết hạn</li>
              <li>Chính sách hoàn tiền áp dụng theo từng trường hợp cụ thể</li>
              <li>StudySync có quyền thay đổi mức giá với thông báo trước 30 ngày</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">6. Quyền sở hữu trí tuệ</h3>
            <p>
              Tất cả nội dung, tính năng và chức năng của StudySync (bao gồm nhưng không giới hạn 
              ở văn bản, đồ họa, logo, biểu tượng, hình ảnh, phần mềm) thuộc sở hữu của StudySync 
              và được bảo vệ bởi luật bản quyền và sở hữu trí tuệ.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">7. Giới hạn trách nhiệm</h3>
            <p className="mb-2">
              StudySync cung cấp dịch vụ "như hiện có" và không đảm bảo:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Dịch vụ sẽ không bị gián đoạn hoặc không có lỗi</li>
              <li>Kết quả thu được từ việc sử dụng dịch vụ</li>
              <li>Tính chính xác tuyệt đối của nội dung</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">8. Chấm dứt dịch vụ</h3>
            <p>
              StudySync có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu vi phạm các điều khoản 
              này, mà không cần thông báo trước. Bạn cũng có thể hủy tài khoản bất cứ lúc nào thông qua 
              cài đặt tài khoản.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">9. Thay đổi điều khoản</h3>
            <p>
              StudySync có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Chúng tôi sẽ thông báo 
              về những thay đổi quan trọng qua email hoặc thông báo trên nền tảng. Việc tiếp tục sử dụng 
              dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">10. Luật áp dụng</h3>
            <p>
              Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải 
              quyết tại tòa án có thẩm quyền tại Việt Nam.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-600 mb-2">11. Liên hệ</h3>
            <p>
              Nếu có câu hỏi về điều khoản sử dụng, vui lòng liên hệ chúng tôi qua email: 
              <span className="font-semibold text-purple-600"> noreply@studysync.com</span>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-6 pt-4 border-t">
            Cập nhật lần cuối: Tháng 11, 2025
          </p>
        </div>
      </Modal>
    </footer>
  );
}