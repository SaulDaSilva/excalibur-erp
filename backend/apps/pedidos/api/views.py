from __future__ import annotations

from datetime import date

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.pedidos import services as order_services
from apps.pedidos.api.serializers import OrderSerializer, OrderWriteSerializer
from apps.pedidos.models import Order


class OrderPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    pagination_class = OrderPagination

    def get_queryset(self):
        queryset = self._base_queryset()
        if self.action != "list":
            return queryset

        status_filter = self.request.query_params.get("status", "").strip()
        if status_filter:
            valid_statuses = set(Order.Status.values)
            if status_filter not in valid_statuses:
                raise ValidationError(
                    {"status": f"Valor inválido. Use uno de: {', '.join(sorted(valid_statuses))}."}
                )
            queryset = queryset.filter(status=status_filter)

        customer_id = self.request.query_params.get("customer_id", "").strip()
        if customer_id:
            if not customer_id.isdigit():
                raise ValidationError({"customer_id": "Debe ser un entero válido."})
            queryset = queryset.filter(customer_id=int(customer_id))

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

        search_value = self.request.query_params.get("q", "").strip()
        if search_value:
            search_query = (
                Q(customer__first_name__icontains=search_value)
                | Q(customer__last_name__icontains=search_value)
                | Q(customer__id_number__icontains=search_value)
            )
            if search_value.isdigit():
                search_query |= Q(id=int(search_value))
            queryset = queryset.filter(search_query)

        return queryset

    @staticmethod
    def _base_queryset():
        return (
            Order.objects.select_related("customer", "shipping_address")
            .prefetch_related("items__product_variant__product")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action in {"create", "partial_update"}:
            return OrderWriteSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        read_serializer = OrderSerializer(self._base_queryset().get(pk=order.pk))
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            raise ValidationError({"detail": "Solo se pueden editar pedidos en estado PENDING."})

        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        read_serializer = OrderSerializer(self._base_queryset().get(pk=order.pk))
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            raise ValidationError(
                {"detail": "Solo se puede eliminar un pedido en estado PENDING para mantener trazabilidad."}
            )
        if order.inventory_movements.exists():
            raise ValidationError(
                {"detail": "No se puede eliminar el pedido porque tiene movimientos de inventario asociados."}
            )

        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="dispatch")
    def dispatch_order(self, request, pk=None):
        order = self.get_object()
        try:
            order = order_services.dispatch_order(order)
        except DjangoValidationError as exc:
            raise ValidationError(self._format_validation_error(exc))

        serializer = OrderSerializer(self._base_queryset().get(pk=order.pk))
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        try:
            order = order_services.cancel_order(order)
        except DjangoValidationError as exc:
            raise ValidationError(self._format_validation_error(exc))

        serializer = OrderSerializer(self._base_queryset().get(pk=order.pk))
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def _parse_query_date(value: str, param_name: str) -> date:
        try:
            return date.fromisoformat(value)
        except ValueError as exc:
            raise ValidationError(
                {param_name: "Formato de fecha inválido. Use YYYY-MM-DD."}
            ) from exc

    @staticmethod
    def _format_validation_error(exc: DjangoValidationError):
        if hasattr(exc, "message_dict"):
            return exc.message_dict
        return {"detail": exc.messages}
