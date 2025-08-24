/* ========== API角色自动发送红包功能 ========== */

// 聊天主题类型
const ChatTopic = {
  CASUAL: 'casual',       // 闲聊
  CELEBRATION: 'celebration', // 庆祝
  THANKS: 'thanks',       // 感谢
  HELP: 'help',           // 求助
  WORK: 'work'            // 工作
};

// 角色心情类型
const RoleMood = {
  HAPPY: 'happy',         // 高兴
  EXCITED: 'excited',     // 兴奋
  GRATEFUL: 'grateful',   // 感激
  NORMAL: 'normal',       // 正常
  UPSET: 'upset'          // 不高兴
}

// 角色红包配置
const roleRedPacketConfig = {
  // 不同心情下发送红包的概率 (0-1)
  moodProbability: {
    [RoleMood.HAPPY]: 0.3,
    [RoleMood.EXCITED]: 0.5,
    [RoleMood.GRATEFUL]: 0.4,
    [RoleMood.NORMAL]: 0.1,
    [RoleMood.UPSET]: 0.05
  },
  
  // 不同聊天主题下发送红包的概率 (0-1)
  topicProbability: {
    [ChatTopic.CASUAL]: 0.1,
    [ChatTopic.CELEBRATION]: 0.6,
    [ChatTopic.THANKS]: 0.5,
    [ChatTopic.HELP]: 0.2,
    [ChatTopic.WORK]: 0.05
  },
  
  // 红包金额范围 (占最大金额的比例)
  amountRange: {
    min: 0.1,
    max: 0.8
  },
  
  // 红包留言模板
  messageTemplates: {
    [ChatTopic.CASUAL]: [
      '随便聊聊，红包助兴',
      '闲聊时间，发个红包',
      '开心聊天，红包来啦'
    ],
    [ChatTopic.CELEBRATION]: [
      '恭喜发财，大吉大利',
      '庆祝一下，红包拿来',
      '喜上加喜，红包给你'
    ],
    [ChatTopic.THANKS]: [
      '感谢支持，红包聊表心意',
      '真心感谢，小小红包不成敬意',
      '谢谢你，这个红包请收下'
    ],
    [ChatTopic.HELP]: [
      '谢谢你的帮助，红包奖励',
      '多亏有你，发个红包表示感谢',
      '感谢帮忙，这是一点心意'
    ],
    [ChatTopic.WORK]: [
      '工作辛苦了，红包鼓励',
      '好好工作，红包奖励',
      '工作表现不错，红包鼓励'
    ]
  }
};

// 角色配置
const roleConfigs = [
  {
    name: '李小明',
    avatar: 'img/avatar1.png',
    personality: {
      generosity: 0.8, // 慷慨程度 (0-1)
     活跃度: 0.7
    }
  },
  {
    name: '张小红',
    avatar: 'img/avatar2.png',
    personality: {
      generosity: 0.6,
     活跃度: 0.9
    }
  },
  {
    name: '王大锤',
    avatar: 'img/avatar3.png',
    personality: {
      generosity: 0.9,
     活跃度: 0.5
    }
  }
];

// 分析聊天内容，确定聊天主题
function analyzeChatTopic(message) {
  // 简单的关键词匹配，实际应用中可以使用更复杂的NLP
  const lowerMessage = message.toLowerCase();
  
  // 庆祝相关关键词
  if (lowerMessage.match(/恭喜|庆祝|生日快乐|节日快乐|新婚|乔迁|喜|成功|中奖/)) {
    return ChatTopic.CELEBRATION;
  }
  
  // 感谢相关关键词
  if (lowerMessage.match(/谢谢|感谢|谢谢|感激|多亏|感谢/)) {
    return ChatTopic.THANKS;
  }
  
  // 求助相关关键词
  if (lowerMessage.match(/帮忙|求助|需要|不会|怎么办|解决|请教/)) {
    return ChatTopic.HELP;
  }
  
  // 工作相关关键词
  if (lowerMessage.match(/工作|项目|任务|报告|会议|客户|方案/)) {
    return ChatTopic.WORK;
  }
  
  // 默认闲聊
  return ChatTopic.CASUAL;
}

// 模拟角色心情
function getRoleMood(roleName) {
  // 简化实现，实际应用中可以根据更复杂的规则
  const random = Math.random();
  
  if (random < 0.2) return RoleMood.HAPPY;
  if (random < 0.3) return RoleMood.EXCITED;
  if (random < 0.4) return RoleMood.GRATEFUL;
  if (random < 0.9) return RoleMood.NORMAL;
  return RoleMood.UPSET;
}

