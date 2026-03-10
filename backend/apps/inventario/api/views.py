from __future__ import annotations

from datetime import date

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.catalogo.models import ProductVariant
from apps.inventario import services as inventory_services
from apps.inventario.api.serializers import (
    AdjustmentMovementInputSerializer,
    InventoryMovementListSerializer,
    ProductionMovementInputSerializer,
    StockByVariantSerializer,
)
from apps.inventario.models import InventoryMovement


class InventoryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class StockByVariantListAPIView(generics.ListAPIView):
    serializer_class = StockByVariantSerializer
    pagination_class = InventoryPagination

    def get_queryset(self):
        queryset = (
            ProductVariant.objects.select_related("product")
            .annotate(stock_pairs=Coalesce(Sum("inventory_movements__quantity_pairs"), 0))
            .order_by("product__name", "measure_mm", "id")
        )

        product_variant_id = self.request.query_params.get("product_variant_id", "").strip()
        if product_variant_id:
            if not product_variant_id.isdigit():
                raise ValidationError({"product_variant_id": "Debe ser un entero válido."})
            queryset = queryset.filter(id=int(product_variant_id))

        product_id = self.request.query_params.get("product_id", "").strip()
        if product_id:
            if not product_id.isdigit():
                raise ValidationError({"product_id": "Debe ser un entero válido."})
            queryset = queryset.filter(product_id=int(product_id))

        search_query = self.request.query_params.get("q", "").strip()
        if search_query:
            queryset = queryset.filter(product__name__icontains=search_query)

        only_active = self.request.query_params.get("only_active", "").strip().lower() == "true"
        if only_active:
            queryset = queryset.filter(is_active=True, product__is_active=True)

        return queryset


class InventoryMovementListAPIView(generics.ListAPIView):
    serializer_class = InventoryMovementListSerializer
    pagination_class = InventoryPagination

    def get_queryset(self):
        queryset = (
            InventoryMovement.objects.select_related("order", "product_variant__product")
            .order_by("-created_at")
        )

        movement_type = self.request.query_params.get("movement_type", "").strip()
        if movement_type:
            valid_types = set(InventoryMovement.Type.values)
            if movement_type not in valid_types:
                raise ValidationError(
                    {"movement_type": f"Valor inválido. Use uno de: {', '.join(sorted(valid_types))}."}
                )
            queryset = queryset.filter(movement_type=movement_type)

        product_variant_id = self.request.query_params.get("product_variant_id", "").strip()
        if product_variant_id:
            if not product_variant_id.isdigit():
                raise ValidationError({"product_variant_id": "Debe ser un entero válido."})
            queryset = queryset.filter(product_variant_id=int(product_variant_id))

        order_id = self.request.query_params.get("order_id", "").strip()
        if order_id:
            if not order_id.isdigit():
                raise ValidationError({"order_id": "Debe ser un entero válido."})
            queryset = queryset.filter(order_id=int(order_id))

        from_value = self.request.query_params.get("from", "").strip()
        to_value = self.request.query_params.get("to", "").strip()
        from_date = self._parse_query_date(from_value, "from") if from_value else None
        to_date = self._parse_query_date(to_value, "to") if to_value else None
        if from_date and to_date and from_date > to_date:
            raise ValidationError({"detail": "El rango de fechas es inválido: from no puede ser mayor que to."})
        if from_date:
            queryset = queryset.filter(created_at__date__gte=from_date)
        if to_date:
            queryset = queryset.filter(created_at__date__lte=to_date)

        return queryset

    @staticmethod
    def _parse_query_date(value: str, param_name: str) -> date:
        try:
            return date.fromisoformat(value)
        except ValueError as exc:
            raise ValidationError({param_name: "Formato de fecha inválido. Use YYYY-MM-DD."}) from exc


class ProductionMovementCreateAPIView(generics.CreateAPIView):
    serializer_class = ProductionMovementInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            movement = inventory_services.create_production_movement(
                user=request.user,
                product_variant_id=serializer.validated_data["product_variant"],
                quantity_pairs=serializer.validated_data["quantity_pairs"],
                note=serializer.validated_data.get("note", ""),
            )
        except DjangoValidationError as exc:
            raise ValidationError(self._format_validation_error(exc))

        out = InventoryMovementListSerializer(
            movement,
            context=self.get_serializer_context(),
        )
        return Response(out.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _format_validation_error(exc: DjangoValidationError):
        if hasattr(exc, "message_dict"):
            return exc.message_dict
        return {"detail": exc.messages}


class AdjustmentMovementCreateAPIView(generics.CreateAPIView):
    serializer_class = AdjustmentMovementInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            movement = inventory_services.create_adjustment_movement(
                user=request.user,
                product_variant_id=serializer.validated_data["product_variant"],
                quantity_pairs=serializer.validated_data["quantity_pairs"],
                note=serializer.validated_data["note"],
            )
        except DjangoValidationError as exc:
            raise ValidationError(self._format_validation_error(exc))

        out = InventoryMovementListSerializer(
            movement,
            context=self.get_serializer_context(),
        )
        return Response(out.data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _format_validation_error(exc: DjangoValidationError):
        if hasattr(exc, "message_dict"):
            return exc.message_dict
        return {"detail": exc.messages}
