from django import forms
from utils.encrypt import md5_string

from utils.bootstrap import BootStrapForm


class LoginForm(BootStrapForm, forms.Form):
    # exclude_field_list = ["username"]

    role = forms.ChoiceField(
        label="角色",
        required=True,
        choices=(("1", "管理员"), ("2", "客户"))
    )

    username = forms.CharField(
        label="用户名",
        widget=forms.TextInput,
    )

    password = forms.CharField(
        label="密码",
        widget=forms.PasswordInput(render_value=True),
    )

    def clean_password(self):
        old = self.cleaned_data['password']
        return md5_string(old)


class RegisterForm(BootStrapForm, forms.Form):
    username = forms.CharField(
        label="用户名",
        widget=forms.TextInput,
    )

    password = forms.CharField(
        label="密码",
        widget=forms.PasswordInput(render_value=True),
    )

    def clean_password(self):
        old = self.cleaned_data['password']
        return md5_string(old)
