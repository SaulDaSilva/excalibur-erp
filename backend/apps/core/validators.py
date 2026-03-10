import re
from django.core.exceptions import ValidationError


def validate_ec_cedula_10(value: str) -> None:
    if not re.fullmatch(r"\d{10}", value or ""):
        raise ValidationError("Cédula debe tener 10 dígitos.")

    provincia = int(value[0:2])
    if provincia < 1 or provincia > 24:
        raise ValidationError("Código de provincia inválido (primeros 2 dígitos).")

    tercer = int(value[2])  # <- important (index 2)
    if tercer > 5:
        raise ValidationError("Tercer dígito inválido para persona natural.")

    coef = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    suma = 0
    for i in range(9):
        mult = int(value[i]) * coef[i]
        if mult >= 10:
            mult -= 9
        suma += mult

    verificador = (10 - (suma % 10)) % 10
    if verificador != int(value[9]):
        raise ValidationError("Cédula inválida: dígito verificador incorrecto.")


def validate_ec_id(value: str) -> None:
    if not re.fullmatch(r"\d{10}|\d{13}", value or ""):
        raise ValidationError("Debe tener 10 dígitos (cédula) o 13 dígitos (RUC).")

    if len(value) == 10:
        validate_ec_cedula_10(value)
        return

    # MVP: Solo RUC persona natural (primeros 10 = cédula válida)
    validate_ec_cedula_10(value[:10])

    estab = int(value[10:13])
    if estab == 0:
        raise ValidationError("RUC inválido: código de establecimiento no puede ser 000.")