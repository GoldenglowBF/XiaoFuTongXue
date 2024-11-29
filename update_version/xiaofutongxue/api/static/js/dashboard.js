document.addEventListener('DOMContentLoaded', function() {
    // 获取所有必要的元素
    const menuItems = document.querySelectorAll('.menu-item');
    const cards = document.querySelectorAll('.card');
    const featureCards = document.querySelectorAll('.feature-card');
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar');

    // AI角色映射
    const roleMap = {
        'interview': 'interview',
        'new-year': 'new_year',
        'bargain': 'bargaining'
    };

    // 添加消息到聊天框的全局函数
    function appendMessage(container, message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // 创建消息图标
        const icon = document.createElement('i');
        icon.className = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
        
        // 创建消息内容容器
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(icon);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeSpan);
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        return messageDiv;
    }

    // 检查是否是移动设备
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // 侧边栏展开/收起功能
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarState', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    });

    // 页面加载时恢复侧边栏状态
    window.addEventListener('load', () => {
        const savedState = localStorage.getItem('sidebarState');
        if (savedState === 'collapsed') {
            sidebar.classList.add('collapsed');
        }
    });

    // 窗口大小改变时处理响应式行为
    window.addEventListener('resize', () => {
        if (!isMobile() && sidebar.classList.contains('collapsed')) {
            sidebar.style.width = '70px';
        } else if (!isMobile()) {
            sidebar.style.width = '250px';
        } else {
            sidebar.style.width = '100%';
        }
    });

    // 页面切换功能
    function switchPage(pageId) {
        menuItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        cards.forEach(card => {
            if (card.id === pageId) {
                card.classList.add('active');
                if (isMobile()) {
                    sidebar.classList.add('collapsed');
                }
                
                // 检查是否是对话页面
                const messagesDiv = card.querySelector('.chat-messages');
                if (messagesDiv && messagesDiv.children.length === 0) {
                    // 根据不同页面显示不同开场白
                    let welcomeMessage = '';
                    switch (pageId) {
                        case 'interview':
                            welcomeMessage = '好，既然你来了，咱们就开始吧。先简单介绍一下你自己吧，告诉我你是谁，之前做过什么，为什么想来这个岗位?';
                            break;
                        case 'new-year':
                            welcomeMessage = '嗬！过年好啊孩子！一转眼都这么大啦，多少年没见了这都，我在你小时候还抱过你哩！现在你多大啦，在读书还是工作呀？ （当前满意度：0）';
                            break;
                        case 'bargain':
                            welcomeMessage = '嘿哟，小伙子!你这眼光可真是毒啊!瞧瞧这件大衣，这可是咱店里现在最火爆的款式，那走在街上，绝对是回头率百分百啊! 5000块钱，一点都不贵!你想想，这穿上多有面子啊!怎么样，赶紧拿下吧!';
                            break;
                    }
                    if (welcomeMessage) {
                        appendMessage(messagesDiv, welcomeMessage, 'ai');
                    }
                }
            } else {
                card.classList.remove('active');
            }
        });
    }

    // 菜单项点击事件
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                switchPage(pageId);
            }
        });
    });

    // 功能卡片点击事件
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                switchPage(pageId);
            }
        });
    });

    // 处理聊天功能
    const chatContainers = document.querySelectorAll('.chat-container');

    chatContainers.forEach(container => {
        const messagesDiv = container.querySelector('.chat-messages');
        const textarea = container.querySelector('textarea');
        const sendBtn = container.querySelector('.send-btn');
        
        // 获取当前聊天容器所属的页面ID
        const parentCard = container.closest('.card');
        const pageId = parentCard.id;

        // 发送消息功能
        async function sendMessage() {
            const message = textarea.value.trim();
            if (!message) return;

            // 根据页面ID获取对应的role
            const role = roleMap[pageId];
            if (!role) return;

            // 添加用户消息
            appendMessage(messagesDiv, message, 'user');
            textarea.value = '';

            // 添加等待消息
            const waitingMessageDiv = appendMessage(messagesDiv, '正在思考中...', 'ai');

            try {
                // 打印请求信息
                const requestData = {
                    user_input: message,
                    role: role
                };
                console.log('Sending request:', requestData);
                
                const response = await fetch('/api/process_question1/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response not ok:', response.status, errorText);
                    throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                
                // 移除等待消息
                messagesDiv.removeChild(waitingMessageDiv);

                if (data.error) {
                    // 如果返回了错误信息
                    appendMessage(messagesDiv, data.error, 'error');
                } else {
                    // 添加AI回复
                    appendMessage(messagesDiv, data.ai_response, 'ai');
                }
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.removeChild(waitingMessageDiv);
                appendMessage(messagesDiv, '发生错误，请稍后重试', 'error');
            }
        }

        // 获取CSRF Token
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        // 绑定事件
        sendBtn.addEventListener('click', sendMessage);
        textarea.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    });

    // 退出登录功能
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('sidebarState');
            window.location.href = 'login.html';
        }
    });

    // 修改密码功能
    const changePasswordForm = document.querySelector('.password-form');
    const cancelBtn = changePasswordForm.querySelector('.cancel-btn');
    const confirmBtn = changePasswordForm.querySelector('.confirm-btn');

    // 取消按钮
    cancelBtn.addEventListener('click', () => {
        changePasswordForm.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        switchPage('home');
    });

    // 确认修改按钮
    confirmBtn.addEventListener('click', () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('请填写所有密码字段');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('两次输入的新密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            alert('新密码长度不能小于6位');
            return;
        }

        alert('密码修改成功！');
        changePasswordForm.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        switchPage('home');
    });

    // 阻止密码表单默认提交
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });
});