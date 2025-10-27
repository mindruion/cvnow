import datetime
import secrets
from datetime import timedelta

from colorfield.fields import ColorField
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import CASCADE
from django.utils.timezone import now
from imagekit.models import ImageSpecField, ProcessedImageField
from pilkit.processors import ResizeToFill


class User(AbstractUser):
    subdomain_name = models.CharField(max_length=30, unique=True)

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"


class Resume(models.Model):
    class Theme(models.TextChoices):
        LIGHT = 'light'
        DARK = 'dark'

    class Language(models.TextChoices):
        EN = 'en'
        ro = 'ro'

    class Step(models.TextChoices):
        started = 'started'
        step_1 = 'step_1'
        step_2 = 'step_2'
        step_3 = 'step_3'
        step_4 = 'step_4'
        theme = 'theme'
        completed = 'completed'

    config = models.JSONField(default=dict, blank=True)

    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=CASCADE)
    profession = models.CharField(max_length=200, null=True)
    phone = models.CharField(max_length=200, null=True)
    email = models.EmailField(null=True)
    location = models.CharField(max_length=200, null=True)
    birth_date = models.DateField(null=True)
    facebook = models.URLField(null=True)
    linkedin = models.URLField(null=True)
    theme = models.CharField(max_length=50, choices=Theme.choices, default=Theme.LIGHT)
    is_private = models.BooleanField(default=False)
    private_token = models.CharField(max_length=100, null=True)
    private_token_lifetime = models.DurationField(null=True)
    private_token_created = models.DateTimeField(null=True)
    can_download_cv = models.BooleanField(default=True)
    include_blogs = models.BooleanField(default=True)
    step = models.CharField(max_length=50, choices=Step.choices, default=Step.started)
    language_used = models.CharField(max_length=20, choices=Language.choices, default=Language.EN)

    avatar = models.ImageField(null=True, blank=True)
    avatar_thumbnail = ProcessedImageField(
        null=True, blank=True,
        processors=[ResizeToFill(100, 50)],
        format='JPEG',
        options={'quality': 60}
    )

    def __str__(self):
        status_as_human = "[IS PRIVATE]" if self.is_private else "[IS PUBLIC]"
        return f"{self.user.name} {self.profession or ''} {status_as_human}"

    @property
    def private_url(self):
        if not self.private_token or self.is_token_expired():
            self.create_token(update=True)

        return f"https://{self.user.subdomain_name}.{settings.CLOUDFLARE_DOMAIN}?token={self.private_token}"

    def create_token(self, update=False):
        if self.is_private:
            if not self.private_token or self.is_token_expired():
                self.generate_new_token()
                # Use timezone-aware now to avoid naive datetime warnings when USE_TZ=True
                self.private_token_created = now()
                if not self.private_token_lifetime:
                    self.private_token_lifetime = timedelta(days=1)

                if update:
                    self.save()

    def generate_new_token(self):
        self.private_token = secrets.token_urlsafe(60)

    def is_token_expired(self):
        return self.private_token_created + self.private_token_lifetime < now()


class AbstractModel(models.Model):
    created_by = models.ForeignKey(
        Resume,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True
        ordering = ['id']

    def __str__(self):
        return str(self.id)


class About(AbstractModel):
    created_by = models.OneToOneField(
        Resume,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    description = models.TextField()
    short_description = models.TextField(null=True)


class WhatIDo(AbstractModel):
    title = models.CharField(max_length=100)
    description = models.TextField(verbose_name="Description")


class AbstractEducation(AbstractModel):
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    title = models.TextField(null=True, blank=True)
    place = models.TextField(null=True, blank=True)

    @property
    def date(self):
        start = self.start_date.strftime("%Y %B")
        end = " - Present"

        if self.end_date:
            end = " - " + self.end_date.strftime("%Y %B")
            if (self.end_date.year, self.end_date.month) == (self.start_date.year, self.start_date.month):
                end = ""

        return f"{start}{end}"

    class Meta:
        abstract = True


class Education(AbstractEducation):
    degree = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    field_of_study = models.TextField(null=True, blank=True)
    institution = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    current = models.BooleanField(default=False)


class Experience(AbstractEducation):
    role = models.TextField(null=True, blank=True)
    company = models.TextField(null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    current = models.BooleanField(default=False)


class WorkingSkills(AbstractModel):
    percentage = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    title = models.CharField(max_length=20)


class Language(AbstractModel):
    percentage = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    title = models.CharField(max_length=20)


class Knowledge(AbstractModel):
    title = models.CharField(max_length=50)


class Blog(AbstractModel):
    img = models.ImageField()
    img_small = ProcessedImageField(
        null=True,
        blank=True,
        processors=[ResizeToFill(310, 310)],
        format='JPEG',
        options={'quality': 100}
    )
    img_big = ProcessedImageField(
        null=True,
        blank=True,
        processors=[ResizeToFill(855, 455)],
        format='JPEG',
        options={'quality': 100}
    )
    created_at = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=400)
    title = models.CharField(max_length=400)
    description = models.TextField()

    @property
    def resume_name(self):
        return self.created_by.__str__()


class ContactMessage(AbstractModel):
    email = models.EmailField()
    message = models.TextField()
    name = models.CharField(max_length=100)
    created_at = models.DateField(auto_now_add=True)
