from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.gastos.models import Expense, ExpenseCategory

User = get_user_model()


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields = ["is_active", "created_at", "updated_at", "deleted_at"]

    def validate_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("El nombre es obligatorio.")

        queryset = ExpenseCategory.objects.filter(name__iexact=normalized)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ya existe una categoria con ese nombre.")
        return normalized


class ExpenseCreatedBySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    created_by = ExpenseCreatedBySerializer(read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "category",
            "category_name",
            "amount",
            "description",
            "expense_date",
            "supplier_name",
            "reference_number",
            "notes",
            "created_by",
            "is_active",
            "created_at",
            "updated_at",
            "deleted_at",
        ]
        read_only_fields = ["created_by", "is_active", "created_at", "updated_at", "deleted_at"]

    def validate_description(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("La descripcion es obligatoria.")
        return normalized

    def validate_supplier_name(self, value: str) -> str:
        return value.strip()

    def validate_reference_number(self, value: str) -> str:
        return value.strip()

    def validate_notes(self, value: str) -> str:
        return value.strip()

    def validate(self, attrs):
        instance = Expense(
            **{
                **(
                    {
                        "category": self.instance.category,
                        "amount": self.instance.amount,
                        "description": self.instance.description,
                        "expense_date": self.instance.expense_date,
                        "supplier_name": self.instance.supplier_name,
                        "reference_number": self.instance.reference_number,
                        "notes": self.instance.notes,
                        "created_by": self.instance.created_by,
                        "is_active": self.instance.is_active,
                    }
                    if self.instance is not None
                    else {}
                ),
                **attrs,
            }
        )
        instance.full_clean()
        return attrs
