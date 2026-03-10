from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        VENTAS = "VENTAS", "Ventas"
        BODEGA = "BODEGA", "Bodega"
        GERENCIA = "GERENCIA", "Gerencia"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VENTAS)

    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN