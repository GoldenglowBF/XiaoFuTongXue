from django.shortcuts import HttpResponse


def handle_random_id(request):
    dialog_id = request.GET.get('id', None)
    print(dialog_id)  # 打印传递过来的ID
    return HttpResponse("OK")