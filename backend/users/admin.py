from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Додаткова інформація", {
            "fields": ("role", "full_name", "phone", "organization", "is_verified")
        }),
    )

    list_display = ("username", "email", "role", "is_verified", "is_staff")

admin.site.register(CustomUser, CustomUserAdmin)
