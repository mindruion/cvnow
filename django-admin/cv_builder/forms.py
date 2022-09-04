from django import forms
from django.contrib.auth.password_validation import validate_password


class SignupForm(forms.Form):
    username = forms.CharField()
    first_name = forms.CharField()
    last_name = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput, )

    def clean_password(self):
        validate_password(self.cleaned_data['password'])
