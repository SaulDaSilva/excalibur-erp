from django.contrib import admin

from apps.gastos.models import Expense, ExpenseCategory


class SoftDeleteAdminMixin:
    def delete_model(self, request, obj):
        obj.soft_delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.soft_delete()


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(SoftDeleteAdminMixin, admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at", "updated_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at", "updated_at", "deleted_at"]
    ordering = ["name"]


@admin.register(Expense)
class ExpenseAdmin(SoftDeleteAdminMixin, admin.ModelAdmin):
    list_display = [
        "expense_date",
        "category",
        "supplier_name",
        "amount",
        "is_active",
        "created_by",
        "created_at",
    ]
    list_filter = ["is_active", "category", "expense_date", "created_at"]
    search_fields = ["description", "supplier_name", "reference_number", "notes"]
    readonly_fields = ["created_by", "created_at", "updated_at", "deleted_at"]
    autocomplete_fields = ["category"]
    date_hierarchy = "expense_date"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("category", "created_by")

    def save_model(self, request, obj, form, change):
        if obj.created_by_id is None and request.user.is_authenticated:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
