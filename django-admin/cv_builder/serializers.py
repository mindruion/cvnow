import base64
from io import BytesIO
from PIL import Image, UnidentifiedImageError
import uuid
from typing import List, Dict, Any, Optional

from django.contrib.auth.password_validation import validate_password
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils.text import slugify
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
    avatar = serializers.SerializerMethodField(read_only=True)

    def get_avatar(self, obj):
        """Return current avatar as base64 data URI."""
        return _imagefield_to_base64(obj.avatar)

    class Meta:
        model = Resume
        exclude = (
            "id", "user", "private_token", "private_token_lifetime", "private_token_created", "is_private")

    def get_blogs(self, obj: Resume):  # noqa
        if obj.include_blogs:
            return BlogSerializer(obj.blog_set, many=True).data
        return []

    def get_knowledge(self, obj: Resume):  # noqa
        return list(obj.knowledge_set.order_by('id').values_list('title', flat=True))


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


class SignupSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class AboutWriteSerializerV2(serializers.ModelSerializer):
    """One-to-one About section"""

    class Meta:
        model = About
        fields = ("description", "short_description")


class WhatIDoWriteSerializerV2(serializers.ModelSerializer):
    """What I Do section"""

    class Meta:
        model = WhatIDo
        fields = ("title", "description")


class EducationWriteSerializerV2(serializers.ModelSerializer):
    """Education section"""
    class Meta:
        model = Education
        fields = ("start_date", "end_date", "title", "place", "degree", "description", "field_of_study", "institution",
                  "notes", "current")


class ExperienceWriteSerializerV2(serializers.ModelSerializer):
    """Experience section"""

    class Meta:
        model = Experience
        fields = ("start_date", "end_date", "title", "place", "role", "company", "location", "description", "current")


class WorkingSkillWriteSerializerV2(serializers.ModelSerializer):
    """Working Skills section"""

    class Meta:
        model = WorkingSkills
        fields = ("title", "percentage")


class KnowledgeItemWriteSerializerV2(serializers.ModelSerializer):
    """Knowledge section"""

    class Meta:
        model = Knowledge
        fields = ("title",)


class LanguageWriteSerializerV2(serializers.ModelSerializer):
    """Language proficiency section"""

    class Meta:
        model = Language
        fields = ("title", "percentage")


# -----------------------------
# Resume (root) serializer
# -----------------------------

