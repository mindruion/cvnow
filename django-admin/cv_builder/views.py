import datetime
import traceback

import CloudFlare
import requests
import os
from django.conf import settings
from django.core.files.base import ContentFile
from django.contrib.auth import login
from django.contrib.auth.models import Group
from django.db import transaction
from django.urls import reverse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.emails import send_verification_email
from cv_builder.models import User, Resume, About
from cv_builder.serializers import ResumeSerializer, ContactSerializer, SignupSerializer, LoginSerializer, \
    ResumeDeepWriteSerializerV2
from cv_builder.utils import create_published_app_route


@api_view()
def get_site_data(request, subdomain):
    token = request.GET.get("token")
    resume_qs = Resume.objects.filter(
        user__subdomain_name=subdomain,
        is_private=True if token else False,
        is_active=True
    ).select_related('user', 'about')
    resume = resume_qs.first()
    if not resume:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if token and resume.private_token != token:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if token and resume.is_token_expired():
        resume.create_token()
        resume.save()
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(ResumeSerializer(resume).data)

@api_view()
def get_site_data_config(request, subdomain):
    token = request.GET.get("token")
    resume_qs = Resume.objects.filter(
        user__subdomain_name=subdomain,
        is_private=True if token else False,
        is_active=True
    ).select_related('user', 'about')
    resume = resume_qs.first()
    if not resume:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if token and resume.private_token != token:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if token and resume.is_token_expired():
        resume.create_token()
        resume.save()
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(resume.config)


