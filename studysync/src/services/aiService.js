import API_BASE_URL from '../config/api.js';

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_AI_API_KEY;
    this.baseURL = API_BASE_URL;
    this.provider = import.meta.env.VITE_AI_PROVIDER || 'openai'; // openai, gemini, claude, local
    this.lastResponses = new Set(); // Track recent responses to avoid repetition
    this.conversationContext = new Map(); // Store conversation contexts
  }

  /**
   * Get AI response from OpenAI
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {Promise<string>} AI response
   */
  async getOpenAIResponse(message, conversationHistory = []) {
    const messages = [
      {
        role: "system",
        content: `Bạn là StudySync AI, một trợ lý học tập thông minh và thân thiện cho học sinh Việt Nam. 

NHIỆM VỤ:
- Hỗ trợ học tập các môn: Toán, Lý, Hóa, Sinh, Văn, Anh, Lịch sử, Địa lý
- Giải thích khái niệm một cách dễ hiểu
- Đưa ra gợi ý học tập hiệu quả
- Tạo kế hoạch học tập cá nhân
- Hỗ trợ giải bài tập từng bước

PHONG CÁCH:
- Sử dụng tiếng Việt tự nhiên, thân thiện
- Emoji phù hợp để tạo cảm giác gần gũi
- Trả lời chi tiết nhưng dễ hiểu
- Khuyến khích và động viên học sinh
- Đưa ra ví dụ cụ thể khi cần thiết

ĐỊNH DẠNG TRẤU LỜI:
- Sử dụng **in đậm** cho từ khóa quan trọng
- Sử dụng bullet points (•) cho danh sách
- Chia nhỏ thông tin thành các phần rõ ràng
- Luôn kết thúc bằng câu hỏi để tương tác tiếp`
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: "user",
        content: message
      }
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Get AI response from Google Gemini
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {Promise<string>} AI response
   */
  async getGeminiResponse(message, conversationHistory = []) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log('🔍 Gemini API Key check:', {
      hasKey: !!apiKey,
      keyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'None',
      keyLength: apiKey ? apiKey.length : 0
    });
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not properly configured');
    }

    // Test if the API key is valid by checking available models first
    try {
      console.log('🔍 Testing Gemini API key validity...');
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      
      if (!modelsResponse.ok) {
        const errorText = await modelsResponse.text();
        console.error('❌ Gemini API key test failed:', errorText);
        throw new Error(`Invalid API key or no access: ${modelsResponse.status}`);
      }
      
      const modelsData = await modelsResponse.json();
      console.log('✅ Available Gemini models:', modelsData.models?.map(m => m.name) || 'None');
    } catch (keyTestError) {
      console.error('❌ Gemini API key validation failed:', keyTestError.message);
      throw new Error(`Gemini API access issue: ${keyTestError.message}`);
    }

    const prompt = `Bạn là StudySync AI, trợ lý học tập thông minh và thân thiện cho học sinh Việt Nam.

NHIỆM VỤ: Hỗ trợ học tập các môn học, giải thích khái niệm, đưa ra lời khuyên học tập hiệu quả.

PHONG CÁCH: Thân thiện, chi tiết, dễ hiểu, sử dụng emoji phù hợp.

${conversationHistory.length > 0 ? `LỊCH SỬ TRƯỚC ĐÓ:\n${conversationHistory.slice(-3).map(msg => `${msg.role === 'user' ? '👤 Học sinh' : '🤖 AI'}: ${msg.content}`).join('\n')}\n\n` : ''}👤 CÂUHỎI MỚI: ${message}

🤖 TRẢ LỜI:`;

    try {
      console.log('📤 Sending request to Gemini API...');
      
      // Try different Gemini models in order of preference
      const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro', 
        'gemini-pro'
      ];
      
      let response;
      let lastError;
      
      for (const model of models) {
        try {
          console.log(`🔄 Trying model: ${model}`);
          response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH", 
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
              ]
            })
          });

          console.log(`📥 Gemini API response status for ${model}:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('📦 Gemini API response data:', data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const responseText = data.candidates[0].content.parts[0].text;
              console.log(`✅ Gemini response received from ${model}:`, responseText.substring(0, 100) + '...');
              return responseText;
            }
          } else {
            const errorText = await response.text();
            console.warn(`⚠️ Model ${model} failed:`, errorText);
            lastError = new Error(`${model}: ${response.status} - ${errorText}`);
          }
        } catch (modelError) {
          console.warn(`⚠️ Model ${model} error:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }

      // If we get here, all models failed
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    } catch (error) {
      console.error('❌ Gemini API Error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get AI response from local/backend API
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {Promise<string>} AI response
   */
  async getLocalAIResponse(message, conversationHistory = []) {
    try {
      const response = await fetch(`${this.baseURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.slice(-10)
        })
      });

      if (!response.ok) {
        throw new Error(`Local AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Local AI API Error:', error);
      throw error;
    }
  }

  /**
   * Get fallback responses when AI services are unavailable
   * @param {string} message - User message
   * @returns {string} Fallback response
   */
  getFallbackResponse(message) {
    const responses = {
      // Greeting responses
      greetings: [
        "👋 Xin chào! Tôi là StudySync AI. Tôi có thể giúp bạn với các câu hỏi về học tập. Bạn cần hỗ trợ gì hôm nay?",
        "🌟 Chào bạn! Tôi sẵn sàng hỗ trợ bạn học tập. Hãy cho tôi biết bạn muốn tìm hiểu về chủ đề nào nhé!",
        "🎓 Hello! Tôi là trợ lý AI của StudySync. Tôi có thể giúp bạn giải đáp thắc mắc về học tập."
      ],

      // Study help responses
      study: [
        "📚 **Gợi ý học tập hiệu quả:**\n\n• **Pomodoro Technique:** Học 25 phút, nghỉ 5 phút\n• **Active Recall:** Tự kiểm tra kiến thức thay vì chỉ đọc lại\n• **Spaced Repetition:** Ôn tập theo khoảng thời gian tăng dần\n• **Teach Others:** Giải thích cho người khác để hiểu sâu hơn\n\nBạn muốn tìm hiểu chi tiết về phương pháp nào không? 🤔",
        
        "🎯 **Kế hoạch học tập thông minh:**\n\n**Bước 1:** Xác định mục tiêu cụ thể\n**Bước 2:** Chia nhỏ kiến thức thành từng phần\n**Bước 3:** Lập lịch học tập hàng ngày\n**Bước 4:** Thường xuyên đánh giá và điều chỉnh\n\nBạn đang học môn gì và cần lập kế hoạch như thế nào? 📝",
        
        "🧠 **Chiến lược ghi nhớ hiệu quả:**\n\n• **Mind Map:** Sơ đồ tư duy kết nối kiến thức\n• **Flashcards:** Thẻ ghi nhớ cho từ vựng, công thức\n• **Storytelling:** Tạo câu chuyện để nhớ thông tin\n• **Visual Learning:** Sử dụng hình ảnh, biểu đồ\n\nMôn học nào bạn đang gặp khó khăn trong việc ghi nhớ? 🎨"
      ],

      // Subject-specific responses
      math: [
        "🔢 **Toán học - Phương pháp học hiệu quả:**\n\n• **Hiểu khái niệm:** Không học thuộc lòng công thức\n• **Luyện tập đều đặn:** Giải bài tập mỗi ngày\n• **Từ dễ đến khó:** Bắt đầu với bài cơ bản\n• **Kiểm tra lại:** Xem lại cách giải để tránh sai lầm\n\nBạn đang học chương nào và gặp khó khăn gì? 🤓"
      ],

      // Group study responses
      group: [
        "👥 **Học nhóm hiệu quả với StudySync:**\n\n• **Tạo nhóm:** Tìm bạn cùng mục tiêu học tập\n• **Phân công nhiệm vụ:** Mỗi người chịu trách nhiệm một phần\n• **Thảo luận tích cực:** Chia sẻ kiến thức và giải đáp thắc mắc\n• **Đánh giá tiến độ:** Theo dõi kết quả học tập của nhóm\n\nBạn muốn tạo nhóm học môn gì? Tôi có thể gợi ý cách tổ chức! 🌟"
      ],

      // Default responses
      default: [
        "🤔 Đây là một câu hỏi thú vị! Mình cần thêm thông tin để có thể hỗ trợ bạn tốt hơn.\n\n**Tôi có thể giúp bạn:**\n• Giải thích khái niệm học tập\n• Đưa ra phương pháp học hiệu quả\n• Tạo kế hoạch học tập\n• Gợi ý tài liệu học tập\n\nBạn có thể nói rõ hơn về vấn đề bạn đang gặp phải không? 😊",
        
        "💡 Tôi hiểu bạn đang cần hỗ trợ! Để đưa ra lời khuyên phù hợp nhất, bạn có thể cho tôi biết:\n\n• Bạn đang học lớp mấy?\n• Môn học nào bạn quan tâm?\n• Vấn đề cụ thể bạn gặp phải?\n\nVí dụ: *\"Tôi học lớp 10, đang gặp khó khăn với môn Hóa học, không hiểu về liên kết hóa học\"*\n\nTôi sẽ hỗ trợ bạn một cách chi tiết nhất! 🎓"
      ]
    };

    const lowerMessage = message.toLowerCase();
    console.log(`🎯 Analyzing message for fallback response: "${lowerMessage}"`);
    
    // Add more sophisticated response selection
    let selectedResponse;
    
    // Greeting detection
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chào')) {
      selectedResponse = responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
      console.log('📋 Selected greeting response');
    }
    // Math-related questions
    else if (lowerMessage.includes('toán') || lowerMessage.includes('math') || lowerMessage.includes('phương trình') || lowerMessage.includes('tính')) {
      selectedResponse = responses.math[0];
      console.log('📋 Selected math response');
    }
    // Group study questions
    else if (lowerMessage.includes('nhóm') || lowerMessage.includes('group') || lowerMessage.includes('team')) {
      selectedResponse = responses.group[0];
      console.log('📋 Selected group study response');
    }
    // General study questions
    else if (lowerMessage.includes('học') || lowerMessage.includes('study') || lowerMessage.includes('ôn') || lowerMessage.includes('bài tập')) {
      selectedResponse = responses.study[Math.floor(Math.random() * responses.study.length)];
      console.log('📋 Selected study response');
    }
    // Subject-specific detection
    else if (lowerMessage.includes('lý') || lowerMessage.includes('physics')) {
      selectedResponse = "⚗️ **Vật lý - Học hiệu quả:**\n\n• **Hiểu hiện tượng:** Quan sát và phân tích hiện tượng thực tế\n• **Công thức:** Nắm vững và áp dụng đúng công thức\n• **Thí nghiệm:** Thực hành để hiểu bản chất\n• **Bài tập:** Giải từ dễ đến khó\n\nBạn đang học chương nào của Vật lý? 🔬";
      console.log('📋 Selected physics response');
    }
    else if (lowerMessage.includes('hóa') || lowerMessage.includes('chemistry')) {
      selectedResponse = "🧪 **Hóa học - Phương pháp học:**\n\n• **Bảng tuần hoàn:** Học thuộc và hiểu cấu trúc\n• **Phương trình:** Cân bằng và hiểu cơ chế\n• **Thí nghiệm:** Quan sát và ghi chép kỹ\n• **Tính chất:** Liên kết lý thuyết với thực tế\n\nBạn cần hỗ trợ về phần nào của Hóa học? 🔬";
      console.log('📋 Selected chemistry response');
    }
    // Default responses with more variety
    else {
      // Create more personalized default responses
      const personalizedDefaults = [
        ...responses.default,
        `🤖 Tôi nhận được câu hỏi: "${message}"\n\n💭 **Để hỗ trợ bạn tốt hơn, tôi cần:**\n• Biết môn học bạn quan tâm\n• Cấp độ học tập (lớp mấy)\n• Vấn đề cụ thể bạn gặp phải\n\nHãy chia sẻ thêm thông tin nhé! 😊`,
        
        `🎯 **Câu hỏi thú vị!** Tôi có thể giúp bạn về:\n\n📚 **Các môn học:**\n• Toán, Lý, Hóa, Sinh\n• Văn, Anh, Sử, Địa\n\n🔧 **Phương pháp học:**\n• Lập kế hoạch học tập\n• Kỹ thuật ghi nhớ\n• Học nhóm hiệu quả\n\nBạn muốn tìm hiểu về lĩnh vực nào? 🤔`,
        
        `✨ **StudySync AI đang sẵn sàng hỗ trợ!**\n\nDựa trên câu hỏi của bạn, tôi khuyên bạn nên:\n• Làm rõ môn học cần hỗ trợ\n• Chia sẻ khó khăn cụ thể\n• Cho biết mục tiêu học tập\n\nVí dụ: "Tôi học lớp 11, gặp khó với bài tập đạo hàm"\n\nHãy thử lại với thông tin chi tiết hơn! 🚀`
      ];
      
      selectedResponse = personalizedDefaults[Math.floor(Math.random() * personalizedDefaults.length)];
      console.log('📋 Selected personalized default response');
    }
    
    // Avoid repeating the same response
    if (this.lastResponses.has(selectedResponse)) {
      console.log('🔄 Response already used recently, selecting alternative...');
      
      // Try to find a different response from the same category
      const alternatives = responses.default.filter(resp => !this.lastResponses.has(resp));
      if (alternatives.length > 0) {
        selectedResponse = alternatives[Math.floor(Math.random() * alternatives.length)];
      } else {
        // Add timestamp to make it unique
        selectedResponse = selectedResponse + `\n\n⏰ *${new Date().toLocaleTimeString('vi-VN')}*`;
      }
    }
    
    // Track this response (keep only last 5)
    this.lastResponses.add(selectedResponse);
    if (this.lastResponses.size > 5) {
      const firstResponse = this.lastResponses.values().next().value;
      this.lastResponses.delete(firstResponse);
    }
    
    console.log(`✅ Fallback response selected (${selectedResponse.length} chars)`);
    return selectedResponse;
  }

  /**
   * Main method to get AI response with fallback support
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {Promise<string>} AI response
   */
  async getChatResponse(message, conversationHistory = []) {
    console.log(`🤖 Getting AI response using ${this.provider} provider...`);
    console.log(`📝 User message: "${message}"`);
    console.log(`🔧 API Key available: ${this.provider === 'openai' ? !!this.apiKey : this.provider === 'gemini' ? !!import.meta.env.VITE_GEMINI_API_KEY : 'N/A'}`);
    
    try {
      let response;
      
      switch (this.provider) {
        case 'openai':
          if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
            console.warn('🚨 OpenAI API key not properly configured, using fallback');
            return this.getFallbackResponse(message);
          }
          console.log('🔄 Calling OpenAI API...');
          response = await this.getOpenAIResponse(message, conversationHistory);
          break;
          
        case 'gemini':
          const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
            console.warn('🚨 Gemini API key not properly configured, using fallback');
            return this.getFallbackResponse(message);
          }
          console.log('🔄 Calling Gemini API...');
          try {
            response = await this.getGeminiResponse(message, conversationHistory);
          } catch (geminiError) {
            console.error('❌ Gemini API completely failed:', geminiError.message);
            console.log('🔄 Falling back to intelligent responses...');
            
            // Add a notice about AI service status
            const fallbackWithNotice = `⚠️ **Thông báo:** Dịch vụ AI đang gặp sự cố kỹ thuật. Tôi đang sử dụng chế độ trả lời thông minh.\n\n${this.getFallbackResponse(message)}\n\n🔧 **Lưu ý:** Các tính năng AI sẽ hoạt động bình thường sau khi được khắc phục.`;
            
            return fallbackWithNotice;
          }
          break;
          
        case 'local':
          console.log('🔄 Calling Local API...');
          response = await this.getLocalAIResponse(message, conversationHistory);
          break;
          
        default:
          console.warn(`🚨 Unknown provider: ${this.provider}, using fallback`);
          return this.getFallbackResponse(message);
      }
      
      console.log('✅ AI response received successfully:', response ? response.substring(0, 100) + '...' : 'Empty response');
      return response;
      
    } catch (error) {
      console.error('❌ AI service error, using fallback response:', {
        provider: this.provider,
        message: error.message,
        status: error.status
      });
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Get study suggestions based on subject
   * @param {string} subject - Subject name
   * @param {string} level - Education level
   * @returns {Promise<Object>} Study suggestions
   */
  async getStudySuggestions(subject, level = 'high-school') {
    const suggestions = {
      'toán': {
        topics: ['Đại số', 'Hình học', 'Giải tích', 'Xác suất thống kê'],
        methods: ['Làm bài tập từ cơ bản đến nâng cao', 'Vẽ sơ đồ tư duy công thức', 'Thực hành giải đề thi'],
        resources: ['Sách giáo khoa', 'Bài tập nâng cao', 'Video bài giảng online']
      },
      'lý': {
        topics: ['Cơ học', 'Nhiệt học', 'Điện học', 'Quang học'],
        methods: ['Thí nghiệm thực hành', 'Vẽ sơ đồ mạch điện', 'Giải bài tập có hình vẽ'],
        resources: ['Thí nghiệm ảo', 'Video thí nghiệm', 'Sách bài tập có lời giải']
      },
      'hóa': {
        topics: ['Hóa đại cương', 'Hóa vô cơ', 'Hóa hữu cơ', 'Hóa phân tích'],
        methods: ['Học thuộc bảng tuần hoàn', 'Viết phương trình hóa học', 'Thực hành thí nghiệm'],
        resources: ['Bảng tuần hoàn tương tác', 'Video thí nghiệm', 'Flashcards công thức']
      }
    };

    return suggestions[subject.toLowerCase()] || {
      topics: ['Chưa có dữ liệu cho môn này'],
      methods: ['Học theo sách giáo khoa', 'Tham gia nhóm học tập', 'Tìm kiếm tài liệu bổ sung'],
      resources: ['StudySync Community', 'Tài liệu online', 'Video học tập']
    };
  }

  /**
   * Generate study plan
   * @param {Object} preferences - User study preferences
   * @returns {Promise<Object>} Generated study plan
   */
  async generateStudyPlan(preferences) {
    const { subjects, timePerDay, level, goals } = preferences;
    
    // This would typically use AI to generate a personalized plan
    // For now, return a template plan
    return {
      plan: {
        daily: `Học ${timePerDay} tiếng mỗi ngày`,
        weekly: subjects.map(subject => `${subject}: 3 buổi/tuần`),
        monthly: 'Kiểm tra tiến độ và điều chỉnh kế hoạch'
      },
      schedule: subjects.map((subject, index) => ({
        subject,
        time: `${7 + index * 2}:00 - ${8 + index * 2}:00`,
        frequency: '3 lần/tuần'
      })),
      tips: [
        'Nghỉ giải lao 10 phút sau mỗi 50 phút học',
        'Ôn tập kiến thức cũ trước khi học bài mới',
        'Tham gia nhóm học để thảo luận'
      ]
    }
  }

  /**
   * Test function for debugging AI responses
   * @param {string} testMessage - Message to test
   * @returns {Promise<Object>} Test results
   */
  async testAI(testMessage = "Xin chào AI!") {
    console.log('🧪 Testing AI Service...');
    
    const testResults = {
      provider: this.provider,
      apiKeyConfigured: {
        openai: !!(this.apiKey && this.apiKey !== 'your_openai_api_key_here'),
        gemini: !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here'),
      },
      testMessage,
      startTime: Date.now()
    };

    try {
      const response = await this.getChatResponse(testMessage);
      testResults.success = true;
      testResults.response = response;
      testResults.responseLength = response.length;
      testResults.duration = Date.now() - testResults.startTime;
      
      console.log('✅ AI Test Results:', testResults);
      return testResults;
    } catch (error) {
      testResults.success = false;
      testResults.error = error.message;
      testResults.duration = Date.now() - testResults.startTime;
      
      console.error('❌ AI Test Failed:', testResults);
      return testResults;
    }
  }

  /**
   * Clear conversation cache
   */
  clearCache() {
    this.lastResponses.clear();
    this.conversationContext.clear();
    console.log('🧹 AI Service cache cleared');
  }

  /**
   * Check Gemini API status and available models
   * @returns {Promise<Object>} API status information
   */
  async checkGeminiStatus() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return {
        status: 'error',
        message: 'API key not configured',
        hasKey: false
      };
    }

    try {
      console.log('🔍 Checking Gemini API status...');
      
      // Test API key validity
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'error',
          message: `API Error: ${response.status} - ${errorText}`,
          hasKey: true,
          httpStatus: response.status
        };
      }

      const data = await response.json();
      const availableModels = data.models?.map(m => m.name.replace('models/', '')) || [];
      
      return {
        status: 'success',
        message: 'Gemini API is working',
        hasKey: true,
        availableModels,
        totalModels: availableModels.length
      };

    } catch (error) {
      return {
        status: 'error',
        message: `Network error: ${error.message}`,
        hasKey: true,
        error: error.message
      };
    }
  }
}

