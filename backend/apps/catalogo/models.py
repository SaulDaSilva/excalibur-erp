from decimal import Decimal
from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel


class Product(TimeStampedModel, SoftDeleteModel):
    name = models.CharField(max_length=120, unique=True, db_index=True, verbose_name="Nombre del Producto")

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ProductVariant(TimeStampedModel, SoftDeleteModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="variants",
    )
    measure_mm = models.PositiveIntegerField(db_index=True, verbose_name="Medida (mm)")
    base_price_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("1.00"),
        verbose_name="Precio base (USD)",
    )

    class Meta:
        verbose_name = "Variante del Producto"
        verbose_name_plural = "Variantes del Producto"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "measure_mm"],
                name="uniq_variant_by_measure",
            )
        ]
        indexes = [
            models.Index(fields=["product", "measure_mm"]),
        ]
        ordering = ["product__name", "measure_mm"]

    def __str__(self) -> str:
        return f"{self.product.name} - {self.measure_mm}mm"