def _imagefield_to_base64(image_field):
    """Return an ImageField as data URI base64 string, or None."""
    if not image_field:
        return None
    try:
        with image_field.open("rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        # best-effort mime guess from filename
        ext = (image_field.name.rsplit(".", 1)[-1] or "jpeg").lower()
        if ext in ("jpg", "jpe"):
            ext = "jpeg"
        return f"data:image/{ext};base64,{b64}"
    except Exception:
        return None


class ResumeDeepWriteSerializerV2(serializers.ModelSerializer):
    about = AboutWriteSerializerV2()  # one-to-one

    what_i_do = WhatIDoWriteSerializerV2(many=True, required=False, source='whatido_set')
    education = EducationWriteSerializerV2(many=True, required=False, source='education_set')
    experience = ExperienceWriteSerializerV2(many=True, required=False, source='experience_set')
    working_skills = WorkingSkillWriteSerializerV2(many=True, required=False, source='workingskills_set')
    languages = LanguageWriteSerializerV2(many=True, required=False, source='language_set')
    knowledge = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    config = serializers.JSONField(required=False)

    avatar_url = serializers.URLField(required=False, allow_blank=True, write_only=True)
    avatar_upload = serializers.CharField(required=False, allow_blank=True, write_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    subdomain = serializers.CharField(source='user.subdomain_name', read_only=True)

    class Meta:
        model = Resume
        fields = (
            "profession", "phone", "email", "location", "birth_date",
            "facebook", "linkedin", "theme", "step",
            "include_blogs", "can_download_cv", "language_used",
            "about", "what_i_do", "education", "experience",
            "working_skills", "knowledge", "languages", 'config',
            "avatar_url", "avatar_upload", "avatar", "subdomain"
        )

    # ----- READ -----
    def get_avatar(self, obj):
        """Return current avatar as base64 data URI."""
        return _imagefield_to_base64(obj.avatar)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Represent knowledge as list of strings (titles)
        data["knowledge"] = list(instance.knowledge_set.order_by('id').values_list("title", flat=True))
        return data

    # ----- AVATAR HELPERS -----
    def _save_avatar_thumbnail_like_admin(self, instance: Resume, raw_bytes: bytes, ext_hint: str = None):
        """
        Save main avatar and also save avatar_thumbnail similarly to how your admin
        writes multiple image fields (big/small). For Resume we have:
          - avatar (original)
          - avatar_thumbnail (ProcessedImageField: 100x50 via model processors)
        We still write original bytes to avatar_thumbnail to trigger processing.
        """
        # Pick extension using Pillow (prefer ext_hint if valid)
        allowed_exts = {"jpg", "png", "gif", "webp", "bmp", "tif", "ico"}
        ext = None
        if ext_hint:
            ext = ext_hint.strip().lower().lstrip(".")
            if ext in ("jpeg", "jpe"):
                ext = "jpg"
            if ext == "tiff":
                ext = "tif"
            if ext not in allowed_exts:
                ext = None
        if not ext:
            try:
                with Image.open(BytesIO(raw_bytes)) as img:
                    fmt = (img.format or "").upper()
                pillow_to_ext = {
                    "JPEG": "jpg",
                    "JPG": "jpg",
                    "PNG": "png",
                    "GIF": "gif",
                    "WEBP": "webp",
                    "BMP": "bmp",
                    "TIFF": "tif",
                    "ICO": "ico",
                }
                ext = pillow_to_ext.get(fmt)
            except Exception:
                ext = None
        ext = (ext or "jpg")

        # Save original
        file_id = uuid.uuid4().hex
        instance.avatar.save(f"{file_id}.{ext}", ContentFile(raw_bytes), save=False)

        # Also write same content into thumbnail field so ImageKit processes it now
        thumb_id = uuid.uuid4().hex
        instance.avatar_thumbnail.save(f"{thumb_id}.{ext}", ContentFile(raw_bytes), save=False)

    def _set_avatar_from_base64(self, instance: Resume, b64_string: str):
        if not b64_string:
            return
        try:
            # Strip "data:image/xxx;base64," header if present
            if "," in b64_string:
                header, b64_data = b64_string.split(",", 1)
                # try to hint extension from header
                ext_hint = None
                if "image/" in header:
                    ext_hint = header.split("image/")[-1].split(";")[0].strip().lower()
            else:
                b64_data = b64_string
                ext_hint = None

            raw = base64.b64decode(b64_data)
            self._save_avatar_thumbnail_like_admin(instance, raw, ext_hint=ext_hint)
        except Exception:
            # swallow errors to avoid breaking whole payload
            pass

    def _set_avatar_from_url(self, instance: Resume, url: str):
        if not url or not url.startswith(("http://", "https://")):
            return
        try:
            import requests
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            # try to hint extension from content-type
            ext_hint = None
            ctype = r.headers.get("Content-Type", "")
            if ctype.startswith("image/"):
                ext_hint = ctype.split("/", 1)[1].lower()
            self._save_avatar_thumbnail_like_admin(instance, r.content, ext_hint=ext_hint)
        except Exception:
            pass

    # ----- RELATION HELPERS (same replace strategy as V2) -----
    def _replace_o2o(self, model_cls, resume: Resume, data):
        if data is None:
            return
        model_cls.objects.update_or_create(created_by=resume, defaults=data)

    def _replace_list(self, model_cls, resume: Resume, items):
        if items is None:
            return
        model_cls.objects.filter(created_by=resume).delete()
        bulk = [model_cls(created_by=resume, **payload) for payload in items]
        if bulk:
            model_cls.objects.bulk_create(bulk)

    def _replace_list_knowledge(self, model_cls, resume: Resume, items):
        if items is None:
            return
        model_cls.objects.filter(created_by=resume).delete()
        bulk = [model_cls(created_by=resume, title=payload) for payload in items]
        if bulk:
            model_cls.objects.bulk_create(bulk)

    # ----- CREATE / UPDATE -----
    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user

        about = validated_data.pop("about", None)
        what_i_do = validated_data.pop("what_i_do", None)
        education = validated_data.pop("education", None)
        experience = validated_data.pop("experience", None)
        working_skills = validated_data.pop("working_skills", None)
        knowledge = validated_data.pop("knowledge", None)
        languages = validated_data.pop("languages", None)

        avatar_url = validated_data.pop("avatar_url", None)
        avatar_upload = validated_data.pop("avatar_upload", None)

        resume, _ = Resume.objects.update_or_create(user=user, defaults=validated_data)

        # Prefer base64 over URL if both provided
        if avatar_upload:
            self._set_avatar_from_base64(resume, avatar_upload)
        elif avatar_url:
            self._set_avatar_from_url(resume, avatar_url)

        # Nested sections (replace strategy)
        self._replace_o2o(About, resume, about)
        self._replace_list(WhatIDo, resume, what_i_do)
        self._replace_list(Education, resume, education)
        self._replace_list(Experience, resume, experience)
        self._replace_list(WorkingSkills, resume, working_skills)
        self._replace_list_knowledge(Knowledge, resume, knowledge)
        self._replace_list(Language, resume, languages)

        resume.save()
        return resume

    @transaction.atomic
    def update(self, instance, validated_data):
        about = validated_data.pop("about", None)
        # Support either field name or source name sneaking into validated_data
        what_i_do = validated_data.pop("what_i_do", None) or validated_data.pop("whatido_set", None)
        education = validated_data.pop("education", None) or validated_data.pop("education_set", None)
        experience = validated_data.pop("experience", None) or validated_data.pop("experience_set", None)
        working_skills = validated_data.pop("working_skills", None) or validated_data.pop("workingskills_set", None)
        knowledge = validated_data.pop("knowledge", None)
        languages = validated_data.pop("languages", None) or validated_data.pop("language_set", None)

        avatar_url = validated_data.pop("avatar_url", None)
        avatar_upload = validated_data.pop("avatar_upload", None)

        # Assign only concrete model fields to avoid touching reverse relations
        scalar_field_names = {f.name for f in instance._meta.fields}
        for k, v in list(validated_data.items()):
            if k in scalar_field_names:
                setattr(instance, k, v)
            # ignore anything else (e.g., reverse relation managers)

        # avatar handling
        if avatar_upload:
            self._set_avatar_from_base64(instance, avatar_upload)
        elif avatar_url:
            self._set_avatar_from_url(instance, avatar_url)

        # PATCH-friendly: only replace sections that are present
        if about is not None:
            self._replace_o2o(About, instance, about)
        if what_i_do is not None:
            self._replace_list(WhatIDo, instance, what_i_do)
        if education is not None:
            self._replace_list(Education, instance, education)
        if experience is not None:
            self._replace_list(Experience, instance, experience)
        if working_skills is not None:
            self._replace_list(WorkingSkills, instance, working_skills)
        if knowledge is not None:
            self._replace_list_knowledge(Knowledge, instance, knowledge)
        if languages is not None:
            self._replace_list(Language, instance, languages)

        instance.save()
        return instance
