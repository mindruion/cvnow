from django.contrib import admin
from django.urls import path

from cv_builder import views
from cv_builder.views import MyResumeViewV2

urlpatterns = [
    path('api/auth/signup', views.ApiSignupView.as_view(), name="signup"),
    path('api/auth/login', views.ApiLoginView.as_view(), name="signin"),
    path('api/my-resume', MyResumeViewV2.as_view(), name="my-resume-v2"),
    path('api/<str:subdomain>', views.get_site_data),
    path('api/config/<str:subdomain>', views.get_site_data_config),
    path('api/contact/<str:subdomain>', views.create_comment),
]
