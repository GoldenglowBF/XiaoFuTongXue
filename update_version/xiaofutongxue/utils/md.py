"""
当用户访问后台时，通过中间件校验用户是否已经登录
校验思路：
    1.设定白名单，对一些不需要登录就能访问url进行控制
    2.根据用户登录成功后在session存储的用户信息，根据key来取信息
                取不到，重定向到登录界面
                取到，将用户信息【id,role,手机号封装到对    象中】

权限判断
校验思路:
    1.设定白名单，对于一些不需要登录就能访问的url进行控制
    2.请求进来，拿到对象的角色，
              根据角色去配置文件中读取所有的权限
              判断当年访问的url是否在权限中
                    不存在，无权访问
                    存在，继续往下走
"""

from django.shortcuts import redirect
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from api import models

class Context:
    def __init__(self, role, id, name):
        self.role = role
        self.id = id
        self.name = name


class AuthMiddleware(MiddlewareMixin):

    # 设置白名单，有些url无需登录就能访问
    def is_white_url_by_name(self, request):
        if request.resolver_match.url_name in settings.UI_WHITE_URL:
            return True

    def process_view(self, request, view_func, view_args, view_kwargs):
        if self.is_white_url_by_name(request):
            return
        # 判断用户是否已经登录
        data_dict = request.session.get(settings.UI_SESSION_KEY)
        if not data_dict:
            return redirect('login')
        request.xf_user = Context(**data_dict)



