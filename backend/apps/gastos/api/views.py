from datetime import date

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.gastos import services as expense_services
from apps.gastos.api.serializers import ExpenseCategorySerializer, ExpenseSerializer
from apps.gastos.models import Expense, ExpenseCategory


class ExpensePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ExpenseCategoryListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExpenseCategorySerializer
    pagination_class = None

    def get_queryset(self):
        queryset = ExpenseCategory.objects.all()

        include_inactive = self.request.query_params.get("include_inactive", "").strip().lower() == "true"
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        search_term = self.request.query_params.get("q", "").strip()
        if search_term:
            queryset = queryset.filter(name__icontains=search_term)

        return queryset.order_by("name")


class ExpenseCategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseCategorySerializer
    queryset = ExpenseCategory.objects.all().order_by("name")

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        expense_services.soft_delete_expense_category(category)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    pagination_class = ExpensePagination

    def get_queryset(self):
        queryset = Expense.objects.select_related("category", "created_by").all()

        include_inactive = self.request.query_params.get("include_inactive", "").strip().lower() == "true"
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        category_id = self.request.query_params.get("category_id", "").strip()
        if category_id:
            if not category_id.isdigit():
                raise ValidationError({"category_id": "Debe ser un entero valido."})
            queryset = queryset.filter(category_id=int(category_id))

        from_value = self.request.query_params.get("from", "").strip()
        to_value = self.request.query_params.get("to", "").strip()
        from_date = self._parse_query_date(from_value, "from") if from_value else None
        to_date = self._parse_query_date(to_value, "to") if to_value else None
        if from_date and to_date and from_date > to_date:
            raise ValidationError({"detail": "El rango de fechas es invalido: from no puede ser mayor que to."})
        if from_date:
            queryset = queryset.filter(expense_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(expense_date__lte=to_date)

        search_term = self.request.query_params.get("q", "").strip()
        if search_term:
            queryset = queryset.filter(
                Q(description__icontains=search_term)
                | Q(supplier_name__icontains=search_term)
                | Q(reference_number__icontains=search_term)
            )

        return queryset.order_by("-expense_date", "-created_at")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @staticmethod
    def _parse_query_date(value: str, param_name: str) -> date:
        try:
            return date.fromisoformat(value)
        except ValueError as exc:
            raise ValidationError({param_name: "Formato de fecha invalido. Use YYYY-MM-DD."}) from exc


class ExpenseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    queryset = Expense.objects.select_related("category", "created_by").all()

    def destroy(self, request, *args, **kwargs):
        expense = self.get_object()
        expense_services.soft_delete_expense(expense)
        return Response(status=status.HTTP_204_NO_CONTENT)
