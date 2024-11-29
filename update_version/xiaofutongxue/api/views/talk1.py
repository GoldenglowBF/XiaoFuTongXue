from django.db import models
from django.utils import timezone
import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# 质谱API信息
api_keys = {
    'bargaining': {
        'apikey': '7e310b976efaf58ae362640c6c9a1f5d.7uobqgdVcq3LX1tM',
        'appid': '1856714419338428416',  # 砍价
    },
    'interview': {
        'apikey': '7e310b976efaf58ae362640c6c9a1f5d.7uobqgdVcq3LX1tM',
        'appid': '1857406193484587008',  # 面试
    },
    'new_year': {
        'apikey': '7e310b976efaf58ae362640c6c9a1f5d.7uobqgdVcq3LX1tM',
        'appid': '1856981823914188800',  # 拜年
    }
}

# 获取会话ID
def get_conversation_id(appid, apikey):
    url = f'https://open.bigmodel.cn/api/llm-application/open/v2/application/{appid}/conversation'
    headers = {
        'Authorization': f'Bearer {apikey}',
    }
    try:
        with requests.post(url, headers=headers) as response:
            response.raise_for_status()  # 检查请求是否成功
            data_dict = response.json()  # 使用 .json() 方法解析响应
            print("Decoded response:", data_dict)  # 打印解码后的响应内容
            return data_dict.get('data', {}).get('conversation_id', None)  # 安全访问，避免 KeyError
    except requests.exceptions.RequestException as e:
        print(f"Error in get_conversation_id: {e}")
        return None

# 发送用户提问数据给质谱API
def send_message(appid, apikey, conversation_id, text):
    url = 'https://open.bigmodel.cn/api/llm-application/open/v2/application/generate_request_id'
    headers = {
        'Authorization': f'Bearer {apikey}',
        'Content-Type': 'application/json'
    }
    data = {
        'app_id': appid,
        'conversation_id': conversation_id,
        'key_value_pairs': [
            {
                'id': 'user',
                'type': 'input',
                'name': '用户提问',
                'value': text
            }
        ]
    }
    try:
        with requests.post(url, json=data, headers=headers) as response:
            response.raise_for_status()  # 检查请求是否成功
            data_dict = response.json()
            return data_dict.get('data', {}).get('id', None)  # 获取消息ID
    except requests.exceptions.RequestException as e:
        print(f"Error in send_message: {e}")
        return None

# 解析质谱API返回的消息，并解码Unicode字符串
def get_msg(line):
    msg = []
    for i in line.split('\n'):
        if i.startswith('data:{"msg":"'):
            # 解码Unicode字符串，直接用utf-8解码，避免乱码
            msg_content = json.loads(i[5:])['msg']
            # 如果发现转义字符，可以尝试使用unicode_escape
            msg.append(msg_content.encode('utf-8').decode('utf-8'))
    return ''.join(msg)


# 获取质谱API的响应数据
def receive_message(apikey, id):
    url = f'https://open.bigmodel.cn/api/llm-application/open/v2/model-api/{id}/sse-invoke'
    headers = {
        'Authorization': f'Bearer {apikey}',
    }
    try:
        with requests.post(url, headers=headers) as response:
            response.raise_for_status()  # 检查请求是否成功
            line = response.content.decode('utf-8', errors='ignore')  # 忽略无效字符
            # 调用get_msg来解码返回的消息
            return get_msg(line)
    except requests.exceptions.RequestException as e:
        print(f"Error in receive_message: {e}")
        return None


# 后端视图，接收前端用户提问并调用质谱API
@csrf_exempt
def process_question1(request):
    if request.method == "POST":
        try:
            # 获取前端发送的数据
            data = json.loads(request.body)
            user_input = data.get('user_input')  # 获取用户提问内容
            role = data.get('role')  # 获取角色

            if not user_input:
                return JsonResponse({"error": "缺少用户提问内容"}, status=400)
            if not role:
                return JsonResponse({"error": "缺少角色信息"}, status=400)

            # 获取对应角色的apikey和appid
            if role not in api_keys:
                return JsonResponse({"error": "无效的角色信息"}, status=400)

            api_info = api_keys[role]
            appid = api_info['appid']
            apikey = api_info['apikey']

            # 获取会话ID
            conversation_id = get_conversation_id(appid, apikey)
            if not conversation_id:
                return JsonResponse({"error": "获取会话ID失败"}, status=500)

            # 调用质谱API处理用户提问
            message_id = send_message(appid, apikey, conversation_id, user_input)
            if not message_id:
                return JsonResponse({"error": "发送提问失败"}, status=500)

            response_message = receive_message(apikey, message_id)
            if not response_message:
                return JsonResponse({"error": "获取回答失败"}, status=500)

            # 去掉响应内容中的换行符
            response_message = response_message.replace('\n', '')  # 去掉所有换行符

            # 返回质谱API的回复给前端
            return JsonResponse({"ai_response": response_message})

        except json.JSONDecodeError:
            return JsonResponse({"error": "请求数据格式错误"}, status=400)
    return JsonResponse({"error": "不支持的请求方法"}, status=405)
