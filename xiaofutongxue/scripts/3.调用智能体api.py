import json
import requests

apikey = '7e310b976efaf58ae362640c6c9a1f5d.7uobqgdVcq3LX1tM'
appid = '1856714419338428416'


def get_conversation_id():
    url = f'https://open.bigmodel.cn/api/llm-application/open/v2/application/{appid}/conversation'
    headers = {
        'Authorization': f'Bearer {apikey}',
    }
    with requests.post(url, headers=headers) as response:
        data_dict = json.loads(response.content.decode('utf-8'))
        return data_dict['data']['conversation_id']


conversation_id = get_conversation_id()


def send_message(text):
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


def receive_message(id):
    url = f'https://open.bigmodel.cn/api/llm-application/open/v2/model-api/{id}/sse-invoke'
    headers = {
        'Authorization': f'Bearer {apikey}',
    }
    with requests.post(url, headers=headers) as response:
        line = response.content.decode('utf-8')
        return get_msg(line)


def get_msg(line):
    msg = []
    for i in line.split('\n'):
        if i.startswith('data:{"msg":"'):
            msg.append(json.loads(i[5:])['msg'])
    return ''.join(msg)


def send(text):
    id = send_message(text)
    msg = receive_message(id)
    return msg



# Example usage

while True:
    msg = send(input())
    print(msg)
