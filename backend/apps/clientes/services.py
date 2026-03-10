from __future__ import annotations

from django.db import transaction
from django.utils import timezone

from apps.clientes.models import Address, Customer


@transaction.atomic
def soft_delete_customer(customer: Customer) -> Customer:
    customer = Customer.objects.select_for_update().get(pk=customer.pk)
    if not customer.is_active:
        return customer

    customer.is_active = False
    customer.deleted_at = timezone.now()
    customer.save(update_fields=["is_active", "deleted_at", "updated_at"])
    return customer


@transaction.atomic
def set_primary_address(address: Address) -> Address:
    address = Address.objects.select_for_update().get(pk=address.pk)

    Address.objects.select_for_update().filter(customer=address.customer).exclude(
        pk=address.pk
    ).update(is_primary=False, updated_at=timezone.now())

    if not address.is_primary:
        address.is_primary = True
        address.save(update_fields=["is_primary", "updated_at"])

    return address


@transaction.atomic
def ensure_primary_exists(customer: Customer) -> Address | None:
    addresses = Address.objects.select_for_update().filter(customer=customer).order_by(
        "-created_at", "-id"
    )
    primary = addresses.filter(is_primary=True).first()
    if primary:
        return primary

    fallback = addresses.first()
    if fallback is None:
        return None

    fallback.is_primary = True
    fallback.save(update_fields=["is_primary", "updated_at"])
    return fallback
