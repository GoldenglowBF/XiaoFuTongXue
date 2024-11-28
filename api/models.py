from django.db import models
from django.utils import timezone

class User(models.Model):
    """用户表"""
    username = models.CharField(max_length=150, unique=True, verbose_name="用户名")
    password = models.CharField(max_length=128, verbose_name="密码")
    # 其他字段 ...

class Administrator(models.Model):
    """管理员表"""
    username = models.CharField(verbose_name="用户名", max_length=32, unique=True)
    password = models.CharField(verbose_name="密码", max_length=64)
    # 其他字段 ...

class AIRole(models.Model):
    """角色表"""
    nickname = models.CharField(max_length=150, unique=True)  # 角色的名字
    description = models.TextField(null=True, blank=True)  # 允许为空
    created_at = models.DateTimeField(auto_now_add=True)  # 记录创建时间
    updated_at = models.DateTimeField(default=timezone.now)  # 记录更新时间

    def __str__(self):
        return self.nickname

class Dialog(models.Model):
    """对话表"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="用户")
    role = models.ForeignKey(AIRole, on_delete=models.CASCADE, null=True)  # 允许为空
    user_input = models.TextField()  # 用户输入
    ai_response = models.TextField(null=True, blank=True)  # 允许为空
    created_at = models.DateTimeField(auto_now_add=True)  # 创建时间

    def __str__(self):
        return f"Dialogue {self.id} - {self.user.username} with {self.role.nickname}"
