document.addEventListener('DOMContentLoaded', function() {
    // 获取所有必要的元素
    const menuItems = document.querySelectorAll('.menu-item');
    const cards = document.querySelectorAll('.card');
    const featureCards = document.querySelectorAll('.feature-card');
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar');

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

        // 发送消息功能
        async function sendMessage() {
            const message = textarea.value.trim();
            if (!message) return;

            // 添加用户消息
            appendMessage(messagesDiv, message, 'user');
            textarea.value = '';

            // 添加等待消息
            const waitingMessageDiv = appendMessage(messagesDiv, '正在思考中...', 'ai');

            try {
                const response = await fetch('/api/process_question/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ user_input: message })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                // 移除等待消息
                messagesDiv.removeChild(waitingMessageDiv);
                // 添加AI回复
                appendMessage(messagesDiv, data.ai_response || '抱歉，没有收到有效回复', 'ai');
            } catch (error) {
                console.error('Error:', error);
                messagesDiv.removeChild(waitingMessageDiv);
                appendMessage(messagesDiv, '发生错误，请稍后重试', 'error');
            }
        }

        // 添加消息到聊天框
        function appendMessage(container, message, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}-message`;
            messageDiv.innerHTML = `
                <p>${message}</p>
                <span class="time">${new Date().toLocaleTimeString()}</span>
            `;
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
            return messageDiv;
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