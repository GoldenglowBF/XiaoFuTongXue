
"""
基于面向对象实现数据的封装
类似的设计案例：django中，用户请求进来携带的请求头 请求体等这些数据都封装到request对象中
"""
from django.http import JsonResponse


class HttpContext:
    def __init__(self):
        self.status = True
        self.data = None
        self.content = None

    @property
    def dict(self):
        return self.__dict__

def login():
    ctx = HttpContext()
    ctx.data = []
    return JsonResponse(ctx.dict)

