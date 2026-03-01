from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('military', 'Військовий'),
        ('volunteer', 'Волонтер'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='military')
    full_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="ПІБ")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    organization = models.CharField(max_length=150, blank=True, null=True, verbose_name="Підрозділ / Фонд")
    is_verified = models.BooleanField(default=False, verbose_name="Підтверджений")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
