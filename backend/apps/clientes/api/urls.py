from django.urls import path
from apps.clientes.api.views import (
    AddressDetailAPIView,
    AddressListCreateAPIView,
    CountryListAPIView,
    CustomerDetailAPIView,
    CustomerListCreateAPIView,
)

urlpatterns = [
    path("paises/", CountryListAPIView.as_view(), name="clientes-country-list"),
    path("", CustomerListCreateAPIView.as_view(), name="clientes-customer-list-create"),
    path("<int:pk>/", CustomerDetailAPIView.as_view(), name="clientes-customer-detail"),
    path(
        "direcciones/",
        AddressListCreateAPIView.as_view(),
        name="clientes-address-list-create",
    ),
    path(
        "direcciones/<int:pk>/",
        AddressDetailAPIView.as_view(),
        name="clientes-address-detail",
    ),
]
