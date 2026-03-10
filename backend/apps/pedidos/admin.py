from django.contrib import admin
from .models import Order, OrderItem
from django.core.exceptions import ValidationError
from django.contrib import messages
from apps.pedidos import services as order_services

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "status", "channel", "created_at", "dispatched_at", "cancelled_at"]
    list_filter = ["status", "channel", "created_at"]
    search_fields = ["id", "customer__first_name", "customer__last_name", "customer__id_number"]
    date_hierarchy = "created_at"
    inlines = [OrderItemInline]
    
    actions = ["dispatch_selected", "cancel_selected"]

    @admin.action(description="Despachar pedidos seleccionados")
    def dispatch_selected(self, request, queryset):
        ok = 0
        for order in queryset:
            try:
                order_services.dispatch_order(order)
                ok += 1
            except ValidationError as e:
                messages.error(request, f"Pedido #{order.id}: {e}")
        if ok:
            messages.success(request, f"Despachados: {ok}")

    @admin.action(description="Cancelar pedidos seleccionados")
    def cancel_selected(self, request, queryset):
        ok = 0
        for order in queryset:
            try:
                order_services.cancel_order(order)
                ok += 1
            except ValidationError as e:
                messages.error(request, f"Pedido #{order.id}: {e}")
        if ok:
            messages.success(request, f"Cancelados: {ok}")