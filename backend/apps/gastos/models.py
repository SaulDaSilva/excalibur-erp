from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.core.models import SoftDeleteModel, TimeStampedModel


class ExpenseCategory(TimeStampedModel, SoftDeleteModel):
    name = models.CharField(max_length=120, unique=True, db_index=True, verbose_name="Nombre")
    description = models.TextField(blank=True, default="", verbose_name="Descripcion")

    class Meta:
        verbose_name = "Categoria de gasto"
        verbose_name_plural = "Categorias de gasto"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Expense(TimeStampedModel, SoftDeleteModel):
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name="expenses",
        verbose_name="Categoria",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Monto",
    )
    description = models.CharField(max_length=255, verbose_name="Descripcion")
    expense_date = models.DateField(db_index=True, verbose_name="Fecha del gasto")
    supplier_name = models.CharField(
        max_length=150,
        blank=True,
        default="",
        db_index=True,
        verbose_name="Proveedor",
    )
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="Referencia",
    )
    notes = models.TextField(blank=True, default="", verbose_name="Observaciones")
    created_by = models.ForeignKey(
        "users.User",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="expenses_created",
        verbose_name="Creado por",
        editable=False,
    )

    class Meta:
        verbose_name = "Gasto"
        verbose_name_plural = "Gastos"
        ordering = ["-expense_date", "-created_at"]
        indexes = [
            models.Index(fields=["expense_date", "created_at"]),
            models.Index(fields=["category", "expense_date"]),
            models.Index(fields=["supplier_name", "expense_date"]),
        ]

    def clean(self):
        super().clean()

        if self.amount <= Decimal("0.00"):
            raise ValidationError({"amount": "El monto debe ser mayor que 0."})

        if self.expense_date and self.expense_date > timezone.localdate():
            raise ValidationError({"expense_date": "La fecha del gasto no puede ser futura."})

        if self.category_id and not self.category.is_active:
            raise ValidationError({"category": "No se pueden registrar gastos con una categoria inactiva."})

        if not self.description.strip():
            raise ValidationError({"description": "La descripcion es obligatoria."})

    def __str__(self) -> str:
        return f"{self.category.name} - {self.amount} - {self.expense_date}"
