document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
});

function initializeChat() {
    // 监听侧边栏菜单点击
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const page = this.dataset.page;
            if (['interview', 'new-year', 'bargain'].includes(page)) {
                const chatContainer = document.querySelector(`#${page} .chat-container`);
                const textarea = chatContainer.querySelector('textarea');
                
                // 只有在textarea没有nid时才生成新的nid
                if (!textarea.dataset.nid) {
                    const randomId = generateRandomId();
                    // 发送到后端
                    sendNidToServer(randomId, page, textarea);
                }
            }
        });
    });

    // 为每个聊天容器添加发送消息的事件监听
    const chatContainers = document.querySelectorAll('.chat-container');
    chatContainers.forEach(container => {
        const textarea = container.querySelector('textarea');
        const sendButton = container.querySelector('.send-btn');
        
        sendButton.addEventListener('click', () => {
            if (textarea.dataset.nid) {
                handleSendMessage(container.dataset.chatType, textarea);
            }
        });
        
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && textarea.dataset.nid) {
                e.preventDefault();
                handleSendMessage(container.dataset.chatType, textarea);
            }
        });
    });
}

// 生成随机ID的函数
function generateRandomId() {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${randomStr}`;
}

function sendNidToServer(nid, chatType, textarea) {
    // 准备表单数据
    const formData = new FormData();
    formData.append('nid', nid);
    
    // 修正cid对应关系
    let cid;
    switch(chatType) {
        case 'interview':
            cid = 1;  // 面试模拟对应 cid=1
            break;
        case 'new-year':
            cid = 2;  // 决战拜年对应 cid=2
            break;
        case 'bargain':
            cid = 3;  // 砍价游戏对应 cid=3
            break;
    }
    formData.append('cid', cid);

    // 将FormData转换为URL编码字符串
    const urlEncodedData = new URLSearchParams(formData).toString();

    // 发送请求
    fetch('/random/nid/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCsrfToken()
        },
        body: urlEncodedData
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'OK') {
            // 保存nid到textarea
            textarea.dataset.nid = nid;
            console.log(`New session ID for ${chatType}:`, nid);
        } else {
            console.error('Failed to send session ID to server');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function handleSendMessage(chatType, textarea) {
    const message = textarea.value.trim();
    if (!message) return;

    const messagesContainer = textarea
        .closest('.chat-container')
        .querySelector('.chat-messages');

    appendMessage(messagesContainer, message, 'user');
    textarea.value = '';
}

function appendMessage(container, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(paragraph);
    messageDiv.appendChild(timeSpan);
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}