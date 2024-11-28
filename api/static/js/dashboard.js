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
        // 保存侧边栏状态到本地存储
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
            // 在PC端保持收缩状态
            sidebar.style.width = '70px';
        } else if (!isMobile()) {
            // 在PC端展开状态
            sidebar.style.width = '250px';
        } else {
            // 在移动端重置宽度
            sidebar.style.width = '100%';
        }
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
                // 如果是移动设备，点击后自动收起侧边栏
                if (isMobile()) {
                    sidebar.classList.add('collapsed');
                }
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
            // 清除本地存储的侧边栏状态
            localStorage.removeItem('sidebarState');
            // 跳转到登录页面
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

        // 表单验证
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
