# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'xftx',  # 数据库
        'USER': 'root',  # 用户名
        'PASSWORD': '123456',  # 密码
        'HOST': '127.0.0.1',   # ip
        'PORT': 3306,          # 端口
    }
}
