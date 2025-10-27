
# accounts/emails.py
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import EmailMultiAlternatives
from django.urls import reverse
from .tokens import account_activation_token

PRIMARY = "#18e7d3"
PRIMARY_DARK = "#0f8a9c"
DEEP = "#0a1f44"
LIGHT = "#eefbfd"
DANGER = "#ff6b6b"

def _absolute(url: str) -> str:
    if url.startswith("http://") or url.startswith("https://"):
        return url
    base = getattr(settings, "FRONTEND_URL", "")
    return f"{base.rstrip('/')}/{url.lstrip('/')}"

def send_verification_email(request, user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    verify_url = getattr(settings, "FRONTEND_VERIFY_EMAIL_URL", None)
    if verify_url:
        link = f"{verify_url}?uid={uid}&token={token}"
    else:
        path = reverse("accounts:verify-email") + f"?uid={uid}&token={token}"
        link = request.build_absolute_uri(path)

    context = {
        "action_url": _absolute(link),
        "user": user,
        "palette": {
            "primary": PRIMARY,
            "primary_dark": PRIMARY_DARK,
            "deep": DEEP,
            "light": LIGHT,
            "danger": DANGER,
        },
    }

    html = render_to_string("email/verify_account.html", context)
    msg = EmailMultiAlternatives(
        subject="Confirm your account",
        body="Please confirm your account.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send()

def send_password_reset_email(request, user):
    from django.contrib.auth.tokens import default_token_generator

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_url = getattr(settings, "FRONTEND_RESET_PASSWORD_URL", None)
    if reset_url:
        link = f"{reset_url}?uid={uid}&token={token}"
    else:
        path = reverse("accounts:password-reset-confirm")
        link = request.build_absolute_uri(path) + f"?uid={uid}&token={token}"

    context = {
        "action_url": _absolute(link),
        "user": user,
        "palette": {
            "primary": PRIMARY,
            "primary_dark": PRIMARY_DARK,
            "deep": DEEP,
            "light": LIGHT,
            "danger": DANGER,
        },
    }

    html = render_to_string("email/password_reset.html", context)
    msg = EmailMultiAlternatives(
        subject="Reset your password",
        body="Use the link to reset your password.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send()
