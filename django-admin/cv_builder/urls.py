from django.contrib import admin
from django.urls import path

from cv_builder import views

urlpatterns = [
    path('api/sign-up', views.ApiSignupView.as_view(), name="signup"),
    path('api/login', views.ApiLoginView.as_view(), name="signin"),
    path('api/<str:subdomain>', views.get_site_data),
    path('api/contact/<str:subdomain>', views.create_comment),
]
