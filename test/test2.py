# 测试模拟api调用和验证视图的行为 test2
from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch
import json

class ProcessQuestionTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('process_question1') 

    @patch('api.views.talk1.get_conversation_id')  
    @patch('api.views.talk1.send_message')  
    @patch('api.views.talk1.receive_message')  
    def test_process_question_success(self, mock_receive_message, mock_send_message, mock_get_conversation_id):
        # 模拟 API 返回
        mock_get_conversation_id.return_value = 'test_conversation_id'
        mock_send_message.return_value = 'test_message_id'
        mock_receive_message.return_value = '这是一个测试回答'

        # 模拟用户输入
        response = self.client.post(self.url, data=json.dumps({
            'user_input': '你好',
            'role': 'bargaining'
        }), content_type='application/json')

        # 验证响应
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"ai_response": "这是一个测试回答"})

    def test_process_question_missing_user_input(self):
        response = self.client.post(self.url, data=json.dumps({
            'role': 'bargaining'
        }), content_type='application/json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"error": "缺少用户提问内容"})

    def test_process_question_invalid_role(self):
        response = self.client.post(self.url, data=json.dumps({
            'user_input': '你好',
            'role': 'invalid_role'
        }), content_type='application/json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"error": "无效的角色信息"})
