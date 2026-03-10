from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("ERP", {"fields": ("role",)}),
    )
    list_display = UserAdmin.list_display + ("role",)
    list_filter = UserAdmin.list_filter + ("role",)