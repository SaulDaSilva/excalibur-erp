from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.clientes.models import Country, Customer
from apps.users.models import User


class CustomerIdValidationTests(TestCase):
    def setUp(self):
        self.ecuador = Country.objects.create(name="Ecuador", iso_code="EC")
        self.colombia = Country.objects.create(name="Colombia", iso_code="CO")
        self.user = User.objects.create_user(username="tester", password="secret123")
        self.client = APIClient()
        self.client.force_login(self.user)

    def test_customer_full_clean_requires_ecuador_id_validation_only_for_ecuador(self):
        customer = Customer(
            first_name="Juan",
            last_name="Perez",
            id_number="1234567890",
            country=self.ecuador,
        )

        with self.assertRaises(ValidationError):
            customer.full_clean()

    def test_customer_full_clean_allows_non_ecuador_id_number_without_ec_rules(self):
        customer = Customer(
            first_name="Carlos",
            last_name="Lopez",
            id_number="1234567890123",
            country=self.colombia,
        )

        customer.full_clean()

    def test_customer_api_create_rejects_invalid_ecuador_id(self):
        response = self.client.post(
            "/api/clientes/",
            {
                "first_name": "Ana",
                "last_name": "Garcia",
                "id_number": "1234567890",
                "email": "",
                "phone": "",
                "country": self.ecuador.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("id_number", response.data)

    def test_customer_api_create_allows_non_ecuador_id(self):
        response = self.client.post(
            "/api/clientes/",
            {
                "first_name": "Mateo",
                "last_name": "Diaz",
                "id_number": "1234567890123",
                "email": "",
                "phone": "",
                "country": self.colombia.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["country_name"], "Colombia")
        self.assertEqual(response.data["id_number"], "1234567890123")

    def test_customer_api_update_allows_existing_id_number_on_same_customer(self):
        customer = Customer.objects.create(
            first_name="Laura",
            last_name="Mendez",
            id_number="1234567890123",
            email="laura@example.com",
            phone="0999999999",
            country=self.colombia,
        )

        response = self.client.patch(
            f"/api/clientes/{customer.id}/",
            {
                "phone": "0988888888",
                "notes": "Cliente actualizado",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        customer.refresh_from_db()
        self.assertEqual(customer.id_number, "1234567890123")
        self.assertEqual(customer.phone, "0988888888")
        self.assertEqual(customer.notes, "Cliente actualizado")
