import React from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Row, Col } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';

export default function ContactSupport() {

  const contactInfo = [
    {
      icon: <MailOutlined className="text-3xl text-purple-600" />,
      title: 'Email',
      content: 'support@studysync.vn',
      description: 'Gửi email cho chúng tôi bất kỳ lúc nào',
    },
    {
      icon: <PhoneOutlined className="text-3xl text-blue-600" />,
      title: 'Điện thoại',
      content: '0832549029',
      description: 'Thứ Hai - Thứ Sáu, 8:00 - 18:00',
    },
    {
      icon: <EnvironmentOutlined className="text-3xl text-green-600" />,
      title: 'Địa chỉ',
      content: 'Đại học FPT TP.HCM',
      description: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, Q.9',
    },
    {
      icon: <ClockCircleOutlined className="text-3xl text-orange-600" />,
      title: 'Giờ làm việc',
      content: '8:00 - 18:00',
      description: 'Thứ Hai đến Thứ Sáu',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Liên Hệ Hỗ Trợ
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Row gutter={[32, 32]} justify="center">
            {contactInfo.map((info, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="h-full"
                >
                  <Card className="h-full text-center shadow-lg border-0 hover:shadow-xl transition-all duration-300" bodyStyle={{ padding: '32px 24px', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        {info.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{info.title}</h3>
                      <p className="text-purple-600 font-semibold text-base">{info.content}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{info.description}</p>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >

        </motion.div>
      </div>
    </div>
  );
}
