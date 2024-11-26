from django.db import models

# 等级表
# class UserLevel(models.Model):
#     name = models.CharField(max_length=50, unique=True, verbose_name="等级名称")
#     description = models.TextField(blank=True, null=True, verbose_name="等级备注")


class User(models.Model):
    """用户表"""
    username = models.CharField(max_length=150, unique=True, verbose_name="用户名")
    password = models.CharField(max_length=128, verbose_name="密码")
    # token = models.CharField(max_length=255, blank=True, null=True, verbose_name="Token")
    # level = models.ForeignKey('UserLevel', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="等级")
    # balance = models.PositiveIntegerField(default=0, verbose_name="余额")

class Administrator(models.Model):
    """ 管理员表 """
    username = models.CharField(verbose_name="用户名", max_length=32, unique=True)
    password = models.CharField(verbose_name="密码", max_length=64)
    # mobile = models.CharField(verbose_name="手机号", max_length=11, db_index=True)
    # create_date = models.DateTimeField(verbose_name="创建日期", auto_now_add=True)


class AIModel(models.Model):
    """模型表"""
    # id = models.AutoField(primary_key=True, verbose_name="模型ID")
    model_name = models.CharField(max_length=100, unique=True, verbose_name="模型名称")
    # price_per_input_token = models.DecimalField(max_digits=10, decimal_places=6,verbose_name="每个输入Token的价格（鲸币）")
    # price_per_output_token = models.DecimalField(max_digits=10, decimal_places=6,
    #                                              verbose_name="每个输出Token的价格（鲸币）")
    is_active = models.BooleanField(default=True, verbose_name="是否当前生效")


class AIRole(models.Model):
    """角色表"""
    nickname = models.CharField(max_length=150, verbose_name="AI角色名称")
    ai_model = models.ForeignKey(AIModel, on_delete=models.CASCADE, verbose_name="关联模型")
    prompt = models.TextField(verbose_name="AI角色的提示语",null=True,blank=True)
    # user_levels = models.ManyToManyField(UserLevel, verbose_name="可以访问的用户类别")
    is_active = models.BooleanField(default=True, verbose_name="是否生效")
    # avatar = models.ImageField(upload_to='ai_avatars/', null=True, blank=True, verbose_name="AI头像")
    # model_desc = models.CharField(max_length=100, default="暂无简介", verbose_name="模型简介")
    context_limit = models.PositiveIntegerField(default=0, verbose_name="历史上下文携带次数")


class Dialog(models.Model):
    """对话表"""
    # id = models.AutoField(primary_key=True, verbose_name="对话ID")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dialogs', verbose_name="用户")
    dialog_name = models.CharField(max_length=100, null=True, blank=True, verbose_name="对话名称")
    dialog_id = models.CharField(max_length=255, unique=True, verbose_name="前端对话ID")  # 时间戳+随机字符串
    is_closed = models.BooleanField(default=False, verbose_name="对话是否关闭")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    last_active_at = models.DateTimeField(auto_now=True, verbose_name="最后活跃时间")


class DialogDetail(models.Model):
    """对话详情表"""
    MESSAGE_TYPE_CHOICES = [
        ('user', '用户'),
        ('ai', 'AI'),
    ]
    # id = models.AutoField(primary_key=True, verbose_name="ID")
    dialog = models.ForeignKey(Dialog, on_delete=models.CASCADE, related_name='details', verbose_name="对话")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="时间")
    text_content = models.TextField(null=True, blank=True, verbose_name="文本内容")
    # file_content = models.JSONField(null=True, blank=True, verbose_name="文件内容 (JSON数组)")
    # tokens_consumed = models.PositiveIntegerField(default=0, verbose_name="消耗的Token数")
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, verbose_name="消息类型")
    ai_role = models.ForeignKey(AIRole, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="AI角色")  # AI角色

