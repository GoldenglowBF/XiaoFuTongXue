"""
URL configuration for xiaofutongxue project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from django.shortcuts import HttpResponse
from api.views import account
from api.views import talk

urlpatterns = [
    path("login/", account.login, name="login"),
    path("register/", account.register, name="register"),
    path("home/", account.home, name="home"),

    # path('random/nid/', ai_talk.handle_random_id, name='handle_random_nid'),
    path('api/process_question/', talk.process_question, name='process_question'),
]
