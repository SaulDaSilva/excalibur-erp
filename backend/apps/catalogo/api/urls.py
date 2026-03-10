from django.urls import path
from apps.catalogo.api.views import (
    ProductListAPIView,
    ProductVariantDetailAPIView,
    ProductVariantListAPIView,
)

urlpatterns = [
    path("productos/", ProductListAPIView.as_view(), name="catalogo-product-list"),
    path("variantes/", ProductVariantListAPIView.as_view(), name="catalogo-variant-list"),
    path("variantes/<int:pk>/", ProductVariantDetailAPIView.as_view(), name="catalogo-variant-detail"),
]
