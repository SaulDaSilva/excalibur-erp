from django.db import models
from django.core.exceptions import ValidationError

from apps.core.models import TimeStampedModel


class InventoryMovement(TimeStampedModel):
    class Type(models.TextChoices):
        PRODUCTION = "PRODUCTION", "Producción"
        SALE = "SALE", "Venta"
        PROMO = "PROMO", "Promoción"
        ADJUSTMENT = "ADJUSTMENT", "Ajuste"
        REVERSAL_SALE = "REVERSAL_SALE", "Reverso de Venta (cancelación)"
        REVERSAL_PROMO = "REVERSAL_PROMO", "Reverso de Promoción (cancelación)"

    product_variant = models.ForeignKey(
        "catalogo.ProductVariant",
        on_delete=models.PROTECT,
        related_name="inventory_movements",
        verbose_name="Variante",
    )

    movement_type = models.CharField(
        max_length=20,
        choices=Type.choices,
        verbose_name="Tipo de movimiento",
    )

    quantity_pairs = models.IntegerField(
        verbose_name="Cantidad (pares)",
        help_text="Entradas positivas, salidas negativas",
    )

    order = models.ForeignKey(
        "pedidos.Order",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="inventory_movements",
        verbose_name="Pedido relacionado",
    )

    note = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Nota",
    )

    # optional: strongly recommended for audit later
    created_by = models.ForeignKey(
        "users.User",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="inventory_movements_created",
        verbose_name="Creado por",
        editable=False,
    )

    class Meta:
        verbose_name = "Movimiento de Inventario"
        verbose_name_plural = "Movimientos de Inventario"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["product_variant", "created_at"]),
            models.Index(fields=["order", "created_at"]),
            models.Index(fields=["movement_type", "created_at"]),
        ]
        constraints = [
            # Prevent duplicate reversals per order+variant+type (idempotency)
            models.UniqueConstraint(
                fields=["order", "product_variant", "movement_type"],
                condition=models.Q(
                    movement_type__in=["REVERSAL_SALE", "REVERSAL_PROMO"]
                ),
                name="uniq_reversal_per_order_variant_type",
            ),
        ]

    def clean(self):
        super().clean()

        if self.movement_type in (self.Type.SALE, self.Type.PROMO) and self.quantity_pairs >= 0:
            raise ValidationError({"quantity_pairs": "SALE/PROMO deben ser salidas (cantidad negativa)."})

        if self.movement_type in (self.Type.REVERSAL_SALE, self.Type.REVERSAL_PROMO) and self.quantity_pairs <= 0:
            raise ValidationError({"quantity_pairs": "REVERSAL deben ser entradas (cantidad positiva)."})

        if self.movement_type == self.Type.PRODUCTION and self.quantity_pairs <= 0:
            raise ValidationError({"quantity_pairs": "PRODUCTION debe ser entrada (cantidad positiva)."})

        if self.movement_type in (self.Type.SALE, self.Type.PROMO, self.Type.REVERSAL_SALE, self.Type.REVERSAL_PROMO) and self.order_id is None:
            raise ValidationError({"order": "Este tipo de movimiento debe estar asociado a un pedido."})

    def __str__(self) -> str:
        return f"{self.get_movement_type_display()} {self.product_variant} ({self.quantity_pairs})"