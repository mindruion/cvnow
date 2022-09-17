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
                self.private_token_created = datetime.datetime.now()
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
    des = models.TextField(verbose_name="Description")
    bg = ColorField(max_length=400, verbose_name="Background color")
    icon = models.ImageField(null=True, blank=True)


class AbstractEducation(AbstractModel):
    from_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    title = models.TextField()
    place = models.TextField()
    bg = ColorField(max_length=400)

    @property
    def date(self):
        start = self.from_date.strftime("%Y %B")
        end = " - Present"

        if self.end_date:
            end = " - " + self.end_date.strftime("%Y %B")
            if (self.end_date.year, self.end_date.month) == (self.from_date.year, self.from_date.month):
                end = ""

        return f"{start}{end}"

    class Meta:
        abstract = True


class Education(AbstractEducation):
    ...


class Experience(AbstractEducation):
    ...


class WorkingSkills(AbstractModel):
    percentage = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    title = models.CharField(max_length=20)
    color = ColorField(max_length=400, default="#5185D4")


class Language(AbstractModel):
    percentage = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    title = models.CharField(max_length=20)
    color = ColorField(max_length=400, default="#5185D4")


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
    bg = ColorField(default="#EEFBFF")

    @property
    def resume_name(self):
        return self.created_by.__str__()


class ContactMessage(AbstractModel):
    email = models.EmailField()
    message = models.TextField()
    name = models.CharField(max_length=100)
    created_at = models.DateField(auto_now_add=True)