// 生成随机红包金额
function generateRedPacketAmount(maxAmount) {
  const { amountRange } = roleRedPacketConfig;
  const minAmount = maxAmount * amountRange.min;
  const maxPossibleAmount = maxAmount * amountRange.max;
  
  // 生成随机金额，保留2位小数
  return parseFloat((Math.random() * (maxPossibleAmount - minAmount) + minAmount).toFixed(2));
}

// 获取随机红包留言
function getRandomMessage(topic) {
  const templates = roleRedPacketConfig.messageTemplates[topic] || roleRedPacketConfig.messageTemplates[ChatTopic.CASUAL];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

// 判断是否应该发送红包
function shouldSendRedPacket(role, topic, mood) {
  const { generosity } = role.personality;
  const moodProb = roleRedPacketConfig.moodProbability[mood];
  const topicProb = roleRedPacketConfig.topicProbability[topic];
  
  // 综合计算发送概率
  const finalProbability = generosity * moodProb * topicProb;
  
  return Math.random() < finalProbability;
}

// 模拟API角色发送红包
function simulateRoleRedPacket(message = null) {
  // 如果没有消息，随机生成一个
  if (!message) {
    message = getRandomMessage(ChatTopic.CASUAL);
  }
  
  // 分析聊天主题
  const topic = analyzeChatTopic(message);
  
  // 随机选择一个角色
  const randomRoleIndex = Math.floor(Math.random() * roleConfigs.length);
  const role = roleConfigs[randomRoleIndex];
  
  // 获取角色心情
  const mood = getRoleMood(role.name);
  
  // 判断是否应该发送红包
  if (shouldSendRedPacket(role, topic, mood)) {
    // 获取最大金额
    const maxAmount = window.settings && window.settings.wallet ? 
      window.settings.wallet.redPacketMaxAmount : 200.00;
    
    // 生成红包金额
    const amount = generateRedPacketAmount(maxAmount);
    
    // 获取红包留言
    const redPacketMessage = getRandomMessage(topic);
    
    // 延迟发送红包，增加真实感
    setTimeout(() => {
      // 调用之前在美化.js中定义的函数发送红包
      if (window.sendRoleRedPacket) {
        window.sendRoleRedPacket(role.name, amount, redPacketMessage);
        console.log(`${role.name}因为${mood}的心情和${topic}的聊天主题，发送了${amount}元红包`);
      }
    }, 1000 + Math.random() * 2000); // 1-3秒的随机延迟
  }
}

// 监听聊天消息，触发角色自动发送红包
function setupAutoRedPacketListener() {
  // 根据用户需求，恢复自动发送红包的逻辑，但确保不会自动弹出红包弹窗
  // 只有用户主动点击红包时才会显示弹窗
  
  // 监听聊天输入框的发送事件
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.querySelector('.send-btn');
  
  if (chatInput && sendBtn) {
    sendBtn.addEventListener('click', function() {
      const message = chatInput.value.trim();
      if (message) {
        // 模拟角色根据用户消息发送红包
        simulateRoleRedPacket(message);
      }
    });
    
    // 监听回车键
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const message = e.target.value.trim();
        if (message) {
          // 模拟角色根据用户消息发送红包
          simulateRoleRedPacket(message);
        }
      }
    });
  }
  
  // 添加定时任务，模拟角色主动发起聊天并发送红包
  setInterval(() => {
    // 有一定概率触发，但只在聊天界面才发送红包
  const chatMessages = document.getElementById('chat-messages');
  
  // 检查是否在聊天界面（存在聊天消息区域）
  // 确保不会在页面刷新时自动触发红包弹窗
  if (chatMessages && Math.random() < 0.05) {
    simulateRoleRedPacket();
  }
  }, 30000); // 每30秒检查一次
  
  console.log('红包自动发送功能已启用，但只有用户主动点击红包才会显示弹窗');
}

// 页面加载完成后初始化
window.addEventListener('load', function() {
  // 延迟初始化，确保美化.js已经加载
  setTimeout(() => {
    setupAutoRedPacketListener();
  }, 1000);
});

// 导出函数供外部使用
export {
  simulateRoleRedPacket,
  analyzeChatTopic,
  getRoleMood
};

/* ========== 测试代码 ========== */
// 如果需要手动测试，可以取消下面的注释
/*
// 5秒后模拟发送一个红包
setTimeout(() => {
  simulateRoleRedPacket('今天真是个好日子！');
}, 5000);
*/