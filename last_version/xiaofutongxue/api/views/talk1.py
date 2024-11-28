import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# 质谱API信息
apikey = '7e310b976efaf58ae362640c6c9a1f5d.7uobqgdVcq3LX1tM'
appid = '1856714419338428416'

# 用于存储每个对话的轮数
conversations = {}

# 获取会话ID
def get_conversation_id():
    url = f'https://open.bigmodel.cn/api/llm-application/open/v2/application/{appid}/conversation'
    headers = {
        'Authorization': f'Bearer {apikey}',
    }
    with requests.post(url, headers=headers) as response:
        data_dict = json.loads(response.content.decode('utf-8'))
        return data_dict['data']['conversation_id']

# 发送用户提问数据给质谱API
def send_message(text, conversation_id):
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
    with requests.post(url, json=data, headers=headers) as response:
        data_dict = json.loads(response.content.decode('utf-8'))
        return data_dict['data']['id']

# 获取质谱API的响应数据
def receive_message(id):
    url = f'https://open.bigmodel.cn/api/llm-application/open/v2/model-api/{id}/sse-invoke'
    headers = {
        'Authorization': f'Bearer {apikey}',
    }
    with requests.post(url, headers=headers) as response:
        line = response.content.decode('utf-8')
        return get_msg(line)

# 解析质谱API返回的消息
def get_msg(line):
    msg = []
    for i in line.split('\n'):
        if i.startswith('data:{"msg":"'):
            msg.append(json.loads(i[5:])['msg'])
    return ''.join(msg)

# 后端视图，接收前端用户提问并调用质谱API
@csrf_exempt
def process_question1(request):
    if request.method == "POST":
        try:
            # 获取前端发送的数据
            data = json.loads(request.body)
            user_input = data.get('user_input')  # 获取用户提问内容
            conversation_id = data.get('conversation_id')  # 获取会话ID

            if not user_input:
                return JsonResponse({"error": "缺少用户提问内容"}, status=400)
            if not conversation_id:
                # 如果没有提供 conversation_id，说明是新的对话
                conversation_id = get_conversation_id()
                conversations[conversation_id] = 1  # 初始化为第一轮对话
                return JsonResponse({"conversation_id": conversation_id, "ai_response": "你好！请问有什么问题？"})

            # 校验对话轮数
            if conversation_id in conversations:
                rounds = conversations[conversation_id]
                if rounds >= 10:
                    return JsonResponse({"error": "对话轮数已超过10轮，结束对话。"}, status=400)
                # 增加轮数
                conversations[conversation_id] += 1
            else:
                return JsonResponse({"error": "无效的对话ID"}, status=400)

            # 调用质谱API处理用户提问
            message_id = send_message(user_input, conversation_id)
            response_message = receive_message(message_id)

            # 返回质谱API的回复给前端
            return JsonResponse({"conversation_id": conversation_id, "ai_response": response_message})

        except json.JSONDecodeError:
            return JsonResponse({"error": "请求数据格式错误"}, status=400)
    return JsonResponse({"error": "不支持的请求方法"}, status=405)
