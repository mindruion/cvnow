
# accounts/urls.py
from django.urls import path
from .views import (
    VerifyEmailView,
    ResendVerificationView,
    RequestPasswordResetView,
    PasswordResetConfirmView,
)

app_name = "accounts"

urlpatterns = [
    path("verify-email", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification", ResendVerificationView.as_view(), name="resend-verification"),
    path("password-reset", RequestPasswordResetView.as_view(), name="password-reset"),
    path("password-reset-confirm", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
