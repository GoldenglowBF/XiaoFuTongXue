// admin.js

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面数据
    initializePage();
    // 添加导航事件监听
    setupNavigation();
    // 加载模拟数据
    loadMockData();
});

// 页面初始化
function initializePage() {
    // 检查是否是移动设备
    if (window.innerWidth <= 768) {
        document.querySelector('.sidebar').classList.remove('active');
        addMobileMenuButton();
    }

    // 窗口大小改变时重新检查
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            addMobileMenuButton();
        } else {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (mobileBtn) mobileBtn.remove();
        }
    });
}

// 添加移动端菜单按钮
function addMobileMenuButton() {
    if (!document.querySelector('.mobile-menu-btn')) {
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn btn';
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(menuBtn);

        menuBtn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

// 设置导航事件
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            navButtons.forEach(b => b.classList.remove('active'));
            // 为当前按钮添加active类
            this.classList.add('active');

            // 隐藏所有页面
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // 显示对应页面
            const targetPage = document.getElementById(this.dataset.page);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // 在移动端时，点击后关闭侧边栏
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    });
}

// 模拟数据
let mockUsers = [
    { id: 1, name: "用户1", username: "user1", password: "pass123", gameData: 1000, achievements: 15 },
    { id: 2, name: "用户2", username: "user2", password: "pass456", gameData: 1500, achievements: 20 },
    { id: 3, name: "用户3", username: "user3", password: "pass789", gameData: 800, achievements: 10 }
];

// 加载模拟数据
function loadMockData() {
    loadUserData();
    loadRankingsData();
    loadAchievementsData();
}

// 加载用户数据
function loadUserData() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    mockUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>******</td>
            <td>
                <button class="btn" onclick="editUser(${user.id})">编辑</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 加载排名数据
function loadRankingsData() {
    const tbody = document.getElementById('rankingsTableBody');
    tbody.innerHTML = '';

    // 按游戏数据排序
    const sortedUsers = [...mockUsers].sort((a, b) => b.gameData - a.gameData);

    sortedUsers.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.gameData}</td>
            <td>
                <button class="btn" onclick="editGameData(${user.id})">修改</button>
                <button class="btn btn-danger" onclick="deleteGameData(${user.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 加载成就数据
function loadAchievementsData() {
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = '<option value="">选择用户</option>';

    mockUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });

    userSelect.addEventListener('change', function() {
        if (this.value) {
            const user = mockUsers.find(u => u.id === parseInt(this.value));
            updateAchievementStats(user);
        }
    });
}

// 更新成就统计
function updateAchievementStats(user) {
    const completed = user.achievements;
    const remaining = 30 - completed;

    document.getElementById('completedAchievements').textContent = completed;
    document.getElementById('remainingAchievements').textContent = remaining;
}

// 修改密码
function changePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || !confirmPassword) {
        alert('请填写完整的密码信息');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }

    alert('密码修改成功！');
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// 编辑用户
function editUser(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    const newName = prompt('请输入新的用户名称:', user.name);
    if (newName) {
        user.name = newName;
        loadMockData();
    }
}

// 删除用户
function deleteUser(userId) {
    if (confirm('确定要删除该用户吗？')) {
        mockUsers = mockUsers.filter(u => u.id !== userId);
        loadMockData();
    }
}

// 编辑游戏数据
function editGameData(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    const newData = prompt('请输入新的游戏数据:', user.gameData);
    if (newData && !isNaN(newData)) {
        user.gameData = parseInt(newData);
        loadMockData();
    }
}

// 删除游戏数据
function deleteGameData(userId) {
    if (confirm('确定要删除该用户的游戏数据吗？')) {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
            user.gameData = 0;
            loadMockData();
        }
    }
}