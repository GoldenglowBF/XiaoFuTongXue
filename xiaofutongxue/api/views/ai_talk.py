from django.shortcuts import HttpResponse


def handle_random_id(request):
    dialog_id = request.POST.get('nid', None)
    print(dialog_id)
    return HttpResponse("OK")