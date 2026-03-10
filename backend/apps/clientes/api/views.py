from django.db.models import Q
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.clientes import services as clientes_services
from apps.clientes.models import Address, Country, Customer
from apps.clientes.api.serializers import (
    AddressSerializer,
    CountrySerializer,
    CustomerSerializer,
)


class CustomerPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class CountryListAPIView(generics.ListAPIView):
    serializer_class = CountrySerializer
    queryset = Country.objects.all().order_by("name")
    pagination_class = None


class CustomerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    pagination_class = CustomerPagination

    def get_queryset(self):
        queryset = Customer.objects.select_related("country").all()

        include_inactive = (
            self.request.query_params.get("include_inactive", "").strip().lower() == "true"
        )
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        search_term = self.request.query_params.get("q", "").strip()
        if search_term:
            queryset = queryset.filter(
                Q(first_name__icontains=search_term)
                | Q(last_name__icontains=search_term)
                | Q(id_number__icontains=search_term)
            )

        return queryset.order_by("last_name", "first_name")


class CustomerDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.select_related("country").all()

    def destroy(self, request, *args, **kwargs):
        customer = self.get_object()
        clientes_services.soft_delete_customer(customer)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AddressListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        queryset = Address.objects.select_related("customer").all()
        customer_id = self.request.query_params.get("customer_id", "").strip()
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset.order_by("-is_primary", "province", "city", "id")

    def perform_create(self, serializer):
        requested_primary = bool(serializer.validated_data.get("is_primary", False))
        if requested_primary:
            address = serializer.save(is_primary=False)
            clientes_services.set_primary_address(address)
            return

        address = serializer.save()
        clientes_services.ensure_primary_exists(address.customer)


class AddressDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    queryset = Address.objects.select_related("customer").all()

    def perform_update(self, serializer):
        previous_is_primary = serializer.instance.is_primary
        requested_primary = serializer.validated_data.get("is_primary", previous_is_primary)

        if requested_primary and not previous_is_primary:
            address = serializer.save(is_primary=False)
            clientes_services.set_primary_address(address)
            return

        serializer.save()
