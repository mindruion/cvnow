from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from cv_builder.models import Resume, About, Knowledge, WorkingSkills, Experience, Education, WhatIDo, Blog, \
    ContactMessage, Language


class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        exclude = ("id", "created_by")


class WhatIDoSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatIDo
        exclude = ("id", "created_by")


class EducationSerializer(serializers.ModelSerializer):
    date = serializers.CharField()

    class Meta:
        model = Education
        exclude = ("id", "created_by")


class ExperienceSerializer(serializers.ModelSerializer):
    date = serializers.CharField()

    class Meta:
        model = Experience
        exclude = ("id", "created_by")


class WorkingSkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingSkills
        exclude = ("id", "created_by")


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        exclude = ("id", "created_by")


class KnowledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Knowledge
        exclude = ("id", "created_by")


class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        exclude = ("created_by",)


class ResumeSerializer(serializers.ModelSerializer):
    about = AboutSerializer()
    what_i_dos = WhatIDoSerializer(source="whatido_set", many=True)
    educations = EducationSerializer(source="education_set", many=True)
    experiences = ExperienceSerializer(source="experience_set", many=True)
    working_skills = WorkingSkillsSerializer(source="workingskills_set", many=True)
    languages = LanguageSerializer(source="language_set", many=True)
    knowledge = KnowledgeSerializer(source="knowledge_set", many=True)
    name = serializers.CharField(source="user.name")
    language = serializers.CharField(source="language_used")
    blogs = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        exclude = (
            "id", "user", "private_token", "private_token_lifetime", "private_token_created", "is_private")

    def get_blogs(self, obj: Resume):  # noqa
        if obj.include_blogs:
            return BlogSerializer(obj.blog_set, many=True).data
        return []


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


class SignupSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.EmailField()
    password = serializers.CharField()

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.EmailField()
    password = serializers.CharField()
