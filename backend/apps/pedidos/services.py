from __future__ import annotations

from dataclasses import dataclass
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.pedidos.models import Order
from apps.inventario import services as inv_services


@dataclass(frozen=True)
class VariantRequirement:
    variant_id: int
    qty_pairs: int


def _build_requirements(order: Order) -> list[VariantRequirement]:
    items = list(order.items.all().select_related("product_variant"))
    req: dict[int, int] = {}
    for it in items:
        vid = int(it.product_variant_id)
        req[vid] = req.get(vid, 0) + int(it.quantity_pairs)
    return [VariantRequirement(variant_id=k, qty_pairs=v) for k, v in req.items()]


@transaction.atomic
def dispatch_order(order: Order) -> Order:
    """
    Business meaning: confirm+dispatch in one step.
    - validates order state/items
    - checks stock
    - creates inventory movements
    - marks order DISPATCHED
    """
    # lock row to avoid double-dispatch/cancel races
    order = Order.objects.select_for_update().get(pk=order.pk)

    if not order.items.exists():
        raise ValidationError("No se puede despachar un pedido que no tiene ítems.")

    if order.status != Order.Status.PENDING:
        raise ValidationError("Solo se puede despachar un pedido en estado 'Pendiente'.")

    requirements = _build_requirements(order)

    inv_services.assert_stock_available(requirements)
    inv_services.create_movements_for_order_dispatch(order)

    order.status = Order.Status.DISPATCHED
    order.dispatched_at = timezone.now()
    order.full_clean()
    order.save(update_fields=["status", "dispatched_at", "updated_at"])
    return order


@transaction.atomic
def cancel_order(order: Order) -> Order:
    """
    - PENDING: cancels without touching inventory
    - DISPATCHED: creates reversal movements and cancels
    """
    order = Order.objects.select_for_update().get(pk=order.pk)

    if order.status == Order.Status.CANCELLED:
        raise ValidationError("El pedido ya está cancelado.")

    if order.status == Order.Status.PENDING:
        order.status = Order.Status.CANCELLED
        order.cancelled_at = timezone.now()
        order.full_clean()
        order.save(update_fields=["status", "cancelled_at", "updated_at"])
        return order

    if order.status != Order.Status.DISPATCHED:
        raise ValidationError("Estado inválido para cancelar.")

    inv_services.create_movements_for_order_cancel_reversal(order)

    order.status = Order.Status.CANCELLED
    order.cancelled_at = timezone.now()
    order.full_clean()
    order.save(update_fields=["status", "cancelled_at", "updated_at"])
    return order