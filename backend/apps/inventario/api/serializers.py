from __future__ import annotations

from rest_framework import serializers

from apps.inventario.models import InventoryMovement


class StockByVariantSerializer(serializers.Serializer):
    product_variant_id = serializers.IntegerField(source="id", read_only=True)
    product = serializers.CharField(source="product.name", read_only=True)
    measure_mm = serializers.IntegerField(read_only=True)
    is_active = serializers.SerializerMethodField()
    stock_pairs = serializers.IntegerField(read_only=True)

    def get_is_active(self, obj) -> bool:
        return bool(getattr(obj, "is_active", False) and getattr(obj.product, "is_active", False))


class ProductVariantBasicSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    product = serializers.CharField(source="product.name", read_only=True)
    measure_mm = serializers.IntegerField(read_only=True)


class InventoryMovementListSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(source="order_id", allow_null=True, read_only=True)
    product_variant = ProductVariantBasicSerializer(read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            "id",
            "created_at",
            "movement_type",
            "quantity_pairs",
            "note",
            "order",
            "product_variant",
        ]


class ProductionMovementInputSerializer(serializers.Serializer):
    product_variant = serializers.IntegerField()
    quantity_pairs = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_quantity_pairs(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError("Debe ser mayor que 0.")
        return value


class AdjustmentMovementInputSerializer(serializers.Serializer):
    product_variant = serializers.IntegerField()
    quantity_pairs = serializers.IntegerField()
    note = serializers.CharField(required=True, allow_blank=False)

    def validate_quantity_pairs(self, value: int) -> int:
        if value == 0:
            raise serializers.ValidationError("No puede ser 0.")
        return value
