
# accounts/views.py
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    ResendVerificationSerializer,
    RequestPasswordResetSerializer,
    PasswordResetConfirmSerializer,
)
from .tokens import account_activation_token
from .emails import send_verification_email, send_password_reset_email

User = get_user_model()

class VerifyEmailView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        uidb64 = request.query_params.get("uid")
        token = request.query_params.get("token")
        if not uidb64 or not token:
            return Response({"detail": "Missing uid or token."}, status=400)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid link."}, status=400)

        if account_activation_token.check_token(user, token):
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=["is_active"])

                refresh = RefreshToken.for_user(user)
                access = refresh.access_token

                return Response(
                    {"access": str(access), "refresh": str(refresh)},
                    status=status.HTTP_201_CREATED
                )

        return Response({"detail": "Invalid or expired token."}, status=400)

class ResendVerificationView(APIView):
    def post(self, request):
        s = ResendVerificationSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email = s.validated_data["email"].lower()
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"detail": "Account already verified."}, status=200)
            send_verification_email(request, user)
        except User.DoesNotExist:
            pass
        return Response({"detail": "If an account exists, a verification email was sent."}, status=200)

class RequestPasswordResetView(APIView):
    def post(self, request):
        s = RequestPasswordResetSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email = s.validated_data["email"].lower()
        try:
            user = User.objects.get(email=email)
            send_password_reset_email(request, user)
        except User.DoesNotExist:
            pass
        return Response({"detail": "If an account exists, a reset email was sent."}, status=200)

class PasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        s = PasswordResetConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        uidb64 = s.validated_data["uid"]
        token = s.validated_data["token"]
        new_password = s.validated_data["new_password"]
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid link."}, status=400)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save(update_fields=["password"])
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response(
                {"access": str(access), "refresh": str(refresh)},
                status=status.HTTP_201_CREATED
            )
        return Response({"detail": "Invalid or expired token."}, status=400)
