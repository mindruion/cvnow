from django.contrib import admin
from django.contrib.admin import register, ModelAdmin
from imagekit.admin import AdminThumbnail

from cv_builder.models import Resume, About, WhatIDo, Education, Experience, WorkingSkills, Knowledge, Blog, \
    ContactMessage, Language


class AboutInline(admin.StackedInline):
    model = About
    min_num = 1
    extra = 0
    can_delete = False


class WhatIDoInline(admin.StackedInline):
    model = WhatIDo
    min_num = 1
    extra = 0


class EducationInline(admin.StackedInline):
    model = Education
    min_num = 1
    extra = 0


class ExperienceInline(admin.StackedInline):
    model = Experience
    min_num = 1
    extra = 0


class WorkingSkillsInline(admin.StackedInline):
    model = WorkingSkills
    min_num = 1
    extra = 0


class KnowledgeInline(admin.StackedInline):
    model = Knowledge
    min_num = 1
    extra = 0


class LanguageInline(admin.StackedInline):
    model = Language
    min_num = 1
    extra = 0


@register(Resume)
class AdminProfile(ModelAdmin):
    fields = (
        'profession', 'phone', 'email', 'location', 'birth_date', 'facebook', 'linkedin',
        'avatar', 'theme', 'include_blogs', 'can_download_cv', 'language'
    )
    list_display = ('__str__', 'phone', 'email', 'include_blogs', 'can_download_cv', 'is_active', 'admin_thumbnail',
                    'language')
    list_editable = ('include_blogs', 'can_download_cv', 'is_active')
    inlines = [
        AboutInline,
        ExperienceInline,
        EducationInline,
        WorkingSkillsInline,
        LanguageInline,
        WhatIDoInline,
        KnowledgeInline,
    ]
    admin_thumbnail = AdminThumbnail(image_field='avatar_thumbnail')

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        if not request.user.is_superuser:
            qs = qs.filter(user=request.user)

        return qs

    def get_readonly_fields(self, request, obj=None):
        if obj and obj.is_private:
            return 'private_url',
        return self.readonly_fields

    def get_fields(self, request, obj=None):
        if obj and obj.is_private:
            return ('private_url', 'private_token_lifetime') + self.fields
        return self.fields

    def save_model(self, request, obj, form, change):
        if request.FILES.get('avatar'):
            obj.avatar_thumbnail = request.FILES['avatar']

        obj.save()


@register(Blog)
class AdminBlog(ModelAdmin):
    fields = (
        'title', 'category', 'description', 'bg', 'img', 'created_by'
    )
    list_display = ('title', 'category', 'resume_name', 'created_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        if not request.user.is_superuser:
            qs = qs.filter(created_by__user=request.user)

        return qs

    def save_model(self, request, obj, form, change):
        if request.FILES.get('img'):
            obj.img_big = request.FILES['img']
            obj.img_small = request.FILES['img']
        obj.save()


@register(ContactMessage)
class AdminContact(ModelAdmin):
    fields = ('name', 'email', 'message', 'created_at')
    list_display = ('name', 'email', 'message', 'created_at')
    readonly_fields = ('name', 'email', 'message', 'created_at')

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        if not request.user.is_superuser:
            qs = qs.filter(created_by__user=request.user)

        return qs
