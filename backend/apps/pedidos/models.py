from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError

from apps.core.models import TimeStampedModel
from apps.clientes.models import Customer, Address
from apps.catalogo.models import ProductVariant


class Order(TimeStampedModel):
    class Channel(models.TextChoices):
        WHATSAPP = "WHATSAPP", "WhatsApp"
        CALL = "CALL", "Llamada"

    class Status(models.TextChoices):
        DISPATCHED = "DISPATCHED", "Despachado"
        CANCELLED = "CANCELLED", "Cancelado"
        PENDING = "PENDING", "Pendiente"

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, verbose_name="Cliente")
    shipping_address = models.ForeignKey(Address, on_delete=models.PROTECT, verbose_name="Dirección de envío")

    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.WHATSAPP, verbose_name="Canal")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name="Estado")

    dispatched_at = models.DateTimeField(null=True, blank=True, editable=False)
    cancelled_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["customer", "created_at"]),
        ]

    def clean(self):
        super().clean()
        if self.customer_id and self.shipping_address_id:
            if self.shipping_address.customer_id != self.customer_id:
                raise ValidationError({"shipping_address": "La dirección de envío no pertenece al cliente seleccionado."})

    # --- computed helpers ---
    def sold_pairs(self) -> int:
        return sum(it.quantity_pairs for it in self.items.all() if it.kind == OrderItem.Kind.SALE)

    def promo_pairs(self) -> int:
        return sum(it.quantity_pairs for it in self.items.all() if it.kind == OrderItem.Kind.PROMO)

    def total_pairs(self) -> int:
        return sum(it.quantity_pairs for it in self.items.all())

    def sold_amount(self) -> Decimal:
        total = Decimal("0.00")
        for it in self.items.all():
            if it.kind == OrderItem.Kind.SALE:
                total += (it.unit_price * it.quantity_pairs)
        return total

    def __str__(self) -> str:
        return f"Pedido #{self.id} - {self.customer}"


class OrderItem(models.Model):
    class Kind(models.TextChoices):
        SALE = "SALE", "Venta"
        PROMO = "PROMO", "Promoción"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items", verbose_name="Pedido")
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.SALE, verbose_name="Tipo")

    product_variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, verbose_name="Producto / Medida")
    quantity_pairs = models.PositiveIntegerField(verbose_name="Cantidad (pares)")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")

    class Meta:
        verbose_name = "Ítem del pedido"
        verbose_name_plural = "Ítems del pedido"
        indexes = [
            models.Index(fields=["order", "product_variant"]),
        ]

    def clean(self):
        super().clean()
        if self.quantity_pairs <= 0:
            raise ValidationError({"quantity_pairs": "La cantidad debe ser mayor que 0."})

        if self.kind == self.Kind.PROMO:
            if self.unit_price != Decimal("0.00"):
                raise ValidationError({"unit_price": "En promoción, el precio unitario debe ser 0.00."})
        else:
            if self.unit_price <= Decimal("0.00"):
                raise ValidationError({"unit_price": "En venta, el precio unitario debe ser mayor que 0.00."})

    def __str__(self) -> str:
        return f"{self.get_kind_display()} {self.product_variant} x {self.quantity_pairs}"