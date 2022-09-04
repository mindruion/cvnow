import datetime
import traceback

import CloudFlare
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from cv_builder.models import User, Resume, About
from cv_builder.serializers import ResumeSerializer, ContactSerializer, SignupSerializer, LoginSerializer


@api_view()
def get_site_data(request, subdomain):
    token = request.GET.get("token")
    resume_qs = Resume.objects.filter(
        user__subdomain_name=subdomain,
        is_private=True if token else False
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


@api_view(["POST"])
def create_comment(request, subdomain):
    try:
        resume = Resume.objects.filter(user__subdomain_name=subdomain).first()
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
        user = User.objects.filter(username=serializer.validated_data['username']).first()

        if not user or not user.check_password(serializer.validated_data["password"]):
            raise ValidationError({"details": "Invalid credential"})

        login(request, user)
        return Response({
            "session_key": request.session.session_key,
            "redirect_url": request.build_absolute_uri(
                reverse("admin:cv_builder_resume_changelist")
            )
        }, status=status.HTTP_200_OK)


class ApiSignupView(APIView):
    def post(self, request):
        zone_id = settings.CLOUDFLARE_ZONE_ID
        email = settings.CLOUDFLARE_EMAIL
        token = settings.CLOUDFLARE_TOKEN
        domain = settings.CLOUDFLARE_DOMAIN
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if User.objects.filter(username=serializer.validated_data['username']).exists():
            raise ValidationError({"details": "This email is already used by someone"})

        subdomain_name = f"{serializer.validated_data['first_name'].replace(' ', '_')}_{serializer.validated_data['last_name'].replace(' ', '_')}".lower()

        if User.objects.filter(subdomain_name=subdomain_name).exists():
            raise ValidationError({"details": "Something bad happened subdomain name"})

        cf = CloudFlare.CloudFlare(email=email, token=token)
        try:
            cf.zones.dns_records.post(zone_id, data=dict(  # noqa
                name=f'{subdomain_name}.{domain}',
                type='A',
                content='164.92.200.190',
                proxied=True
            ))
        except Exception as e:  # noqa
            print(traceback.format_exc())
            raise ValidationError({"details": "Something bad happened"})

        user = User.objects.create_user(subdomain_name=subdomain_name, is_staff=True, **serializer.validated_data)
        resume = self.create_public_resume(user)
        public_resume_id = resume.id
        self.create_private_resume(resume)
        login(request, user)
        return Response({
            "session_key": request.session.session_key,
            "redirect_url": request.build_absolute_uri(
                reverse("admin:cv_builder_resume_change", args=[public_resume_id])
            )
        }, status=status.HTTP_200_OK)

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
        user.groups.set([Group.objects.get(name="Cv Builder")])
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

    def __create_blogs(self, resume):  # noqa
        resume.blog_set.create(
            category="Perfect",
            description="""I'm Awesome at something from best place ever, place is here, working in best place and some other super places. I enjoy turning complex problems into simple, beautiful and amazing work.""",
            title="How to be Perfect",
        )

        resume.blog_set.create(
            category="Awesome",
            description="""I'm Awesome at something from best place ever, place is here, working in best place and some other super places. I enjoy turning complex problems into simple, beautiful and amazing work.""",
            title="How to be Awesome",
        )

    def __create_about(self, resume):  # noqa
        About.objects.create(
            created_by=resume,
            description="""I'm Awesome at something from best place ever, place is here, working in best place and some other super places. I enjoy turning complex problems into simple, beautiful and amazing work.""",
            short_description="""My aim is to bring across your message and identity in the most creative way. I worked everywhere and I am amazing.""",
        )

    def __create_educations(self, resume):  # noqa
        resume.education_set.create(
            from_date=datetime.date(year=2000, month=10, day=20),
            title="Ph.D in Awesome",
            place="ABC University, Los Angeles, CA",
            bg="#FFF4F4",
        )

        resume.education_set.create(
            from_date=datetime.date(year=2000, month=10, day=20),
            title="Ph.D in Amazingness",
            place="Harvard University, Cambridge, MA",
            bg="#FFF1FB",
        )

        resume.education_set.create(
            from_date=datetime.date(year=2000, month=10, day=20),
            title="Ph.D in Amazingness",
            place="Oxford University, England",
            bg="#FFF4F4",
        )

    def __create_experiences(self, resume):  # noqa
        resume.experience_set.create(
            from_date=datetime.date(year=2000, month=10, day=1),
            end_date=datetime.date(year=2000, month=10, day=1),
            title="Head of Heads",
            place="Facebook",
            bg="#EEF5FA",
        )

        resume.experience_set.create(
            from_date=datetime.date(year=2000, month=10, day=1),
            end_date=datetime.date(year=2000, month=10, day=1),
            title="Head of Heads",
            place="Google",
            bg="#F2F4FF",
        )

        resume.experience_set.create(
            from_date=datetime.date(year=2000, month=10, day=1),
            end_date=datetime.date(year=2000, month=10, day=1),
            title="Head of Heads",
            place="Amazon",
            bg="#EEF5FA",
        )

    def __create_working_skills(self, resume):  # noqa
        resume.workingskills_set.create(
            title="Amazing",
            color="#FF6464",
            percentage=99
        )
        resume.workingskills_set.create(
            title="Perfect",
            color="#9272D4",
            percentage=98
        )
        resume.workingskills_set.create(
            title="Brilliant",
            color="#5185D4",
            percentage=97
        )
        resume.workingskills_set.create(
            title="Awesome",
            color="#CA56F2",
            percentage=100
        )

    def __create_knowledge(self, resume):  # noqa
        for t in ["Here something", "Here too", "I know", "Best", "To do"]:
            resume.knowledge_set.create(
                title=t,
            )

    def __create_what_i_dos(self, resume):  # noqa
        for t, bg in [
            ("Awesome at something", "#FCF4FF"),
            ("Perfect at something", "#FEFAF0"),
            ("Best at something", "#FCF4FF"),
            ("Amazing at something", "#FFF4F4"),
            ("Brilliant at something", "#FFF0F8"),
            ("Again Awesome at something", "#F3FAFF"),
        ]:
            resume.whatido_set.create(
                title=t,
                bg=bg,
                des="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam euismod volutpat."
            )