@api_view(["POST"])
def create_comment(request, subdomain):
    try:
        resume = Resume.objects.filter(user__subdomain_name=subdomain, is_active=True).first()
        serializer = ContactSerializer(data={**request.data, "created_by": resume.id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
    except Resume.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(status=status.HTTP_200_OK)


class ApiLoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(username=serializer.validated_data['email']).first()

        if not user or not user.check_password(serializer.validated_data["password"]):
            raise ValidationError({"details": "Invalid credential"})

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response(
            {
                "access": str(access),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED
        )

class ApiSignupView(APIView):
    def __create_subdomain(self, validated_data, separator='_'):  # noqa
        subdomain_name = f"{validated_data['first_name'].replace(' ', '_')}{separator}{validated_data['last_name'].replace(' ', '_')}".lower()
        return subdomain_name

    def _create_subdomain(self, serializer):
        subdomain_work = False
        for character in ["_", "__", "-", "--", "___", "---", "|", "||"]:
            subdomain_name = self.__create_subdomain(serializer.validated_data, character)

            if User.objects.filter(subdomain_name=subdomain_name).exists():
                continue
            else:
                subdomain_work = True
                break
        if not subdomain_work:
            raise ValidationError({"details": "Something bad happened"})
        return subdomain_name

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["email"]
        serializer.validated_data["username"] = username

        if User.objects.filter(username=username).exists():
            raise ValidationError({"details": "This email is already used by someone"})

        subdomain_name = self._create_subdomain(serializer)

        try:
            # Use a single atomic block just for DB writes
            with transaction.atomic():
                user = User.objects.create_user(
                    subdomain_name=subdomain_name,
                    is_staff=True,
                    is_active=False,
                    **serializer.validated_data
                )

                resume = self.create_public_resume(user)
                self.create_private_resume(resume)

            # Do non-DB side effects outside of the DB transaction
            create_published_app_route(subdomain_name)
            send_verification_email(request, user)

        except Exception as e:
            traceback.print_exc()
            # Let Django manage transaction rollback automatically
            raise ValidationError(
                {"details": f"Signup failed: {str(e)}"}
            )

        return Response({"detail": "Registration successful. Check your email to confirm your account."},
                        status=201)


    def create_public_resume(self, user):
        resume = Resume.objects.create(
            user=user,
            phone="+373 61 000 000",
            email="example@mail.com",
            location="Moldova, Chisinau",
            birth_date=datetime.date(year=2000, month=2, day=20),
            profession="Making fun",
            facebook="https://www.facebook.com/",
            linkedin="https://www.linkedin.com/",
        )
        # user.groups.set([Group.objects.get(name="Cv Builder")])
        self.populate_resume_default_data(resume)
        return resume

    def create_private_resume(self, resume):
        resume.id = None
        resume.is_private = True
        resume.create_token()
        resume.save()
        self.populate_resume_default_data(resume)

    def populate_resume_default_data(self, resume: Resume):  # noqa
        self.__create_what_i_dos(resume)
        self.__create_about(resume)
        self.__create_working_skills(resume)
        self.__create_educations(resume)
        self.__create_experiences(resume)
        self.__create_knowledge(resume)
        self.__create_blogs(resume)
        self.__create_languages(resume)

    def __create_languages(self, resume):
        resume.language_set.create(
            title="English",
            percentage=100
        )

    def __create_blogs(self, resume):  # noqa
        description = (
            """I'm Awesome at something from best place ever, place is here, working in best place and some other super places. """
            """I enjoy turning complex problems into simple, beautiful and amazing work."""
        )

        def _create_one(filename, category, title):
            try:
                path = os.path.join(settings.BASE_DIR, "default_images", filename)
                with open(path, "rb") as f:
                    resume.blog_set.create(
                        category=category,
                        description=description,
                        title=title,
                        img=ContentFile(f.read(), name=filename),
                    )
            except Exception:
                # If default image not available, skip creating blog to avoid breaking signup
                pass

        _create_one("blog1.jpg", "Perfect", "How to be Perfect")
        _create_one("blog2.jpg", "Awesome", "How to be Awesome")

    def __create_about(self, resume):  # noqa
        About.objects.create(
            created_by=resume,
            description="""I'm Awesome at something from best place ever, place is here, working in best place and some other super places. I enjoy turning complex problems into simple, beautiful and amazing work.""",
            short_description="""My aim is to bring across your message and identity in the most creative way. I worked everywhere and I am amazing.""",
        )

    def __create_educations(self, resume):  # noqa
        resume.education_set.create(
            start_date=datetime.date(year=2000, month=10, day=20),
            title="Ph.D in Awesome",
            place="ABC University, Los Angeles, CA",
        )

        resume.education_set.create(
            start_date=datetime.date(year=2000, month=10, day=20),
            title="Ph.D in Amazingness",
            place="Harvard University, Cambridge, MA",
        )

        resume.education_set.create(
            start_date=datetime.date(year=2000, month=10, day=20),
            title="Ph.D in Amazingness",
            place="Oxford University, England",
        )

    def __create_experiences(self, resume):  # noqa
        resume.experience_set.create(
            start_date=datetime.date(year=2000, month=10, day=1),
            end_date=datetime.date(year=2000, month=10, day=1),
            title="Head of Heads",
            place="Facebook",
        )

        resume.experience_set.create(
            start_date=datetime.date(year=2000, month=10, day=1),
            end_date=datetime.date(year=2000, month=10, day=1),
            title="Head of Heads",
            place="Google",
        )

        resume.experience_set.create(
            start_date=datetime.date(year=2000, month=10, day=1),
            end_date=datetime.date(year=2000, month=10, day=1),
            title="Head of Heads",
            place="Amazon",
        )

    def __create_working_skills(self, resume):  # noqa
        resume.workingskills_set.create(
            title="Amazing",
            percentage=99
        )
        resume.workingskills_set.create(
            title="Perfect",
            percentage=98
        )
        resume.workingskills_set.create(
            title="Brilliant",
            percentage=97
        )
        resume.workingskills_set.create(
            title="Awesome",
            percentage=100
        )

    def __create_knowledge(self, resume):  # noqa
        for t in ["Here something", "Here too", "I know", "Best", "To do"]:
            resume.knowledge_set.create(
                title=t,
            )

    def __create_what_i_dos(self, resume):  # noqa
        for t in [
            "Awesome at something",
            "Perfect at something",
            "Best at something",
            "Amazing at something",
            "Brilliant at something",
            "Again Awesome at something",
        ]:
            resume.whatido_set.create(
                title=t,
                description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat."
            )


class MyResumeViewV2(APIView):
    """
    Upsert-style endpoint for the authenticated user's resume.
    - GET: return current resume (404 if none)
    - POST: create or update (partial allowed)
    - PUT: full replace (all sections you include will overwrite)
    - PATCH: partial update (only provided fields/sections are touched)
    """

    def get_object(self, request):
        return Resume.objects.filter(user=request.user).first()

    def get(self, request, *args, **kwargs):
        instance = self.get_object(request)
        if not instance:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResumeDeepWriteSerializerV2(instance, context={"request": request})
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """
        Create or update (upsert). Allows partial payloads.
        """
        instance = self.get_object(request)
        if instance:
            serializer = ResumeDeepWriteSerializerV2(
                instance, data=request.data, partial=True, context={"request": request}
            )
        else:
            serializer = ResumeDeepWriteSerializerV2(
                data=request.data, context={"request": request}
            )
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            ResumeDeepWriteSerializerV2(saved, context={"request": request}).data,
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )

    def put(self, request, *args, **kwargs):
        """
        Full update (idempotent). If no resume exists yet, create one.
        """
        instance = self.get_object(request)
        if instance:
            serializer = ResumeDeepWriteSerializerV2(
                instance, data=request.data, partial=False, context={"request": request}
            )
        else:
            serializer = ResumeDeepWriteSerializerV2(
                data=request.data, context={"request": request}
            )
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            ResumeDeepWriteSerializerV2(saved, context={"request": request}).data,
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )

    def patch(self, request, *args, **kwargs):
        """
        Partial update; only fields/sections present are changed.
        """
        instance = self.get_object(request)
        if not instance:
            # Create-on-patch if you prefer; otherwise return 404
            serializer = ResumeDeepWriteSerializerV2(
                data=request.data, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            saved = serializer.save()
            return Response(
                ResumeDeepWriteSerializerV2(saved, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )

        serializer = ResumeDeepWriteSerializerV2(
            instance, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(ResumeDeepWriteSerializerV2(saved, context={"request": request}).data)
