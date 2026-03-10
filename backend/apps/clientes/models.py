from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.core.validators import validate_ec_id


class Country(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True, verbose_name="País")
    iso_code = models.CharField(max_length=3, unique=True, verbose_name="Código ISO")

    class Meta:
        verbose_name = "País"
        verbose_name_plural = "Países"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Customer(TimeStampedModel, SoftDeleteModel):
    first_name = models.CharField(max_length=100, db_index=True, verbose_name="Nombres")
    last_name = models.CharField(max_length=100, db_index=True, verbose_name="Apellidos")

    id_number = models.CharField(
        max_length=13,
        unique=True,
        verbose_name="Cédula / RUC",
        help_text="Cédula: 10 dígitos | RUC (persona natural): 13 dígitos (solo números)",
        validators=[validate_ec_id],
    )

    email = models.EmailField(blank=True, default="", verbose_name="Correo Electrónico")
    phone = models.CharField(max_length=50, blank=True, default="", verbose_name="Número de Teléfono")

    country = models.ForeignKey(
        Country,
        on_delete=models.PROTECT,
        related_name="customers",
        verbose_name="País",
        db_index=True,
    )
    notes = models.TextField(blank=True, default="", verbose_name="Observaciones")

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["last_name", "first_name"]
        indexes = [
            models.Index(fields=["last_name", "first_name"]),
        ]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()


class Address(TimeStampedModel):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="addresses",
        verbose_name="Cliente",
    )

    province = models.CharField(max_length=120, db_index=True, verbose_name="Provincia")
    city = models.CharField(max_length=120, db_index=True, verbose_name="Ciudad")

    address_line = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Domicilio / Dirección",
    )

    is_primary = models.BooleanField(default=False, verbose_name="Dirección Principal")

    class Meta:
        ordering = ["-is_primary", "province", "city"]
        verbose_name = "Dirección"
        verbose_name_plural = "Direcciones"
        indexes = [models.Index(fields=["province", "city"])]
        constraints = [
            models.UniqueConstraint(
                fields=["customer"],
                condition=models.Q(is_primary=True),
                name="uniq_primary_address_per_customer",
            )
        ]

    def __str__(self) -> str:
        return f"{self.province} - {self.city} - {self.address_line}".strip()