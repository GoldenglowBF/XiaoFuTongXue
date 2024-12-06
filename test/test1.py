# 登录与注册的测试 test1
from django.test import TestCase
from django.urls import reverse
from api.forms.account import LoginForm, RegisterForm
from api.models import User, Administrator

class UserAuthTests(TestCase):

    def setUp(self):
        # 创建测试用户
        self.user = User.objects.create_user(username='testuser', password='testpass', role='2')

    def test_login_get(self):
        # 测试 GET 请求返回登录页面
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'login.html')

    def test_login_post_valid(self):
        # 测试有效的登录请求
        response = self.client.post(reverse('login'), {'username': 'testuser', 'password': 'testpass', 'role': '2'})
        self.assertRedirects(response, '/home/')  
        self.assertIn('_auth_user_id', self.client.session)  

    def test_login_post_invalid(self):
        # 测试无效的登录请求
        response = self.client.post(reverse('login'), {'username': 'testuser', 'password': 'wrongpass', 'role': '2'})
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'login.html')
        self.assertFormError(response, 'form', 'password', '用户名或密码错误')

    def test_register_get(self):
        # 测试 GET 请求返回注册页面
        response = self.client.get(reverse('register'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'register.html')

    def test_register_post_valid(self):
        # 测试有效的注册请求
        response = self.client.post(reverse('register'), {'username': 'newuser', 'password': 'newpass', 'role': '2'})
        self.assertRedirects(response, reverse('login'))
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_post_invalid(self):
        # 测试无效的注册请求
        response = self.client.post(reverse('register'), {'username': '', 'password': '', 'role': '2'})
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'register.html')
        self.assertFormError(response, 'form', 'username', '此字段是必填项。')  
