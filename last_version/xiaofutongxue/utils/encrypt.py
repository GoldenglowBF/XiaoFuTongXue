import hashlib


def md5_string(data_string):
    obj = hashlib.md5("fsdkfsjdfksjkdjflkajsdfiji".encode("utf-8"))
    obj.update(data_string.encode("utf-8"))
    return obj.hexdigest()


if __name__ == '__main__':
    res = md5_string("123")
    print(res)