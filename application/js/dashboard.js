document.addEventListener('DOMContentLoaded', function() {
    // 获取所有菜单项和内容卡片
    const menuItems = document.querySelectorAll('.menu-item');
    const cards = document.querySelectorAll('.card');
    const featureCards = document.querySelectorAll('.feature-card');

    // 侧边栏展开/收起功能
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // 页面切换功能
    function switchPage(pageId) {
        // 更新菜单项状态
        menuItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 更新内容卡片显示
        cards.forEach(card => {
            if (card.id === pageId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // 侧边栏菜单点击事件
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            switchPage(pageId);
        });
    });

    // 功能卡片点击事件
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            switchPage(pageId);
        });
    });

    // 处理聊天功能
    const chatContainers = document.querySelectorAll('.chat-container');
    
    chatContainers.forEach(container => {
        const messagesDiv = container.querySelector('.chat-messages');
        const textarea = container.querySelector('textarea');
        const sendBtn = container.querySelector('.send-btn');

        // 发送消息功能
        function sendMessage() {
            const message = textarea.value.trim();
            if (message) {
                // 创建用户消息元素
                const userMessage = document.createElement('div');
                userMessage.className = 'message user-message';
                userMessage.innerHTML = `
                    <p>${message}</p>
                    <span class="time">${new Date().toLocaleTimeString()}</span>
                `;
                messagesDiv.appendChild(userMessage);

                // 清空输入框
                textarea.value = '';

                // 自动滚动到底部
                messagesDiv.scrollTop = messagesDiv.scrollHeight;

                // 模拟AI回复
                setTimeout(() => {
                    const aiMessage = document.createElement('div');
                    aiMessage.className = 'message ai-message';
                    aiMessage.innerHTML = `
                        <p>收到您的消息，我们正在处理中...</p>
                        <span class="time">${new Date().toLocaleTimeString()}</span>
                    `;
                    messagesDiv.appendChild(aiMessage);
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }, 1000);
            }
        }

        // 绑定发送按钮点击事件
        sendBtn.addEventListener('click', sendMessage);

        // 绑定回车键发送事件
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
            // 这里添加退出登录的逻辑，比如跳转到登录页面
            window.location.href = 'login.html';
        }
    });

    // 修改密码功能
    const changePasswordForm = document.querySelector('.password-form');
    const cancelBtn = changePasswordForm.querySelector('.cancel-btn');
    const confirmBtn = changePasswordForm.querySelector('.confirm-btn');

    // 取消按钮
    cancelBtn.addEventListener('click', () => {
        // 清空表单
        changePasswordForm.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        // 返回主页
        switchPage('home');
    });

    // 确认修改按钮
    confirmBtn.addEventListener('click', () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // 简单的表单验证
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

        // 这里添加修改密码的逻辑，通常需要发送到服务器
        alert('密码修改成功！');
        // 清空表单
        changePasswordForm.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        // 返回主页
        switchPage('home');
    });

    // 阻止修改密码表单的默认提交行为
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });
});