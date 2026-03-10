from django.contrib import admin
from .models import Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ["product", "measure_mm", "base_price_usd", "is_active", "created_at"]
    list_filter = ["is_active", "product"]
    search_fields = ["product__name"]