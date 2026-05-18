from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.gastos.models import Expense, ExpenseCategory
from apps.users.models import User


class ExpenseDynamicCategoryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="secret123")
        self.client.force_login(self.user)

        self.travel_category = ExpenseCategory.objects.create(
            name="Gastos de viajes",
            code=ExpenseCategory.Code.TRAVEL_EXPENSES,
            form_group=ExpenseCategory.FormGroup.VIAJES,
            sort_order=10,
            is_system=True,
        )
        self.delivery_category = ExpenseCategory.objects.create(
            name="ENVIOS - CARRERAS",
            code=ExpenseCategory.Code.DELIVERY_RUNS,
            form_group=ExpenseCategory.FormGroup.LOGISTICA,
            sort_order=22,
            is_system=True,
        )
        self.service_category = ExpenseCategory.objects.create(
            name="Servicios prestados",
            code=ExpenseCategory.Code.PROVIDED_SERVICES,
            form_group=ExpenseCategory.FormGroup.SERVICIOS,
            sort_order=60,
            is_system=True,
        )

    def _payload(self, **overrides):
        payload = {
            "category": self.travel_category.id,
            "amount": "10.00",
            "description": "Gasto operativo",
            "expense_date": timezone.localdate().isoformat(),
            "supplier_name": "",
            "reference_number": "",
            "notes": "",
            "details": {},
        }
        payload.update(overrides)
        return payload

    def test_create_travel_expense_requires_destination(self):
        response = self.client.post("/api/gastos/", self._payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("destination", response.data["details"])

    def test_create_services_expense_requires_service_provider_name(self):
        response = self.client.post(
            "/api/gastos/",
            self._payload(
                category=self.service_category.id,
                details={},
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("service_provider_name", response.data["details"])

    def test_create_delivery_runs_expense_accepts_supplier_name(self):
        response = self.client.post(
            "/api/gastos/",
            self._payload(
                category=self.delivery_category.id,
                supplier_name="Mensajero local",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["supplier_name"], "Mensajero local")

    def test_list_categories_returns_metadata(self):
        response = self.client.get("/api/gastos/categorias/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["code"] == ExpenseCategory.Code.TRAVEL_EXPENSES for item in response.data))
        self.assertTrue(any(item["form_group"] == ExpenseCategory.FormGroup.SERVICIOS for item in response.data))

    def test_list_expenses_can_filter_by_form_group(self):
        Expense.objects.create(
            category=self.travel_category,
            amount="12.50",
            description="Viaje a feria",
            expense_date=timezone.localdate(),
            supplier_name="",
            reference_number="",
            notes="",
            details={"destination": "Bogota"},
            created_by=self.user,
        )
        Expense.objects.create(
            category=self.service_category,
            amount="25.00",
            description="Apoyo contable",
            expense_date=timezone.localdate(),
            supplier_name="",
            reference_number="",
            notes="",
            details={"service_provider_name": "Ana"},
            created_by=self.user,
        )

        response = self.client.get("/api/gastos/?form_group=VIAJES")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["category_group"], ExpenseCategory.FormGroup.VIAJES)
