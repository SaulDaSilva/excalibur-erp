from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce

from apps.catalogo.models import ProductVariant
from apps.inventario.models import InventoryMovement
from apps.pedidos.models import Order


@dataclass(frozen=True)
class VariantRequirement:
    variant_id: int
    qty_pairs: int


def get_stock_by_variant_ids(variant_ids: list[int]) -> dict[int, int]:
    rows = (
        InventoryMovement.objects
        .filter(product_variant_id__in=variant_ids)
        .values("product_variant_id")
        .annotate(stock=Coalesce(Sum("quantity_pairs"), 0))
    )
    stock = {int(r["product_variant_id"]): int(r["stock"]) for r in rows}
    for vid in variant_ids:
        stock.setdefault(vid, 0)
    return stock


def assert_stock_available(requirements: list[VariantRequirement]) -> None:
    variant_ids = [r.variant_id for r in requirements]
    stock = get_stock_by_variant_ids(variant_ids)

    shortages: list[str] = []
    for r in requirements:
        if stock[r.variant_id] < r.qty_pairs:
            shortages.append(f"Variante {r.variant_id}: requerido {r.qty_pairs}, disponible {stock[r.variant_id]}")

    if shortages:
        raise ValidationError("Stock insuficiente: " + " | ".join(shortages))


def create_movements_for_order_dispatch(order: Order) -> None:
    """
    Creates SALE/PROMO negative movements per item.
    Idempotent at the order-level: refuse if any SALE/PROMO movements already exist for the order.
    """
    if InventoryMovement.objects.filter(
        order=order,
        movement_type__in=[InventoryMovement.Type.SALE, InventoryMovement.Type.PROMO],
    ).exists():
        raise ValidationError("Este pedido ya tiene movimientos de despacho (SALE/PROMO).")

    movs: list[InventoryMovement] = []
    for it in order.items.all().select_related("product_variant"):
        qty = -abs(int(it.quantity_pairs))
        mtype = InventoryMovement.Type.PROMO if it.kind == it.Kind.PROMO else InventoryMovement.Type.SALE

        movs.append(
            InventoryMovement(
                product_variant=it.product_variant,
                movement_type=mtype,
                quantity_pairs=qty,
                order=order,
                note=f"Automático por despacho del pedido #{order.id}",
            )
        )

    # bulk_create skips full_clean(), so we enforce sign rules ourselves above.
    InventoryMovement.objects.bulk_create(movs)


def create_movements_for_order_cancel_reversal(order: Order) -> None:
    """
    Creates reversal movements for the order's SALE/PROMO movements.
    Idempotent: UniqueConstraint prevents duplicates per order+variant+reversal_type.
    """
    source_movs = (
        InventoryMovement.objects
        .filter(order=order, movement_type__in=[InventoryMovement.Type.SALE, InventoryMovement.Type.PROMO])
        .select_related("product_variant")
    )

    if not source_movs.exists():
        raise ValidationError("Pedido despachado pero sin movimientos SALE/PROMO para revertir.")

    # Aggregate by variant and type so we create ONE reversal per variant per type
    agg: dict[tuple[int, str], int] = defaultdict(int)
    for m in source_movs:
        key = (int(m.product_variant_id), str(m.movement_type))
        agg[key] += abs(int(m.quantity_pairs))

    reversals: list[InventoryMovement] = []
    for (variant_id, src_type), total_qty in agg.items():
        reversal_type = (
            InventoryMovement.Type.REVERSAL_PROMO
            if src_type == InventoryMovement.Type.PROMO
            else InventoryMovement.Type.REVERSAL_SALE
        )
        reversals.append(
            InventoryMovement(
                product_variant_id=variant_id,
                movement_type=reversal_type,
                quantity_pairs=total_qty,  # positive
                order=order,
                note=f"Reverso por cancelación del pedido #{order.id}",
            )
        )

    # bulk_create will raise IntegrityError if duplicates violate uniq constraint.
    InventoryMovement.objects.bulk_create(reversals, ignore_conflicts=True)


@transaction.atomic
def create_production_movement(user, product_variant_id: int, quantity_pairs: int, note: str = "") -> InventoryMovement:
    if quantity_pairs <= 0:
        raise ValidationError({"quantity_pairs": "PRODUCTION requiere una cantidad positiva."})

    product_variant = ProductVariant.objects.filter(pk=product_variant_id).first()
    if product_variant is None:
        raise ValidationError({"product_variant": "La variante de producto no existe."})

    movement = InventoryMovement(
        product_variant=product_variant,
        movement_type=InventoryMovement.Type.PRODUCTION,
        quantity_pairs=quantity_pairs,
        order=None,
        note=note or "",
    )

    if hasattr(movement, "created_by_id") and user is not None and getattr(user, "is_authenticated", False):
        movement.created_by = user

    movement.full_clean()
    movement.save()
    return movement


@transaction.atomic
def create_adjustment_movement(user, product_variant_id: int, quantity_pairs: int, note: str) -> InventoryMovement:
    if quantity_pairs == 0:
        raise ValidationError({"quantity_pairs": "ADJUSTMENT no permite cantidad 0."})
    if not (note or "").strip():
        raise ValidationError({"note": "La nota es obligatoria para ajustes."})

    product_variant = ProductVariant.objects.filter(pk=product_variant_id).first()
    if product_variant is None:
        raise ValidationError({"product_variant": "La variante de producto no existe."})

    movement = InventoryMovement(
        product_variant=product_variant,
        movement_type=InventoryMovement.Type.ADJUSTMENT,
        quantity_pairs=quantity_pairs,
        order=None,
        note=note.strip(),
    )

    if hasattr(movement, "created_by_id") and user is not None and getattr(user, "is_authenticated", False):
        movement.created_by = user

    movement.full_clean()
    movement.save()
    return movement
