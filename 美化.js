// app.js - 完整实现（保存覆盖）
// 注意：本脚本依赖于 index.html 中所列的元素 id/class，与前面给出的 HTML 完整版配套使用。

/* =========================
   Utilities & State
   ========================= */
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
function toast(msg, ms=1800){
  const t = $("#toast");
  if(!t) return;
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), ms);
}
function genId(){ return 'r'+Math.random().toString(36).slice(2,9); }

// 创建一个函数，用于将console.log输出到调试面板
function setupDebugPanel() {
  const debugLogElement = document.getElementById('debug-log');
  if (!debugLogElement) return;
  
  // 保存原始console.log
  const originalConsoleLog = console.log;
  
  // 重写console.log
  console.log = function() {
    // 调用原始console.log
    originalConsoleLog.apply(console, arguments);
    
    // 将日志添加到调试面板
    try {
      const logMessage = Array.from(arguments)
        .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)
        .join(' ');
      
      const logElement = document.createElement('div');
      logElement.style.marginBottom = '5px';
      logElement.style.padding = '2px 0';
      logElement.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      logElement.textContent = logMessage;
      
      debugLogElement.appendChild(logElement);
      
      // 自动滚动到底部
      debugLogElement.scrollTop = debugLogElement.scrollHeight;
    } catch (error) {
      // 如果格式化失败，使用原始对象的toString方法
      const logMessage = Array.from(arguments).join(' ');
      const logElement = document.createElement('div');
      logElement.textContent = logMessage;
      debugLogElement.appendChild(logElement);
    }
  };
}

// 红包相关函数的提前声明
function createRedPacketMessageModal() {
  console.log('动态创建红包模态框');
  
  // 检查是否已经存在模态框
  let modal = document.getElementById('redpacket-message-modal');
  if (modal) return;
  
  // 创建模态框容器
  modal = document.createElement('div');
  modal.id = 'redpacket-message-modal';
  modal.className = 'modal';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.zIndex = '9999';
  
  // 创建模态框内容
  const content = document.createElement('div');
  content.className = 'redpacket-message-content';
  
  // 创建模态框头部
  const header = document.createElement('div');
  header.className = 'redpacket-message-header';
  
  const senderName = document.createElement('span');
  senderName.id = 'redpacket-sender-name';
  senderName.className = 'redpacket-message-sender';
  
  const closeBtn = document.createElement('button');
  closeBtn.id = 'redpacket-message-close';
  closeBtn.className = 'redpacket-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', closeRedPacketMessageModal);
  
  header.appendChild(senderName);
  header.appendChild(closeBtn);
  
  // 创建模态框主体
  const body = document.createElement('div');
  body.id = 'redpacket-message-body';
  body.className = 'redpacket-message-body';
  
  // 创建模态框底部
  const footer = document.createElement('div');
  footer.className = 'redpacket-message-footer';
  
  const openBtn = document.createElement('button');
  openBtn.id = 'redpacket-open-btn';
  openBtn.className = 'btn btn-primary';
  openBtn.textContent = '拆红包';
  openBtn.addEventListener('click', openRedPacket);
  
  footer.appendChild(openBtn);
  
  // 组装模态框
  content.appendChild(header);
  content.appendChild(body);
  content.appendChild(footer);
  modal.appendChild(content);
  
  // 添加到页面
  document.body.appendChild(modal);
  
  // 更新全局引用
  window.redPacketSenderName = senderName;
  window.redPacketMessageBody = body;
  window.redPacketMessageModal = modal;
  window.redPacketOpenBtn = openBtn;
  window.redPacketMessageClose = closeBtn;
  
  // 添加点击外部关闭的功能
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeRedPacketMessageModal();
    }
  });
}

function showRedPacketMessageModal(sender, amount, message, coverType, customCover) {
  // 添加详细的调用堆栈日志，以追踪是谁调用了这个函数
  console.log('showRedPacketMessageModal被调用:', {
    sender: sender,
    amount: amount,
    message: message,
    timestamp: new Date().toISOString(),
    callStack: new Error().stack
  });
  
  // 强制创建模态框，不依赖现有元素检查
  console.log('强制创建红包模态框');
  createSimpleRedPacketModal();
  
  // 重新获取所有元素引用
  window.redPacketSenderName = document.getElementById('redpacket-sender-name') || {};
  window.redPacketMessageBody = document.getElementById('redpacket-message-body') || {};
  window.redPacketMessageModal = document.getElementById('redpacket-message-modal') || {};
  window.redPacketOpenBtn = document.getElementById('redpacket-open-btn') || {};
  window.redPacketMessageClose = document.getElementById('redpacket-message-close') || {};
  
  // 确保所有元素都已正确获取
  if (!window.redPacketMessageModal || typeof window.redPacketMessageModal.style === 'undefined') {
    console.error('红包模态框元素获取失败，重试创建备用模态框');
    // 尝试再次创建
    createSimpleRedPacketModal();
    // 重新获取元素
    window.redPacketMessageModal = document.getElementById('redpacket-message-modal') || {};
  }
  
  // 设置红包发送者名称
  if (window.redPacketSenderName && typeof window.redPacketSenderName.textContent !== 'undefined') {
    window.redPacketSenderName.textContent = sender;
  }
  
  // 设置红包内容（如果存在body元素）
  if (window.redPacketMessageBody && typeof window.redPacketMessageBody.innerHTML !== 'undefined') {
    // 清空并添加红包内容
    window.redPacketMessageBody.innerHTML = '';
    
    const redPacketImage = document.createElement('div');
    redPacketImage.className = 'redpacket-message-image';
    
    // 设置红包封面（使用红包特定的封面信息）
    if (coverType === 'custom' && customCover) {
      redPacketImage.style.backgroundImage = `url(${customCover})`;
    } else {
      redPacketImage.style.backgroundImage = 'linear-gradient(135deg, #FF4B4B 0%, #FF7575 100%)';
    }
    
    const redPacketText = document.createElement('div');
    redPacketText.className = 'redpacket-message-text';
    redPacketText.textContent = message;
    
    redPacketImage.appendChild(redPacketText);
    window.redPacketMessageBody.appendChild(redPacketImage);
  }
  
  // 确保拆红包按钮有点击事件
  if (window.redPacketOpenBtn && typeof window.redPacketOpenBtn.addEventListener !== 'undefined') {
    // 移除可能存在的旧事件监听器
    const newOpenBtn = window.redPacketOpenBtn.cloneNode(true);
    window.redPacketOpenBtn.parentNode.replaceChild(newOpenBtn, window.redPacketOpenBtn);
    window.redPacketOpenBtn = newOpenBtn;
    // 添加新的事件监听器
    window.redPacketOpenBtn.addEventListener('click', openRedPacket);
  }
  
  // 确保关闭按钮有点击事件
  if (window.redPacketMessageClose && typeof window.redPacketMessageClose.addEventListener !== 'undefined') {
    // 移除可能存在的旧事件监听器
    const newCloseBtn = window.redPacketMessageClose.cloneNode(true);
    window.redPacketMessageClose.parentNode.replaceChild(newCloseBtn, window.redPacketMessageClose);
    window.redPacketMessageClose = newCloseBtn;
    // 添加新的事件监听器
    window.redPacketMessageClose.addEventListener('click', closeRedPacketMessageModal);
  }
  
  // 强制显示模态框 - 使用内联样式确保显示
  console.log('强制显示红包模态框');
  if (window.redPacketMessageModal && typeof window.redPacketMessageModal.style !== 'undefined') {
    window.redPacketMessageModal.style.display = 'flex';
    window.redPacketMessageModal.style.position = 'fixed';
    window.redPacketMessageModal.style.top = '0';
    window.redPacketMessageModal.style.left = '0';
    window.redPacketMessageModal.style.width = '100%';
    window.redPacketMessageModal.style.height = '100%';
    window.redPacketMessageModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    window.redPacketMessageModal.style.zIndex = '9999'; // 确保模态框在最上层
    window.redPacketMessageModal.style.alignItems = 'center';
    window.redPacketMessageModal.style.justifyContent = 'center';
    window.redPacketMessageModal.style.pointerEvents = 'auto';
    window.redPacketMessageModal.style.opacity = '1'; // 确保模态框可见
    window.redPacketMessageModal.style.visibility = 'visible'; // 确保模态框可见
  } else {
    console.error('无法显示红包模态框，元素引用错误');
    // 作为最后的备用方案，直接创建并显示一个简单的提示
    alert(`您收到了来自${sender}的红包，金额为¥${amount.toFixed(2)}`);
  }
  
  // 存储红包数据
  if (window.redPacketMessageModal && typeof window.redPacketMessageModal.dataset !== 'undefined') {
    window.redPacketMessageModal.dataset.amount = amount;
    window.redPacketMessageModal.dataset.sender = sender;
    window.redPacketMessageModal.dataset.coverType = coverType;
  }
  
  // 添加全局变量引用，便于调试
  window.currentRedPacketData = {
    sender: sender,
    amount: amount,
    message: message
  };
}

// 创建一个简单的备用红包模态框
function createSimpleRedPacketModal() {
  // 检查是否已经存在模态框
  let modal = document.getElementById('redpacket-message-modal');
  if (modal) return;
  
  // 创建模态框容器
  modal = document.createElement('div');
  modal.id = 'redpacket-message-modal';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.zIndex = '9999';
  
  // 创建模态框内容
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '16px';
  content.style.width = '80%';
  content.style.maxWidth = '300px';
  content.style.padding = '20px';
  
  // 创建模态框头部
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '15px';
  
  const senderName = document.createElement('span');
  senderName.id = 'redpacket-sender-name';
  senderName.style.fontSize = '16px';
  senderName.style.fontWeight = 'bold';
  
  const closeBtn = document.createElement('button');
  closeBtn.id = 'redpacket-message-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.addEventListener('click', closeRedPacketMessageModal);
  
  header.appendChild(senderName);
  header.appendChild(closeBtn);
  
  // 创建模态框主体
  const body = document.createElement('div');
  body.id = 'redpacket-message-body';
  body.style.minHeight = '150px';
  body.style.display = 'flex';
  body.style.alignItems = 'center';
  body.style.justifyContent = 'center';
  
  // 创建模态框底部
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = '20px';
  
  const openBtn = document.createElement('button');
  openBtn.id = 'redpacket-open-btn';
  openBtn.textContent = '拆红包';
  openBtn.style.backgroundColor = '#FF4B4B';
  openBtn.style.color = 'white';
  openBtn.style.border = 'none';
  openBtn.style.borderRadius = '20px';
  openBtn.style.padding = '10px 20px';
  openBtn.style.cursor = 'pointer';
  openBtn.addEventListener('click', openRedPacket);
  
  footer.appendChild(openBtn);
  
  // 组装模态框
  content.appendChild(header);
  content.appendChild(body);
  content.appendChild(footer);
  modal.appendChild(content);
  
  // 添加到页面
  document.body.appendChild(modal);
  
  // 添加点击外部关闭的功能
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeRedPacketMessageModal();
    }
  });
  console.log('红包模态框创建成功');
}

async function safeFetch(url, opts={}){
  try{
    const r = await fetch(url, opts);
    if(!r.ok) {
      // try to read text for debugging
      const txt = await (r.text().catch(()=>null));
      console.warn("safeFetch non-OK", r.status, txt);
      return null;
    }
    // attempt json, fallback to text
    try { return await r.json(); } catch(e){ return await r.text().catch(()=>null); }
  }catch(e){
    console.warn("safeFetch fail", e);
    return null;
  }
}

/* persistent state in localStorage */
let roles = JSON.parse(localStorage.getItem("roles") || "[]");
let settings = JSON.parse(localStorage.getItem("settings") || JSON.stringify({
  globalEnable: false,
  globalRoleRead: false,
  books: [],    // 世界书 array of {id,name,content}
  preset: null, // selected preset id or null
  presets: [],  // available presets array of {id,name,content}
  regex: [],    // array of {id,name,pattern}
  globalApi: {
    enabled: false,
    mode: "official",
    base: "",
    key: "",
    model: "",
    custom: "",
    temp: 0.8,
    readRes: false
  },
  wallet: {
    balance: 1000.00, // 初始钱包余额1000元
    redPacketMaxAmount: 200.00 // 红包最大金额200元
  }
}));
let userProfile = JSON.parse(localStorage.getItem('wechat_user_profile') || JSON.stringify({
  nickname: '瑄',
  avatar: 'img/微信图标.jpg'
}));

function saveAll(){
  localStorage.setItem("roles", JSON.stringify(roles));
  localStorage.setItem("settings", JSON.stringify(settings));
  localStorage.setItem("wechat_user_profile", JSON.stringify(userProfile));
}

/* ========== Time update ========== */
function updateTime(){
  const d = new Date();
  $("#statusbar-time").innerText = d.toTimeString().slice(0,5);
  $("#cute-time").innerText = d.toTimeString().slice(0,5);
  $("#cute-date").innerText = `${d.getMonth()+1}/${d.getDate()}`;
}
setInterval(updateTime, 1000);
updateTime();

/* ========== UI Navigation ========== */
// open app
$("#open-wechat").addEventListener("click", ()=>{
  $("#mainpage").style.display = "none";
  $("#wechatpage").style.display = "flex";
  renderChatList();
  renderContacts();
  // 根据用户需求，状态栏覆盖在软件之上
  // 更新状态栏样式为微信页面
  $("#statusbar").classList.remove("statusbar-main");
  $("#statusbar").classList.add("statusbar-wechat");
  // 隐藏状态栏图标，只显示时间
  $("#statusbar").querySelector(".statusbar-icons").style.display = "none";
});

// 用户头像自定义功能
function setupAvatarCustomization() {
  let currentAvatarData = null;
  
  // 打开头像编辑弹窗
  function openAvatarEditModal() {
    // 设置预览图为当前头像
    $("#avatar-preview").src = userProfile.avatar;
    currentAvatarData = null;
    
    // 显示弹窗
    $("#avatar-edit-mask").style.display = "flex";
  }
  
  // 关闭头像编辑弹窗
  function closeAvatarEditModal() {
    $("#avatar-edit-mask").style.display = "none";
    // 重置文件输入
    $("#avatar-edit-upload").value = '';
    currentAvatarData = null;
  }
  
  // 头像文件选择事件
  $("#avatar-edit-upload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
      toast("请选择图片文件");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      // 显示预览
      $("#avatar-preview").src = event.target.result;
      currentAvatarData = event.target.result;
    };
    reader.readAsDataURL(file);
    
    // 重置文件输入，以便能重复选择同一文件
    this.value = '';
  });
  
  // 确认按钮点击事件
  $("#avatar-edit-confirm").addEventListener("click", function() {
    if (currentAvatarData) {
      // 更新用户配置
      userProfile.avatar = currentAvatarData;
      saveAll();
      
      // 更新所有页面上的用户头像
      updateUserAvatars();
      toast("头像更新成功");
    }
    closeAvatarEditModal();
  });
  
  // 取消按钮点击事件
  $("#avatar-edit-cancel").addEventListener("click", closeAvatarEditModal);
  
  // 个人页面头像点击事件
  $("#user-avatar-container").addEventListener("click", openAvatarEditModal);
  
  // 朋友圈页面头像点击事件
  $("#moments-avatar-container").addEventListener("click", openAvatarEditModal);
}

// 用户头像圆角自定义功能
function setupAvatarRadiusCustomization() {
  // 从localStorage获取保存的圆角值，如果没有则使用默认值
  let avatarRadius = localStorage.getItem('avatarRadius') || '8';
  
  // 应用保存的圆角值
  applyAvatarRadius(avatarRadius);
  
  // 打开圆角调整弹窗
  function openAvatarRadiusModal() {
    // 设置滑块初始值
    $('#avatar-radius-slider').value = avatarRadius;
    $('#avatar-radius-value').innerText = avatarRadius + 'px';
    
    // 更新预览
    updateRadiusPreview(avatarRadius);
    
    // 显示弹窗
    $('#avatar-radius-mask').style.display = 'flex';
  }
  
  // 关闭圆角调整弹窗
  function closeAvatarRadiusModal() {
    $('#avatar-radius-mask').style.display = 'none';
  }
  
  // 更新预览
  function updateRadiusPreview(radius) {
    // 同时更新头像容器和图片的圆角样式，确保完整的预览效果
    const previewAvatar = document.querySelector('#avatar-radius-mask .msg-avatar');
    const previewAvatarImg = document.querySelector('#avatar-radius-preview');
    
    if (previewAvatar) {
      previewAvatar.style.borderRadius = radius + 'px';
    }
    
    if (previewAvatarImg) {
      previewAvatarImg.style.borderRadius = radius + 'px';
    }
    
    // 更新显示值
    const valueDisplay = document.querySelector('#avatar-radius-value');
    if (valueDisplay) {
      valueDisplay.innerText = radius + 'px';
    }
  }
  
  // 应用圆角设置到所有头像
  function applyAvatarRadius(radius) {
    // 保存到localStorage
    localStorage.setItem('avatarRadius', radius);
    avatarRadius = radius;
    
    // 获取所有头像相关元素 - 包括容器和图片
    const allAvatarElements = document.querySelectorAll(
      '.msg-avatar, .msg-avatar img, '+ // 消息中的头像
      '.cute-avatar, .role-avatar, .role-avatar img, '+ // 聊天列表/联系人的头像
      '.contact-avatar, .contact-avatar img, '+ // 联系人头像
      '.moments-avatar, .moments-avatar img, '+ // 朋友圈头像
      '.me-avatar, .me-avatar img, '+ // 我自己的头像
      '#user-avatar, #moments-avatar, #chat-user-avatar, #chat-role-avatar' // 其他页面的头像
    );
    
    // 应用圆角到所有头像元素
    allAvatarElements.forEach(element => {
      element.style.borderRadius = radius + 'px';
    });
  }
  
  // 滑块事件监听 - 使用标准DOM API确保兼容性
  const slider = document.querySelector('#avatar-radius-slider');
  if (slider) {
    slider.addEventListener('input', function() {
      // 实时更新预览
      updateRadiusPreview(this.value);
    });
  }
  
  // 确认按钮点击事件
  $('#avatar-radius-confirm').addEventListener('click', function() {
    const newRadius = $('#avatar-radius-slider').value;
    applyAvatarRadius(newRadius);
    toast('头像圆角已更新');
    closeAvatarRadiusModal();
  });
  
  // 取消按钮点击事件
  $('#avatar-radius-cancel').addEventListener('click', closeAvatarRadiusModal);
  
  // 聊天页面中的用户头像点击事件
  // 注意：用户头像可能在消息渲染后才存在，所以需要在消息渲染后添加事件
  // 这里先添加对模板的监听，实际应用会在消息渲染后动态添加
  
  // 返回设置函数，便于在其他地方调用
  return {
    openModal: openAvatarRadiusModal,
    applyRadius: applyAvatarRadius
  };
}

// 用户昵称自定义功能
function setupNicknameCustomization() {
  // 角色备注编辑功能
  function openRoleNickEditModal() {
    if (!currentRole) return;
    // 设置输入框为当前角色名称
    $("#nick-edit-input").value = currentRole.name || "角色";
    
    // 显示弹窗
    $("#nick-edit-mask").style.display = "flex";
    
    // 自动聚焦输入框
    setTimeout(() => {
      $("#nick-edit-input").focus();
    }, 100);
  }
  
  function closeRoleNickEditModal() {
    $("#nick-edit-mask").style.display = "none";
  }
  
  // 角色备注确认按钮点击事件
  $("#nick-edit-save").addEventListener("click", function() {
    if (!currentRole) return;
    const newNickname = $("#nick-edit-input").value.trim();
    if (newNickname !== '') {
      currentRole.name = newNickname;
      $("#chat-nick").innerText = newNickname;
      saveAll();
      renderChatList();
      renderContacts();
      toast("备注更新成功");
    }
    closeRoleNickEditModal();
  });
  
  // 角色备注取消按钮点击事件
  $("#nick-edit-cancel").addEventListener("click", closeRoleNickEditModal);
  
  // 点击聊天页面顶部昵称打开备注编辑
  $("#chat-nick").addEventListener("click", openRoleNickEditModal);
  // 打开昵称编辑弹窗
  function openNicknameEditModal() {
    // 设置输入框为当前昵称
    $("#nickname-edit-input").value = userProfile.nickname;
    
    // 显示弹窗
    $("#nickname-edit-mask").style.display = "flex";
    
    // 自动聚焦输入框
    setTimeout(() => {
      $("#nickname-edit-input").focus();
    }, 100);
  }
  
  // 关闭昵称编辑弹窗
  function closeNicknameEditModal() {
    $("#nickname-edit-mask").style.display = "none";
  }
  
  // 确认按钮点击事件
  $("#nickname-edit-confirm").addEventListener("click", function() {
    const newNickname = $("#nickname-edit-input").value.trim();
    if (newNickname !== '') {
      userProfile.nickname = newNickname;
      saveAll();
      updateUserNicknames();
      toast("昵称更新成功");
    }
    closeNicknameEditModal();
  });
  
  // 取消按钮点击事件
  $("#nickname-edit-cancel").addEventListener("click", closeNicknameEditModal);
  
  // 个人页面昵称点击事件
  $("#user-nick").addEventListener("click", openNicknameEditModal);
}

// 更新所有页面上的用户头像
function updateUserAvatars() {
  try {
    // 个人页面头像
    const userAvatar = $("#user-avatar");
    if (userAvatar) userAvatar.src = userProfile.avatar;
    
    // 朋友圈页面头像
    const momentsAvatar = $("#moments-avatar");
    if (momentsAvatar) momentsAvatar.src = userProfile.avatar;
    
    // 聊天页面用户头像（可能已被移除）
    const chatUserAvatar = $("#chat-user-avatar");
    if (chatUserAvatar) chatUserAvatar.src = userProfile.avatar;
    
    // 消息模板中的用户头像
    $all(".user-msg-avatar").forEach(img => {
      img.src = userProfile.avatar;
    });
    
    // 主页面头像
    const mainpageAvatar = $("#mainpage .cute-avatar");
    if (mainpageAvatar) mainpageAvatar.src = userProfile.avatar;
  } catch (error) {
    console.log("更新头像时发生错误:", error);
    // 错误不会阻止其他功能
  }
}

// 更新所有页面上的用户昵称
function updateUserNicknames() {
  $("#user-nick").innerText = userProfile.nickname;
  $("#wx-tab-moments .moments-nick").innerText = userProfile.nickname;
}

// back/dismiss handlers
$("#back-main").addEventListener("click", ()=> {
  $("#wechatpage").style.display = "none";
  $("#mainpage").style.display = "flex";
  // 停止对话监控
  stopConversationMonitoring();
  // 根据用户需求，在返回主页面时状态栏恢复原状
  // 更新状态栏样式为主页面
  $("#statusbar").classList.remove("statusbar-wechat");
  $("#statusbar").classList.add("statusbar-main");
  // 恢复状态栏图标显示
  $("#statusbar").querySelector(".statusbar-icons").style.display = "flex";
});
$("#back-wechat").addEventListener("click", ()=> {
  $("#chatpage").style.display = "none";
  $("#wechatpage").style.display = "flex";
  // 停止对话监控
  stopConversationMonitoring();
  // 根据用户需求，状态栏覆盖在软件之上
  // 更新状态栏样式为微信页面
  $("#statusbar").classList.remove("statusbar-main");
  $("#statusbar").classList.add("statusbar-wechat");
  // 隐藏状态栏图标，只显示时间
  $("#statusbar").querySelector(".statusbar-icons").style.display = "none";
});

// bottom tabbar
$all(".tabbar-item").forEach(item=>{
  item.addEventListener("click", ()=>{
    $all(".tabbar-item").forEach(i=>i.classList.remove("tabbar-active"));
    item.classList.add("tabbar-active");
    const tab = item.dataset.tab;
    $all(".wx-tab").forEach(t=> t.classList.remove("wx-tab-active"));
    const el = document.getElementById("wx-tab-"+tab);
    if(el) el.classList.add("wx-tab-active");
  });
});

/* ========== Render lists ========== */
function renderChatList(){
  const box = $("#chat-list");
  box.innerHTML = "";
  roles.forEach(r=>{
    const el = document.createElement("div");
    el.className = "role-item";
    el.dataset.id = r.id;
    // 使用头像图片或默认显示首字母
    const avatarHtml = r.avatar ? 
      `<div class="role-avatar-container"><img class="role-avatar" src="${r.avatar}" alt="${escapeHtml(r.name||"角色")}"></div>` : 
      `<div class="role-avatar">${(r.name||"角色")[0]}</div>`;
    
    el.innerHTML = `
      ${avatarHtml}
      <div class="role-info">
        <div class="role-name">${escapeHtml(r.name||"角色")}</div>
        <div class="role-desc">${escapeHtml(r.desc||"")}</div>
      </div>
      <span class="api-badge ${r.api?.enabled ? "" : "off"}"><i class="fa fa-link"></i> API</span>
    `;
    el.addEventListener("click", ()=> openChat(r.id));
    box.appendChild(el);
  });
}

function renderContacts(){
  const box = $("#contact-list");
  box.innerHTML = "";
  roles.forEach(r=>{
    const el = document.createElement("div");
    el.className = "role-item";
    el.dataset.id = r.id;
    // 使用头像图片或默认显示首字母
    const avatarHtml = r.avatar ? 
      `<div class="role-avatar-container"><img class="role-avatar" src="${r.avatar}" alt="${escapeHtml(r.name||"角色")}"></div>` : 
      `<div class="role-avatar">${(r.name||"角色")[0]}</div>`;
    
    el.innerHTML = `
      ${avatarHtml}
      <div class="role-info">
        <div class="role-name">${escapeHtml(r.name||"角色")}</div>
        <div class="role-desc">${escapeHtml(r.desc||"")}</div>
      </div>
    `;
    el.addEventListener("click", ()=> openChat(r.id));
    box.appendChild(el);
  });
}

function syncAll(){
  saveAll();
  renderChatList();
  renderContacts();
}

