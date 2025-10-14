import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, Slider, Tag, Timeline, Modal } from 'antd';
import { BookOutlined, ClockCircleOutlined, TargetOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';

const { Option } = Select;
const { TextArea } = Input;

export default function StudyPlanGenerator({ onPlanGenerated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const subjects = [
    { value: 'toán', label: '📐 Toán học', color: 'blue' },
    { value: 'lý', label: '⚗️ Vật lý', color: 'purple' },
    { value: 'hóa', label: '🧪 Hóa học', color: 'green' },
    { value: 'sinh', label: '🌱 Sinh học', color: 'cyan' },
    { value: 'văn', label: '📝 Ngữ văn', color: 'red' },
    { value: 'anh', label: '🇬🇧 Tiếng Anh', color: 'orange' },
    { value: 'lịch sử', label: '📚 Lịch sử', color: 'gold' },
    { value: 'địa lý', label: '🌍 Địa lý', color: 'lime' },
  ];

  const studyLevels = [
    { value: 'grade-6', label: 'Lớp 6' },
    { value: 'grade-7', label: 'Lớp 7' },
    { value: 'grade-8', label: 'Lớp 8' },
    { value: 'grade-9', label: 'Lớp 9' },
    { value: 'grade-10', label: 'Lớp 10' },
    { value: 'grade-11', label: 'Lớp 11' },
    { value: 'grade-12', label: 'Lớp 12' },
  ];

  const handleGeneratePlan = async (values) => {
    setLoading(true);
    try {
      // Create a detailed prompt for AI
      const prompt = `Tạo kế hoạch học tập chi tiết cho học sinh với thông tin sau:

**Thông tin học sinh:**
- Cấp độ: ${values.level}
- Môn học quan tâm: ${values.subjects.join(', ')}
- Thời gian học mỗi ngày: ${values.timePerDay} tiếng
- Mục tiêu: ${values.goals}
- Phong cách học: ${values.studyStyle}
- Thời gian có sẵn: ${values.availableTime}

**Yêu cầu:**
1. Lịch học hàng tuần cụ thể
2. Phân bổ thời gian cho từng môn
3. Phương pháp học hiệu quả cho từng môn
4. Mốc kiểm tra tiến độ
5. Gợi ý tài liệu và nguồn học

Hãy tạo kế hoạch thực tế, dễ thực hiện và hiệu quả.`;

      const response = await aiService.getChatResponse(prompt);
      
      // Parse the response or use the generateStudyPlan method
      const planData = await aiService.generateStudyPlan(values);
      
      setGeneratedPlan({
        aiResponse: response,
        structuredPlan: planData,
        userInputs: values
      });
      
      toast.success('🎯 Kế hoạch học tập đã được tạo!', {
        duration: 3000,
      });

      if (onPlanGenerated) {
        onPlanGenerated({
          aiResponse: response,
          plan: planData
        });
      }

    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error('Có lỗi khi tạo kế hoạch học tập', {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        title={
          <div className="flex items-center gap-2">
            <TargetOutlined className="text-blue-500" />
            <span>Tạo Kế Hoạch Học Tập AI</span>
          </div>
        }
        className="mb-4"
        extra={
          <Button 
            type="primary" 
            onClick={() => setVisible(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
          >
            Tạo Kế Hoạch Mới
          </Button>
        }
      >
        <div className="text-gray-600">
          🤖 Sử dụng AI để tạo kế hoạch học tập cá nhân hóa phù hợp với mục tiêu và thời gian của bạn.
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <TargetOutlined className="text-blue-500" />
            <span>Tạo Kế Hoạch Học Tập Với AI</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGeneratePlan}
          className="mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="level"
              label="Cấp độ học tập"
              rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
            >
              <Select placeholder="Chọn lớp đang học">
                {studyLevels.map(level => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="timePerDay"
              label="Thời gian học mỗi ngày (giờ)"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
            >
              <Slider
                min={1}
                max={8}
                marks={{
                  1: '1h',
                  2: '2h',
                  4: '4h',
                  6: '6h',
                  8: '8h'
                }}
                tooltip={{ formatter: (value) => `${value} giờ` }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="subjects"
            label="Môn học quan tâm"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một môn học' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các môn học bạn muốn tập trung"
              optionLabelProp="label"
            >
              {subjects.map(subject => (
                <Option key={subject.value} value={subject.value} label={subject.label}>
                  <Tag color={subject.color}>{subject.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="goals"
            label="Mục tiêu học tập"
            rules={[{ required: true, message: 'Vui lòng nhập mục tiêu' }]}
          >
            <TextArea
              rows={3}
              placeholder="Ví dụ: Chuẩn bị thi vào lớp 10, nâng cao điểm toán và lý, ôn tập kỳ thi cuối năm..."
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="studyStyle"
              label="Phong cách học tập"
            >
              <Select placeholder="Cách bạn thích học">
                <Option value="visual">👁️ Học qua hình ảnh</Option>
                <Option value="auditory">👂 Học qua nghe</Option>
                <Option value="kinesthetic">✋ Học qua thực hành</Option>
                <Option value="reading">📖 Học qua đọc viết</Option>
                <Option value="mixed">🎨 Kết hợp nhiều cách</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="availableTime"
              label="Thời gian rảnh"
            >
              <Select placeholder="Khi nào bạn có thể học">
                <Option value="morning">🌅 Sáng sớm</Option>
                <Option value="afternoon">☀️ Chiều</Option>
                <Option value="evening">🌆 Tối</Option>
                <Option value="weekend">📅 Cuối tuần</Option>
                <Option value="flexible">⏰ Linh hoạt</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setVisible(false)}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
            >
              {loading ? 'Đang tạo kế hoạch...' : '🎯 Tạo Kế Hoạch'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Display Generated Plan */}
      {generatedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card
            title={
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <span>Kế Hoạch Học Tập Được Tạo</span>
              </div>
            }
            className="border-green-200"
          >
            <div className="space-y-4">
              {/* AI Response */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  🤖 Lời khuyên từ AI:
                </h4>
                <div className="whitespace-pre-wrap text-gray-700">
                  {generatedPlan.aiResponse}
                </div>
              </div>

              {/* Structured Plan */}
              {generatedPlan.structuredPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card size="small" title="📅 Lịch Học Hàng Tuần">
                    <Timeline
                      items={generatedPlan.structuredPlan.schedule?.map(item => ({
                        children: (
                          <div>
                            <div className="font-medium">{item.subject}</div>
                            <div className="text-sm text-gray-500">
                              {item.time} - {item.frequency}
                            </div>
                          </div>
                        )
                      })) || []}
                    />
                  </Card>

                  <Card size="small" title="💡 Gợi Ý Học Tập">
                    <ul className="space-y-2">
                      {generatedPlan.structuredPlan.tips?.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      )) || []}
                    </ul>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </>
  );
}