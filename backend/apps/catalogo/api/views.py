from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

from apps.catalogo.api.serializers import ProductListSerializer, ProductVariantSerializer
from apps.catalogo.models import Product, ProductVariant


class VariantPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


def _only_active_enabled(value: str | None) -> bool:
    if value is None or value == "":
        return True
    return value.strip().lower() == "true"


class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Product.objects.all().order_by("name")

        if _only_active_enabled(self.request.query_params.get("only_active")):
            queryset = queryset.filter(is_active=True)

        query = self.request.query_params.get("q", "").strip()
        if query:
            queryset = queryset.filter(name__icontains=query)

        return queryset


class ProductVariantListAPIView(generics.ListAPIView):
    serializer_class = ProductVariantSerializer
    pagination_class = VariantPagination

    def get_queryset(self):
        queryset = ProductVariant.objects.select_related("product").all().order_by(
            "product__name", "measure_mm"
        )

        if _only_active_enabled(self.request.query_params.get("only_active")):
            queryset = queryset.filter(is_active=True, product__is_active=True)

        product_id = self.request.query_params.get("product_id", "").strip()
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        query = self.request.query_params.get("q", "").strip()
        if query:
            queryset = queryset.filter(product__name__icontains=query)

        return queryset


class ProductVariantDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ProductVariantSerializer

    def get_queryset(self):
        queryset = ProductVariant.objects.select_related("product").all()
        if _only_active_enabled(self.request.query_params.get("only_active")):
            queryset = queryset.filter(is_active=True, product__is_active=True)
        return queryset
