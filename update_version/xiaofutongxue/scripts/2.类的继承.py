"""

继承寻找顺序：
    所在的对象中封装的
    自己的类中封装的
    父类的类变量封装的
"""
class Base:
    city = "北京"

    def __init__(self):
        print(self.city)


class Info(Base):
    city = "上海"

obj = Info()