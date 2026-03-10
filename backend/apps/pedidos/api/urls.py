from django.urls import path
from apps.pedidos.api.views import OrderViewSet

order_list = OrderViewSet.as_view({"get": "list", "post": "create"})
order_detail = OrderViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"})
order_dispatch = OrderViewSet.as_view({"post": "dispatch_order"})
order_cancel = OrderViewSet.as_view({"post": "cancel"})

urlpatterns = [
    path("", order_list, name="pedidos-order-list-create"),
    path("<int:pk>/", order_detail, name="pedidos-order-detail"),
    path("<int:pk>/dispatch/", order_dispatch, name="pedidos-order-dispatch"),
    path("<int:pk>/cancel/", order_cancel, name="pedidos-order-cancel"),
]
