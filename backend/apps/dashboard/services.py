from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from typing import Any

from django.db.models import DecimalField, ExpressionWrapper, F, Prefetch, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from apps.catalogo.models import ProductVariant
from apps.pedidos.models import Order, OrderItem


def get_dashboard_summary(low_stock_threshold: int = 10) -> dict[str, Any]:
    generated_at = timezone.now()
    pending_orders_queryset = (
        Order.objects.filter(status=Order.Status.PENDING)
        .select_related("customer", "shipping_address")
        .prefetch_related(
            Prefetch(
                "items",
                queryset=OrderItem.objects.select_related("product_variant__product"),
            )
        )
        .order_by("-created_at")
    )

    pending_orders_count = pending_orders_queryset.count()
    pending_orders = [
        _serialize_pending_order(order)
        for order in pending_orders_queryset[:20]
    ]

    sales_last_7_days_usd = _get_sales_last_7_days_usd()
    pairs_last_7_days = _get_pairs_last_7_days()
    low_stock_variants_count = _get_low_stock_variants_count(low_stock_threshold)

    return {
        "metrics": {
            "pending_orders_count": pending_orders_count,
            "sales_last_7_days_usd": sales_last_7_days_usd,
            "sold_pairs_last_7_days": pairs_last_7_days["sold_pairs_last_7_days"],
            "promo_pairs_last_7_days": pairs_last_7_days["promo_pairs_last_7_days"],
            "low_stock_variants_count": low_stock_variants_count,
            "low_stock_threshold": low_stock_threshold,
        },
        "pending_orders": pending_orders,
        "generated_at": generated_at,
    }


def _get_sales_last_7_days_usd() -> Decimal:
    cutoff = timezone.now() - timedelta(days=7)
    amount_expression = ExpressionWrapper(
        F("unit_price") * F("quantity_pairs"),
        output_field=DecimalField(max_digits=18, decimal_places=2),
    )
    value_zero = Value(
        Decimal("0.00"),
        output_field=DecimalField(max_digits=18, decimal_places=2),
    )
    total = (
        OrderItem.objects.filter(
            order__status=Order.Status.DISPATCHED,
            order__created_at__gte=cutoff,
            kind=OrderItem.Kind.SALE,
        )
        .aggregate(total=Coalesce(Sum(amount_expression), value_zero))
        .get("total", Decimal("0.00"))
    )
    return total or Decimal("0.00")
def _get_pairs_last_7_days() -> dict[str, int]:
    cutoff = timezone.now() - timedelta(days=7)
    aggregated = (
        OrderItem.objects.filter(
            order__status=Order.Status.DISPATCHED,
            order__created_at__gte=cutoff,
        )
        .values("kind")
        .annotate(total_pairs=Coalesce(Sum("quantity_pairs"), 0))
    )

    sold_pairs = 0
    promo_pairs = 0

    for row in aggregated:
        total_pairs = int(row.get("total_pairs") or 0)
        if row["kind"] == OrderItem.Kind.SALE:
            sold_pairs = total_pairs
        elif row["kind"] == OrderItem.Kind.PROMO:
            promo_pairs = total_pairs

    return {
        "sold_pairs_last_7_days": sold_pairs,
        "promo_pairs_last_7_days": promo_pairs,
    }


def _get_low_stock_variants_count(low_stock_threshold: int) -> int:
    return (
        ProductVariant.objects.annotate(
            stock_pairs=Coalesce(Sum("inventory_movements__quantity_pairs"), 0)
        )
        .filter(stock_pairs__lt=low_stock_threshold)
        .count()
    )


def _serialize_pending_order(order: Order) -> dict[str, Any]:
    sold_amount_usd = Decimal("0.00")
    sold_pairs = 0
    promo_pairs = 0
    total_pairs = 0
    items: list[dict[str, Any]] = []

    for item in order.items.all():
        quantity_pairs = int(item.quantity_pairs)
        total_pairs += quantity_pairs

        if item.kind == OrderItem.Kind.SALE:
            sold_pairs += quantity_pairs
            sold_amount_usd += item.unit_price * quantity_pairs
        elif item.kind == OrderItem.Kind.PROMO:
            promo_pairs += quantity_pairs

        items.append(
            {
                "id": item.id,
                "kind": item.kind,
                "quantity_pairs": quantity_pairs,
                "unit_price": item.unit_price,
                "product_variant": {
                    "id": item.product_variant_id,
                    "measure_mm": item.product_variant.measure_mm,
                    "product_name": item.product_variant.product.name,
                },
            }
        )

    return {
        "id": order.id,
        "created_at": order.created_at,
        "channel": order.channel,
        "status": order.status,
        "customer": {
            "id": order.customer_id,
            "first_name": order.customer.first_name,
            "last_name": order.customer.last_name,
            "id_number": order.customer.id_number,
        },
        "shipping_address": {
            "id": order.shipping_address_id,
            "province": order.shipping_address.province,
            "city": order.shipping_address.city,
            "address_line": order.shipping_address.address_line,
            "is_primary": order.shipping_address.is_primary,
        },
        "items": items,
        "sold_amount_usd": sold_amount_usd,
        "sold_pairs": sold_pairs,
        "promo_pairs": promo_pairs,
        "total_pairs": total_pairs,
    }
