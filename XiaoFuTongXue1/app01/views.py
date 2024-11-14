from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse
from django.contrib.auth.forms import AuthenticationForm
# Create your views here.
from django.shortcuts import HttpResponse
from django.contrib.auth import get_user_model, login, authenticate

from django import forms

from XiaoFuTongXue1.settings import USE_I18N
from .models import *


def login(request):
    print(request.path_info)
    if request.method == "GET":
        return render(request, "login.html", {"form": AuthenticationForm()})

    form = AuthenticationForm(request, data=request.POST)
    if not form.is_valid():
        return render(request, "login.html", {"form": form})

    username = form.cleaned_data.get("username")
    password = form.cleaned_data.get("password")
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return redirect('user:home')
    else:
        return JsonResponse({"error": "用户名或密码错误"}, status=400)


class RegisterForm(forms.Form):
    nickname = forms.CharField(max_length=100, error_messages={'required': '昵称不能为空'})
    username = forms.CharField(max_length=100, error_messages={'required': '用户名不能为空'})
    password = forms.CharField(max_length=100, error_messages={'required': '密码不能为空'})
    re_password = forms.CharField(max_length=100, error_messages={'required': '确认密码不能为空'})

    class Meta:
        model = User
        fields = ['username', 'password']

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        re_password = cleaned_data.get('re_password')
        if password != re_password:
            raise forms.ValidationError('两次密码不一致')
        return cleaned_data

    def clean_username(self):
        username = self.cleaned_data.get('username')
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('用户名已存在')
        return username


def register(request):
    print(request.path_info)
    if request.method == "GET":
        form = RegisterForm()
        return render(request, "register.html", {"form": form})
    form = RegisterForm(request.POST)
    if not form.is_valid():
        return render(request, "register.html", {"form": form})

    nickname = form.cleaned_data.get("nickname")
    username = form.cleaned_data.get("username")
    password = form.cleaned_data.get("password")
    User.objects.create_user(username=username, password=password)
    return redirect(reverse('user:login'))


def home(request):
    return render(request, "dashboard.html")