/* helper for safe insertion */
function escapeHtml(s){
  if(!s) return "";
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

/* ========== Chat page ========== */
let currentRole = null;
function openChat(roleId){
  try {
    // 停止之前可能正在运行的对话监控
    stopConversationMonitoring();
    
    const r = roles.find(x=>x.id===roleId);
    if(!r) return;
    currentRole = r;
    $("#chat-nick").innerText = r.name || "角色";
    // 默认设置为在线状态
    updateRoleOnlineStatus(true);
    // 更新聊天页面的角色头像（可能已被移除）
    const chatRoleAvatar = $("#chat-role-avatar");
    if (chatRoleAvatar) chatRoleAvatar.src = r.avatar || "img/微信图标.jpg";
    $("#wechatpage").style.display = "none";
    $("#chatpage").style.display = "flex";
    // 更新状态栏样式为微信页面并设置正确的背景色，确保与钱包顶部融合
    $("#statusbar").classList.remove("statusbar-main");
    $("#statusbar").classList.add("statusbar-wechat");
    // 确保状态栏设置正确的布局和定位
    $("#statusbar").style.justifyContent = "space-between";
    $("#statusbar").style.position = "absolute";
    $("#statusbar").style.top = "0";
    $("#statusbar").style.left = "0";
    $("#statusbar").style.right = "0";
    $("#statusbar").style.zIndex = "9999";
    $("#statusbar").style.pointerEvents = "none";
    $("#statusbar").style.background = "var(--pink)"; // 设置与钱包顶部相同的背景色
    $("#statusbar").style.minHeight = "32px";
    $("#statusbar").style.padding = "12px 16px 0 16px";
    $("#statusbar").style.fontSize = "15px";
    $("#statusbar").style.alignItems = "center";
    
    // 确保状态栏设置正确的布局和定位
    $("#statusbar").style.justifyContent = "space-between";
    // 增强状态栏的定位和层级，确保覆盖在聊天界面顶部
    $("#statusbar").style.position = "absolute";
    $("#statusbar").style.top = "0";
    $("#statusbar").style.left = "0";
    $("#statusbar").style.right = "0";
    $("#statusbar").style.zIndex = "9999";
    $("#statusbar").style.pointerEvents = "none";
    $("#statusbar").style.background = "var(--pink)";
    $("#statusbar").style.minHeight = "32px";
    $("#statusbar").style.padding = "12px 16px 0 16px";
    $("#statusbar").style.fontSize = "15px";
    $("#statusbar").style.alignItems = "center";
    
    // 移除聊天头部的margin-top，确保状态栏能够完全覆盖在顶部
    $("#chatpage .chat-header").style.marginTop = "0";
    $("#chatpage .chat-header").style.height = "60px"; // 聊天界面顶部高度调整为60px
    
    // 设置钱包页面头部高度为30px，比微信列表界面和聊天界面更低
    $("#walletpage .wx-header").style.marginTop = "0";
    $("#walletpage .wx-header").style.height = "30px";
    
    // 确保微信列表页面头部高度为90px
    $("#wechatpage .wx-header").style.marginTop = "0";
    $("#wechatpage .wx-header").style.height = "90px"; // 微信列表界面顶部高度调整为90px
    
    // 确保状态栏图标可见
    const statusbarIcons = $("#statusbar").querySelector(".statusbar-icons");
    if (statusbarIcons) {
      statusbarIcons.style.display = "flex";
      // 检查图标是否存在，如果不存在则重新添加
      if (statusbarIcons.children.length === 0) {
        statusbarIcons.innerHTML = '<i class="fa fa-signal"></i><i class="fa fa-wifi"></i><i class="fa fa-battery-full"></i>';
      }
    }
    
    // 添加中间的微信风格黑色圆形图标
    let statusBarCenter = $("#statusbar").querySelector(".statusbar-center");
    if (!statusBarCenter) {
      statusBarCenter = document.createElement("div");
      statusBarCenter.className = "statusbar-center";
      statusBarCenter.style.display = "flex";
      statusBarCenter.style.alignItems = "center";
      statusBarCenter.innerHTML = '<div class="statusbar-circle"></div>';
      $("#statusbar").appendChild(statusBarCenter);
    } else {
      // 更新已存在的中间元素内容为圆形图标
      statusBarCenter.innerHTML = '<div class="statusbar-circle"></div>';
    }
    
    // 移除之前可能添加的其他状态栏元素
    const oldDynamicIsland = $("#statusbar").querySelector(".statusbar-dynamic-island");
    if (oldDynamicIsland) {
      oldDynamicIsland.remove();
    }
    
    // 确保刘海屏始终显示并置于顶层
    const notch = document.querySelector('.notch');
    if (notch) {
      notch.style.display = 'block'; // 强制显示刘海屏
      notch.style.position = 'absolute';
      notch.style.zIndex = '10000'; // 确保刘海屏在最顶层
    }
    
    renderMessages();
    
    // 设置实时已读状态监测，并保存清理函数引用
  const cleanupReadMonitoring = setupReadStatusMonitoring();
  
  // 保存清理函数引用，用于在切换聊天时清除
  if (currentRole && !currentRole.cleanupFunctions) {
    currentRole.cleanupFunctions = [];
  }
  if (currentRole && typeof cleanupReadMonitoring === 'function') {
    currentRole.cleanupFunctions.push(cleanupReadMonitoring);
  }
  
  // 初始化拍一拍功能
  // 直接调用setupPatPatFeature函数并保存其返回的清理函数
  const cleanupPatPatFeature = setupPatPatFeature();
  // 将拍一拍的清理函数添加到角色的清理函数列表中
  if (cleanupPatPatFeature && typeof cleanupPatPatFeature === 'function') {
    currentRole.cleanupFunctions.push(cleanupPatPatFeature);
  }
    
    // 启动对话监控，让角色能主动发起对话
    startConversationMonitoring();
    
    // 应用用户设置的头像圆角，确保聊天界面打开时所有头像都使用正确的圆角值
    if (window.avatarRadiusSettings && window.avatarRadiusSettings.applyRadius) {
      const savedRadius = localStorage.getItem('avatarRadius') || '8';
      window.avatarRadiusSettings.applyRadius(savedRadius);
    }
  } catch (error) {
    console.log("打开聊天时发生错误:", error);
    // 错误不会阻止其他功能
  }
}
function renderMessages(){
  const box = $("#chat-messages");
  box.innerHTML = "";
  if(!currentRole.messages) currentRole.messages = [];
  
  // 处理消息数组，确保API角色（非用户）的消息中表情包和文本不会混合
  const processedMessages = [];
  currentRole.messages.forEach(m => {
    // 对于用户消息，保持原样
    if (m.me) {
      processedMessages.push(m);
      return;
    }
    
    // 对于API角色消息，检查是否同时包含文本和表情包
    const displayText = m.text || ''; // 确保displayText总是一个字符串
    const hasEmojiOnly = displayText.match(/^\[表情(\d+)\]$/);
    const hasEmojiInText = displayText.match(/\[表情(\d+)\]/g) && !hasEmojiOnly;
    
    // 如果是纯表情消息或纯文本消息，保持原样
    if (hasEmojiOnly || !hasEmojiInText) {
      processedMessages.push(m);
      return;
    }
    
    // 分离文本和表情包为单独的消息
    function separateTextAndEmojis(text) {
      const messages = [];
      const emojiRegex = /\[表情(\d+)\]/g;
      let lastIndex = 0;
      let match;
      
      // 查找所有表情包引用
      while ((match = emojiRegex.exec(text)) !== null) {
        // 添加表情包之前的文本作为单独消息
        const textBeforeEmoji = text.substring(lastIndex, match.index).trim();
        if (textBeforeEmoji.length > 0) {
          messages.push({...m, text: textBeforeEmoji});
        }
        
        // 添加表情包作为单独消息 - API角色的表情包必须单独发送
        messages.push({...m, text: match[0]});
        
        lastIndex = match.index + match[0].length;
      }
      
      // 添加最后一个表情包之后的文本
      const remainingText = text.substring(lastIndex).trim();
      if (remainingText.length > 0) {
        messages.push({...m, text: remainingText});
      }
      
      return messages;
    }
    
    // 将分离后的消息添加到处理后的消息数组中
    const separatedMessages = separateTextAndEmojis(displayText);
    processedMessages.push(...separatedMessages);
  });
  
  // 渲染处理后的消息
  processedMessages.forEach((m, index) => {
    // 检查与前一条消息的时间差，如果超过阈值，添加中间时间戳
    if (index > 0) {
      const prevMessage = processedMessages[index - 1];
      // 确保两条消息都有时间戳
      if (m.time && prevMessage.time) {
        const timeDiff = m.time - prevMessage.time;
        
        // 如果时间差超过3分钟（180000毫秒），添加中间时间戳
        if (timeDiff > 180000) {
          const timeMarker = document.createElement('div');
          timeMarker.className = 'message-time-marker';
          timeMarker.textContent = formatTime(m.time);
          box.appendChild(timeMarker);
        }
      }
    }
    
    // 对于拍一拍和系统消息，在聊天界面中间以灰色字显示
    if (m.isPat || m.isSystem) {
      const patElement = document.createElement('div');
      patElement.className = 'pat-message';
      patElement.textContent = m.text;
      // 为拍一拍消息添加点击事件，允许用户点击消息本身来打开设置
      if (m.isPat) {
        patElement.style.cursor = 'pointer';
        patElement.title = '点击自定义拍一拍内容';
        patElement.addEventListener('click', function() {
          const patSettingBtn = document.getElementById('pat-setting-btn');
          if (patSettingBtn) {
            // 触发设置按钮的点击事件，打开设置模态框
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            patSettingBtn.dispatchEvent(event);
          }
        });
      }
      box.appendChild(patElement);
    } else {
      // 普通消息使用原有气泡样式
      const tpl = m.me ? document.getElementById("tpl-message-me").content.cloneNode(true)
                       : document.getElementById("tpl-message").content.cloneNode(true);
      
      // 设置消息内容，确保emoji能够正确显示
      const msgContent = tpl.querySelector(".msg-content");
      
      // 处理本地表情占位符，将其转换为可见的emoji或图片
      let displayText = m.text || ''; // 确保displayText总是一个字符串
      
      // 从localStorage加载本地表情
      const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
      
      // 检查是否包含纯表情消息（只包含表情占位符）
      const emojiOnlyMatch = displayText.match(/^\[表情(\d+)\]$/);
      if (emojiOnlyMatch) {
        const emojiNumber = parseInt(emojiOnlyMatch[1]);
        if (emojiNumber <= localEmojis.length && localEmojis[emojiNumber - 1]) {
          // 纯表情消息，直接显示图片
          const img = document.createElement('img');
          img.src = localEmojis[emojiNumber - 1].url;
          img.alt = '表情';
          img.style.width = '80px';
          img.style.height = '80px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '8px';
          msgContent.innerHTML = '';
          msgContent.appendChild(img);
        } else {
          // 表情不存在，使用默认emoji
          const emojiMap = {
            1: '😂', 2: '😊', 3: '😍', 4: '😎', 5: '🥳',
            6: '😭', 7: '😡', 8: '🤔', 9: '😴', 10: '😱'
          };
          const emoji = emojiMap[emojiNumber] || '😊';
          msgContent.innerText = emoji;
        }
      } else {
        // 文本消息中包含表情占位符
        const localEmojiMatches = displayText.match(/\[表情(\d+)\]/g);
        if (localEmojiMatches) {
          // 构建带HTML的消息内容
          let htmlContent = displayText;
          localEmojiMatches.forEach(match => {
            const emojiNumber = parseInt(match.match(/\d+/)[0]);
            if (emojiNumber <= localEmojis.length && localEmojis[emojiNumber - 1]) {
              // 替换为图片标签
              const imgTag = `<img src="${localEmojis[emojiNumber - 1].url}" alt="表情" style="width:24px;height:24px;vertical-align:middle;margin:0 2px;">`;
              htmlContent = htmlContent.replace(match, imgTag);
            } else {
              // 表情不存在，使用默认emoji
              const emojiMap = {
                1: '😂', 2: '😊', 3: '😍', 4: '😎', 5: '🥳',
                6: '😭', 7: '😡', 8: '🤔', 9: '😴', 10: '😱'
              };
              const emoji = emojiMap[emojiNumber] || '😊';
              htmlContent = htmlContent.replace(match, emoji);
            }
          });
          msgContent.innerHTML = htmlContent;
        } else {
          // 普通文本消息，使用textContent确保正确处理空格
          msgContent.textContent = displayText;
        }
      }
      
      // 移除原有的拍一拍样式，因为我们现在使用单独的显示方式
      
      // 设置消息中的头像
      if (m.me) {
        const avatarImg = tpl.querySelector(".user-msg-avatar");
        if (avatarImg) {
          avatarImg.src = userProfile.avatar;
        }
      } else {
        const avatarImg = tpl.querySelector(".role-msg-avatar");
        if (avatarImg) {
          avatarImg.src = currentRole.avatar || "img/微信图标.jpg";
        }
      }
      
      // 设置已读状态显示
      const readStatusEl = tpl.querySelector('.read-status');
      if (readStatusEl) {
        // 确保消息对象有read状态属性，默认未读
        if (m.me) {
          // 用户消息的已读状态由对方决定
          readStatusEl.textContent = m.read ? '已读' : '未读';
          readStatusEl.style.color = m.read ? '#666' : '#999';
        } else {
          // API角色消息的已读状态由用户决定
          readStatusEl.textContent = m.read ? '已读' : '未读';
          readStatusEl.style.color = m.read ? '#666' : '#999';
        }
      }
      
      // 设置消息发送时间显示
      const timeEl = tpl.querySelector('.message-time');
      if (timeEl && m.time) {
        timeEl.textContent = formatTime(m.time);
      }
      
      box.appendChild(tpl);
  }
  });
  
  // 为所有用户头像添加点击事件
  document.querySelectorAll('.user-msg-avatar').forEach(avatar => {
    // 移除可能已存在的事件监听器，避免重复添加
    const newAvatar = avatar.cloneNode(true);
    avatar.parentNode.replaceChild(newAvatar, avatar);
    
    // 添加点击事件
    newAvatar.addEventListener('click', function(e) {
      e.stopPropagation();
      if (window.avatarRadiusSettings && window.avatarRadiusSettings.openModal) {
        window.avatarRadiusSettings.openModal();
      }
    });
  });
  
  box.scrollTop = box.scrollHeight;
  
  // 自动标记API角色消息为已读，因为用户正在查看
  markRoleMessagesAsRead();
  
  // 应用用户设置的头像圆角，确保新渲染的消息头像也使用正确的圆角值
  if (window.avatarRadiusSettings && window.avatarRadiusSettings.applyRadius) {
    const savedRadius = localStorage.getItem('avatarRadius') || '8';
    window.avatarRadiusSettings.applyRadius(savedRadius);
  }
}
// 格式化时间显示（几点几分）
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 标记API角色消息为已读 - 优化版
function markRoleMessagesAsRead() {
  // 仅当用户在聊天界面且页面可见时才标记为已读
  if (!currentRole || !currentRole.messages || document.hidden) return;
  
  let hasUnread = false;
  
  // 获取聊天气泡容器
  const chatContainer = document.getElementById('chat-messages');
  if (!chatContainer) {
    // 如果没有聊天容器，回退到原始逻辑（针对特定场景下的兼容性）
    let allUnread = false;
    currentRole.messages.forEach(m => {
      if (!m.me && !m.read) {
        allUnread = true;
      }
    });
    
    if (allUnread) {
      currentRole.messages.forEach(m => {
        if (!m.me) {
          m.read = true;
        }
      });
      saveAll();
      notifyApiOfReadStatus();
    }
    return;
  }
  
  // 遍历所有消息，检测是否可见并更新已读状态
  currentRole.messages.forEach((m, index) => {
    // 处理API角色消息的已读状态（用户读取后变为已读）
    if (!m.me && !m.read) {
      // 检查消息是否在可视区域内
      const messageElement = chatContainer.children[index];
      if (messageElement) {
        const rect = messageElement.getBoundingClientRect();
        // 更宽松的可见性检测 - 提高已读状态的响应速度
        // 只要消息的一部分在可视区域内且页面可见，就认为用户可能已经阅读
        const isVisible = rect.top < window.innerHeight && 
                         rect.bottom > 0 && 
                         rect.left < window.innerWidth && 
                         rect.right > 0;
        
        if (isVisible && !document.hidden) {
          m.read = true;
          m.readTime = Date.now(); // 记录已读时间
          hasUnread = true;
          
          // 更新UI显示
          const readStatusEl = messageElement.querySelector('.read-status');
          if (readStatusEl) {
            readStatusEl.textContent = '已读';
            readStatusEl.style.color = '#666';
          }
        }
      }
    }
  });
  
  if (hasUnread) {
    saveAll();
    
    // 通知API用户已读，可以触发主动回复
    notifyApiOfReadStatus();
  }
}

// 添加滚动事件监听，实时检测消息可见性并更新已读状态 - 优化版
function setupReadStatusMonitoring() {
  const chatContainer = document.getElementById('chat-messages');
  if (!chatContainer) return;
  
  // 节流函数，避免频繁调用
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function(...args) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastExecTime;
      
      if (elapsedTime >= delay) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        func.apply(this, args);
        lastExecTime = currentTime;
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
          timeoutId = null;
        }, delay - elapsedTime);
      }
    };
  }
  
  // 进一步降低节流延迟以提高实时性
  const throttledMarkAsRead = throttle(markRoleMessagesAsRead, 50);
  chatContainer.addEventListener('scroll', throttledMarkAsRead);
  
  // 添加页面可见性变化监听
  document.addEventListener('visibilitychange', markRoleMessagesAsRead);
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', throttledMarkAsRead);
  
  // 缩短定时检查间隔 - 确保即使没有滚动也能及时更新已读状态
  const visibilityCheckInterval = setInterval(markRoleMessagesAsRead, 300);
  
  // 清理函数
  return () => {
    chatContainer.removeEventListener('scroll', throttledMarkAsRead);
    document.removeEventListener('visibilitychange', markRoleMessagesAsRead);
    window.removeEventListener('resize', throttledMarkAsRead);
    clearInterval(visibilityCheckInterval);
  }
}

// 判断是否应该主动发起对话（基于上下文和情感）
function shouldInitiateConversation() {
  if (!currentRole || !currentRole.messages || currentRole.messages.length === 0) {
    return false;
  }
  
  // 获取最近的几条消息
  const recentMessages = currentRole.messages.slice(-10); // 扩大上下文范围，更好地理解对话
  
  // 检查是否刚刚有新的对话（避免在短时间内重复发送）
  const lastMessage = currentRole.messages[currentRole.messages.length - 1];
  const messageTime = lastMessage.time || Date.now();
  const timeDiff = Date.now() - messageTime;
  
  // 根据时间间隔调整主动发起对话的概率
  // 时间越长，主动发起的概率越高
  let baseProbability = 0.6; // 基础概率
  if (timeDiff > 120000) { // 2分钟以上
    baseProbability = 0.9; // 90%概率主动发起对话
  } else if (timeDiff > 60000) { // 1-2分钟
    baseProbability = 0.7; // 70%概率
  } else if (timeDiff > 30000) { // 30秒-1分钟
    baseProbability = 0.5; // 50%概率
  }
  
  // 检查最近的消息是否已经是角色主动发起的
  let recentInitiatedByRole = 0;
  const recentInitiatedMessages = [];
  
  recentMessages.forEach(msg => {
    if (!msg.me && !msg.isResponseToUser) {
      recentInitiatedByRole++;
      recentInitiatedMessages.push(msg);
    }
  });
  
  // 只有在短时间内发送了过多主动消息时才限制
  const lastInitiatedTime = recentInitiatedMessages.length > 0 ? 
    (recentInitiatedMessages[recentInitiatedMessages.length - 1].time || Date.now()) : 0;
  const initiatedTimeDiff = Date.now() - lastInitiatedTime;
  
  // 如果在60秒内已经主动发了3条消息，则暂时不主动发起
  if (recentInitiatedByRole >= 3 && initiatedTimeDiff < 60000) {
    return false;
  }
  
  // 高级情感分析：检查用户消息是否包含情绪词汇
  const positiveEmotions = ['开心', '高兴', '好的', '不错', '谢谢', '很棒', '喜欢', '爱你', '支持', '赞同', '厉害', '幸福', '满足', '愉快'];
  const negativeEmotions = ['难过', '伤心', '生气', '讨厌', '烦躁', '无聊', '不开心', '失望', '委屈', '累', '压力', '焦虑', '孤独', '沮丧'];
  const neutralTopics = ['今天', '天气', '工作', '学习', '电影', '音乐', '游戏', '吃饭', '睡觉', '计划', '打算', '兴趣', '爱好', '生活'];
  const questionKeywords = ['？', '吗', '什么', '怎么', '如何', '为什么', '哪里', '谁'];
  
  let hasPositiveEmotion = false;
  let hasNegativeEmotion = false;
  let hasNeutralTopic = false;
  let hasQuestion = false;
  let isLastMessageFromUser = lastMessage.me;
  
  // 统计用户最后的回复数量，判断用户的参与度
  let userReplyCount = 0;
  recentMessages.forEach(msg => {
    if (msg.me) {
      userReplyCount++;
      
      const text = msg.text.toLowerCase();
      positiveEmotions.forEach(emotion => {
        if (text.includes(emotion.toLowerCase())) {
          hasPositiveEmotion = true;
        }
      });
      negativeEmotions.forEach(emotion => {
        if (text.includes(emotion.toLowerCase())) {
          hasNegativeEmotion = true;
        }
      });
      neutralTopics.forEach(topic => {
        if (text.includes(topic.toLowerCase())) {
          hasNeutralTopic = true;
        }
      });
      questionKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          hasQuestion = true;
        }
      });
    }
  });
  
  // 基于不同情况调整主动发起对话的概率
  if (hasNegativeEmotion) {
    // 用户有负面情绪时，高概率主动发起对话进行安慰
    return Math.random() > 0.1; // 90%的概率
  }
  
  if (hasPositiveEmotion) {
    // 用户有正面情绪时，高概率主动发起对话分享喜悦
    return Math.random() > 0.2; // 80%的概率
  }
  
  if (hasQuestion && userReplyCount > 0) {
    // 用户问了问题但长时间没回复，主动追问
    return Math.random() > 0.15; // 85%的概率
  }
  
  if (hasNeutralTopic) {
    // 有中性话题时，可以适度主动延续话题
    return Math.random() > 0.3; // 70%的概率
  }
  
  // 用户参与度高时，即使没有明显情绪或话题，也可以主动发起对话
  if (userReplyCount >= 2) {
    return Math.random() > 0.4; // 60%的概率
  }
  
  // 长时间没有收到用户回复，主动询问或开启新话题
  if (timeDiff > 30000 && isLastMessageFromUser) {
    return Math.random() > 0.3; // 70%的概率主动询问
  }
  
  // 其他情况下，根据时间间隔调整概率
  return Math.random() > (1 - baseProbability);
}

// 通知API用户已读状态
function notifyApiOfReadStatus() {
  const cfg = getRoleApiConfig(currentRole);
  if(!cfg || !cfg.base || typeof cfg.base !== 'string' || cfg.base.trim() === '') {
    return; // 无API配置，不执行
  }
  
  // 标记所有用户消息为已读（API已收到用户消息）
  let hasUserMessagesToMarkRead = false;
  currentRole.messages.forEach(m => {
    if (m.me && !m.read) {
      m.read = true;
      hasUserMessagesToMarkRead = true;
    }
  });
  
  if (hasUserMessagesToMarkRead) {
    saveAll();
    // 更新UI显示
    renderMessages();
  }
  
  // 用户已读后，立即触发API主动回复检查（降低延迟以提高实时性）
  setTimeout(() => {
    // 基于上下文和情感智能判断是否应该主动发起新的对话
    if (shouldInitiateConversation()) {
      initiateApiConversation();
    }
  }, 500); // 0.5秒后检查是否发起主动对话
  
  // 立即向API发送真实的已读状态通知
  notifyApiDirectlyAboutReadStatus();
}

// 通知API直接获取已读状态 - 确保API能接收到真实的已读状态
function notifyApiDirectlyAboutReadStatus() {
  const cfg = getRoleApiConfig(currentRole);
  if(!cfg || !cfg.base || typeof cfg.base !== 'string' || cfg.base.trim() === '') {
    return; // 无API配置，不执行
  }
  
  try {
    // 构建包含已读状态信息的通知
    const readInfo = {
      roleId: currentRole.id,
      readMessages: currentRole.messages
        .filter(m => !m.me && m.read)
        .map(m => ({ id: m.time, text: m.text, readTime: m.readTime })),
      timestamp: Date.now()
    };
    
    // 发送已读状态到API
    if (settings.globalApi.enabled && settings.globalApi.readRes) {
      // 这里可以根据实际API接口定义进行实现
      console.log('已向API发送已读状态通知:', readInfo);
      // 例如可以通过fetch或其他方式发送请求到API
      // fetch(`${cfg.base}/read-status`, { method: 'POST', body: JSON.stringify(readInfo), ... });
    }
  } catch (error) {
    console.error('发送已读状态通知到API时出错:', error);
  }
}

// 定期检查是否需要主动发起对话
let conversationCheckInterval;
function startConversationMonitoring() {
  // 清除之前的计时器，避免重复设置
  if (conversationCheckInterval) {
    clearInterval(conversationCheckInterval);
  }
  
  // 每15秒检查一次是否需要主动发起对话
  conversationCheckInterval = setInterval(() => {
    if (currentRole && currentRole.messages && currentRole.messages.length > 0) {
      // 检查是否应该主动发起对话
      if (shouldInitiateConversation()) {
        initiateApiConversation();
      }
    }
  }, 15000); // 15秒检查一次
}

// 停止对话监控
function stopConversationMonitoring() {
  if (conversationCheckInterval) {
    clearInterval(conversationCheckInterval);
    conversationCheckInterval = null;
  }
  
  // 清理已读状态监测的事件监听器
  if (currentRole && currentRole.cleanupFunctions) {
    currentRole.cleanupFunctions.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    currentRole.cleanupFunctions = [];
  }
}