const aiServiceInstance = new AIService();

// Add debug functions to window for console testing
if (typeof window !== 'undefined') {
  window.debugAI = {
    test: (message) => aiServiceInstance.testAI(message),
    clearCache: () => aiServiceInstance.clearCache(),
    getProvider: () => aiServiceInstance.provider,
    checkKeys: () => ({
      openai: !!(aiServiceInstance.apiKey && aiServiceInstance.apiKey !== 'your_openai_api_key_here'),
      gemini: !!(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    }),
    fallbackTest: (message) => aiServiceInstance.getFallbackResponse(message),
    checkGemini: () => aiServiceInstance.checkGeminiStatus(),
    // Quick fix command
    fixGemini: async () => {
      console.log('🔧 Running Gemini diagnostics...');
      const status = await aiServiceInstance.checkGeminiStatus();
      console.log('📊 Gemini Status:', status);
      
      if (status.status === 'error') {
        console.log('❌ Gemini Issues Detected:');
        console.log('- Message:', status.message);
        console.log('- Has API Key:', status.hasKey);
        
        if (!status.hasKey) {
          console.log('💡 Solution: Add VITE_GEMINI_API_KEY to your .env file');
        } else if (status.httpStatus === 403) {
          console.log('💡 Solution: API key invalid or no access. Get new key from https://makersuite.google.com/app/apikey');
        } else if (status.httpStatus === 404) {
          console.log('💡 Solution: Models not available. Check your Google Cloud project settings');
        }
      } else {
        console.log('✅ Gemini is working! Available models:', status.availableModels);
      }
      
      return status;
    }
  };
  
  console.log('🎯 AI Debug tools available at window.debugAI');
  console.log('🔧 Quick commands:');
  console.log('  - window.debugAI.checkGemini() - Check API status');
  console.log('  - window.debugAI.fixGemini() - Run diagnostics');
  console.log('  - window.debugAI.test("hello") - Test AI response');
}

export default aiServiceInstance;