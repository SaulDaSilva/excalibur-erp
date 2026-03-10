from django.urls import path
from apps.inventario.api.views import (
    AdjustmentMovementCreateAPIView,
    InventoryMovementListAPIView,
    ProductionMovementCreateAPIView,
    StockByVariantListAPIView,
)

urlpatterns = [
    path("stock_by_variant/", StockByVariantListAPIView.as_view(), name="inventario-stock-by-variant"),
    path("movimientos/", InventoryMovementListAPIView.as_view(), name="inventario-movement-list"),
    path("production/", ProductionMovementCreateAPIView.as_view(), name="inventario-production-create"),
    path("adjustment/", AdjustmentMovementCreateAPIView.as_view(), name="inventario-adjustment-create"),
]
