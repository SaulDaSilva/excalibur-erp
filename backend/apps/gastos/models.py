from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.core.models import SoftDeleteModel, TimeStampedModel


class ExpenseCategory(TimeStampedModel, SoftDeleteModel):
    class FormGroup(models.TextChoices):
        VIAJES = "VIAJES", "Viajes"
        LOGISTICA = "LOGISTICA", "Logistica"
        PERSONAL = "PERSONAL", "Personal"
        PRODUCCION = "PRODUCCION", "Produccion"
        FISCAL = "FISCAL", "Fiscal"
        SERVICIOS = "SERVICIOS", "Servicios"
        MISCELANEO = "MISCELANEO", "Miscelaneo"

    class Code(models.TextChoices):
        GALLERY = "GALLERY", "Galleria"
        TRAVEL_EXPENSES = "TRAVEL_EXPENSES", "Gastos de viajes"
        CUBOX_STORAGE = "CUBOX_STORAGE", "Bodegas cubox"
        DHL = "DHL", "DHL"
        EMPLOYEE_PAYMENTS = "EMPLOYEE_PAYMENTS", "Pago de empleados"
        SPUR_PAINTING = "SPUR_PAINTING", "Pago de pintada de espuelas"
        DELIVERY_RUNS = "DELIVERY_RUNS", "Envios - carreras"
        MISCELLANEOUS = "MISCELLANEOUS", "Miscelaneo"
        VAT_DECLARATIONS = "VAT_DECLARATIONS", "Declaraciones de IVA"
        PROVIDED_SERVICES = "PROVIDED_SERVICES", "Servicios prestados"
        SUPPLIES = "SUPPLIES", "Insumos"
        PRODUCTION_MOLDS = "PRODUCTION_MOLDS", "Moldes para produccion"

    name = models.CharField(max_length=120, unique=True, db_index=True, verbose_name="Nombre")
    description = models.TextField(blank=True, default="", verbose_name="Descripcion")
    code = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name="Codigo",
    )
    form_group = models.CharField(
        max_length=32,
        choices=FormGroup.choices,
        null=True,
        blank=True,
        db_index=True,
        verbose_name="Grupo de formulario",
    )
    sort_order = models.PositiveSmallIntegerField(default=0, verbose_name="Orden")
    is_system = models.BooleanField(default=False, verbose_name="Categoria de sistema")

    class Meta:
        verbose_name = "Categoria de gasto"
        verbose_name_plural = "Categorias de gasto"
        ordering = ["sort_order", "name"]

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
    details = models.JSONField(default=dict, blank=True, verbose_name="Detalles")
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

        self.supplier_name = (self.supplier_name or "").strip()
        self.reference_number = (self.reference_number or "").strip()
        self.notes = (self.notes or "").strip()

        if self.amount <= Decimal("0.00"):
            raise ValidationError({"amount": "El monto debe ser mayor que 0."})

        if self.expense_date and self.expense_date > timezone.localdate():
            raise ValidationError({"expense_date": "La fecha del gasto no puede ser futura."})

        if self.category_id and not self.category.is_active:
            raise ValidationError({"category": "No se pueden registrar gastos con una categoria inactiva."})

        if not self.description.strip():
            raise ValidationError({"description": "La descripcion es obligatoria."})

        details = self.details or {}
        if not isinstance(details, dict):
            raise ValidationError({"details": "Los detalles del gasto deben ser un objeto JSON."})

        normalized_details = {
            key: value.strip() if isinstance(value, str) else value
            for key, value in details.items()
        }
        self.details = normalized_details

        if not self.category_id:
            return

        detail_errors = {}
        category_code = self.category.code or ""
        form_group = self.category.form_group or ""

        if form_group == ExpenseCategory.FormGroup.VIAJES and not normalized_details.get("destination"):
            detail_errors["destination"] = "El destino es obligatorio para gastos de viajes."

        if form_group == ExpenseCategory.FormGroup.PERSONAL:
            if not normalized_details.get("employee_name"):
                detail_errors["employee_name"] = "El nombre del empleado es obligatorio."
            if not normalized_details.get("payment_concept"):
                detail_errors["payment_concept"] = "El concepto del pago es obligatorio."

        if form_group == ExpenseCategory.FormGroup.SERVICIOS and not normalized_details.get("service_provider_name"):
            detail_errors["service_provider_name"] = "El nombre del prestador del servicio es obligatorio."

        if detail_errors:
            raise ValidationError({"details": detail_errors})

    def __str__(self) -> str:
        return f"{self.category.name} - {self.amount} - {self.expense_date}"
