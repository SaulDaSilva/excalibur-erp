from django.contrib import admin
from .models import InventoryMovement


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ["created_at", "movement_type", "product_variant", "quantity_pairs", "order"]
    list_filter = ["movement_type", "created_at"]
    search_fields = ["product_variant__product__name", "note", "order__id"]
    date_hierarchy = "created_at"