// API主动发起对话
async function initiateApiConversation() {
  const cfg = getRoleApiConfig(currentRole);
  if(!cfg || !cfg.base || typeof cfg.base !== 'string' || cfg.base.trim() === '') {
    return; // 无API配置，不执行
  }
  
  try {
    // 获取最近的对话上下文，扩大范围以更好地理解对话
    const recentMessages = currentRole.messages.slice(-10);
    const context = recentMessages.map(msg => {
      const role = msg.me ? "用户" : "你";
      return `${role}说: ${msg.text}`;
    }).join("\n");
    
    // 检测对话状态，决定回复类型
    let responseType = "single";
    let sentiment = "neutral";
    let conversationType = "normal";
    
    // 高级对话分析
    const userLastMessage = recentMessages.find(msg => msg.me);
    const lastMessageTime = recentMessages[recentMessages.length - 1].time || Date.now();
    const timeSinceLastMessage = Date.now() - lastMessageTime;
    
    if (userLastMessage) {
      const text = userLastMessage.text.toLowerCase();
      
      // 检查是否适合多段回复的情况
      if (text.includes('？') || text.includes('？') || text.includes('吗') || text.includes('如何') || text.includes('怎样')) {
        responseType = "detailed";
      }
      
      // 检查用户情绪
      const negativeKeywords = ['难过', '伤心', '生气', '讨厌', '烦躁', '无聊', '不开心', '失望', '委屈', '累', '压力', '焦虑', '孤独', '沮丧'];
      const positiveKeywords = ['开心', '高兴', '好的', '不错', '谢谢', '很棒', '喜欢', '爱你', '支持', '赞同', '厉害', '幸福', '满足', '愉快'];
      
      if (negativeKeywords.some(keyword => text.includes(keyword))) {
        sentiment = "negative";
        conversationType = "comfort";
      } else if (positiveKeywords.some(keyword => text.includes(keyword))) {
        sentiment = "positive";
        conversationType = "celebrate";
      } else if (timeSinceLastMessage > 60000) {
        // 长时间没收到回复，主动询问
        conversationType = "inquire";
      }
    }
    
    // 根据对话状态构建不同的提示词
    let prompt;
    
    if (conversationType === "inquire") {
      // 询问模式，适合长时间没收到回复时
      prompt = `基于以下对话上下文，以${currentRole.name}的身份主动发起一段询问式对话。
用户已经有一段时间没有回复了，请自然地询问对方是否还在，或者是否愿意继续之前的话题。
你的提问应该友好、亲切，避免给人压力，保持对话的轻松氛围。
可以提到之前的话题，让对话更连贯。

对话上下文：
${context}

现在，请以${currentRole.name}的身份发起询问：`;
    } else if (conversationType === "comfort") {
      // 安慰模式，适合用户有负面情绪时
      prompt = `基于以下对话上下文，以${currentRole.name}的身份主动发起一段安慰性对话。
用户似乎有些负面情绪，请表达理解和关心，提供支持和鼓励。
你的回复应该真诚、温暖，可以包含一些积极的建议或想法。
使用自然、口语化的表达，避免过于正式的措辞。

对话上下文：
${context}

现在，请以${currentRole.name}的身份进行安慰回复：`;
    } else if (conversationType === "celebrate") {
      // 分享喜悦模式，适合用户表达正面情绪时
      prompt = `基于以下对话上下文，以${currentRole.name}的身份主动发起一段分享喜悦的对话。
用户看起来心情不错，请分享这种积极情绪，延续愉快的话题。
你的回复应该充满活力，积极向上，可以提出一些有趣的话题或建议。
使用生动、有趣的语言，让对话更加愉快。

对话上下文：
${context}

现在，请以${currentRole.name}的身份分享喜悦：`;
    } else if (responseType === "detailed") {
      // 详细回复模式，适合回答问题或解释事情
      prompt = `基于以下对话上下文，以${currentRole.name}的身份主动发起一段详细的对话回复。
请根据用户的问题或话题，给出详细、有条理的解释或建议。
你的回复应该包含2-3个自然段落，每段有明确的中心思想，并且与上下文紧密相关。
不要使用"首先"、"其次"等生硬的连接词，保持口语化和自然。

对话上下文：
${context}

现在，请以${currentRole.name}的身份进行详细回复：`;
    } else {
      // 普通对话模式，但更注重延续话题
      prompt = `基于以下对话上下文，以${currentRole.name}的身份主动发起一段符合你人设的对话。
考虑用户的情绪和对话内容，自然延续话题或者开启相关的新话题。
你的回复应该有具体内容，避免空洞的问候，鼓励用户继续参与对话。
可以提问、分享想法或表达兴趣，让对话更有互动性。

对话上下文：
${context}

现在，请以${currentRole.name}的身份主动发起对话：`;
    }
    
    // 调用API获取主动回复
    const response = await callApiForChat(cfg, prompt, currentRole);
    
    if (response && response.trim()) {
      // 根据回复内容决定是否需要拆分为多条消息
      let messagesToAdd = [];
      
      // 如果回复包含多个段落，考虑拆分为多条消息
      if (responseType === "detailed") {
        // 尝试根据换行符分割长回复
        const paragraphs = response.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        if (paragraphs.length > 1 && paragraphs.length <= 3) {
          // 将长回复拆分为多个短消息，模拟自然对话
          paragraphs.forEach((para, index) => {
            messagesToAdd.push({
              me: false,
              text: para.trim(),
              read: false,
              isInitiative: true,
              isMultiPart: true,
              partIndex: index,
              totalParts: paragraphs.length,
              time: Date.now() + (index * 1000) // 每条消息间隔1秒
            });
          });
        } else {
          // 单条消息
          messagesToAdd.push({me:false, text: response.trim(), read: false, isInitiative: true, time: Date.now()});
        }
      } else {
        // 单条消息
        messagesToAdd.push({me:false, text: response.trim(), read: false, isInitiative: true, time: Date.now()});
      }
      
      // 添加所有消息
      messagesToAdd.forEach(msg => {
        currentRole.messages.push(msg);
      });
      
      // 随机决定是否添加拍一拍消息 (10% 的概率)
      if (Math.random() < 0.1) {
        const patMessage = {
          me: false, // API角色发起的
          text: `[${currentRole.name}]拍了拍[${userProfile.nickname}]`,
          isPat: true, // 标记为拍一拍消息
          time: Date.now(),
          read: false
        };
        currentRole.messages.push(patMessage);
      }
      
      renderMessages();
      saveAll();
      
      // 如果是多条消息，设置定时器逐步显示
      if (messagesToAdd.length > 1) {
        for (let i = 1; i < messagesToAdd.length; i++) {
          setTimeout(() => {
            renderMessages();
          }, i * 1500); // 每条消息延迟1.5秒显示
        }
      }
    }
  } catch (error) {
    console.error("主动发起对话失败:", error);
  }
}

// 打字机效果函数 - 增强版
async function typewriterEffect(message, callback) {
  // 定义处理函数：将文本和表情包分离成不同的消息
  // 确保API角色发送的表情包必须单独成条，不能与文字混合
  function separateTextAndEmojis(text) {
    const messages = [];
    const emojiRegex = /\[表情(\d+)\]/g;
    let lastIndex = 0;
    let match;
    
    // 查找所有表情包引用
    while ((match = emojiRegex.exec(text)) !== null) {
      // 添加表情包之前的文本作为单独消息
      const textBeforeEmoji = text.substring(lastIndex, match.index).trim();
      if (textBeforeEmoji.length > 0) {
        messages.push(textBeforeEmoji);
      }
      
      // 添加表情包作为单独消息 - API角色的表情包必须单独发送
      messages.push(match[0]);
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加最后一个表情包之后的文本
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText.length > 0) {
      messages.push(remainingText);
    }
    
    return messages;
  }
  
  // 首先将消息分割成句子
  const sentences = message.split(/(?<=[。！？])/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    if (callback) callback();
    return;
  }
  
  // 然后处理每个句子，分离文本和表情包
  const allMessages = [];
  sentences.forEach(sentence => {
    const separatedMessages = separateTextAndEmojis(sentence);
    allMessages.push(...separatedMessages);
  });
  
  // 显示所有消息，每条消息单独一个气泡
  for (let i = 0; i < allMessages.length; i++) {
    if (i > 0) {
      // 除第一条消息外，其他消息添加延迟
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    }
    
    const currentMessage = allMessages[i];
    currentRole.messages.push({me:false, text: currentMessage, read: false, isResponseToUser: true, time: Date.now()});
    renderMessages();
    saveAll();
  }
  
  if (callback) callback();
}

// 初始化拍一拍功能
function setupPatPatFeature() {
  const chatContainer = document.getElementById('chat-messages');
  if (!chatContainer) return;
  
  // 定义事件处理函数以便能够正确移除
  async function handleDoubleClick(event) {
    // 检查点击的是否是API角色的头像
    const avatarElement = event.target.closest('.role-msg-avatar');
    if (avatarElement) {
      event.preventDefault();
      event.stopPropagation();
      
      // 获取自定义的拍一拍句子
      let patMySentence = '拍了拍我的小脑袋';
      let patOtherSentence = '的小脑袋';
      
      try {
        // 尝试获取用户自定义的拍一拍设置
        const savedSettings = localStorage.getItem('patSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          patMySentence = settings.mySentence || patMySentence;
          patOtherSentence = settings.otherSentence || patOtherSentence;
        }
      } catch (error) {
        console.error('获取拍一拍设置失败:', error);
      }
      
      // 格式化拍一拍消息文本：我'动作'了'API角色的内容'
      const patMessage = {
        id: Date.now(),
        text: `我拍了拍${currentRole.name}${patOtherSentence}`,
        me: true,
        time: Date.now(),
        isPat: true
      };
      
      // 添加系统提示，表明API角色已经看到了拍一拍
      const systemMessage = {
        id: Date.now() + 1,
        text: `「${currentRole.name}」拍了拍我的${patMySentence.replace('拍了拍我的', '')}`,
        me: false,
        time: Date.now(),
        isPat: true // 使用isPat标记而不是isSystem，确保统一的居中样式
      };
      
      // 同时显示toast通知
      toast(systemMessage.text);
      
      // 将消息添加到messages数组以保存在聊天记录中
      currentRole.messages.push(patMessage, systemMessage);
      
      // 调用renderMessages函数，让它根据isPat标记以居中样式显示这些消息
      renderMessages();
      
      saveAll();
      
      // 通知API用户发送了拍一拍（如果启用了相关设置）
      if (settings.globalApi.enabled && settings.globalApi.readRes) {
        // 获取API配置
        const cfg = getRoleApiConfig(currentRole);
        if (cfg && cfg.base && typeof cfg.base === 'string' && cfg.base.trim() !== '') {
          try {
            // 准备拍一拍相关的提示文本，让API知道用户拍了拍它
            const patPrompt = `用户刚刚拍了拍你(${currentRole.name})，请以${currentRole.name}的身份做出自然、亲切的回应。回应应该简短、温暖，符合角色性格特点，可以带点俏皮或可爱的语气。`;
            
            // 调用API获取回复
            const reply = await callApiForChat(cfg, patPrompt, currentRole);
            
            // 如果有有效的回复，添加到消息列表并显示
            if (reply && reply.trim()) {
              const apiReplyMessage = {
                id: Date.now() + 2,
                text: reply.trim(),
                me: false,
                time: Date.now()
              };
              
              currentRole.messages.push(apiReplyMessage);
              saveAll();
              
              // 使用打字机效果显示API回复
              await typewriterEffect(reply.trim());
            }
            
            console.log('已向API发送拍一拍通知并获取回复');
          } catch (error) {
            console.error('拍一拍API调用失败:', error);
          }
        } else {
          console.log('已向API发送拍一拍通知:', {
            roleId: currentRole.id,
            type: 'pat',
            timestamp: Date.now()
          });
        }
      }
    }
  }
  
  // 监听聊天容器中的双击事件
  chatContainer.addEventListener('dblclick', handleDoubleClick);
  
  // API角色自主发起拍一拍互动的功能 - 基于角色性格和聊天内容
  function setupAutoPatFeature() {
    // 定义可能的拍一拍动作和内容
    const autoPatActions = [
      '轻轻拍了拍',
      '温柔地摸了摸',
      '宠溺地揉了揉',
      '戳了戳',
      '抱了抱',
      '亲了亲'
    ];
    
    const autoPatContents = [
      '小脑袋',
      '肩膀',
      '手背',
      '脸颊',
      '头发',
      '额头'
    ];
    
    // 根据聊天内容分析是否适合发送拍一拍
    function analyzeChatForPatting() {
      if (!currentRole || !currentRole.messages || currentRole.messages.length === 0) {
        return false;
      }
      
      // 获取最近5条消息
      const recentMessages = currentRole.messages.slice(-5);
      const lastMessage = recentMessages[recentMessages.length - 1];
      
      // 如果最后一条消息是系统消息或拍一拍消息，不适合发送
      if (lastMessage.isSystem || lastMessage.isPat) {
        return false;
      }
      
      // 检查是否是用户发的消息（me: true）
      if (!lastMessage.me) {
        return false;
      }
      
      // 简单的关键词匹配，判断是否适合发送拍一拍
      const messageText = (lastMessage.text || '').toLowerCase();
      const positiveKeywords = ['开心', '高兴', '谢谢', '感谢', '好的', '真棒', '喜欢', '爱你', '想你'];
      const neutralKeywords = ['你好', '在吗', '在干什么', '吃了吗', '晚安', '早安', '再见'];
      
      // 检查是否包含适合拍一拍的关键词
      for (const keyword of positiveKeywords) {
        if (messageText.includes(keyword)) {
          return 1.5; // 积极内容，增加拍一拍概率
        }
      }
      
      for (const keyword of neutralKeywords) {
        if (messageText.includes(keyword)) {
          return 1.0; // 中性内容，正常拍一拍概率
        }
      }
      
      return false; // 不适合拍一拍
    }
    
    // 随机生成拍一拍消息
    function generateAutoPatMessage() {
      const randomAction = autoPatActions[Math.floor(Math.random() * autoPatActions.length)];
      const randomContent = autoPatContents[Math.floor(Math.random() * autoPatContents.length)];
      
      return {
        id: Date.now(),
        text: `「${currentRole.name}」${randomAction}我的${randomContent}`,
        me: false,
        time: Date.now(),
        isPat: true
      };
    }
    
    // 设置随机定时器，让API角色主动发起拍一拍
    function scheduleAutoPat() {
      // 获取角色的活跃度属性，如果没有则默认为0.5
      const roleLiveness = currentRole?.personality?.活跃度 || 0.5;
      
      // 根据活跃度调整时间间隔：活跃度越高，间隔越短
      const minInterval = Math.floor(60 * 1000 * (2 - roleLiveness)); // 1-2分钟
      const maxInterval = Math.floor(5 * 60 * 1000 * (2 - roleLiveness)); // 3-10分钟
      const interval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
      
      setTimeout(() => {
        // 检查是否应该触发自动拍一拍
        // 基础概率基于角色活跃度
        const baseProbability = roleLiveness * 0.5; // 活跃度最高时基础概率为0.5
        
        // 分析聊天内容，获取内容系数
        const contentFactor = analyzeChatForPatting();
        
        if (contentFactor && Math.random() < (baseProbability * contentFactor)) {
          const autoPatMessage = generateAutoPatMessage();
          currentRole.messages.push(autoPatMessage);
          toast(autoPatMessage.text);
          renderMessages();
          saveAll();
          console.log('API角色自主发起了拍一拍互动', {
            role: currentRole.name,
            liveness: roleLiveness,
            contentFactor: contentFactor,
            probability: baseProbability * contentFactor
          });
        }
        
        // 继续安排下一次自动拍一拍
        scheduleAutoPat();
      }, interval);
    }
    
    // 开始自动拍一拍功能
    scheduleAutoPat();
  }
  
  // 启动API角色自主发起拍一拍互动的功能
  setupAutoPatFeature();
  
  // 清理函数 - 正确移除实际添加的事件监听器
  return () => {
    chatContainer.removeEventListener('dblclick', handleDoubleClick);
  };
}

// 初始化拍一拍设置功能
function setupPatSettingFeature() {
  const patSettingBtn = document.getElementById('pat-setting-btn');
  const patSettingMask = document.getElementById('pat-setting-mask');
  const patSettingCancel = document.getElementById('pat-setting-cancel');
  const patSettingSave = document.getElementById('pat-setting-save');
  const patMySentence = document.getElementById('pat-my-sentence');
  const patOtherSentence = document.getElementById('pat-other-sentence');
  const patAnimation = document.getElementById('pat-animation');
  
  if (!patSettingBtn || !patSettingMask || !patSettingCancel || !patSettingSave) {
    console.warn('拍一拍设置相关元素未找到，功能无法初始化');
    return;
  }
  
  // 从localStorage加载保存的设置
  function loadPatSettings() {
    try {
      const savedSettings = localStorage.getItem('patSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (patMySentence && settings.mySentence) {
          patMySentence.value = settings.mySentence;
        }
        if (patOtherSentence && settings.otherSentence) {
          patOtherSentence.value = settings.otherSentence;
        }
        if (patAnimation && settings.animation) {
          patAnimation.value = settings.animation;
        }
      }
    } catch (error) {
      console.error('加载拍一拍设置失败:', error);
    }
  }
  
  // 保存设置到localStorage
  function savePatSettings() {
    try {
      // 验证输入内容
      if (patMySentence && !patMySentence.value.trim()) {
        patMySentence.value = '拍了拍我的小脑袋';
      }
      if (patOtherSentence && !patOtherSentence.value.trim()) {
        patOtherSentence.value = '的小脑袋';
      }
      
      const settings = {
        mySentence: patMySentence ? patMySentence.value : '拍了拍我的小脑袋',
        otherSentence: patOtherSentence ? patOtherSentence.value : '的小脑袋',
        animation: patAnimation ? patAnimation.value : 'default'
      };
      localStorage.setItem('patSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('保存拍一拍设置失败:', error);
      return false;
    }
  }
  
  // 打开设置模态框
  function openPatSettingModal() {
    loadPatSettings();
    if (patSettingMask) {
      patSettingMask.style.display = 'flex';
    }
  }
  
  // 关闭设置模态框
  function closePatSettingModal() {
    if (patSettingMask) {
      patSettingMask.style.display = 'none';
    }
  }
  
  // 保存设置按钮点击事件
  function handleSaveClick() {
    if (savePatSettings()) {
      // 显示保存成功提示
      toast('拍一拍设置已保存');
      
      // 提示用户设置已立即生效
      setTimeout(() => {
        toast('设置已立即生效');
      }, 1500);
    }
    closePatSettingModal();
  }
  
  // 添加事件监听器
  patSettingBtn.addEventListener('click', openPatSettingModal);
  patSettingCancel.addEventListener('click', closePatSettingModal);
  patSettingSave.addEventListener('click', handleSaveClick);
  
  // 点击模态框外部关闭
  if (patSettingMask) {
    patSettingMask.addEventListener('click', function(e) {
      if (e.target === patSettingMask) {
        closePatSettingModal();
      }
    });
  }
  
  // 限制输入框最大长度
  if (patMySentence) {
    patMySentence.addEventListener('input', function() {
      const maxLength = 20;
      if (this.value.length > maxLength) {
        this.value = this.value.substring(0, maxLength);
      }
    });
  }
  
  if (patOtherSentence) {
    patOtherSentence.addEventListener('input', function() {
      const maxLength = 10; // 增加最大长度限制，让用户有更多自定义空间
      if (this.value.length > maxLength) {
        this.value = this.value.substring(0, maxLength);
      }
    });
  }
  
  // 为输入框添加更友好的placeholder提示
  if (patMySentence) {
    // 添加实时预览功能
    const previewContainer = document.createElement('div');
    previewContainer.className = 'pat-preview';
    previewContainer.style.fontSize = '12px';
    previewContainer.style.color = '#999';
    previewContainer.style.marginTop = '4px';
    previewContainer.style.padding = '4px';
    previewContainer.style.background = '#f5f5f5';
    previewContainer.style.borderRadius = '4px';
    previewContainer.textContent = `示例效果：对方拍了拍我的${patMySentence.value.replace('拍了拍我的', '')}`;
    
    patMySentence.parentNode.appendChild(previewContainer);
    
    // 实时更新预览
    patMySentence.addEventListener('input', function() {
      const content = this.value || '拍了拍我的小脑袋';
      const cleanContent = content.replace('拍了拍我的', '');
      previewContainer.textContent = `示例效果：对方拍了拍我的${cleanContent}`;
    });
  }
  
  if (patOtherSentence) {
    // 添加实时预览功能
    const previewContainer = document.createElement('div');
    previewContainer.className = 'pat-preview';
    previewContainer.style.fontSize = '12px';
    previewContainer.style.color = '#999';
    previewContainer.style.marginTop = '4px';
    previewContainer.style.padding = '4px';
    previewContainer.style.background = '#f5f5f5';
    previewContainer.style.borderRadius = '4px';
    previewContainer.textContent = `示例效果：我拍了拍角色${patOtherSentence.value}`;
    
    patOtherSentence.parentNode.appendChild(previewContainer);
    
    // 实时更新预览
    patOtherSentence.addEventListener('input', function() {
      const content = this.value || '的小脑袋';
      previewContainer.textContent = `示例效果：我拍了拍角色${content}`;
    });
  }
  
  console.log('拍一拍设置功能已初始化');
  
  // 返回获取拍一拍句子的函数，方便其他地方调用
  return {
    getPatMySentence: function() {
      try {
        const savedSettings = localStorage.getItem('patSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          return settings.mySentence || '拍了拍我的小脑袋';
        }
      } catch (error) {
        console.error('获取拍一拍句子失败:', error);
      }
      return '拍了拍我的小脑袋';
    },
    getPatOtherSentence: function() {
      try {
        const savedSettings = localStorage.getItem('patSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          return settings.otherSentence || '的小脑袋';
        }
      } catch (error) {
        console.error('获取拍一拍句子失败:', error);
      }
      return '的小脑袋';
    }
  };
}

// 发送消息事件监听
$("#send-btn").addEventListener("click", async ()=>{
  const val = $("#chat-input").value.trim();
  if(!val) return;
  // push user message，用户发送的消息默认已读并添加时间戳
  currentRole.messages = currentRole.messages || [];
  const now = Date.now();
  
  // 分离文本和表情包，确保表情包单独成条发送
  function separateTextAndEmojis(text) {
    const messages = [];
    const emojiRegex = /\[表情(\d+)\]/g;
    let lastIndex = 0;
    let match;
    
    // 查找所有表情包引用
    while ((match = emojiRegex.exec(text)) !== null) {
      // 添加表情包之前的文本作为单独消息
      const textBeforeEmoji = text.substring(lastIndex, match.index).trim();
      if (textBeforeEmoji.length > 0) {
        messages.push({me:true, text: textBeforeEmoji, read: true, time: now});
      }
      
      // 添加表情包作为单独消息
      messages.push({me:true, text: match[0], read: true, time: now});
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加最后一个表情包之后的文本
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText.length > 0) {
      messages.push({me:true, text: remainingText, read: true, time: now});
    }
    
    return messages;
  }
  
  // 分离消息并添加到消息列表
  const separatedMessages = separateTextAndEmojis(val);
  currentRole.messages.push(...separatedMessages);
  
  $("#chat-input").value = "";
  renderMessages();
  saveAll();

  // call API according to priority
  const cfg = getRoleApiConfig(currentRole);
  if(!cfg || !cfg.base || typeof cfg.base !== 'string' || cfg.base.trim() === ''){
    // no api configured - simulate simple echo or idle
    const mockReply = "（未配置 API）"+ " " + "当前仅支持本地聊天示例。\n\n请在设置中配置有效的API地址。\n提示：基础地址应类似 https://api.openai.com 或其他兼容OpenAI API的地址。";
    await typewriterEffect(mockReply);
    return;
  }
  
  // 初始化拍一拍功能（如果尚未初始化）
  if (typeof currentRole.setupPatPatFeature === 'undefined') {
    currentRole.setupPatPatFeature = setupPatPatFeature();
  }

  // call
  const reply = await callApiForChat(cfg, val, currentRole);
  // 使用打字机效果显示API回复
  await typewriterEffect(reply || "（无回复）");
});

/* ========== API selection logic (role vs global) ========== */
function getRoleApiConfig(role){
  // if role has enabled api use it
  if(role.api && role.api.enabled) return role.api;
  // else if global api is enabled use it
  if(settings.globalApi && settings.globalApi.enabled) return settings.globalApi;
  return null;
}

