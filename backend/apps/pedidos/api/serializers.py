from __future__ import annotations

from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from apps.catalogo.models import Product, ProductVariant
from apps.clientes.models import Address, Customer
from apps.pedidos.models import Order, OrderItem


def _raise_as_drf_validation_error(exc: DjangoValidationError) -> None:
    if hasattr(exc, "message_dict"):
        raise serializers.ValidationError(exc.message_dict)
    raise serializers.ValidationError(exc.messages)


class CustomerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "first_name", "last_name", "id_number"]


class AddressSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "province", "city", "address_line", "is_primary"]


class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name"]


class ProductVariantSummarySerializer(serializers.ModelSerializer):
    product = ProductSummarySerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "measure_mm", "product"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSummarySerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "kind", "product_variant", "quantity_pairs", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSummarySerializer(read_only=True)
    shipping_address = AddressSummarySerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    sold_pairs = serializers.IntegerField(read_only=True)
    promo_pairs = serializers.IntegerField(read_only=True)
    total_pairs = serializers.IntegerField(read_only=True)
    sold_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "shipping_address",
            "items",
            "status",
            "channel",
            "order_date",
            "sold_pairs",
            "promo_pairs",
            "total_pairs",
            "sold_amount",
            "created_at",
            "dispatched_at",
            "cancelled_at",
        ]


class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["kind", "product_variant", "quantity_pairs", "unit_price"]

    def validate(self, attrs):
        kind = attrs.get("kind", getattr(self.instance, "kind", None))
        quantity_pairs = attrs.get("quantity_pairs", getattr(self.instance, "quantity_pairs", None))
        unit_price = attrs.get("unit_price", getattr(self.instance, "unit_price", None))

        errors: dict[str, str] = {}
        if quantity_pairs is not None and quantity_pairs <= 0:
            errors["quantity_pairs"] = "La cantidad debe ser mayor que 0."

        if kind == OrderItem.Kind.PROMO and unit_price != Decimal("0.00"):
            errors["unit_price"] = "En promoción, el precio unitario debe ser 0.00."

        if kind == OrderItem.Kind.SALE and (unit_price is None or unit_price <= Decimal("0.00")):
            errors["unit_price"] = "En venta, el precio unitario debe ser mayor que 0.00."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class OrderWriteSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ["customer", "shipping_address", "channel", "order_date", "items"]

    def validate(self, attrs):
        if "status" in self.initial_data:
            raise serializers.ValidationError(
                {"status": "El estado no puede actualizarse directamente."}
            )

        order = self.instance
        if order is not None and order.status != Order.Status.PENDING:
            raise serializers.ValidationError(
                {"detail": "Solo se pueden editar pedidos en estado PENDING."}
            )

        if order is not None and "customer" in attrs and attrs["customer"] != order.customer:
            raise serializers.ValidationError(
                {"customer": "No se permite cambiar el cliente de un pedido existente."}
            )

        customer = attrs.get("customer", order.customer if order else None)
        shipping_address = attrs.get(
            "shipping_address",
            order.shipping_address if order else None,
        )
        if customer and shipping_address and shipping_address.customer_id != customer.id:
            raise serializers.ValidationError(
                {"shipping_address": "La dirección de envío no pertenece al cliente seleccionado."}
            )

        items = attrs.get("items", None)
        if order is None and not items:
            raise serializers.ValidationError(
                {"items": "Debe enviar al menos un ítem para crear el pedido."}
            )
        if order is not None and items is not None and len(items) == 0:
            raise serializers.ValidationError(
                {"items": "Debe enviar al menos un ítem al reemplazar la lista de ítems."}
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = Order(**validated_data)
        order.status = Order.Status.PENDING

        try:
            order.full_clean()
        except DjangoValidationError as exc:
            _raise_as_drf_validation_error(exc)

        order.save()
        self._replace_items(order, items_data)
        return order

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        for field in ("customer", "shipping_address", "channel", "order_date"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            _raise_as_drf_validation_error(exc)

        instance.save()

        if items_data is not None:
            self._replace_items(instance, items_data)

        return instance

    def _replace_items(self, order: Order, items_data: list[dict]) -> None:
        order.items.all().delete()
        for item_data in items_data:
            item = OrderItem(order=order, **item_data)
            try:
                item.full_clean()
            except DjangoValidationError as exc:
                _raise_as_drf_validation_error(exc)
            item.save()
