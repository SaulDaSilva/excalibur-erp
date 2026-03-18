from django.urls import path

from apps.gastos.api.views import (
    ExpenseCategoryDetailAPIView,
    ExpenseCategoryListCreateAPIView,
    ExpenseDetailAPIView,
    ExpenseListCreateAPIView,
)

urlpatterns = [
    path("categorias/", ExpenseCategoryListCreateAPIView.as_view(), name="gastos-category-list-create"),
    path("categorias/<int:pk>/", ExpenseCategoryDetailAPIView.as_view(), name="gastos-category-detail"),
    path("", ExpenseListCreateAPIView.as_view(), name="gastos-expense-list-create"),
    path("<int:pk>/", ExpenseDetailAPIView.as_view(), name="gastos-expense-detail"),
]
