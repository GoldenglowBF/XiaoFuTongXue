from django import views
from django.conf import settings
from api.forms.account import LoginForm, RegisterForm
from api import models
from django.shortcuts import render, HttpResponse, redirect


def login(request):
    # 1.让用户看到页面
    if request.method == "GET":
        print(request.GET)
        form = LoginForm()
        return render(request, "login.html", {"form": form})

    # 2.用户提交数据
    form = LoginForm(request.POST)
    if not form.is_valid():
        return render(request, "login.html", {"form": form})

    data_dict = form.cleaned_data
    role = data_dict.pop("role")
    if role == "1":
        user_object = models.Administrator.objects.filter(**data_dict).first()
    else:
        user_object = models.User.objects.filter(**data_dict).first()
    # 数据不存在
    if not user_object:
        form.add_error("password", "用户名或密码错误")
        return render(request, "login.html", {"form": form})

    # 数据存在，将用户信息存储到session中
    mapping = {"1": "ADMIN", "2": "CUSTOMER"}
    request.session[settings.UI_SESSION_KEY] = {
        "role": mapping[role],
        "id": user_object.id,
        "name": user_object.username
    }
    # 成功，跳转后台
    return redirect(settings.HOME_URL)


def register(request):
    if request.method == "GET":
        form = RegisterForm()
        return render(request, "register.html", {"form": form})

    # 2.用户提交数据
    form = RegisterForm(request.POST)
    if not form.is_valid():
        return render(request, "register.html", {"form": form})

    data_dict = form.cleaned_data
    models.User.objects.create(**data_dict)

    return redirect("login")


def home(request):
    return render(request, "dashboard.html")


