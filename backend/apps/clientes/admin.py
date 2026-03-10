from django.contrib import admin
from .models import Country, Customer, Address


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    search_fields = ["name", "iso_code"]
    list_display = ["name", "iso_code", "created_at"]


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    search_fields = ["first_name", "last_name", "id_number", "email"]
    list_filter = ["is_active", "country"]
    list_display = ["first_name", "last_name", "id_number", "country", "is_active", "created_at"]
    inlines = [AddressInline]