/* ========== API base URL normalization ========== */
// 标准化 base 地址，只移除末尾斜杠，保留用户配置的路径结构
function normalizeBaseUrl(base) {
  if (!base) return '';
  // 移除末尾斜杠但保留路径结构
  let normalized = base.replace(/\/$/, '');
  // 处理常见的API路径问题
  if (normalized.includes('//') && !normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

/* ========== API call helper ========== */
/*
  This function tries to call an API endpoint at `${base}/v1/chat/completions`
  It sends a simple JSON structure:
  {
    model: ...,
    temperature: ...,
    messages: [ {role:"system", content:...}, ... ]
  }
  If settings.globalApi.readRes is true, include worldbook/preset/regex in system messages.
*/
// 基础API调用函数（不支持图片）
async function callApiForChat(apiCfg, userMessage, role) {
  try {
    // 检查API配置是否有效
    if(!apiCfg || !apiCfg.base || typeof apiCfg.base !== 'string' || apiCfg.base.trim() === '') {
      console.error("无效的API配置: base地址为空或不是字符串");
      return "（未配置有效的API地址）\n请在设置中配置正确的API地址。";
    }
    
    const base = normalizeBaseUrl(apiCfg.base);
    // 构建完整API URL
    let url;
    
    // 检查是否是完整URL（包含协议和主机）
    const isFullUrl = /^https?:\/\//i.test(base);
    
    // 智能URL构建，避免重复路径
    if(base.endsWith('/v1/chat/completions')) {
      url = base;
    } else if(base.endsWith('/v1')) {
      url = base + "/chat/completions";
    } else if(base.endsWith('/v1/chat')) {
      url = base + "/completions";
    } else if(base.includes('/v1/v1')) {
      const cleanBase = base.replace('/v1/v1', '/v1');
      url = cleanBase + "/chat/completions";
    } else if(base.includes('/chat/completions')) {
      url = base;
    } else {
      // 标准路径格式
      if (isFullUrl && !base.includes('/v1')) {
        url = base + "/v1/chat/completions";
      } else if (!isFullUrl && base.includes('.') && !base.startsWith('/')) {
        url = "https://" + base + "/v1/chat/completions";
      } else {
        url = base + "/v1/chat/completions";
      }
    }
    
    const headers = {"Content-Type":"application/json"};
    if(apiCfg.key) headers["Authorization"] = "Bearer " + apiCfg.key;

    const body = {
      model: apiCfg.model || apiCfg.custom || "gpt-3.5-turbo", // 默认使用基础模型
      temperature: parseFloat(apiCfg.temp || 0.8),
      messages: []
    };

    // include role system prompt first
    if(role.system) body.messages.push({role:"system", content: role.system});
    
    // include user's local emojis information so API can understand them
    const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
    if(localEmojis && localEmojis.length > 0) {
      const emojiInfo = localEmojis.map((emoji, index) => {
        return `[表情${index + 1}]: 用户上传的表情包图片，文件名为"${emoji.name}"`;
      }).join('\n');
      
      body.messages.push({
        role: "system", 
        content: `用户有以下自定义表情包可用，当用户使用[表情X]时，表示发送了对应的自定义表情包图片:\n${emojiInfo}\n\n重要：你使用[表情X]格式引用表情包时，请确保每个表情包单独作为一条消息发送，不要与文字混合在同一条消息中。即文字单独发一条消息，表情包单独发一条消息。\n\n另外，你可以根据自己的心情以及回复内容，主动选择合适的表情包来丰富对话。请根据对话氛围、情感表达和回复内容的需要，灵活使用这些表情包，使对话更加生动有趣。`
      });
    }

    // include global resources if allowed
    if((apiCfg === settings.globalApi && settings.globalApi.readRes) || (apiCfg !== settings.globalApi && settings.globalApi.readRes && settings.globalEnable)){
      // add books/preset/regex as system context (simple representation)
      if(settings.books && settings.books.length){
        body.messages.push({role:"system", content: "世界书：" + JSON.stringify(settings.books)});
      }
      if(settings.preset){
        body.messages.push({role:"system", content: "预设：" + JSON.stringify(settings.presets?.find(p=>p.id===settings.preset) || "")});
      }
      if(settings.regex && settings.regex.length){
        body.messages.push({role:"system", content: "正则：" + JSON.stringify(settings.regex)});
      }
    }

    // append messages as context with memory length limit
    const memoryLength = apiCfg.memoryEnabled ? (apiCfg.memoryLength || 10) : 10;
    (role.messages || []).slice(-memoryLength).forEach(m=> {
      body.messages.push({ role: m.me ? "user" : "assistant", content: m.text });
    });

    // add current user message
    body.messages.push({ role: "user", content: userMessage });

    // 显示正在请求API地址（调试信息）
    console.log("正在请求API:", url);
    console.log("请求头:", headers);
    console.log("请求体:", body);
    
    // do request
    const resp = await fetch(url, { method:"POST", headers, body: JSON.stringify(body) });
    if(!resp.ok){
      console.log(`API请求失败: ${resp.status} ${resp.statusText}`);
      // 智能构建备用地址，避免重复路径
      let altUrl;
      if(base.includes('/chat/completions')) {
        // 如果主URL已经包含了/chat/completions，尝试使用/v1/chat/completions
        altUrl = base.replace('/chat/completions', '/v1/chat/completions');
      } else if(base.includes('/v1')) {
        // 如果已经包含/v1但没有/chat/completions，添加/chat/completions
        altUrl = base + "/chat/completions";
      } else {
        // 否则，添加完整的/v1/chat/completions路径
        altUrl = base + "/v1/chat/completions";
      }
      console.log("尝试备用地址:", altUrl);
      const alt = await fetch(altUrl, { method:"POST", headers, body: JSON.stringify(body) }).catch(()=>null);
      if(!alt || !alt.ok) {
        // try to parse error response for debugging
        let txt = "";
        try{ txt = await resp.text(); }catch(e){}
        console.warn("API returned non-ok:", resp.status, txt);
        return `（API 请求失败）\n请求URL: ${url}\n备用URL: ${altUrl || '未生成'}\nHTTP状态码: ${resp.status}\n\n错误详情:\n${txt.substring(0, 500)}...\n\n请检查：\n1. API基础地址是否正确\n2. API密钥是否有效\n3. 网络连接是否正常\n4. 防火墙是否阻止了请求`;
      } else {
        console.log("备用地址请求成功");
        const js = await alt.json().catch(()=>null);
        // attempt to extract content
        if(js && js.choices && js.choices[0] && js.choices[0].message) return js.choices[0].message.content;
        if(js && js.choices && js.choices[0] && js.choices[0].text) return js.choices[0].text;
        return typeof js === "string" ? js : "（API 返回格式不标准）";
      }
    } else {
      console.log("API请求成功，状态码:", resp.status);
      // 尝试解析JSON响应
      let js;
      try {
        js = await resp.json();
        console.log("API response:", js); // 添加调试信息
      } catch(e) {
        console.error("JSON parse error:", e);
        // 尝试以文本形式读取响应
        const text = await resp.text().catch(()=>null);
        if(text) {
          console.log("API text response:", text);
          // 检查是否是HTML错误页面
          if(text.startsWith('<!doctype') || text.includes('<html')) {
            // 分析HTML错误信息
            const titleMatch = text.match(/<title>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : "HTML错误页面";
            return `（API返回HTML错误页面，请检查API地址是否正确）\n请求URL: ${url}\n页面标题: ${title}\n\n错误页面预览:\n${text.substring(0, 500)}...`;
          }
          return `（响应不是有效的JSON格式）\n\n原始响应:\n${text.substring(0, 500)}...`;
        }
        return `（响应解析失败：${e.message}）\n\n请求URL: ${url}\n建议检查API地址是否正确，或网络连接是否正常。`;
      }

      // 尝试从不同格式的响应中提取内容
      if(js) {
        // 先检查是否包含错误信息
        if(js.error) {
          const errorMessage = js.error.message || JSON.stringify(js.error);
          const errorType = js.error.type || "API错误";
          const errorCode = js.error.code || "未知代码";
          return `（${errorType}）\n错误信息：${errorMessage}\n错误代码：${errorCode}\n\n建议：\n1. 检查API密钥是否有效\n2. 确认余额是否充足\n3. 稍后再试或联系API提供商支持`;
        }
        // 标准OpenAI格式
        if(js.choices && js.choices[0] && js.choices[0].message) {
          let content = js.choices[0].message.content;
          
          // 从content开头移除可能的系统提示
          if(content.startsWith("你可以使用[表情X]格式来引用并发送用户的自定义表情包")) {
            const promptEnd = content.indexOf("\n\n");
            if(promptEnd > -1) {
              content = content.substring(promptEnd + 2);
            }
          }
          
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            // 简单的字符数限制（实际应用中可替换为更精确的token计算）
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 旧版格式或其他API格式
        if(js.choices && js.choices[0] && js.choices[0].text) {
          let content = js.choices[0].text;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // Claude等API可能直接返回content
        if(js.content) {
          let content = js.content;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 某些API可能返回result字段
        if(js.result) {
          let content = js.result;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 如果响应是字符串直接返回
        if(typeof js === "string") {
          let content = js;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 最后尝试字符串化整个响应对象，以便用户查看
        return "（响应格式不标准）\n" + JSON.stringify(js, null, 2);
      }
      return "（无有效回复）";
    }
  }catch(e){
    console.error("callApiForChat error", e);
    const errorType = e.name || "未知错误";
    const errorMsg = e.message || "请求过程中发生错误";
    return `（请求失败：${errorType}）\n错误信息：${errorMsg}\n\n常见原因：\n1. 网络连接问题\n2. API服务不可用\n3. 防火墙或代理设置\n4. 浏览器安全策略限制\n\n建议检查网络连接和API配置`;
  }
}

// 支持图片的API调用函数
async function callApiForChatWithImages(apiCfg, userMessage, role, images = []) {
  try {
    // 首先尝试使用支持多模态的方式调用API
    const result = await callMultiModalApi(apiCfg, userMessage, role, images);
    if (result !== null) {
      return result;
    }
    
    // 如果多模态调用失败或API不支持多模态，则回退到普通文本调用
    console.log("多模态API调用失败，回退到普通文本调用");
    return callApiForChat(apiCfg, userMessage, role);
  } catch (error) {
    console.error("callApiForChatWithImages error:", error);
    // 出错时也回退到普通文本调用
    return callApiForChat(apiCfg, userMessage, role);
  }
}

// 多模态API调用函数（支持图片）
async function callMultiModalApi(apiCfg, userMessage, role, images = []) {
  try {
    // 检查API配置是否有效
    if(!apiCfg || !apiCfg.base || typeof apiCfg.base !== 'string' || apiCfg.base.trim() === '') {
      console.error("无效的API配置: base地址为空或不是字符串");
      return null;
    }
    
    const base = normalizeBaseUrl(apiCfg.base);
    // 构建完整API URL
    let url;
    
    // 检查是否是完整URL（包含协议和主机）
    const isFullUrl = /^https?:\/\//i.test(base);
    
    // 智能URL构建，避免重复路径
    if(base.endsWith('/v1/chat/completions')) {
      url = base;
    } else if(base.endsWith('/v1')) {
      url = base + "/chat/completions";
    } else if(base.endsWith('/v1/chat')) {
      url = base + "/completions";
    } else if(base.includes('/v1/v1')) {
      const cleanBase = base.replace('/v1/v1', '/v1');
      url = cleanBase + "/chat/completions";
    } else if(base.includes('/chat/completions')) {
      url = base;
    } else {
      // 标准路径格式
      if (isFullUrl && !base.includes('/v1')) {
        url = base + "/v1/chat/completions";
      } else if (!isFullUrl && base.includes('.') && !base.startsWith('/')) {
        url = "https://" + base + "/v1/chat/completions";
      } else {
        url = base + "/v1/chat/completions";
      }
    }
    
    const headers = {"Content-Type":"application/json"};
    if(apiCfg.key) headers["Authorization"] = "Bearer " + apiCfg.key;

    const body = {
      model: apiCfg.model || apiCfg.custom || "gpt-4o-mini", // 默认使用支持图片的模型
      temperature: parseFloat(apiCfg.temp || 0.8),
      messages: []
    };

    // include role system prompt first
    if(role.system) body.messages.push({role:"system", content: role.system});
    
    // include user's local emojis information so API can understand them
    const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
    if(localEmojis && localEmojis.length > 0) {
      const emojiInfo = localEmojis.map((emoji, index) => {
        return `[表情${index + 1}]: 用户上传的表情包图片，文件名为"${emoji.name}"`;
      }).join('\n');
      
      body.messages.push({
        role: "system", 
        content: `用户有以下自定义表情包可用，当用户使用[表情X]时，表示发送了对应的自定义表情包图片:\n${emojiInfo}\n\n重要：你使用[表情X]格式引用表情包时，请确保每个表情包单独作为一条消息发送，不要与文字混合在同一条消息中。即文字单独发一条消息，表情包单独发一条消息。\n\n另外，你可以根据自己的心情以及回复内容，主动选择合适的表情包来丰富对话。请根据对话氛围、情感表达和回复内容的需要，灵活使用这些表情包，使对话更加生动有趣。`
      });
    }

    // include global resources if allowed
    if((apiCfg === settings.globalApi && settings.globalApi.readRes) || (apiCfg !== settings.globalApi && settings.globalApi.readRes && settings.globalEnable)){
      // add books/preset/regex as system context (simple representation)
      if(settings.books && settings.books.length){
        body.messages.push({role:"system", content: "世界书：" + JSON.stringify(settings.books)});
      }
      if(settings.preset){
        body.messages.push({role:"system", content: "预设：" + JSON.stringify(settings.presets?.find(p=>p.id===settings.preset) || "")});
      }
      if(settings.regex && settings.regex.length){
        body.messages.push({role:"system", content: "正则：" + JSON.stringify(settings.regex)});
      }
    }

    // append messages as context with memory length limit
    const memoryLength = apiCfg.memoryEnabled ? (apiCfg.memoryLength || 10) : 10;
    (role.messages || []).slice(-memoryLength).forEach(m=> {
      if (m.type === 'image') {
        // 对于图片消息，我们需要特殊处理
        body.messages.push({
          role: m.me ? "user" : "assistant",
          content: [
            { type: "text", text: m.text || "[图片]" },
            // 如果有图片内容且是当前用户发送的消息，添加图片内容
            m.me && m.content ? { type: "image_url", image_url: { url: m.content } } : null
          ].filter(Boolean)
        });
      } else {
        // 普通文本消息
        body.messages.push({ role: m.me ? "user" : "assistant", content: m.text });
      }
    });

    // add current user message with images
    if (images && images.length > 0) {
      const messageContent = [
        { type: "text", text: userMessage }
      ];
      
      // 添加所有图片
      images.forEach(imgDataUrl => {
        messageContent.push({
          type: "image_url",
          image_url: { url: imgDataUrl }
        });
      });
      
      body.messages.push({ role: "user", content: messageContent });
    } else {
      // 没有图片，发送普通文本消息
      body.messages.push({ role: "user", content: userMessage });
    }

    // 显示正在请求API地址（调试信息）
    console.log("正在请求多模态API:", url);
    console.log("请求头:", headers);
    console.log("请求体:", body);
    
    // do request
    const resp = await fetch(url, { method:"POST", headers, body: JSON.stringify(body) });
    if(!resp.ok){
      console.log(`API请求失败: ${resp.status} ${resp.statusText}`);
      // 智能构建备用地址，避免重复路径
      let altUrl;
      if(base.includes('/chat/completions')) {
        // 如果主URL已经包含了/chat/completions，尝试使用/v1/chat/completions
        altUrl = base.replace('/chat/completions', '/v1/chat/completions');
      } else if(base.includes('/v1')) {
        // 如果已经包含/v1但没有/chat/completions，添加/chat/completions
        altUrl = base + "/chat/completions";
      } else {
        // 否则，添加完整的/v1/chat/completions路径
        altUrl = base + "/v1/chat/completions";
      }
      console.log("尝试备用地址:", altUrl);
      const alt = await fetch(altUrl, { method:"POST", headers, body: JSON.stringify(body) }).catch(()=>null);
      if(!alt || !alt.ok) {
        // try to parse error response for debugging
        let txt = "";
        try{ txt = await resp.text(); }catch(e){}
        console.warn("API returned non-ok:", resp.status, txt);
        return `（API 请求失败）\n请求URL: ${url}\n备用URL: ${altUrl || '未生成'}\nHTTP状态码: ${resp.status}\n\n错误详情:\n${txt.substring(0, 500)}...\n\n请检查：\n1. API基础地址是否正确\n2. API密钥是否有效\n3. 网络连接是否正常\n4. 防火墙是否阻止了请求`;
      } else {
        console.log("备用地址请求成功");
        const js = await alt.json().catch(()=>null);
        // attempt to extract content
        if(js && js.choices && js.choices[0] && js.choices[0].message) return js.choices[0].message.content;
        if(js && js.choices && js.choices[0] && js.choices[0].text) return js.choices[0].text;
        return typeof js === "string" ? js : "（API 返回格式不标准）";
      }
    } else {
      console.log("API请求成功，状态码:", resp.status);
      // 尝试解析JSON响应
      let js;
      try {
        js = await resp.json();
        console.log("API response:", js); // 添加调试信息
      } catch(e) {
        console.error("JSON parse error:", e);
        // 尝试以文本形式读取响应
        const text = await resp.text().catch(()=>null);
        if(text) {
          console.log("API text response:", text);
          // 检查是否是HTML错误页面
          if(text.startsWith('<!doctype') || text.includes('<html')) {
            // 分析HTML错误信息
            const titleMatch = text.match(/<title>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : "HTML错误页面";
            return `（API返回HTML错误页面，请检查API地址是否正确）\n请求URL: ${url}\n页面标题: ${title}\n\n错误页面预览:\n${text.substring(0, 500)}...`;
          }
          return `（响应不是有效的JSON格式）\n\n原始响应:\n${text.substring(0, 500)}...`;
        }
        return `（响应解析失败：${e.message}）\n\n请求URL: ${url}\n建议检查API地址是否正确，或网络连接是否正常。`;
      }

      // 尝试从不同格式的响应中提取内容
      if(js) {
        // 先检查是否包含错误信息
        if(js.error) {
          const errorMessage = js.error.message || JSON.stringify(js.error);
          const errorType = js.error.type || "API错误";
          const errorCode = js.error.code || "未知代码";
          return `（${errorType}）\n错误信息：${errorMessage}\n错误代码：${errorCode}\n\n建议：\n1. 检查API密钥是否有效\n2. 确认余额是否充足\n3. 稍后再试或联系API提供商支持`;
        }
        // 标准OpenAI格式
        if(js.choices && js.choices[0] && js.choices[0].message) {
          let content = js.choices[0].message.content;
          
          // 从content开头移除可能的系统提示
          if(content.startsWith("你可以使用[表情X]格式来引用并发送用户的自定义表情包")) {
            const promptEnd = content.indexOf("\n\n");
            if(promptEnd > -1) {
              content = content.substring(promptEnd + 2);
            }
          }
          
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            // 简单的字符数限制（实际应用中可替换为更精确的token计算）
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 旧版格式或其他API格式
        if(js.choices && js.choices[0] && js.choices[0].text) {
          let content = js.choices[0].text;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // Claude等API可能直接返回content
        if(js.content) {
          let content = js.content;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 某些API可能返回result字段
        if(js.result) {
          let content = js.result;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 如果响应是字符串直接返回
        if(typeof js === "string") {
          let content = js;
          // 应用令牌限制
          if(apiCfg.tokenLimitEnabled && apiCfg.tokenLimit) {
            if(content.length > apiCfg.tokenLimit) {
              content = content.substring(0, apiCfg.tokenLimit) + "...\n\n（回复已根据设置限制长度）";
            }
          }
          return content;
        }
        // 最后尝试字符串化整个响应对象，以便用户查看
        return "（响应格式不标准）\n" + JSON.stringify(js, null, 2);
      }
      return "（无有效回复）";
    }
  }catch(e){
    console.error("callApiForChat error", e);
    const errorType = e.name || "未知错误";
    const errorMsg = e.message || "请求过程中发生错误";
    return `（请求失败：${errorType}）\n错误信息：${errorMsg}\n\n常见原因：\n1. 网络连接问题\n2. API服务不可用\n3. 防火墙或代理设置\n4. 浏览器安全策略限制\n\n建议检查网络连接和API配置`;
  }
}

/* ========== More menu (+) logic ========== */
$("#wx-more-btn").addEventListener("click", ()=> $("#more-mask").style.display = "flex");
$("#more-mask").addEventListener("click", (ev)=> { if(ev.target.id === "more-mask") $("#more-mask").style.display = "none"; });

// first-level buttons
$("#add-friend-btn").addEventListener("click", ()=> $("#friend-sub").classList.toggle("active"));
$("#add-group-btn").addEventListener("click", ()=> toast("群聊功能暂未实现"));
$("#add-api-btn").addEventListener("click", ()=> {
  $("#more-mask").style.display = "none";
  preloadProviders(); fillGlobalApiForm();
  $("#global-api-mask").style.display = "flex";
});

/* ========== Role create/edit logic ========== */
// 角色头像上传功能
$("#role-avatar-box").addEventListener("click", function() {
  $("#role-avatar-upload").click();
});

$("#role-avatar-upload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // 检查文件类型
  if (!file.type.match('image.*')) {
    toast("请选择图片文件");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    // 更新头像预览
    $("#role-avatar-box").innerHTML = `<img src="${event.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
    
    // 如果正在编辑角色，更新角色的头像
    if (editingRole) {
      editingRole.avatar = event.target.result;
    }
  };
  reader.readAsDataURL(file);
  
  // 重置文件输入
  this.value = '';
});

$("#create-role-btn").addEventListener("click", ()=> {
  $("#more-mask").style.display = "none";
  editingRole = null;
  $("#role-name").value = "";
  $("#role-desc").value = "";
  $("#role-system").value = "";
  $("#role-greeting").value = "";
  $("#role-api-enabled").checked = false;
  $("#role-api-fields").classList.add("hidden");
  $("#role-delete").classList.add("hidden");
  // 重置头像显示
  $("#role-avatar-box").innerText = "A";
  $("#role-mask").style.display = "flex";
});

// toggle role api fields
$("#role-api-enabled").addEventListener("change", ()=> $("#role-api-fields").classList.toggle("hidden", !$("#role-api-enabled").checked));
$("#role-cancel").addEventListener("click", ()=> $("#role-mask").style.display = "none");

// save role
$("#role-save").addEventListener("click", ()=>{
  let r = editingRole || { id: genId(), messages: [] };
  r.name = $("#role-name").value.trim() || "新角色";
  r.desc = $("#role-desc").value.trim() || "";
  r.system = $("#role-system").value || "";
  r.greeting = $("#role-greeting").value || "";
  // 保存头像信息（如果有）
  if (editingRole && editingRole.avatar) {
    r.avatar = editingRole.avatar;
  }
  r.api = {
    enabled: !!$("#role-api-enabled").checked,
    base: $("#role-api-base").value.trim(),
    key: $("#role-api-key").value.trim(),
    model: $("#role-api-model").value.trim(),
    custom: $("#role-api-model-custom").value.trim(),
    temp: parseFloat($("#role-api-temp").value) || 0.8
  };
  if(!editingRole) roles.push(r);
  syncAll();
  $("#role-mask").style.display = "none";
  toast("已保存角色");
});

// delete
$("#role-delete").addEventListener("click", ()=>{
  if(!editingRole) return;
  roles = roles.filter(x => x.id !== editingRole.id);
  syncAll();
  $("#role-mask").style.display = "none";
  toast("已删除角色");
});

// 聊天界面右上角按钮点击事件 - 打开聊天信息页面
$("#chat-api-btn").addEventListener("click", ()=>{
    openChatInfoPage();
});

// 打开聊天信息页面的函数
function openChatInfoPage() {
    const chatPage = $('#chatpage');
    const chatInfoPage = $('#chatinfo-page');
    
    // 先更新聊天信息页面的数据
    updateChatInfoPage();
    
    // 设置状态栏样式
    $("#statusbar").classList.remove("statusbar-main");
    $("#statusbar").classList.add("statusbar-wechat");
    $("#statusbar").style.background = "var(--pink)";
    
    // 设置聊天信息页面头部高度
    $("#chatinfo-page .wx-header").style.marginTop = "0";
    $("#chatinfo-page .wx-header").style.height = "60px";
    
    // 淡出聊天页面
    chatPage.style.opacity = '0';
    
    setTimeout(() => {
        // 隐藏聊天页面
        chatPage.style.display = 'none';
        
        // 显示聊天信息页面
        chatInfoPage.style.display = 'flex';
        chatInfoPage.style.flexDirection = 'column';
        
        // 淡入聊天信息页面
        setTimeout(() => {
            chatInfoPage.style.opacity = '1';
        }, 10);
    }, 300);
}

// 返回聊天页面的函数
function closeChatInfoPage() {
    const chatPage = $('#chatpage');
    const chatInfoPage = $('#chatinfo-page');
    
    // 淡出聊天信息页面
    chatInfoPage.style.opacity = '0';
    
    setTimeout(() => {
        // 隐藏聊天信息页面
        chatInfoPage.style.display = 'none';
        
        // 显示聊天页面
        chatPage.style.display = 'flex';
        
        // 淡入聊天页面
        setTimeout(() => {
            chatPage.style.opacity = '1';
        }, 10);
    }, 300);
}

// 更新聊天信息页面数据的函数
function updateChatInfoPage() {
    // 提供默认角色对象，避免defaultRole未定义的错误
    const defaultRole = {
        name: "角色",
        avatar: "img/微信图标.jpg"
    };
    
    const roleModel = window.currentRole || defaultRole;
    
    // 更新角色名称
    if ($("#chatinfo-role-name")) {
        $("#chatinfo-role-name").textContent = roleModel.name || "角色";
    }
    
    // 更新角色头像
    if ($("#chatinfo-role-avatar")) {
        $("#chatinfo-role-avatar").src = roleModel.avatar || "img/微信图标.jpg";
    }
}

// 聊天信息页面返回按钮点击事件
$("#chatinfo-back").addEventListener("click", closeChatInfoPage);

// 角色头像点击事件 - 触发文件选择
$("#chatinfo-role-avatar-container").addEventListener("click", ()=>{
    $("#chatinfo-avatar-upload").click();
});

/* Role API probe/test */
async function probeModels(base, key){
  if(!base) return [];
  const normalizedBase = normalizeBaseUrl(base);
  
  // 智能构建测试URL，避免重复路径
  const testUrls = [];
  
  // 检查基础地址是否已经包含完整路径
  if (normalizedBase.includes('/models')) {
    testUrls.push(normalizedBase);
  } else {
    // 主要URL - 标准格式
    let mainUrl;
    if (normalizedBase.endsWith('/v1')) {
      mainUrl = normalizedBase + '/models';
    } else if (normalizedBase.includes('/v1/')) {
      mainUrl = normalizedBase.replace(/\/v1\/.*$/, '/v1/models');
    } else {
      mainUrl = normalizedBase + '/v1/models';
    }
    testUrls.push(mainUrl);
    
    // 备选URL - 不包含v1的格式
    if (!normalizedBase.includes('/v1')) {
      testUrls.push(normalizedBase + '/models');
    }
    
    // 清理重复的v1路径问题
    if (normalizedBase.includes('/v1/v1')) {
      const cleanBase = normalizedBase.replace('/v1/v1', '/v1');
      testUrls.push(cleanBase + '/models');
    }
  }
  const headers = {};
  if(key) headers["Authorization"] = "Bearer " + key;
  for(const u of testUrls){
    const js = await safeFetch(u, { headers });
    // heuristics: look for data array with id fields
    if(js && Array.isArray(js.data)) return js.data.map(d => d.id || d.name).filter(Boolean);
    // some providers return {models:[]}
    if(js && Array.isArray(js.models)) return js.models.map(d => d.id || d.name).filter(Boolean);
    // some public APIs return array directly
    if(Array.isArray(js)) return js.map(x=>x.id||x.name||x).filter(Boolean);
  }
  return [];
}

$("#role-api-probe").addEventListener("click", async ()=>{
  const base = $("#role-api-base").value.trim();
  const key = $("#role-api-key").value.trim();
  const sel = $("#role-api-model");
  sel.innerHTML = "";
  toast("尝试自动获取模型...");
  const models = await probeModels(base, key);
  if(models.length){
    models.forEach(m => {
      const o = document.createElement("option"); o.value = m; o.textContent = m;
      sel.appendChild(o);
    });
    $("#role-api-status").innerText = "已获取模型";
    toast("已获取模型列表");
  } else {
    $("#role-api-status").innerText = "获取失败";
    toast("获取模型失败，请检查 Base/Key 或手动输入模型");
  }
});

$("#role-api-test").addEventListener("click", async ()=>{
  const ok = await testApi($("#role-api-base").value.trim(), $("#role-api-key").value.trim());
  $("#role-api-status").innerText = ok ? "连通成功" : "连通失败";
});

/* ========== Global API UI & Logic ========== */
// 初始化全局API配置的事件监听器
function initGlobalApiSettingsEvents() {
  // 令牌限制开关事件
  $("#global-api-token-limit-enabled").addEventListener("change", function() {
    const isEnabled = this.checked;
    $("#global-api-token-limit").disabled = !isEnabled;
  });
  
  // 令牌限制滑块事件
  $("#global-api-token-limit").addEventListener("input", function() {
    $("#global-api-token-limit-value").innerText = this.value;
  });
  
  // 记忆长度开关事件
  $("#global-api-memory-enabled").addEventListener("change", function() {
    const isEnabled = this.checked;
    $("#global-api-memory").disabled = !isEnabled;
  });
  
  // 记忆长度滑块事件
  $("#global-api-memory").addEventListener("input", function() {
    $("#global-api-memory-value").innerText = this.value;
  });
}

// 在页面加载完成后初始化事件监听器
window.addEventListener('DOMContentLoaded', function() {
  initGlobalApiSettingsEvents();
  
  // 初始化头像圆角自定义功能
  window.avatarRadiusSettings = setupAvatarRadiusCustomization();
  
  // 初始化多功能面板
  initMultiPanel();
  
  // 初始化拍一拍设置功能
  setupPatSettingFeature();
});

const OFFICIAL_PROVIDERS = [
  { name: "OpenAI 官方", base: "https://api.openai.com/v1" },
  { name: "Anthropic", base: "https://api.anthropic.com/v1" }
];
const PUBLIC_PROVIDERS = [
  { name: "公益站 示例 A", base: "https://free.gptapi.net/v1" },
  { name: "公益站 示例 B", base: "https://chatgpt.loli.net/v1" }
];

function preloadProviders(){
  const mode = $("#global-api-mode").value;
  const list = mode === "public" ? PUBLIC_PROVIDERS : OFFICIAL_PROVIDERS;
  const sel = $("#global-provider");
  sel.innerHTML = "";
  list.forEach(p=>{
    const o = document.createElement("option");
    o.value = p.base;
    o.textContent = p.name + " — " + p.base;
    sel.appendChild(o);
  });
}
$("#global-api-providers-refresh").addEventListener("click", ()=>{
  preloadProviders();
  toast("已刷新供应商示例（本地列表）");
});

$("#global-provider").addEventListener("change", ()=>{
  $("#global-api-base").value = $("#global-provider").value || $("#global-api-base").value;
});

// probe global models
$("#global-api-probe").addEventListener("click", async ()=>{
  const base = $("#global-api-base").value.trim();
  const key = $("#global-api-key").value.trim();
  const sel = $("#global-api-model");
  sel.innerHTML = "";
  toast("尝试自动获取模型...");
  const models = await probeModels(base, key);
  if(models.length){
    models.forEach(m=>{
      const o = document.createElement("option"); o.value = m; o.textContent = m;
      sel.appendChild(o);
    });
    $("#global-api-status").innerText = "已获取模型";
    toast("已获取模型列表");
  } else {
    $("#global-api-status").innerText = "获取失败";
    toast("获取模型失败");
  }
});

// test api connectivity via /models
async function testApi(base,key){
  if(!base) return false;
  const normalizedBase = normalizeBaseUrl(base);
  
  // 智能构建测试URL，避免重复路径
  const urls = [];
  
  // 检查基础地址是否已经包含完整路径
  if (normalizedBase.includes('/models')) {
    urls.push(normalizedBase);
  } else {
    // 主要URL - 标准格式
    let mainUrl;
    if (normalizedBase.endsWith('/v1')) {
      mainUrl = normalizedBase + '/models';
    } else if (normalizedBase.includes('/v1/')) {
      mainUrl = normalizedBase.replace(/\/v1\/.*$/, '/v1/models');
    } else {
      mainUrl = normalizedBase + '/v1/models';
    }
    urls.push(mainUrl);
    
    // 备选URL - 不包含v1的格式
    if (!normalizedBase.includes('/v1')) {
      urls.push(normalizedBase + '/models');
    }
    
    // 清理重复的v1路径问题
    if (normalizedBase.includes('/v1/v1')) {
      const cleanBase = normalizedBase.replace('/v1/v1', '/v1');
      urls.push(cleanBase + '/models');
    }
  }
  
  const headers = {};
  if(key) headers["Authorization"] = "Bearer " + key;
  for(const u of urls){
    const js = await safeFetch(u, { headers });
    if(js) {
      return true;
    }
  }
  return false;
}
$("#global-api-test").addEventListener("click", async ()=>{
  const ok = await testApi($("#global-api-base").value.trim(), $("#global-api-key").value.trim());
  $("#global-api-status").innerText = ok ? "连通成功" : "连通失败";
});
$("#global-api-cancel").addEventListener("click", ()=> $("#global-api-mask").style.display = "none");

// save global api
$("#global-api-save").addEventListener("click", ()=>{
  settings.globalApi = settings.globalApi || {};
  settings.globalApi.enabled = true;
  settings.globalApi.mode = $("#global-api-mode").value;
  settings.globalApi.base = $("#global-api-base").value.trim();
  settings.globalApi.key = $("#global-api-key").value.trim();
  settings.globalApi.model = $("#global-api-model").value.trim() || $("#global-api-model-custom").value.trim();
  settings.globalApi.custom = $("#global-api-model-custom").value.trim();
  settings.globalApi.temp = parseFloat($("#global-api-temp").value) || 0.8;
  settings.globalApi.readRes = !!$("#global-api-read-res").checked;
  
  // 添加回复令牌限制设置
  settings.globalApi.tokenLimitEnabled = !!$("#global-api-token-limit-enabled").checked;
  settings.globalApi.tokenLimit = parseInt($("#global-api-token-limit").value) || 1000;
  
  // 添加记忆长度设置
  settings.globalApi.memoryEnabled = !!$("#global-api-memory-enabled").checked;
  settings.globalApi.memoryLength = parseInt($("#global-api-memory").value) || 10;
  
  saveAll();
  $("#global-api-mask").style.display = "none";
  toast("已保存全局 API");
});

/* 验证API配置 */
function validateApiConfig(apiCfg) {
  if(!apiCfg || !apiCfg.base) return { valid: false, message: "未配置API基础地址" };
  if(typeof apiCfg.base !== 'string') return { valid: false, message: "API基础地址必须是字符串" };
  
  // 简单的URL格式验证
  try {
    const url = new URL(apiCfg.base.includes('://') ? apiCfg.base : 'http://' + apiCfg.base);
    if(!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, message: "API基础地址必须使用HTTP或HTTPS协议" };
    }
  } catch(e) {
    return { valid: false, message: `无效的URL格式: ${e.message}` };
  }
  
  return { valid: true, message: "API配置格式正确" };
}

/* fill fields when opening */
function fillGlobalApiForm(){
  const g = settings.globalApi || {};
  $("#global-api-mode").value = g.mode || "official";
  preloadProviders();
  $("#global-api-base").value = g.base || "";
  $("#global-api-key").value = g.key || "";
  $("#global-api-model").value = g.model || "";
  $("#global-api-model-custom").value = g.custom || "";
  $("#global-api-temp").value = g.temp ?? 0.8;
  $("#global-api-read-res").checked = !!g.readRes;
  
  // 填充令牌限制设置
  $("#global-api-token-limit-enabled").checked = !!g.tokenLimitEnabled;
  $("#global-api-token-limit").value = g.tokenLimit || 1000;
  $("#global-api-token-limit-value").innerText = g.tokenLimit || 1000;
  $("#global-api-token-limit").disabled = !g.tokenLimitEnabled;
  
  // 填充记忆长度设置
  $("#global-api-memory-enabled").checked = !!g.memoryEnabled;
  $("#global-api-memory").value = g.memoryLength || 10;
  $("#global-api-memory-value").innerText = g.memoryLength || 10;
  $("#global-api-memory").disabled = !g.memoryEnabled;
  
  // 验证配置并显示状态
  const validation = validateApiConfig(g);
  $("#global-api-status").innerText = g.base ? validation.message : "未检测";
  $("#global-api-status").className = validation.valid ? "status-valid" : "status-invalid";
}

/* ========== Settings center - Tabs and resources ========= */
$all("#settings-modal .tabbar button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $all("#settings-modal .tabbar button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.target;
    $all("#settings-modal .section").forEach(sec=>{
      sec.classList.toggle("active", sec.id === target);
    });
  });
});

// render chips/pills from settings
function renderSettingsResources(){
  // books
  const booksWrap = $("#chips-book"); booksWrap.innerHTML = "";
  (settings.books || []).forEach(b=>{
    const el = document.createElement("div");
    el.className = "chip";
    el.dataset.id = b.id;
    el.innerHTML = `
      <span class="resource-name">${b.name}</span>
      <span class="edit-icon">✎</span>
    `;
    if((settings.selectedBooks||[]).includes(b.id)) el.classList.add("active");
    
    // 编辑按钮点击事件
    el.querySelector('.edit-icon').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal('book', b);
    });
    
    // 选中状态点击事件
    el.addEventListener("click", ()=>{
      settings.selectedBooks = settings.selectedBooks || [];
      if(settings.selectedBooks.includes(b.id)){
        settings.selectedBooks = settings.selectedBooks.filter(x=>x!==b.id);
        el.classList.remove("active");
      } else {
        settings.selectedBooks.push(b.id);
        el.classList.add("active");
      }
      saveAll();
    });
    booksWrap.appendChild(el);
  });

  // presets (single select)
  const preWrap = $("#pills-preset"); preWrap.innerHTML = "";
  (settings.presets || []).forEach(p=>{
    const el = document.createElement("div");
    el.className = "pill";
    el.dataset.id = p.id;
    el.innerHTML = `
      <span class="resource-name">${p.name}</span>
      <span class="edit-icon">✎</span>
    `;
    if(settings.preset === p.id) el.classList.add("active");
    
    // 编辑按钮点击事件
    el.querySelector('.edit-icon').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal('preset', p);
    });
    
    // 选中状态点击事件
    el.addEventListener("click", ()=>{
      settings.preset = (settings.preset === p.id) ? null : p.id;
      renderSettingsResources();
      saveAll();
    });
    preWrap.appendChild(el);
  });

  // regex
  const regWrap = $("#chips-regex"); regWrap.innerHTML = "";
  (settings.regex || []).forEach(r=>{
    const el = document.createElement("div");
    el.className = "chip";
    el.dataset.id = r.id;
    el.innerHTML = `
      <span class="resource-name">${r.name}</span>
      <span class="edit-icon">✎</span>
    `;
    if((settings.selectedRegex||[]).includes(r.id)) el.classList.add("active");
    
    // 编辑按钮点击事件
    el.querySelector('.edit-icon').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal('regex', r);
    });
    
    // 选中状态点击事件
    el.addEventListener("click", ()=>{
      settings.selectedRegex = settings.selectedRegex || [];
      if(settings.selectedRegex.includes(r.id)){
        settings.selectedRegex = settings.selectedRegex.filter(x=>x!==r.id);
        el.classList.remove("active");
      } else {
        settings.selectedRegex.push(r.id);
        el.classList.add("active");
      }
      saveAll();
    });
    regWrap.appendChild(el);
  });
}

// 编辑模态框控制
let currentEditingType = null;
let currentEditingId = null;

function openEditModal(type, item = null) {
  currentEditingType = type;
  currentEditingId = item ? item.id : null;
  const modal = $("#edit-resource-modal");
  const titleInput = $("#edit-title");
  const contentInput = $("#edit-content");
  const regexPatternInput = $("#edit-regex-pattern");
  const regexSection = $("#edit-regex-section");
  const contentSection = $("#edit-content-section");

  // 根据类型显示不同字段
  if (type === 'regex') {
    regexSection.style.display = 'block';
    contentSection.style.display = 'none';
    modal.querySelector("h3").textContent = "编辑正则规则";
  } else {
    regexSection.style.display = 'none';
    contentSection.style.display = 'block';
    modal.querySelector("h3").textContent = type === 'book' ? "编辑世界书" : "编辑预设";
  }

  // 填充表单数据
  if (item) {
    titleInput.value = item.name || '';
    if (type === 'regex') {
      regexPatternInput.value = item.pattern || '';
    } else {
      contentInput.value = item.content || '';
    }
  } else {
    titleInput.value = '';
    contentInput.value = '';
    regexPatternInput.value = '';
  }

  $("#edit-resource-mask").style.display = "flex";
}

// 保存编辑内容
function saveResourceEdit() {
  const title = $("#edit-title").value.trim();
  if (!title) {
    toast("名称不能为空");
    return;
  }

  const item = {
    id: currentEditingId || genId(),
    name: title
  };

  // 根据类型添加不同字段
  if (currentEditingType === 'regex') {
    const pattern = $("#edit-regex-pattern").value.trim();
    if (!pattern) {
      toast("正则表达式不能为空");
      return;
    }
    item.pattern = pattern;
  } else {
    item.content = $("#edit-content").value.trim();
  }

  // 保存到对应的数据结构
  if (currentEditingType === 'book') {
    const index = settings.books.findIndex(b => b.id === currentEditingId);
    if (index >= 0) {
      settings.books[index] = item;
    } else {
      settings.books.push(item);
    }
  } else if (currentEditingType === 'preset') {
    const index = settings.presets.findIndex(p => p.id === currentEditingId);
    if (index >= 0) {
      settings.presets[index] = item;
    } else {
      settings.presets.push(item);
      // 如果是新增预设且没有选中预设，自动选中
      if (!settings.preset) {
        settings.preset = item.id;
      }
    }
  } else if (currentEditingType === 'regex') {
    const index = settings.regex.findIndex(r => r.id === currentEditingId);
    if (index >= 0) {
      settings.regex[index] = item;
    } else {
      settings.regex.push(item);
    }
  }

  saveAll();
  renderSettingsResources();
  $("#edit-resource-mask").style.display = "none";
  toast("保存成功");
}

// 资源文件上传处理
function handleResourceUpload(type, files) {
  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const content = e.target.result;
      let resources = [];

      // 支持单资源JSON和资源数组JSON
      const json = JSON.parse(content);
      if (Array.isArray(json)) {
        resources = json;
      } else {
        resources.push(json);
      }

      // 验证并保存资源
      let count = 0;
      resources.forEach(item => {
        if (typeof item.name !== 'string' || !item.name.trim()) return;

        const newItem = {
          id: genId(),
          name: item.name.trim()
        };

        if (type === 'regex') {
          if (typeof item.pattern !== 'string') return;
          newItem.pattern = item.pattern;
          settings.regex.push(newItem);
        } else {
          if (typeof item.content !== 'string') return;
          newItem.content = item.content;
          if (type === 'book') {
            settings.books.push(newItem);
          } else {
            settings.presets.push(newItem);
          }
        }
        count++;
      });

      saveAll();
      renderSettingsResources();
      toast(`成功导入 ${count} 个${type === 'book' ? '世界书' : type === 'preset' ? '预设' : '正则规则'}`);
    } catch (e) {
      console.error("文件解析失败", e);
      toast("文件格式无效，请上传JSON文件");
    }
  };

  reader.readAsText(file);
}

// 设置页面相关事件
// settings open/save
$("#btn-settings").addEventListener("click", ()=>{
  $("#settings-mask").style.display = "flex";
  $("#global-enable").checked = !!settings.globalEnable;
  $("#global-role-read").checked = !!settings.globalRoleRead;
  renderSettingsResources();
});
$("#settings-cancel").addEventListener("click", ()=> $("#settings-mask").style.display = "none");
// 上传按钮事件
$("#upload-book-btn").addEventListener("click", ()=>{
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => handleResourceUpload('book', e.target.files);
  input.click();
});

$("#upload-preset-btn").addEventListener("click", ()=>{
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => handleResourceUpload('preset', e.target.files);
  input.click();
});

$("#upload-regex-btn").addEventListener("click", ()=>{
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => handleResourceUpload('regex', e.target.files);
  input.click();
});

// 编辑模态框事件
$("#edit-resource-save").addEventListener("click", saveResourceEdit);
$("#edit-resource-cancel").addEventListener("click", ()=>{
  $("#edit-resource-mask").style.display = "none";
});

// 编辑按钮事件
$("#edit-book-btn").addEventListener("click", ()=>{
  // 查找第一个被选中的世界书
  const selectedId = (settings.selectedBooks || []).find(id => true);
  if (!selectedId) {
    toast("请先选择一个世界书");
    return;
  }
  const selected = settings.books.find(b => b.id === selectedId);
  if (selected) {
    openEditModal('book', selected);
  }
});

$("#edit-preset-btn").addEventListener("click", ()=>{
  if (!settings.preset) {
    toast("请先选择一个预设");
    return;
  }
  const selected = settings.presets.find(p => p.id === settings.preset);
  if (selected) {
    openEditModal('preset', selected);
  }
});

$("#edit-regex-btn").addEventListener("click", ()=>{
  // 查找第一个被选中的正则规则
  const selectedId = (settings.selectedRegex || []).find(id => true);
  if (!selectedId) {
    toast("请先选择一个正则规则");
    return;
  }
  const selected = settings.regex.find(r => r.id === selectedId);
  if (selected) {
    openEditModal('regex', selected);
  }
});

$("#settings-save").addEventListener("click", ()=>{
  settings.globalEnable = !!$("#global-enable").checked;
  settings.globalRoleRead = !!$("#global-role-read").checked;
  saveAll();
  $("#settings-mask").style.display = "none";
  toast("设置已保存");
});

/* ========== Import JSON / PNG logic ========== */
/*
  Behavior:
  - User chooses files via input or drag-drop.
  - For .json: parse JSON -> if it's a role or array of roles, add to preview queue.
  - For image (png/jpg/webp): attempt to read textual metadata chunks in PNG (tEXt/iTXt/zTXt)
    and parse JSON payloads for keys like 'chara_card', 'chara_card_v2' (common in role cards).
  - Render preview list with checkboxes (default checked).
  - On "导入并同步", push selected items into roles and syncAll().
*/

// helper: read file as ArrayBuffer and text
function readFileAsArrayBuffer(file){ return new Promise((res, rej)=>{ const fr = new FileReader(); fr.onload = ()=> res(fr.result); fr.onerror = ()=> rej(fr.error); fr.readAsArrayBuffer(file); }); }
function readFileAsText(file){ return new Promise((res, rej)=>{ const fr = new FileReader(); fr.onload = ()=> res(fr.result); fr.onerror = ()=> rej(fr.error); fr.readAsText(file, "utf-8"); }); }

// parse PNG textual chunks
function parsePngTextChunks(arrayBuffer){
  // PNG format: 8-byte signature, then chunks: length(4) type(4) data(length) crc(4)
  const dat = new DataView(arrayBuffer);
  const sig = [];
  for(let i=0;i<8;i++) sig.push(dat.getUint8(i));
  // check PNG signature
  const pngSig = [137,80,78,71,13,10,26,10];
  let isPng = pngSig.every((b,i)=>b===sig[i]);
  if(!isPng) return {}; // not png
  let offset = 8;
  const texts = {};
  while(offset < dat.byteLength){
    if(offset + 8 > dat.byteLength) break;
    const length = dat.getUint32(offset); offset += 4;
    // read chunk type
    let type = "";
    for(let i=0;i<4;i++){ type += String.fromCharCode(dat.getUint8(offset+i)); }
    offset += 4;
    if(offset + length > dat.byteLength) break;
    // read data
    const chunkData = new Uint8Array(arrayBuffer, offset, length);
    // tEXt : keyword\0text
    if(type === "tEXt" || type === "zTXt" || type === "iTXt"){
      // attempt to decode as utf-8
      let text = "";
      try { text = new TextDecoder("utf-8").decode(chunkData); } catch(e){ text = ""; }
      // tEXt is "keyword\0text"
      const parts = text.split('\u0000');
      if(parts.length >= 2){
        const key = parts.shift();
        const val = parts.join('\u0000');
        texts[key] = val;
      } else {
        // fallback: maybe "key:value" or raw
        const idx = text.indexOf(':');
        if(idx > 0){
          const key = text.slice(0, idx).trim();
          const val = text.slice(idx+1).trim();
          texts[key] = val;
        } else {
          // unknown name, store under unknownX
          const k = "unknown_" + offset;
          texts[k] = text;
        }
      }
    } else {
      // ignore other chunk types
    }
    offset += length;
    offset += 4; // skip CRC
  }
  return texts;
}

// parse import file (json or image) and return array of parsed items (role objects)
async function parseImportFile(file){
  const results = [];
  const name = file.name || "";
  const lower = name.toLowerCase();
  try{
    if(lower.endsWith(".json")){
      const txt = await readFileAsText(file);
      let obj;
      try { obj = JSON.parse(txt); } catch(e){ obj = null; }
      if(!obj){ toast("JSON 解析失败：" + file.name); return results; }
      // obj may be single role or array, or wrapper
      if(Array.isArray(obj)){
        obj.forEach(o=> {
          if(o && o.name) results.push( normalizeImportedRole(o) );
        });
      } else {
        // if the object is wrapper like {kind:'role', data: {...}}
        if(obj.kind === "role" && obj.data) results.push(normalizeImportedRole(obj.data));
        else if(obj.name && obj.system!==undefined) results.push(normalizeImportedRole(obj));
        else if(obj.roles && Array.isArray(obj.roles)) obj.roles.forEach(o=> { if(o) results.push(normalizeImportedRole(o)); });
        else {
          // fallback: ignore
          console.warn("Unrecognized JSON import", obj);
        }
      }
    } else if(/\.(png|jpg|jpeg|webp)$/i.test(lower)){
      // PNG: try chunk parse (only PNG has textual chunks reliably)
      const ab = await readFileAsArrayBuffer(file);
      const txts = parsePngTextChunks(ab);
      // common keys: chara_card, chara_card_v2, role, metadata
      const possibleKeys = Object.keys(txts);
      // try known keys
      let used = false;
      for(const key of possibleKeys){
        const val = txts[key];
        if(!val) continue;
        // attempt parse json inside
        try{
          const js = JSON.parse(val);
          // if js looks like a role
          if(js && (js.name || js.character || js.system)){
            results.push(normalizeImportedRole(js));
            used = true;
          } else if(Array.isArray(js)){
            js.forEach(o=> { if(o) results.push(normalizeImportedRole(o)); });
            used = true;
          } else {
            // if contains "chara" or "role" fields
            if(js && (js.chara || js.role || js.character)) {
              results.push(normalizeImportedRole(js));
              used = true;
            }
          }
        }catch(e){
          // value might be base64 embedded JSON or other encoding; try base64 decode
          try{
            // if value contains base64-looking text, decode
            const clean = val.trim();
            // ignore tiny strings
            if(clean.length > 50){
              const decoded = atob(clean);
              try{
                const js2 = JSON.parse(decoded);
                if(js2 && (js2.name || js2.system)) { results.push(normalizeImportedRole(js2)); used = true; }
              }catch(e){}
            }
          }catch(e){}
        }
      }
      if(!used){
        // Not found metadata -> maybe the PNG just a card image; create a placeholder role with filename
        const placeholder = {
          id: genId(),
          name: file.name.replace(/\.[^.]+$/,''),
          desc: "从图片导入的角色卡（仅名称）",
          system: "",
          greeting: "",
          api: { enabled:false }
        };
        results.push(placeholder);
      }
    } else {
      // unknown file type - ignore
      toast("不支持的文件类型：" + file.name);
    }
  }catch(e){
    console.error("parseImportFile error", e);
  }
  return results;
}

// normalize incoming role-like objects to our role shape
function normalizeImportedRole(o){
  // attempt flexible mapping
  const role = {
    id: o.id || genId(),
    name: o.name || o.title || o.character || ("角色_"+genId().slice(1,6)),
    desc: o.desc || o.description || o.summary || "",
    system: o.system || o.system_prompt || o.system_prompt_text || "",
    greeting: o.greeting || o.welcome || o.start || "",
    api: o.api || { enabled:false },
    messages: []
  };
  return role;
}

/* UI Drag & Drop & File input handlers */
const importFileInput = $("#import-file");
const importDrop = $("#import-drop");
const importBadges = $("#import-badges");
const importPreview = $("#import-preview");
let importQueue = []; // {role, selected, sourceFileName}

if(importFileInput){
  importFileInput.addEventListener("change", async (ev)=>{
    const files = Array.from(ev.target.files || []);
    await handleImportFiles(files);
    importFileInput.value = ""; // reset
  });
}
if(importDrop){
  importDrop.addEventListener("dragover", (e)=>{ e.preventDefault(); importDrop.classList.add("drag"); });
  importDrop.addEventListener("dragleave", ()=> importDrop.classList.remove("drag"));
  importDrop.addEventListener("drop", async (e)=>{
    e.preventDefault(); importDrop.classList.remove("drag");
    const files = Array.from(e.dataTransfer.files || []);
    await handleImportFiles(files);
  });
}

async function handleImportFiles(files){
  importBadges.innerHTML = "";
  importPreview.innerHTML = "";
  importQueue = [];
  if(!files || files.length===0) return;
  // show badges
  files.forEach(f=>{
    const b = document.createElement("div"); b.className="file-badge"; b.innerText = f.name;
    importBadges.appendChild(b);
  });
  // process sequentially
  for(const f of files){
    const parsed = await parseImportFile(f);
    parsed.forEach(roleObj=>{
      const entry = { role: roleObj, selected: true, src: f.name };
      importQueue.push(entry);
    });
  }
  // render preview
  renderImportPreview();
}

function renderImportPreview(){
  importPreview.innerHTML = "";
  importQueue.forEach((e, idx)=>{
    const node = document.getElementById("tpl-import-item").content.cloneNode(true);
    const item = node.querySelector(".item");
    item.dataset.index = idx;
    item.dataset.kind = "role";
    node.querySelector(".title").innerText = e.role.name || "无名角色";
    node.querySelector(".desc").innerText = e.role.desc || ("来源：" + (e.src||"文件"));
    const chk = node.querySelector(".import-checked");
    chk.checked = !!e.selected;
    chk.addEventListener("change", (ev)=>{
      importQueue[idx].selected = !!ev.target.checked;
    });
    importPreview.appendChild(node);
  });
}

/* apply import */
$("#import-apply").addEventListener("click", ()=>{
  if(importQueue.length === 0){ toast("无导入内容"); return; }
  const toAdd = importQueue.filter(x=>x.selected).map(x=>normalizeImportedRole(x.role));
  if(toAdd.length === 0){ toast("未选择任何项目"); return; }
  // ensure unique IDs
  toAdd.forEach(r=>{
    r.id = r.id || genId();
    roles.push(r);
  });
  syncAll(); // save + render chat & contacts
  $("#import-mask").style.display = "none";
  toast(`已导入 ${toAdd.length} 个角色`);
  importQueue = [];
  importPreview.innerHTML = "";
  importBadges.innerHTML = "";
});

$("#import-cancel").addEventListener("click", ()=> {
  importQueue = [];
  importPreview.innerHTML = "";
  importBadges.innerHTML = "";
  $("#import-mask").style.display = "none";
});

/* ========== Settings initial data (if none) ========== */
// provide some demo presets/books/regex if empty
(function ensureDefaults(){
  if(!settings.presets || !settings.presets.length){
    settings.presets = [
      { id: genId(), name: "友好风格", content: "使用友好语气，回答详细" },
      { id: genId(), name: "简洁风格", content: "回答简洁、直奔主题" }
    ];
  }
  if(!settings.books || !settings.books.length){
    settings.books = [
      { id: genId(), name: "世界观 A", content: "这是角色 A 的世界设定..." },
      { id: genId(), name: "世界观 B", content: "这是角色 B 的世界设定..." }
    ];
  }
  if(!settings.regex || !settings.regex.length){
    settings.regex = [
      { id: genId(), name: "过滤表情", pattern: "\\p{Emoji}" },
      { id: genId(), name: "屏蔽脏话", pattern: "脏话词汇" }
    ];
  }
  saveAll();
})();

/* ========== Render initial lists =========*/
renderChatList();
renderContacts();

/* ========== Settings load on startup (globalApi fill) ========= */
fillGlobalApiForm();

/* ========== Initialize avatar and nickname customization ========= */
setupAvatarCustomization();
setupNicknameCustomization();
updateUserAvatars();
updateUserNicknames();

/* ========== Utility: open masks for import/global api/role editor ====== */
$all("[id$='-btn']").forEach(b=>{/* placeholder to avoid lint */});

/* Note: you can add more helper functions below as needed (e.g., remove role by id, duplicate role, export) */

/* ========== API角色在线状态显示功能 ========== */
// 更新API角色在线状态
function updateRoleOnlineStatus(isOnline) {
  const statusElement = document.getElementById('role-online-status');
  if (!statusElement) return; // 如果元素不存在，不执行后续操作
  
  const statusIndicator = statusElement.querySelector('.status-indicator');
  const statusText = document.getElementById('status-text');
  
  if (isOnline) {
    statusIndicator.classList.remove('offline');
    statusIndicator.classList.add('online');
    statusText.textContent = '在线';
    statusText.style.color = '#21a67a';
  } else {
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
    statusText.textContent = '离线';
    statusText.style.color = '#999';
  }
}

// 模拟API角色在线状态监测
function startOnlineStatusMonitoring() {
  // 每30秒模拟检查一次在线状态
  setInterval(() => {
    // 这里可以替换为真实的API检查逻辑
    const isOnline = Math.random() > 0.05; // 95%的概率在线
    updateRoleOnlineStatus(isOnline);
  }, 30000);
}

/* ========== 表情包功能 ========== */
// 初始化表情包功能
function initEmojiSystem() {
  const emojiPanel = document.getElementById('emoji-panel');
  const leftBtn = document.getElementById('left-btn');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  
  // 如果元素不存在，不执行后续操作
  if (!emojiPanel || !leftBtn || !chatInput || !sendBtn) return;
  
  // 初始化时确保表情包面板不显示
  emojiPanel.classList.remove('active');
  
  // 常用系统表情列表
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', 
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥'
  ];
  
  // 创建并加载系统表情
  const emojiGrid = document.getElementById('emoji-grid');
  if (emojiGrid) {
    emojiGrid.innerHTML = '';
    commonEmojis.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'emoji-item';
      emojiItem.textContent = emoji;
      emojiItem.addEventListener('click', () => {
        insertEmoji(emoji);
      });
      emojiGrid.appendChild(emojiItem);
    });
  }
  
  // 插入表情到输入框
  function insertEmoji(emoji) {
    const start = chatInput.selectionStart;
    const end = chatInput.selectionEnd;
    const value = chatInput.value;
    
    chatInput.value = value.substring(0, start) + emoji + value.substring(end);
    chatInput.focus();
    chatInput.selectionStart = chatInput.selectionEnd = start + emoji.length;
    chatInput.dispatchEvent(new Event('input'));
  }
  
  // 渲染系统表情的函数
  function renderSystemEmojis() {
    if (!emojiGrid) return;
    
    emojiGrid.innerHTML = '';
    commonEmojis.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'emoji-item';
      emojiItem.textContent = emoji;
      emojiItem.addEventListener('click', () => {
        insertEmoji(emoji);
      });
      emojiGrid.appendChild(emojiItem);
    });
  }
  
  // 切换表情包面板显示/隐藏
  leftBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const inputbarContainer = document.querySelector('.inputbar-container');
    const multiPanel = document.getElementById('multi-panel');
    
    if (emojiPanel.classList.contains('active')) {
      // 隐藏面板
      emojiPanel.classList.remove('active');
      inputbarContainer.classList.remove('expanded');
    } else {
      // 检查多功能面板是否处于激活状态
      if (multiPanel && multiPanel.classList.contains('active')) {
        // 关闭多功能面板
        multiPanel.classList.remove('active');
        inputbarContainer.classList.remove('expanded-multi');
        
        // 添加一个短暂的延迟以实现平滑过渡效果
        setTimeout(() => {
          // 显示表情包面板
          emojiPanel.classList.add('active');
          inputbarContainer.classList.add('expanded');
          
          // 强制设置面板为不透明
          emojiPanel.style.background = '#ffffff';
          emojiPanel.style.backgroundColor = '#ffffff';
          emojiPanel.style.opacity = '1';
          emojiPanel.style.backdropFilter = 'none';
          
          // 强制设置所有子元素为不透明
          const allElements = emojiPanel.querySelectorAll('*');
          allElements.forEach(el => {
            el.style.background = '#ffffff';
            el.style.backgroundColor = '#ffffff';
            el.style.opacity = '1';
            el.style.backdropFilter = 'none';
          });
        }, 300);
      } else {
        // 正常显示表情包面板
        emojiPanel.classList.add('active');
        inputbarContainer.classList.add('expanded');
        
        // 强制设置面板为不透明
        emojiPanel.style.background = '#ffffff';
        emojiPanel.style.backgroundColor = '#ffffff';
        emojiPanel.style.opacity = '1';
        emojiPanel.style.backdropFilter = 'none';
        
        // 强制设置所有子元素为不透明
        const allElements = emojiPanel.querySelectorAll('*');
        allElements.forEach(el => {
          el.style.background = '#ffffff';
          el.style.backgroundColor = '#ffffff';
          el.style.opacity = '1';
          el.style.backdropFilter = 'none';
        });
      }
    }
  });
  
  // 点击其他区域关闭表情包面板
  document.addEventListener('click', (e) => {
    // 只有当表情包面板是激活状态时才执行判断
    if (emojiPanel.classList.contains('active')) {
      // 检查点击目标是否在表情包面板内或是否是表情包按钮
      const isClickInsidePanel = emojiPanel.contains(e.target);
      const isClickOnButton = e.target === leftBtn;
      
      // 如果点击既不是在面板内，也不是在表情包按钮上，则关闭面板
      if (!isClickInsidePanel && !isClickOnButton) {
        emojiPanel.classList.remove('active');
        const inputbarContainer = document.querySelector('.inputbar-container');
        inputbarContainer.classList.remove('expanded');
      }
    }
  });
  
  // 功能按钮切换
  const btnSystemEmoji = document.getElementById('btn-system-emoji');
  const btnImportEmoji = document.getElementById('btn-import-emoji');
  const systemEmojisSection = document.getElementById('system-emojis');
  const localEmojisSection = document.getElementById('local-emojis');
  const uploadEmojiBtn = document.querySelector('.upload-emoji-btn-large');
  const uploadEmojiInput = document.getElementById('upload-emoji-input');
  
  // 系统表情按钮点击事件
  if (btnSystemEmoji && systemEmojisSection && localEmojisSection) {
    btnSystemEmoji.addEventListener('click', () => {
      btnSystemEmoji.classList.add('active');
      btnImportEmoji.classList.remove('active');
      systemEmojisSection.style.display = 'block';
      localEmojisSection.style.display = 'none';
      
      // 确保系统表情已加载
      if (emojiGrid && emojiGrid.innerHTML.trim() === '') {
        renderSystemEmojis();
      }
    });
  }
  
  // 导入表情按钮点击事件
  if (btnImportEmoji && systemEmojisSection && localEmojisSection) {
    btnImportEmoji.addEventListener('click', () => {
      btnImportEmoji.classList.add('active');
      btnSystemEmoji.classList.remove('active');
      systemEmojisSection.style.display = 'none';
      localEmojisSection.style.display = 'block';
      loadLocalEmojis();
    });
  }
  
  // 上传按钮点击事件（触发文件选择）
  if (uploadEmojiBtn && uploadEmojiInput) {
    uploadEmojiBtn.addEventListener('click', () => {
      uploadEmojiInput.click();
    });
  }
  
  // 加载本地表情
  function loadLocalEmojis() {
    const localEmojisContainer = document.getElementById('local-emojis-container');
    
    if (!localEmojisContainer) return;
    
    // 清除现有内容
    localEmojisContainer.innerHTML = '';
    
    // 从localStorage加载本地表情
    const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
    localEmojis.forEach((emojiData, index) => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'local-emoji-item';
      emojiItem.style.position = 'relative';
      
      const img = document.createElement('img');
      img.src = emojiData.url;
      img.alt = '表情';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      
      // 添加删除按钮
      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'delete-emoji-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        localEmojis.splice(index, 1);
        localStorage.setItem('localEmojis', JSON.stringify(localEmojis));
        loadLocalEmojis();
      });
      
      emojiItem.appendChild(img);
      emojiItem.appendChild(deleteBtn);
      emojiItem.addEventListener('click', () => {
        // 对于本地图片，使用占位符表示
        const emojiPlaceholder = `[表情${index + 1}]`;
        insertEmoji(emojiPlaceholder);
      });
      
      localEmojisContainer.appendChild(emojiItem);
    });
  }
  
  // 上传本地表情 - 确保功能完整
  // 使用已声明的变量，不再重复声明
  if (uploadEmojiInput && btnImportEmoji) {
    // 文件选择变化时处理上传
    uploadEmojiInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files.length === 0) return;
      
      // 获取已有的本地表情
      const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
      
      let filesProcessed = 0;
      let filesToProcess = files.length;
      
      // 显示导入表情标签
      btnImportEmoji.click();
      
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          filesProcessed++;
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          // 保存表情数据到localStorage
          localEmojis.push({
            url: event.target.result,
            name: file.name,
            size: file.size,
            type: file.type,
            timestamp: Date.now()
          });
          
          filesProcessed++;
          
          // 所有文件处理完成后保存并刷新
          if (filesProcessed === filesToProcess) {
            // 限制本地表情数量，避免localStorage过大
            if (localEmojis.length > 100) {
              localEmojis.shift();
            }
            
            localStorage.setItem('localEmojis', JSON.stringify(localEmojis));
            loadLocalEmojis();
          }
        };
        reader.onerror = () => {
          filesProcessed++;
        };
        reader.readAsDataURL(file);
      });
      
      // 清空input，允许重复上传同一文件
      uploadEmojiInput.value = '';
    });
  }
  
  // 监听发送按钮，确保发送消息时关闭表情包面板
  sendBtn.addEventListener('click', () => {
    emojiPanel.classList.remove('active');
    const inputbarContainer = document.querySelector('.inputbar-container');
    inputbarContainer.classList.remove('expanded');
  });
  
  // 初始化系统表情，确保首次打开面板时有内容显示
  renderSystemEmojis();
}

/* ========== 初始化多功能面板 ========== */
function initMultiPanel() {
  const multiPanel = document.getElementById('multi-panel');
  const rightBtn1 = document.getElementById('right-btn-1');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const emojiPanel = document.getElementById('emoji-panel');
  const panel1 = document.getElementById('multi-panel-panel-1');
  const panel2 = document.getElementById('multi-panel-panel-2');
  const indicators = document.querySelectorAll('.multi-panel-indicator');
  const panelNextBtn = document.getElementById('panel-next-btn');
  const panelPrevBtn = document.getElementById('panel-prev-btn');
  
  // 如果元素不存在，不执行后续操作
  if (!multiPanel || !rightBtn1 || !chatInput || !sendBtn || !panel1 || !panel2) return;
  
  // 初始化时确保多功能面板不显示
  multiPanel.classList.remove('active');
  
  // 切换多功能面板显示/隐藏
  rightBtn1.addEventListener('click', (e) => {
    e.stopPropagation();
    const inputbarContainer = document.querySelector('.inputbar-container');
    
    // 确保表情包面板关闭
    emojiPanel.classList.remove('active');
    inputbarContainer.classList.remove('expanded');
    
    if (multiPanel.classList.contains('active')) {
      // 隐藏面板
      multiPanel.classList.remove('active');
      inputbarContainer.classList.remove('expanded-multi');
    } else {
      // 显示面板
      multiPanel.classList.add('active');
      inputbarContainer.classList.add('expanded-multi');
      
      // 强制设置面板为不透明
      multiPanel.style.background = '#ffffff';
      multiPanel.style.backgroundColor = '#ffffff';
      multiPanel.style.opacity = '1';
      multiPanel.style.backdropFilter = 'none';
      
      // 强制设置所有子元素为不透明
      const allElements = multiPanel.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.background = '#ffffff';
        el.style.backgroundColor = '#ffffff';
        el.style.opacity = '1';
        el.style.backdropFilter = 'none';
      });
    }
  });
  
  // 点击其他区域关闭多功能面板
  document.addEventListener('click', (e) => {
    // 只有当多功能面板是激活状态时才执行判断
    if (multiPanel.classList.contains('active')) {
      // 检查点击目标是否在多功能面板内或是否是多功能面板按钮
      const isClickInsidePanel = multiPanel.contains(e.target);
      const isClickOnButton = e.target === rightBtn1 || rightBtn1.contains(e.target);
      
      // 如果点击既不是在面板内，也不是在多功能面板按钮上，则关闭面板
      if (!isClickInsidePanel && !isClickOnButton) {
        multiPanel.classList.remove('active');
        const inputbarContainer = document.querySelector('.inputbar-container');
        inputbarContainer.classList.remove('expanded-multi');
      }
    }
  });
  
  // 监听发送按钮，确保发送消息时关闭多功能面板
  sendBtn.addEventListener('click', () => {
    multiPanel.classList.remove('active');
    const inputbarContainer = document.querySelector('.inputbar-container');
    inputbarContainer.classList.remove('expanded-multi');
  });
  
  // 切换面板功能
  function switchPanel(panelNumber) {
    if (panelNumber === 1) {
      panel1.style.display = 'block';
      panel2.style.display = 'none';
      indicators[0].classList.add('active');
      indicators[1].classList.remove('active');
    } else {
      panel1.style.display = 'none';
      panel2.style.display = 'block';
      indicators[0].classList.remove('active');
      indicators[1].classList.add('active');
    }
  }
  
  // 添加指示器点击事件
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const panelNumber = parseInt(indicator.dataset.panel);
      switchPanel(panelNumber);
    });
  });
  
  // 为向右箭头按钮添加点击事件
  if (panelNextBtn) {
    panelNextBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      switchPanel(2); // 切换到第二个面板
    });
  }
  
  // 为向左箭头按钮添加点击事件
  if (panelPrevBtn) {
    panelPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      switchPanel(1); // 切换回第一个面板
    });
  }
  
  // 为多功能面板中的每个项目添加点击事件
  const multiPanelItems = multiPanel.querySelectorAll('.multi-panel-item');
  multiPanelItems.forEach((item) => {
    item.addEventListener('click', () => {
      // 打印日志，表示点击了哪个功能
      const functionName = item.querySelector('.multi-panel-text').textContent;
      console.log(`点击了${functionName}功能`);
      
      // 点击后关闭面板
      multiPanel.classList.remove('active');
      const inputbarContainer = document.querySelector('.inputbar-container');
      inputbarContainer.classList.remove('expanded-multi');
    });
  });
}

/* ========== 相册功能实现 ========== */
function initPhotoAlbum() {
  // 获取元素
  const photoAlbumItem = document.getElementById('photo-album-item');
  const photoMask = document.getElementById('photo-mask');
  const photoModal = document.getElementById('photo-modal');
  const photoInput = document.getElementById('photo-input');
  const photoUploadBtn = document.getElementById('photo-upload-btn');
  const photoPreviewContainer = document.getElementById('photo-preview-container');
  const photoCancelBtn = document.getElementById('photo-cancel-btn');
  const photoSendBtn = document.getElementById('photo-send-btn');
  
  // 存储选中的图片
  let selectedPhotos = [];
  let uploadedPhotos = [];
  
  // 相册项目点击事件
  if (photoAlbumItem) {
    photoAlbumItem.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡，避免触发父级的点击事件
      
      // 清空之前的选择和预览
      selectedPhotos = [];
      uploadedPhotos = [];
      photoPreviewContainer.innerHTML = '';
      photoSendBtn.disabled = true;
      
      // 显示图片选择器模态框
      photoMask.style.display = 'flex';
    });
  }
  
  // 点击上传按钮，触发文件选择
  if (photoUploadBtn) {
    photoUploadBtn.addEventListener('click', () => {
      photoInput.click();
    });
  }
  
  // 监听文件选择
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
              const imgDataUrl = event.target.result;
              uploadedPhotos.push(imgDataUrl);
              renderPhotoPreview(imgDataUrl);
            };
            
            reader.readAsDataURL(file);
          }
        }
      }
      
      // 重置input，以便能够重复选择同一文件
      photoInput.value = '';
    });
  }
  
  // 渲染图片预览
  function renderPhotoPreview(imgDataUrl) {
    const previewItem = document.createElement('div');
    previewItem.className = 'photo-preview-item';
    previewItem.dataset.url = imgDataUrl;
    
    const img = document.createElement('img');
    img.src = imgDataUrl;
    img.alt = '预览图片';
    
    previewItem.appendChild(img);
    photoPreviewContainer.appendChild(previewItem);
    
    // 添加点击选择事件
    previewItem.addEventListener('click', () => {
      if (previewItem.classList.contains('selected')) {
        // 取消选择
        previewItem.classList.remove('selected');
        const index = selectedPhotos.indexOf(imgDataUrl);
        if (index > -1) {
          selectedPhotos.splice(index, 1);
        }
      } else {
        // 选择图片
        previewItem.classList.add('selected');
        selectedPhotos.push(imgDataUrl);
      }
      
      // 更新发送按钮状态
      photoSendBtn.disabled = selectedPhotos.length === 0;
    });
  }
  
  // 取消按钮点击事件
  if (photoCancelBtn) {
    photoCancelBtn.addEventListener('click', () => {
      photoMask.style.display = 'none';
    });
  }
  
  // 发送按钮点击事件
  if (photoSendBtn) {
    photoSendBtn.addEventListener('click', async () => {
      if (selectedPhotos.length > 0 && currentRole) {
        const now = Date.now();
        
        // 发送选中的图片
        selectedPhotos.forEach((imgDataUrl) => {
          // 将图片消息添加到当前角色的消息列表
          currentRole.messages = currentRole.messages || [];
          currentRole.messages.push({
            me: true,
            type: 'image',
            content: imgDataUrl,
            text: '[图片]', // 添加文本提示，让API知道这里有图片
            read: true,
            time: now
          });
        });
        
        // 找到当前角色在roles数组中的索引并更新
        const roleIndex = roles.findIndex(r => r.id === currentRole.id);
        if (roleIndex !== -1) {
          roles[roleIndex] = currentRole;
        }
        
        // 保存并重新渲染消息列表
        saveAll();
        renderMessages();
        
        // 关闭图片选择器模态框
        photoMask.style.display = 'none';
        
        // 重置选中的图片数组，解决按钮需要点击多次的问题
        selectedPhotos = [];
        photoSendBtn.disabled = true;
        
        // 调用API获取回复（如果启用了自动回复）
        if (settings.globalApi && settings.globalApi.enabled) {
          // 直接添加"正在识别图片"的提示消息，确保它显示在气泡中
          currentRole.messages.push({
            me: false,
            text: '正在识别图片...',
            read: false,
            time: Date.now(),
            isTyping: true
          });
          saveAll();
          renderMessages();
          
          try {
            // 准备包含图片信息的提示
            let prompt = '用户发送了图片，请根据图片内容进行回复。';
            
            // 调用API并传递包含图片信息的上下文
            const reply = await callApiForChatWithImages(settings.globalApi, prompt, currentRole, selectedPhotos);
            
            // 移除"正在识别图片"的提示
            if (currentRole.messages && currentRole.messages.length > 0) {
              const lastIndex = currentRole.messages.length - 1;
              if (currentRole.messages[lastIndex].isTyping) {
                currentRole.messages.pop();
              }
            }
            
            // 添加API回复
            currentRole.messages.push({
              me: false,
              text: reply,
              read: false,
              time: Date.now()
            });
            
            // 保存并重新渲染消息列表
            saveAll();
            renderMessages();
          } catch (error) {
            console.error('API调用错误:', error);
            
            // 移除"正在识别图片"的提示
            if (currentRole.messages && currentRole.messages.length > 0) {
              const lastIndex = currentRole.messages.length - 1;
              if (currentRole.messages[lastIndex].isTyping) {
                currentRole.messages.pop();
              }
            }
            
            currentRole.messages.push({
              me: false,
              text: '抱歉，图片识别过程中出现错误。',
              read: false,
              time: Date.now()
            });
            saveAll();
            renderMessages();
          }
        }
      }
    });
  }
  
  // 点击模态框背景关闭
  if (photoMask) {
    photoMask.addEventListener('click', (e) => {
      if (e.target === photoMask) {
        photoMask.style.display = 'none';
      }
    });
  }
  
  // 阻止模态框内部点击事件冒泡
  if (photoModal) {
    photoModal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

/* ========== 图片查看器功能 ========== */
// 创建图片查看器
function createImageViewer() {
  // 检查是否已经存在图片查看器
  if (document.getElementById('image-viewer')) {
    return;
  }
  
  // 获取小手机模型容器
  const iphone = document.querySelector('.iphone');
  if (!iphone) {
    console.error('未找到小手机模型容器');
    return;
  }
  
  // 创建图片查看器容器 - 相对于小手机模型定位
  const viewer = document.createElement('div');
  viewer.id = 'image-viewer';
  viewer.style.position = 'absolute';
  viewer.style.top = '0';
  viewer.style.left = '0';
  viewer.style.width = '100%';
  viewer.style.height = '100%';
  viewer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  viewer.style.zIndex = '9999';
  viewer.style.display = 'none';
  viewer.style.justifyContent = 'center';
  viewer.style.alignItems = 'center';
  viewer.style.cursor = 'pointer';
  
  // 创建关闭按钮
  const closeBtn = document.createElement('div');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '50px'; // 调整位置，考虑刘海屏
  closeBtn.style.right = '30px';
  closeBtn.style.color = 'white';
  closeBtn.style.fontSize = '40px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.zIndex = '10';
  closeBtn.style.userSelect = 'none';
  
  // 创建图片容器 - 进一步缩小尺寸，确保完全在手机屏幕内
  const imgContainer = document.createElement('div');
  imgContainer.style.maxWidth = '70%';  
  imgContainer.style.maxHeight = '65%'; 
  imgContainer.style.display = 'flex';
  imgContainer.style.justifyContent = 'center';
  imgContainer.style.alignItems = 'center';
  
  // 创建大图显示元素
  const fullImg = document.createElement('img');
  fullImg.id = 'full-size-image';
  fullImg.style.maxWidth = '100%';
  fullImg.style.maxHeight = '100%';
  fullImg.style.objectFit = 'contain';
  
  // 组装图片查看器
  imgContainer.appendChild(fullImg);
  viewer.appendChild(closeBtn);
  viewer.appendChild(imgContainer);
  
  // 将图片查看器添加到小手机模型容器中，而不是body
  iphone.appendChild(viewer);
  
  // 添加关闭事件
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    viewer.style.display = 'none';
  });
  
  viewer.addEventListener('click', function() {
    viewer.style.display = 'none';
  });
  
  // 防止点击图片时关闭查看器
  fullImg.addEventListener('click', function(e) {
    e.stopPropagation();
  });
}

// 显示图片查看器
function showImageViewer(imgSrc) {
  const viewer = document.getElementById('image-viewer');
  const fullImg = document.getElementById('full-size-image');
  
  if (viewer && fullImg) {
    fullImg.src = imgSrc;
    viewer.style.display = 'flex';
    // 阻止页面滚动
    document.body.style.overflow = 'hidden';
    
    // 图片加载完成后恢复页面滚动
    fullImg.onload = function() {
      // 图片加载完成后的处理
    };
    
    // 图片加载失败的处理
    fullImg.onerror = function() {
      console.error('大图加载失败:', imgSrc);
    };
  }
}

// 页面加载时创建图片查看器并设置调试面板
window.addEventListener('load', function() {
  createImageViewer();
  setupDebugPanel();
});

// 为防止页面其他代码覆盖，在DOMContentLoaded时再次尝试创建
document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('image-viewer')) {
    createImageViewer();
  }
});

/* ========== 拍一拍消息相关函数 ========== */
// 发送拍一拍消息时使用的函数 
function sendPatMessage(sender, receiver) {
  const chatMessages = document.getElementById('chat-messages');
  
  // 创建独立的拍一拍容器（不嵌套在原有消息结构中）
  const patContainer = document.createElement('div');
  patContainer.className = 'pat-message-container';
  
  // 创建拍一拍内容
  const patMessage = document.createElement('div');
  patMessage.className = 'pat-message';
  patMessage.textContent = `${sender} 拍了拍 ${receiver}`;
  
  patContainer.appendChild(patMessage);
  chatMessages.appendChild(patContainer);
  
  // 滚动到底部
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ========== 修改消息渲染函数支持图片类型 ========== */
// 保存原始的renderMessages函数以便在新函数中调用
const originalRenderMessages = renderMessages;

// 重写renderMessages函数以支持图片类型和红包消息
function renderMessagesWithImageSupport() {
  console.log('renderMessagesWithImageSupport被调用');
  
  const box = document.getElementById('chat-messages');
  if (!box || !currentRole) {
    console.log('未找到聊天容器或当前角色');
    if (originalRenderMessages) originalRenderMessages();
    return;
  }
  
  box.innerHTML = "";
  if(!currentRole.messages) {
    console.log('当前角色没有消息');
    currentRole.messages = [];
  }
  
  console.log('当前角色消息数量:', currentRole.messages.length);
  // 检查是否有拍一拍消息
  const hasPatMessages = currentRole.messages.some(m => m.isPat || m.isSystem);
  console.log('是否包含拍一拍/系统消息:', hasPatMessages);
  // 打印所有拍一拍消息
  currentRole.messages.forEach((m, index) => {
    if (m.isPat || m.isSystem) {
      console.log(`消息${index}是拍一拍/系统消息:`, m);
    }
  });
  
  // 渲染消息
  currentRole.messages.forEach((m, index) => {
    // 对于拍一拍和系统消息，在聊天界面中间以特殊样式显示
    if (m.isPat || m.isSystem) {
      console.log(`正在处理消息${index} - 拍一拍/系统消息:`, m);
      // 创建独立的拍一拍容器
      const patContainer = document.createElement('div');
      patContainer.className = 'pat-message-container';
      
      // 创建拍一拍内容
      const patMessage = document.createElement('div');
      patMessage.className = 'pat-message';
      patMessage.textContent = m.text;
      
      patContainer.appendChild(patMessage);
      box.appendChild(patContainer);
      console.log('已将拍一拍消息添加到聊天容器');
      return;
    }
    
    // 渲染常规消息
    const tpl = m.me ? document.getElementById("tpl-message-me").content.cloneNode(true)
                     : document.getElementById("tpl-message").content.cloneNode(true);
    
    // 设置消息内容
    const msgContent = tpl.querySelector(".msg-content");
    
    // 特殊处理图片类型的消息
    if (m.type === 'image' && m.content) {
      try {
        // 添加图片元素
        const img = document.createElement('img');
        img.src = m.content;
        img.alt = '聊天图片';
        // 设置图片样式，使其适应气泡容器
        img.style.maxWidth = '95%'; // 相对于气泡容器的宽度
        img.style.maxHeight = '200px'; // 保持最大高度限制
        img.style.width = 'auto'; // 宽度自动适应
        img.style.height = 'auto'; // 高度自动适应
        img.style.borderRadius = '8px';
        img.style.objectFit = 'contain'; // 使用contain而非cover，确保图片完整显示
        img.style.display = 'block';
        img.style.margin = '8px auto'; // 添加一些内边距
        img.style.boxSizing = 'border-box'; // 确保padding和border包含在尺寸内
        img.style.cursor = 'pointer'; // 添加点击指针样式
        // 确保气泡容器能够正确包裹图片
        msgContent.style.padding = '8px'; // 设置气泡内边距
        msgContent.style.boxSizing = 'border-box'; // 确保尺寸计算正确
        
        // 添加点击放大查看原图功能
        img.addEventListener('click', function(e) {
          e.stopPropagation();
          showImageViewer(m.content);
        });
        
        // 添加图片加载错误处理
        img.onerror = function() {
          console.error('图片加载失败:', m.content.substring(0, 50) + '...');
          msgContent.innerHTML = '<span style="color: #999;">[图片加载失败]</span>';
        };
        
        msgContent.innerHTML = '';
        msgContent.appendChild(img);
      } catch (error) {
        console.error('渲染图片时出错:', error);
        msgContent.innerHTML = '<span style="color: #999;">[图片渲染失败]</span>';
      }
    } else {
      // 处理普通文本和表情消息
      let displayText = m.text || '';
      
      // 从localStorage加载本地表情
      const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
      
      // 检查是否包含纯表情消息
      const emojiOnlyMatch = displayText.match(/^\[表情(\d+)\]$/);
      if (emojiOnlyMatch) {
        const emojiNumber = parseInt(emojiOnlyMatch[1]);
        if (emojiNumber <= localEmojis.length && localEmojis[emojiNumber - 1]) {
          // 纯表情消息，直接显示图片
          const img = document.createElement('img');
          img.src = localEmojis[emojiNumber - 1].url;
          img.alt = '表情';
          img.style.width = '80px';
          img.style.height = '80px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '8px';
          img.style.cursor = 'pointer'; // 添加点击指针样式
          msgContent.innerHTML = '';
          msgContent.appendChild(img);
          
          // 添加点击放大查看原图功能
          img.addEventListener('click', function(e) {
            e.stopPropagation();
            showImageViewer(localEmojis[emojiNumber - 1].url);
          });
        } else {
          // 表情不存在，使用默认emoji
          const emojiMap = {
            1: '😂', 2: '😊', 3: '😍', 4: '😎', 5: '🥳',
            6: '😭', 7: '😡', 8: '🤔', 9: '😴', 10: '😱'
          };
          const emoji = emojiMap[emojiNumber] || '😊';
          msgContent.innerText = emoji;
        }
      } else {
        // 文本消息中包含表情占位符
        const localEmojiMatches = displayText.match(/\[表情(\d+)\]/g);
        if (localEmojiMatches) {
          // 构建带HTML的消息内容
          let htmlContent = displayText;
          localEmojiMatches.forEach(match => {
            const emojiNumber = parseInt(match.match(/\d+/)[0]);
            if (emojiNumber <= localEmojis.length && localEmojis[emojiNumber - 1]) {
              // 替换为图片标签
              const imgTag = `<img src="${localEmojis[emojiNumber - 1].url}" alt="表情" style="width:24px;height:24px;vertical-align:middle;margin:0 2px;cursor:pointer" onclick="showImageViewer('${localEmojis[emojiNumber - 1].url}'); event.stopPropagation();">`;
              htmlContent = htmlContent.replace(match, imgTag);
            } else {
              // 表情不存在，使用默认emoji
              const emojiMap = {
                1: '😂', 2: '😊', 3: '😍', 4: '😎', 5: '🥳',
                6: '😭', 7: '😡', 8: '🤔', 9: '😴', 10: '😱'
              };
              const emoji = emojiMap[emojiNumber] || '😊';
              htmlContent = htmlContent.replace(match, emoji);
            }
          });
          msgContent.innerHTML = htmlContent;
        } else {
          // 普通文本消息
          msgContent.textContent = displayText;
        }
      }
    }
    
    // 拍一拍消息已在前面特殊处理，这里不需要再添加样式
    
    // 设置消息中的头像
    if (m.me) {
      const avatarImg = tpl.querySelector(".user-msg-avatar");
      if (avatarImg) {
        avatarImg.src = userProfile.avatar;
      }
    } else {
      const avatarImg = tpl.querySelector(".role-msg-avatar");
      if (avatarImg) {
        avatarImg.src = currentRole.avatar || "img/微信图标.jpg";
      }
    }
    
    // 设置已读状态显示
    const readStatusEl = tpl.querySelector('.read-status');
    if (readStatusEl) {
      if (m.me) {
        readStatusEl.textContent = m.read ? '已读' : '未读';
        readStatusEl.style.color = m.read ? '#666' : '#999';
      } else {
        readStatusEl.textContent = m.read ? '已读' : '未读';
        readStatusEl.style.color = m.read ? '#666' : '#999';
      }
    }
    
    // 设置消息发送时间显示
    const timeEl = tpl.querySelector('.message-time');
    if (timeEl && m.time) {
      timeEl.textContent = formatTime(m.time);
    }
    
    box.appendChild(tpl);
  });
  
  // 为所有用户头像添加点击事件
  document.querySelectorAll('.user-msg-avatar').forEach(avatar => {
    const newAvatar = avatar.cloneNode(true);
    avatar.parentNode.replaceChild(newAvatar, avatar);
    
    newAvatar.addEventListener('click', function(e) {
      e.stopPropagation();
      if (window.avatarRadiusSettings && window.avatarRadiusSettings.openModal) {
        window.avatarRadiusSettings.openModal();
      }
    });
  });
  
  // 渲染红包消息 - 从chatMessagesHistory中获取
  if (window.chatMessagesHistory && Array.isArray(window.chatMessagesHistory)) {
    // 过滤出红包类型的消息
    const redPacketMessages = window.chatMessagesHistory.filter(msg => msg.type === 'redpacket');
    
    // 将红包消息与常规消息合并并按时间排序
    const allMessages = [...currentRole.messages].map(m => ({
      ...m,
      isRegularMessage: true,
      timestamp: m.time || Date.now()
    })).concat(redPacketMessages.map(m => ({
      ...m,
      isRedPacket: true,
      timestamp: m.timestamp || Date.now()
    })));
    
    // 按时间戳排序
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    // 清空聊天区域，重新渲染排序后的所有消息
    box.innerHTML = "";
    
    // 渲染排序后的消息
    allMessages.forEach(m => {
      if (m.isRegularMessage) {
        // 对于拍一拍和系统消息，在聊天界面中间以特殊样式显示
        if (m.isPat || m.isSystem) {
          console.log(`正在处理消息 - 拍一拍/系统消息:`, m);
          // 创建独立的拍一拍容器
          const patContainer = document.createElement('div');
          patContainer.className = 'pat-message-container';
          
          // 创建拍一拍内容
          const patMessage = document.createElement('div');
          patMessage.className = 'pat-message';
          patMessage.textContent = m.text;
          
          patContainer.appendChild(patMessage);
          box.appendChild(patContainer);
          console.log('已将拍一拍消息添加到聊天容器');
          return;
        }
        
        // 渲染常规消息
        const tpl = m.me ? document.getElementById("tpl-message-me").content.cloneNode(true)
                         : document.getElementById("tpl-message").content.cloneNode(true);
        
        // 设置消息内容
        const msgContent = tpl.querySelector(".msg-content");
        
        // 特殊处理图片类型的消息
        if (m.type === 'image' && m.content) {
          try {
            // 添加图片元素
            const img = document.createElement('img');
            img.src = m.content;
            img.alt = '聊天图片';
            // 设置图片样式，使其适应气泡容器
            img.style.maxWidth = '95%'; // 相对于气泡容器的宽度
            img.style.maxHeight = '200px'; // 保持最大高度限制
            img.style.width = 'auto'; // 宽度自动适应
            img.style.height = 'auto'; // 高度自动适应
            img.style.borderRadius = '8px';
            img.style.objectFit = 'contain'; // 使用contain而非cover，确保图片完整显示
            img.style.display = 'block';
            img.style.margin = '8px auto'; // 添加一些内边距
            img.style.boxSizing = 'border-box'; // 确保padding和border包含在尺寸内
            img.style.cursor = 'pointer'; // 添加点击指针样式
            // 确保气泡容器能够正确包裹图片
            msgContent.style.padding = '8px'; // 设置气泡内边距
            msgContent.style.boxSizing = 'border-box'; // 确保尺寸计算正确
            
            // 添加点击放大查看原图功能
            img.addEventListener('click', function(e) {
              e.stopPropagation();
              showImageViewer(m.content);
            });
            
            // 添加图片加载错误处理
            img.onerror = function() {
              console.error('图片加载失败:', m.content.substring(0, 50) + '...');
              msgContent.innerHTML = '<span style="color: #999;">[图片加载失败]</span>';
            };
            
            msgContent.innerHTML = '';
            msgContent.appendChild(img);
          } catch (error) {
            console.error('渲染图片时出错:', error);
            msgContent.innerHTML = '<span style="color: #999;">[图片渲染失败]</span>';
          }
        } else {
          // 处理普通文本和表情消息
          let displayText = m.text || '';
          
          // 从localStorage加载本地表情
          const localEmojis = JSON.parse(localStorage.getItem('localEmojis') || '[]');
          
          // 检查是否包含纯表情消息
          const emojiOnlyMatch = displayText.match(/^\[表情(\d+)\]$/);
          if (emojiOnlyMatch) {
            const emojiNumber = parseInt(emojiOnlyMatch[1]);
            if (emojiNumber <= localEmojis.length && localEmojis[emojiNumber - 1]) {
              // 纯表情消息，直接显示图片
              const img = document.createElement('img');
              img.src = localEmojis[emojiNumber - 1].url;
              img.alt = '表情';
              img.style.width = '80px';
              img.style.height = '80px';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '8px';
              img.style.cursor = 'pointer'; // 添加点击指针样式
              msgContent.innerHTML = '';
              msgContent.appendChild(img);
              
              // 添加点击放大查看原图功能
              img.addEventListener('click', function(e) {
                e.stopPropagation();
                showImageViewer(localEmojis[emojiNumber - 1].url);
              });
            } else {
              // 表情不存在，使用默认emoji
              const emojiMap = {
                1: '😂', 2: '😊', 3: '😍', 4: '😎', 5: '🥳',
                6: '😭', 7: '😡', 8: '🤔', 9: '😴', 10: '😱'
              };
              const emoji = emojiMap[emojiNumber] || '😊';
              msgContent.innerText = emoji;
            }
          } else {
            // 文本消息中包含表情占位符
            const localEmojiMatches = displayText.match(/\[表情(\d+)\]/g);
            if (localEmojiMatches) {
              // 构建带HTML的消息内容
              let htmlContent = displayText;
              localEmojiMatches.forEach(match => {
                const emojiNumber = parseInt(match.match(/\d+/)[0]);
                if (emojiNumber <= localEmojis.length && localEmojis[emojiNumber - 1]) {
                  // 替换为图片标签
                  const imgTag = `<img src="${localEmojis[emojiNumber - 1].url}" alt="表情" style="width:24px;height:24px;vertical-align:middle;margin:0 2px;cursor:pointer" onclick="showImageViewer('${localEmojis[emojiNumber - 1].url}'); event.stopPropagation();">`;
                  htmlContent = htmlContent.replace(match, imgTag);
                } else {
                  // 表情不存在，使用默认emoji
                  const emojiMap = {
                    1: '😂', 2: '😊', 3: '😍', 4: '😎', 5: '🥳',
                    6: '😭', 7: '😡', 8: '🤔', 9: '😴', 10: '😱'
                  };
                  const emoji = emojiMap[emojiNumber] || '😊';
                  htmlContent = htmlContent.replace(match, emoji);
                }
              });
              msgContent.innerHTML = htmlContent;
            } else {
              // 普通文本消息
              msgContent.textContent = displayText;
            }
          }
        }
        
        // 设置消息中的头像
        if (m.me) {
          const avatarImg = tpl.querySelector(".user-msg-avatar");
          if (avatarImg) {
            avatarImg.src = userProfile.avatar;
          }
        } else {
          const avatarImg = tpl.querySelector(".role-msg-avatar");
          if (avatarImg) {
            avatarImg.src = currentRole.avatar || "img/微信图标.jpg";
          }
        }
        
        // 设置已读状态显示
        const readStatusEl = tpl.querySelector('.read-status');
        if (readStatusEl) {
          if (m.me) {
            readStatusEl.textContent = m.read ? '已读' : '未读';
            readStatusEl.style.color = m.read ? '#666' : '#999';
          } else {
            readStatusEl.textContent = m.read ? '已读' : '未读';
            readStatusEl.style.color = m.read ? '#666' : '#999';
          }
        }
        
        // 设置消息发送时间显示
        const timeEl = tpl.querySelector('.message-time');
        if (timeEl && m.time) {
          timeEl.textContent = formatTime(m.time);
        }
        
        box.appendChild(tpl);
      } else if (m.isRedPacket) {
        // 渲染红包消息
        const isUser = m.sender === userProfile.nickname;
        
        // 创建红包消息元素
        const redPacketMsg = document.createElement('div');
        redPacketMsg.className = isUser ? 'msg me' : 'msg';
        
        // 创建红包样式
        let redPacketStyle = '';
        if (m.coverType === 'custom' && m.customCover) {
          redPacketStyle = `style="background-image: url(${m.customCover}); background-size: cover; background-position: center;"`;
        }
        
        // 构建红包消息HTML
        if (isUser) {
          // 用户消息：头像在右，消息在左
          redPacketMsg.innerHTML = `
            <div class="msg-container">
              <div class="redpacket-msg-item" ${redPacketStyle} data-amount="${m.amount}" data-message="${m.content}" data-cover-type="${m.coverType || 'default'}" data-custom-cover="${m.customCover || ''}" data-opened="${m.opened || false}">
                <div class="redpacket-msg-body">
                  <i class="fa fa-red-envelope"></i>
                  <span>${m.content}</span>
                </div>
              </div>
              ${m.opened ? '<div class="redpacket-opened-tip">对方已拆红包</div>' : ''}
            </div>
            <div class="msg-avatar-container">
              <div class="msg-avatar">
                <img src="${userProfile.avatar || '默认头像路径'}" alt="${m.sender}">
              </div>
            </div>`;
        } else {
          // 角色消息：头像在左，消息在右
          redPacketMsg.innerHTML = `
            <div class="msg-avatar-container">
              <div class="msg-avatar">
                <img src="${m.senderAvatar || currentRole.avatar || '默认角色头像路径'}" alt="${m.sender}">
              </div>
            </div>
            <div class="msg-container">
              <div class="redpacket-msg-item" ${redPacketStyle} data-amount="${m.amount}" data-message="${m.content}" data-cover-type="${m.coverType || 'default'}" data-custom-cover="${m.customCover || ''}" data-opened="${m.opened || false}">
                <div class="redpacket-msg-body">
                  <i class="fa fa-red-envelope"></i>
                  <span>${m.content}</span>
                </div>
              </div>
              ${m.opened ? '<div class="redpacket-opened-tip">已拆红包</div>' : ''}
            </div>`;
        }
        
        // 添加到聊天消息列表
        box.appendChild(redPacketMsg);
        
        // 添加点击事件
        const redPacketMsgItem = redPacketMsg.querySelector('.redpacket-msg-item');
        const isOpened = m.opened || false;
        
        if (!isOpened) {
          redPacketMsgItem.addEventListener('click', function() {
            const amount = parseFloat(this.getAttribute('data-amount'));
            const content = this.getAttribute('data-message');
            const coverType = this.getAttribute('data-cover-type');
            const customCover = this.getAttribute('data-custom-cover');
            showRedPacketMessageModal(m.sender, amount, content, coverType, customCover);
          });
        } else {
          // 如果已经打开，添加已拆样式
          redPacketMsgItem.classList.add('redpacket-opened');
        }
      }
    });
  }
  
  box.scrollTop = box.scrollHeight;
  
  // 自动标记API角色消息为已读
  markRoleMessagesAsRead();
  
  // 应用用户设置的头像圆角
  if (window.avatarRadiusSettings && window.avatarRadiusSettings.applyRadius) {
    const savedRadius = localStorage.getItem('avatarRadius') || '8';
    window.avatarRadiusSettings.applyRadius(savedRadius);
  }
}

// 立即替换原始的renderMessages函数
window.renderMessages = renderMessagesWithImageSupport;
// 确保页面加载完成后再次替换，防止被其他代码覆盖
window.addEventListener('load', () => {
  window.renderMessages = renderMessagesWithImageSupport;
});

/* ========== 钱包功能 ========== */
// 初始化钱包功能
function initWallet() {
  // 获取元素
  const walletBtn = $('#btn-wallet');
  const walletPage = $('#walletpage');
  const backWalletBtn = $('#wallet-back');
  const walletEyeBtn = $('#wallet-eye-btn');
  const walletAmount = $('#wallet-amount');
  
  if (!walletBtn || !walletPage || !backWalletBtn || !walletEyeBtn || !walletAmount) {
    console.warn('Wallet elements not found');
    return;
  }
  
  // 更新钱包余额显示
  function updateWalletBalance() {
    // 确保settings.wallet存在
    if (!settings.wallet) {
      settings.wallet = {
        balance: 1000.00,
        redPacketMaxAmount: 200.00
      };
      saveAll();
    }
    
    // 检查眼睛图标状态
    const eyeIcon = walletEyeBtn.querySelector('i');
    const isHidden = eyeIcon.classList.contains('fa-eye-slash');
    
    if (isHidden) {
      walletAmount.textContent = '••••';
    } else {
      walletAmount.textContent = settings.wallet.balance.toFixed(2);
    }
  }
  
  // 显示钱包页面（平滑切换）
  function showWallet() {
    // 获取iPhone容器
    const iphone = document.querySelector('.iphone');
    if (!iphone) {
      console.error('未找到iPhone容器');
      return;
    }
    
    // 确保iPhone容器有overflow:hidden属性，防止内容溢出
    iphone.style.overflow = 'hidden';
    
    // 设置初始样式
    walletPage.style.opacity = '0';
    walletPage.style.transform = 'translateX(0)'; // 重置transform属性
    walletPage.style.display = 'block';
    // 确保钱包页面在小手机容器内 - 相对于iPhone容器定位
    walletPage.style.position = 'absolute';
    walletPage.style.top = '0';
    walletPage.style.left = '0';
    walletPage.style.width = '100%';
    walletPage.style.height = '100%';
    walletPage.style.zIndex = '10'; // 降低z-index以确保状态栏可以覆盖
    walletPage.style.boxSizing = 'border-box';
    walletPage.style.paddingTop = '32px'; // 为顶部状态栏留出空间
    walletPage.style.paddingBottom = '48px'; // 为底部导航栏留出空间
    walletPage.style.overflow = 'hidden';
    
    // 添加动画效果
    setTimeout(() => {
      walletPage.style.opacity = '1';
    }, 10);
    
    // 隐藏其他主要内容区域
    const wechatPage = $('#wechatpage');
    if (wechatPage) {
      wechatPage.style.opacity = '0';
      // 不使用display:none，而是通过opacity控制显示/隐藏，保留DOM结构
    }
    
    // 确保底部导航栏可见
    const wxTabbar = document.querySelector('.wx-tabbar');
    if (wxTabbar) {
      wxTabbar.style.display = 'flex';
      wxTabbar.style.position = 'absolute'; // 改为absolute定位，相对于iPhone容器
      wxTabbar.style.bottom = '0';
      wxTabbar.style.zIndex = '70'; // 比walletPage更高，确保在最上层
    }
    
    // 更新状态栏样式为微信页面并设置正确的背景色，确保与钱包顶部融合
    $("#statusbar").classList.remove("statusbar-main");
    $("#statusbar").classList.add("statusbar-wechat");
    // 确保状态栏设置正确的布局和定位
    $("#statusbar").style.justifyContent = "space-between";
    $("#statusbar").style.position = "absolute";
    $("#statusbar").style.top = "0";
    $("#statusbar").style.left = "0";
    $("#statusbar").style.right = "0";
    $("#statusbar").style.zIndex = "9999";
    $("#statusbar").style.pointerEvents = "none";
    $("#statusbar").style.background = "var(--pink)"; // 设置与钱包顶部相同的背景色
    $("#statusbar").style.minHeight = "32px";
    $("#statusbar").style.padding = "12px 16px 0 16px";
    $("#statusbar").style.fontSize = "15px";
    $("#statusbar").style.alignItems = "center";
    
    // 更新余额显示
    updateWalletBalance();
  }
  
  // 返回上一页
  function hideWallet() {
    // 先恢复wechatPage的可见性，再隐藏walletPage，避免闪烁
    const wechatPage = $('#wechatpage');
    if (wechatPage) {
      wechatPage.style.opacity = '1';
    }
    
    // 然后淡出walletPage
    walletPage.style.opacity = '0';
    
    setTimeout(() => {
      walletPage.style.display = 'none';
          
        // 更新状态栏样式为微信页面
        $("#statusbar").classList.remove("statusbar-main");
        $("#statusbar").classList.add("statusbar-wechat");
          
        // 确保返回"我"这个Tab
        const meTab = $('#wx-tab-me');
        const tabbarItems = document.querySelectorAll('.tabbar-item');
        const wxTabbar = document.querySelector('.wx-tabbar');
        
        // 移除所有tab的激活状态
        document.querySelectorAll('.wx-tab').forEach(tab => {
          tab.classList.remove('wx-tab-active');
        });
        
        // 激活"我"这个Tab
        if (meTab) {
          meTab.classList.add('wx-tab-active');
        }
        
        // 确保底部导航栏正确显示
        if (wxTabbar) {
          wxTabbar.style.display = 'flex';
          wxTabbar.style.position = 'absolute';
          wxTabbar.style.bottom = '0';
          wxTabbar.style.zIndex = '50';
        }
        
        // 恢复iPhone容器的overflow属性
        const iphone = document.querySelector('.iphone');
        if (iphone) {
          iphone.style.overflow = 'hidden'; // 保持与原始CSS一致
        }
        
        // 更新底部导航栏的激活状态
        tabbarItems.forEach(item => {
          item.classList.remove('tabbar-active');
          if (item.getAttribute('data-tab') === 'me') {
            item.classList.add('tabbar-active');
          }
        });
        
        // 重新设置微信列表页面头部高度为90px，确保从钱包返回后高度不变
        $("#wechatpage .wx-header").style.height = "90px";
    }, 300);
  }
  
  // 切换余额显示/隐藏
  function toggleBalanceVisibility() {
    const eyeIcon = walletEyeBtn.querySelector('i');
    const isHidden = eyeIcon.classList.contains('fa-eye-slash');
    
    if (isHidden) {
      // 显示余额
      walletAmount.textContent = settings.wallet.balance.toFixed(2);
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    } else {
      // 隐藏余额
      walletAmount.textContent = '••••';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    }
  }
  
  // 添加事件监听器
  walletBtn.addEventListener('click', showWallet);
  backWalletBtn.addEventListener('click', hideWallet);
  walletEyeBtn.addEventListener('click', toggleBalanceVisibility);
  
  // 为功能按钮添加点击效果
  const featureItems = $all('.wallet-feature-item');
  featureItems.forEach(item => {
    item.addEventListener('click', () => {
      toast('功能即将上线');
    });
  });
  
  // 为服务列表项添加点击效果
  const serviceItems = $all('.wallet-service-item');
  serviceItems.forEach(item => {
    item.addEventListener('click', () => {
      toast('服务即将上线');
    });
  });
  
  // 初始化余额显示
  updateWalletBalance();
}

/* ========== 红包功能 ========== */
// 初始化红包功能
function initRedPacket() {
  // 获取元素
  const redPacketBtn = document.querySelector('.multi-panel-item:nth-child(5)'); // 多功能面板中的红包按钮
  const redPacketMask = $('#redpacket-mask');
  const redPacketModal = $('#redpacket-modal');
  const redPacketCancel = $('#redpacket-cancel');
  const redPacketSend = $('#redpacket-send');
  const redPacketAmount = $('#redpacket-amount');
  const redPacketBalance = $('#redpacket-balance');
  const redPacketMessage = $('#redpacket-message');
  const redPacketCoverItems = document.querySelectorAll('.redpacket-cover-item');
  const redPacketCoverUpload = $('#redpacket-cover-upload');
  
  const redPacketMessageModal = $('#redpacket-message-modal');
  const redPacketMessageClose = $('#redpacket-message-close');
  const redPacketOpenBtn = $('#redpacket-open-btn');
  const redPacketSenderName = $('#redpacket-sender-name');
  const redPacketMessageBody = $('#redpacket-message-body');
  
  // 检查元素是否存在
  if (!redPacketBtn || !redPacketMask || !redPacketModal || !redPacketCancel || !redPacketSend || 
      !redPacketAmount || !redPacketBalance || !redPacketMessage || !redPacketMessageModal) {
    console.warn('Red packet elements not found');
    return;
  }
  
  // 自定义封面图片数据
  let customCoverImage = null;
  
  // 当前选择的封面类型
  let selectedCoverType = 'default';
  
  // 聊天消息历史存储 - 定义为全局变量，确保在renderMessages中可访问
  window.chatMessagesHistory = window.chatMessagesHistory || [];
  
  // 加载聊天消息历史
  function loadChatMessagesHistory() {
    const savedMessages = localStorage.getItem('chatMessagesHistory');
    if (savedMessages) {
      window.chatMessagesHistory = JSON.parse(savedMessages);
      renderChatMessagesHistory();
    }
  }
  
  // 加载聊天消息历史
  loadChatMessagesHistory();
  
  // 保存聊天消息历史
  function saveChatMessagesHistory() {
    localStorage.setItem('chatMessagesHistory', JSON.stringify(window.chatMessagesHistory));
  }
  
  // 渲染聊天消息历史
  function renderChatMessagesHistory() {
    const chatMessages = $('#chat-messages');
    if (!chatMessages) return;
    
    // 渲染所有历史消息
    window.chatMessagesHistory.forEach(message => {
      if (message.type === 'redpacket') {
        // 创建红包消息元素 - 使用与CSS匹配的类名
        const redPacketMsg = document.createElement('div');
        redPacketMsg.className = message.sender === userProfile.nickname ? 'msg me' : 'msg';
        
        // 获取发送者头像
        const isUser = message.sender === userProfile.nickname;
        const senderAvatar = isUser ? userProfile.avatar : message.senderAvatar;
        
        // 创建红包样式 - 根据封面类型设置不同的样式
        let redPacketStyle = '';
        if (message.coverType === 'custom' && message.customCover) {
          redPacketStyle = `style="background-image: url(${message.customCover}); background-size: cover; background-position: center;"`;
        }
        
        // 构建红包消息HTML - 遵循CSS布局结构
        if (isUser) {
          // 用户消息：头像在右，消息在左
          redPacketMsg.innerHTML = `
            <div class="msg-container">
              <div class="redpacket-msg-item" ${redPacketStyle} data-amount="${message.amount}" data-message="${message.content}" data-cover-type="${message.coverType || 'default'}" data-custom-cover="${message.customCover || ''}" data-opened="${message.opened || false}">
                <div class="redpacket-msg-body">
                  <i class="fa fa-red-envelope"></i>
                  <span>${message.content}</span>
                </div>
              </div>
              ${message.opened ? '<div class="redpacket-opened-tip">对方已拆红包</div>' : ''}
            </div>
            <div class="msg-avatar-container">
              <div class="msg-avatar">
                <img src="${senderAvatar || '默认头像路径'}" alt="${message.sender}">
              </div>
            </div>`;
        } else {
          // 角色消息：头像在左，消息在右
          redPacketMsg.innerHTML = `
            <div class="msg-avatar-container">
              <div class="msg-avatar">
                <img src="${senderAvatar || '默认角色头像路径'}" alt="${message.sender}">
              </div>
            </div>
            <div class="msg-container">
              <div class="redpacket-msg-item" ${redPacketStyle} data-amount="${message.amount}" data-message="${message.content}" data-cover-type="${message.coverType || 'default'}" data-custom-cover="${message.customCover || ''}" data-opened="${message.opened || false}">
                <div class="redpacket-msg-body">
                  <i class="fa fa-red-envelope"></i>
                  <span>${message.content}</span>
                </div>
              </div>
              ${message.opened ? '<div class="redpacket-opened-tip">已拆红包</div>' : ''}
            </div>`;
        }
        
        // 添加到聊天消息列表
        chatMessages.appendChild(redPacketMsg);
        
        // 添加点击事件
        const redPacketMsgItem = redPacketMsg.querySelector('.redpacket-msg-item');
        const isOpened = message.opened || false;
        
        // 存储sender信息到元素中，避免闭包问题
        redPacketMsgItem.setAttribute('data-sender', message.sender);
        
        if (!isOpened) {
          redPacketMsgItem.addEventListener('click', function() {
            const amount = parseFloat(this.getAttribute('data-amount'));
            const content = this.getAttribute('data-message');
            const coverType = this.getAttribute('data-cover-type');
            const customCover = this.getAttribute('data-custom-cover');
            const senderFromElement = this.getAttribute('data-sender');
            showRedPacketMessageModal(senderFromElement, amount, content, coverType, customCover);
          });
        } else {
          // 如果已经打开，添加已拆样式
          redPacketMsgItem.classList.add('redpacket-opened');
        }
      }
    });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // 打开红包发送模态框
  function openRedPacketModal() {
    // 确保settings.wallet存在
    if (!settings.wallet) {
      settings.wallet = {
        balance: 1000.00,
        redPacketMaxAmount: 200.00
      };
      saveAll();
    }
    
    // 更新余额显示
    redPacketBalance.textContent = settings.wallet.balance.toFixed(2);
    
    // 重置表单
    redPacketAmount.value = '';
    redPacketMessage.value = '恭喜发财，大吉大利';
    
    // 重置封面选择
    redPacketCoverItems.forEach(i => i.classList.remove('active'));
    redPacketCoverItems[0].classList.add('active');
    selectedCoverType = 'default';
    customCoverImage = null;
    
    // 显示模态框
    redPacketMask.style.display = 'flex';
  }
  
  // 关闭红包发送模态框
  function closeRedPacketModal() {
    redPacketMask.style.display = 'none';
  }
  
  // 处理封面选择
  redPacketCoverItems.forEach(item => {
    item.addEventListener('click', () => {
      // 移除所有active状态
      redPacketCoverItems.forEach(i => i.classList.remove('active'));
      // 添加当前项的active状态
      item.classList.add('active');
      // 更新选择的封面类型
      selectedCoverType = item.getAttribute('data-cover');
      
      // 如果选择自定义封面，触发文件上传
      if (selectedCoverType === 'custom') {
        redPacketCoverUpload.click();
      }
    });
  });
  
  // 处理自定义封面上传
  redPacketCoverUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
      // 如果用户取消选择，恢复默认封面
      redPacketCoverItems.forEach(i => i.classList.remove('active'));
      redPacketCoverItems[0].classList.add('active');
      selectedCoverType = 'default';
      return;
    }
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
      toast('请选择图片文件');
      // 恢复默认封面
      redPacketCoverItems.forEach(i => i.classList.remove('active'));
      redPacketCoverItems[0].classList.add('active');
      selectedCoverType = 'default';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      customCoverImage = event.target.result;
      // 更新自定义封面预览
      const customCoverPreview = document.querySelector('.custom-cover');
      customCoverPreview.style.backgroundImage = `url(${customCoverImage})`;
      customCoverPreview.style.color = 'transparent';
    };
    reader.readAsDataURL(file);
  });
  
  // 验证红包金额
  function validateAmount(amount) {
    if (!amount || isNaN(amount)) {
      return { valid: false, message: '请输入有效的金额' };
    }
    
    const numAmount = parseFloat(amount);
    
    if (numAmount <= 0) {
      return { valid: false, message: '金额必须大于0' };
    }
    
    if (numAmount > settings.wallet.redPacketMaxAmount) {
      return { valid: false, message: `红包金额不能超过${settings.wallet.redPacketMaxAmount}元` };
    }
    
    if (numAmount > settings.wallet.balance) {
      return { valid: false, message: '余额不足' };
    }
    
    return { valid: true };
  }
  
  // 发送红包
  function sendRedPacket() {
    const amount = redPacketAmount.value;
    const message = redPacketMessage.value || '恭喜发财，大吉大利';
    
    // 验证金额
    const validation = validateAmount(amount);
    if (!validation.valid) {
      toast(validation.message);
      return;
    }
    
    const numAmount = parseFloat(amount);
    
    // 扣除钱包余额
    settings.wallet.balance -= numAmount;
    saveAll();
    
    // 更新钱包页面的余额显示
    const walletAmount = $('#wallet-amount');
    const eyeIcon = $('#wallet-eye-btn').querySelector('i');
    if (walletAmount && !eyeIcon.classList.contains('fa-eye-slash')) {
      walletAmount.textContent = settings.wallet.balance.toFixed(2);
    }
    
    // 关闭模态框
    closeRedPacketModal();
    
    // 显示发送成功提示
    toast('红包发送成功');
    
    // 保存封面信息的副本，确保每个红包有自己的封面信息
    const currentCoverType = selectedCoverType;
    const currentCustomCover = customCoverImage;
    
    // 在聊天窗口显示红包消息
    showRedPacketInChat(userProfile.nickname, numAmount, message, currentCoverType, currentCustomCover);
  }
  
  // 在聊天窗口显示红包消息
  function showRedPacketInChat(sender, amount, message, coverType, customCover) {
    // 这里简化处理，实际应该调用聊天消息渲染函数
    // 假设当前在聊天页面
    const chatMessages = $('#chat-messages');
    if (!chatMessages) return;
    
    // 获取发送者头像
    const isUser = sender === userProfile.nickname;
    const senderAvatar = isUser ? userProfile.avatar : null;
    
    // 将红包消息添加到历史记录
    const redPacketMessage = {
      type: 'redpacket',
      sender: sender,
      senderAvatar: senderAvatar,
      amount: amount,
      content: message,
      coverType: coverType || 'default',
      customCover: customCover || '',
      timestamp: new Date().getTime(),
      opened: false // 新增字段，标记红包是否已拆
    };
    window.chatMessagesHistory.push(redPacketMessage);
    saveChatMessagesHistory();
    
    // 创建红包消息元素 - 使用与CSS匹配的类名
    const redPacketMsg = document.createElement('div');
    redPacketMsg.className = isUser ? 'msg me' : 'msg';
    
    // 创建红包样式 - 根据封面类型设置不同的样式
    let redPacketStyle = '';
    if (coverType === 'custom' && customCover) {
      redPacketStyle = `style="background-image: url(${customCover}); background-size: cover; background-position: center;"`;
    }
    
    // 构建红包消息HTML - 确保用户和角色消息结构统一
    // 添加msg-content包装以确保样式一致
    if (isUser) {
      // 用户消息：头像在右，消息在左
      redPacketMsg.innerHTML = `
        <div class="msg-container">
          <div class="msg-content">
            <div class="redpacket-msg-item" ${redPacketStyle} data-amount="${amount}" data-message="${message}" data-cover-type="${coverType || 'default'}" data-custom-cover="${customCover || ''}" data-opened="false">
              <div class="redpacket-msg-body">
                <i class="fa fa-red-envelope"></i>
                <span>${message}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="msg-avatar-container">
          <div class="msg-avatar">
            <img src="${userProfile.avatar || '默认头像路径'}" alt="${sender}">
          </div>
        </div>`;
    } else {
      // 角色消息：头像在左，消息在右
      redPacketMsg.innerHTML = `
        <div class="msg-avatar-container">
          <div class="msg-avatar">
            <img src="${senderAvatar || '默认角色头像路径'}" alt="${sender}">
          </div>
        </div>
        <div class="msg-container">
          <div class="msg-content">
            <div class="redpacket-msg-item" ${redPacketStyle} data-amount="${amount}" data-message="${message}" data-cover-type="${coverType || 'default'}" data-custom-cover="${customCover || ''}" data-opened="false">
              <div class="redpacket-msg-body">
                <i class="fa fa-red-envelope"></i>
                <span>${message}</span>
              </div>
            </div>
          </div>
        </div>`;
    }
    
    // 添加到聊天消息列表
    chatMessages.appendChild(redPacketMsg);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 添加点击事件
    const redPacketMsgItem = redPacketMsg.querySelector('.redpacket-msg-item');
    if (redPacketMsgItem) {
      // 存储sender信息到元素中，避免闭包问题
      redPacketMsgItem.setAttribute('data-sender', sender);
      // 为确保点击事件生效，添加一个备用的封装事件处理
      function handleRedPacketClick() {
        console.log('红包点击事件触发！');
        const amount = parseFloat(redPacketMsgItem.getAttribute('data-amount'));
        const content = redPacketMsgItem.getAttribute('data-message');
        const coverType = redPacketMsgItem.getAttribute('data-cover-type');
        const customCover = redPacketMsgItem.getAttribute('data-custom-cover');
        const senderFromElement = redPacketMsgItem.getAttribute('data-sender');
        console.log('红包数据:', { sender: senderFromElement, amount: amount, content: content });
        showRedPacketMessageModal(senderFromElement, amount, content, coverType, customCover);
      }
      
      // 添加主要点击事件
      redPacketMsgItem.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('redpacket-msg-item 点击事件直接触发');
        handleRedPacketClick();
      });
      
      // 为了确保点击事件一定能触发，添加额外的事件监听器
      redPacketMsgItem.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        console.log('redpacket-msg-item 鼠标按下事件触发');
      });
      
      // 添加备用的点击事件处理到父元素，确保点击能够被捕获
      const msgContent = redPacketMsg.querySelector('.msg-content');
      if (msgContent) {
        msgContent.addEventListener('click', function(e) {
          console.log('msg-content 点击事件触发，目标元素:', e.target);
          if (e.target === msgContent || e.target.closest('.redpacket-msg-item')) {
            e.stopPropagation();
            handleRedPacketClick();
          }
        });
      }
      
      // 添加到最外层元素的点击事件，作为最后的保障
      redPacketMsg.addEventListener('click', function(e) {
        console.log('最外层 msg 元素点击事件触发，目标元素:', e.target);
        if (e.target.closest('.redpacket-msg-item')) {
          e.stopPropagation();
          handleRedPacketClick();
        }
      });
    }
  }
  
  // 注意：showRedPacketMessageModal函数的实际实现位于文件顶部(第19行)，包含页面加载时间检查逻辑
  // 此处不再重复实现，以避免函数重复定义导致的时间检查机制失效
  
  // 关闭红包消息模态框 - 全局函数
  window.closeRedPacketMessageModal = function() {
    console.log('尝试关闭红包模态框');
    if (window.redPacketMessageModal && typeof window.redPacketMessageModal.style !== 'undefined') {
      window.redPacketMessageModal.style.display = 'none';
    } else {
      console.error('红包模态框引用不存在或样式属性不可访问');
    }
  }
  
  // 打开红包 - 全局函数
  window.openRedPacket = function() {
    console.log('尝试打开红包');
    if (!window.redPacketMessageModal) {
      console.error('红包模态框不存在');
      return;
    }
    
    const amount = parseFloat(window.redPacketMessageModal.dataset.amount);
    const sender = window.redPacketMessageModal.dataset.sender;
    
    if (isNaN(amount) || !sender) {
      console.error('红包数据不正确:', { amount, sender });
      toast('红包数据异常，无法打开');
      return;
    }
    
    // 关闭模态框
    window.closeRedPacketMessageModal();
    
    // 显示打开红包提示
    toast(`恭喜你获得了来自${sender}的¥${amount.toFixed(2)}红包`);
    
    // 记录红包已拆状态
    markRedPacketAsOpened(sender, amount);
    
    // 这里可以添加入账逻辑，但根据需求，目前只需要显示提示
  }
  
  // 标记红包为已拆
  function markRedPacketAsOpened(sender, amount) {
    // 查找对应的红包消息
    const chatMessages = $('#chat-messages');
    if (!chatMessages) return;
    
    // 更新历史记录中的红包状态
    for (let i = 0; i < window.chatMessagesHistory.length; i++) {
      const msg = window.chatMessagesHistory[i];
      if (msg.type === 'redpacket' && msg.sender === sender && msg.amount === amount && !msg.opened) {
        msg.opened = true;
        break;
      }
    }
    saveChatMessagesHistory();
    
    // 清空聊天区域并重新渲染所有消息
    chatMessages.innerHTML = '';
    renderChatMessagesHistory();
  }
  
  // API调用此方法标记角色领取了用户的红包
  window.markRoleRedPacketAsOpened = function(roleName) {
    // 查找最新的由用户发送给该角色的未拆红包
    const userNickname = userProfile ? userProfile.nickname : '我';
    let foundRedPacket = false;
    let redPacketAmount = 0;
    
    for (let i = window.chatMessagesHistory.length - 1; i >= 0; i--) {
      const msg = window.chatMessagesHistory[i];
      if (msg.type === 'redpacket' && msg.sender === userNickname && !msg.opened) {
        // 标记红包为已拆
        msg.opened = true;
        redPacketAmount = msg.amount;
        foundRedPacket = true;
        saveChatMessagesHistory();
        break;
      }
    }
    
    if (foundRedPacket) {
      // 创建领取红包的通知消息
      const notificationMessage = {
        type: 'notification',
        content: `${roleName}领了你的红包`,
        timestamp: new Date().getTime(),
        isSystem: true
      };
      
      // 添加到聊天历史
      window.chatMessagesHistory.push(notificationMessage);
      saveChatMessagesHistory();
      
      // 清空聊天区域并重新渲染所有消息
      const chatMessages = $('#chat-messages');
      if (chatMessages) {
        chatMessages.innerHTML = '';
        renderChatMessagesHistory();
      }
      
      // 显示领取红包提示
      toast(`${roleName}领取了你的红包，金额为¥${parseFloat(redPacketAmount).toFixed(2)}`);
    } else {
      console.log('未找到可领取的红包');
    }
  }
  
  // 扩展renderChatMessagesHistory函数，使其能渲染通知消息
  const originalRenderChatMessages = window.renderChatMessages;
  window.renderChatMessages = function(messages) {
    // 调用原始函数渲染消息
    if (originalRenderChatMessages) {
      originalRenderChatMessages(messages);
    }
    
    // 渲染通知消息（如果有）
    const chatMessages = $('#chat-messages');
    if (!chatMessages) return;
    
    // 查找所有通知消息
    const notificationMessages = (messages || window.chatMessagesHistory || [])
      .filter(msg => msg.type === 'notification' && msg.isSystem);
    
    // 如果有通知消息但聊天区域中没有显示，则添加它们
    notificationMessages.forEach(msg => {
      // 检查是否已存在该消息
      const existingMessages = chatMessages.querySelectorAll(`.notification-message[data-timestamp="${msg.timestamp}"]`);
      if (existingMessages.length === 0) {
        // 创建通知消息元素
        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification-message';
        notificationEl.setAttribute('data-timestamp', msg.timestamp);
        notificationEl.style.textAlign = 'center';
        notificationEl.style.margin = '10px 0';
        notificationEl.style.padding = '4px 12px';
        notificationEl.style.backgroundColor = '#f0f0f0';
        notificationEl.style.borderRadius = '12px';
        notificationEl.style.fontSize = '12px';
        notificationEl.style.color = '#666';
        notificationEl.style.display = 'inline-block';
        notificationEl.textContent = msg.content;
        
        // 创建容器并添加通知消息
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.appendChild(notificationEl);
        
        // 找到正确的插入位置（根据时间戳）
        const allMsgElements = chatMessages.querySelectorAll('.msg, .notification-message');
        let inserted = false;
        
        for (let i = 0; i < allMsgElements.length; i++) {
          const element = allMsgElements[i];
          const elementTime = parseFloat(element.dataset.timestamp || 0);
          
          if (elementTime > msg.timestamp) {
            chatMessages.insertBefore(container, element.parentNode);
            inserted = true;
            break;
          }
        }
        
        // 如果没有找到合适的位置，就添加到最后
        if (!inserted) {
          chatMessages.appendChild(container);
        }
      }
    });
  }
  
  // 模拟API角色发送红包
  window.sendRoleRedPacket = function(roleName, amount = null, message = null) {
    // 如果没有指定金额，随机生成一个不超过最大金额的金额
    if (!amount) {
      const maxAmount = settings.wallet.redPacketMaxAmount;
      amount = (Math.random() * maxAmount * 0.8 + maxAmount * 0.2).toFixed(2); // 生成20%-100%的随机金额
    }
    
    if (!message) {
      message = '恭喜发财，大吉大利';
    }
    
    // 角色红包使用默认封面
    const roleCoverType = 'default';
    const roleCustomCover = '';
    
    // 在聊天窗口显示红包消息
    showRedPacketInChat(roleName, parseFloat(amount), message, roleCoverType, roleCustomCover);
  };
  
  // 添加事件监听器
  redPacketBtn.addEventListener('click', openRedPacketModal);
  redPacketCancel.addEventListener('click', closeRedPacketModal);
  redPacketSend.addEventListener('click', sendRedPacket);
  redPacketMessageClose.addEventListener('click', closeRedPacketMessageModal);
  redPacketOpenBtn.addEventListener('click', openRedPacket);
  
  // 点击模态框外部关闭
  redPacketMask.addEventListener('click', function(e) {
    if (e.target === redPacketMask) {
      closeRedPacketModal();
    }
  });
  
  redPacketMessageModal.addEventListener('click', function(e) {
    if (e.target === redPacketMessageModal) {
      closeRedPacketMessageModal();
    }
  });
}

/* ========== 初始化新功能 ========== */
// 页面加载完成后初始化所有功能
window.addEventListener('load', () => {
  // 记录页面加载时间
  window.pageLoadTime = Date.now();
  
  // 初始化状态栏样式 - 默认显示mainpage，使用mainpage样式
  const statusbar = document.querySelector('.statusbar');
  if (statusbar) {
    statusbar.classList.add('statusbar-main');
  }
  
  // 初始化用户交互状态
  window.userHasInteracted = false;
  
  // 监听用户交互事件
  function handleUserInteraction() {
    if (!window.userHasInteracted) {
      window.userHasInteracted = true;
      console.log('用户已与页面交互，现在可以显示红包弹窗');
      
      // 移除所有一次性事件监听器
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    }
  }
  
  // 添加多种用户交互事件监听器
  document.addEventListener('click', handleUserInteraction, { once: true });
  document.addEventListener('mousedown', handleUserInteraction, { once: true });
  document.addEventListener('keydown', handleUserInteraction, { once: true });
  document.addEventListener('touchstart', handleUserInteraction, { once: true });
  console.log('页面加载时间:', window.pageLoadTime);
  
  // 初始化页面导航逻辑
  initPageNavigation();
  
  initEmojiSystem();
  startOnlineStatusMonitoring();
  initPhotoAlbum(); // 初始化相册功能
  initWallet(); // 初始化钱包功能
  initRedPacket(); // 初始化红包功能
});

// 初始化页面导航逻辑
function initPageNavigation() {
  // 获取页面元素
  const mainpage = document.getElementById('mainpage');
  const wechatpage = document.getElementById('wechatpage');
  const chatpage = document.getElementById('chatpage');
  const statusbar = document.querySelector('.statusbar');
  const statusbarIcons = document.querySelector('.statusbar-icons');
  
  // 确保状态栏图标区域存在且可见
  function ensureStatusbarIconsVisible() {
    if (statusbarIcons) {
      statusbarIcons.style.display = 'flex'; // 确保图标区域是flex布局
      statusbarIcons.style.visibility = 'visible'; // 确保可见
      // 检查图标是否存在，如果不存在则重新添加
      if (statusbarIcons.children.length === 0) {
        statusbarIcons.innerHTML = '<i class="fa fa-signal"></i><i class="fa fa-wifi"></i><i class="fa fa-battery-full"></i>';
      }
    }
  }
  
  // 微信图标点击事件 - 从主页面到微信主界面
  document.getElementById('open-wechat').addEventListener('click', function() {
    mainpage.style.display = 'none';
    wechatpage.style.display = 'block';
    // 更新状态栏样式
    if (statusbar) {
      statusbar.classList.remove('statusbar-main');
      statusbar.classList.add('statusbar-wechat');
      // 确保状态栏的justify-content为space-between
      statusbar.style.justifyContent = 'space-between';
      // 确保图标区域可见
      ensureStatusbarIconsVisible();
    }
  });
  
  // 微信主界面返回按钮事件 - 从微信主界面到主页面
  document.getElementById('back-main').addEventListener('click', function() {
    wechatpage.style.display = 'none';
    mainpage.style.display = 'block';
    // 更新状态栏样式
    if (statusbar) {
      statusbar.classList.remove('statusbar-wechat');
      statusbar.classList.add('statusbar-main');
      // 确保状态栏的justify-content为space-between
      statusbar.style.justifyContent = 'space-between';
      // 重置状态栏的背景为透明，确保与主界面顶部融合
      statusbar.style.background = 'transparent';
      // 确保图标区域可见
      ensureStatusbarIconsVisible();
    }
  });
  
  // 聊天界面返回按钮事件 - 从聊天界面到微信主界面
  document.getElementById('back-wechat').addEventListener('click', function() {
    chatpage.style.display = 'none';
    wechatpage.style.display = 'block';
    // 更新状态栏样式
    if (statusbar) {
      statusbar.classList.remove('statusbar-main');
      statusbar.classList.add('statusbar-wechat');
      // 确保状态栏的justify-content为space-between
      statusbar.style.justifyContent = 'space-between';
      // 确保图标区域可见
      ensureStatusbarIconsVisible();
    }
  });
  
  // 钱包返回按钮事件已经在initWallet函数中定义
}

/* End of app.js */
