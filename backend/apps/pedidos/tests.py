from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.catalogo.models import Product, ProductVariant
from apps.clientes.models import Address, Country, Customer
from apps.pedidos.models import Order, OrderItem
from apps.users.models import User


class OrderDateAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="secret123")
        self.client.force_login(self.user)

        self.country = Country.objects.create(name="Colombia", iso_code="CO")
        self.customer = Customer.objects.create(
            first_name="Carlos",
            last_name="Lopez",
            id_number="1234567890123",
            country=self.country,
        )
        self.address = Address.objects.create(
            customer=self.customer,
            province="Bogota",
            city="Bogota",
            address_line="Calle 1",
            is_primary=True,
        )
        self.product = Product.objects.create(name="Espuelas plasticas")
        self.variant = ProductVariant.objects.create(
            product=self.product,
            measure_mm=14,
            base_price_usd=Decimal("1.00"),
        )

    def _payload(self, **overrides):
        payload = {
            "customer": self.customer.id,
            "shipping_address": self.address.id,
            "channel": Order.Channel.WHATSAPP,
            "items": [
                {
                    "kind": OrderItem.Kind.SALE,
                    "product_variant": self.variant.id,
                    "quantity_pairs": 2,
                    "unit_price": "1.00",
                }
            ],
        }
        payload.update(overrides)
        return payload

    def test_create_order_without_order_date_defaults_to_today(self):
        response = self.client.post("/api/pedidos/", self._payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["order_date"], timezone.localdate().isoformat())

    def test_create_order_with_past_order_date(self):
        order_date = timezone.localdate() - timedelta(days=3)

        response = self.client.post(
            "/api/pedidos/",
            self._payload(order_date=order_date.isoformat()),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["order_date"], order_date.isoformat())

    def test_create_order_rejects_future_order_date(self):
        order_date = timezone.localdate() + timedelta(days=1)

        response = self.client.post(
            "/api/pedidos/",
            self._payload(order_date=order_date.isoformat()),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("order_date", response.data)

    def test_list_order_date_filters_use_order_date_not_created_at(self):
        old_order = Order.objects.create(
            customer=self.customer,
            shipping_address=self.address,
            channel=Order.Channel.WHATSAPP,
            status=Order.Status.PENDING,
            order_date=timezone.localdate() - timedelta(days=10),
        )
        recent_order = Order.objects.create(
            customer=self.customer,
            shipping_address=self.address,
            channel=Order.Channel.CALL,
            status=Order.Status.PENDING,
            order_date=timezone.localdate(),
        )
        for order in (old_order, recent_order):
            OrderItem.objects.create(
                order=order,
                kind=OrderItem.Kind.SALE,
                product_variant=self.variant,
                quantity_pairs=1,
                unit_price=Decimal("1.00"),
            )

        response = self.client.get(
            "/api/pedidos/",
            {"from": timezone.localdate().isoformat(), "to": timezone.localdate().isoformat()},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in response.data["results"]]
        self.assertEqual(ids, [recent_order.id])
