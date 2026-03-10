from rest_framework import serializers


class DashboardSummaryQuerySerializer(serializers.Serializer):
    low_stock_threshold = serializers.IntegerField(required=False, default=10)


class DashboardMetricsSerializer(serializers.Serializer):
    pending_orders_count = serializers.IntegerField()
    sales_last_7_days_usd = serializers.DecimalField(max_digits=18, decimal_places=2)
    current_stock_pairs = serializers.IntegerField()
    low_stock_variants_count = serializers.IntegerField()
    low_stock_threshold = serializers.IntegerField()


class PendingOrderCustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    id_number = serializers.CharField()


class PendingOrderShippingAddressSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    province = serializers.CharField()
    city = serializers.CharField()
    address_line = serializers.CharField(allow_blank=True)
    is_primary = serializers.BooleanField()


class PendingOrderItemProductVariantSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    measure_mm = serializers.IntegerField()
    product_name = serializers.CharField()


class PendingOrderItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    kind = serializers.CharField()
    quantity_pairs = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    product_variant = PendingOrderItemProductVariantSerializer()


class PendingOrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    channel = serializers.CharField()
    status = serializers.CharField()
    customer = PendingOrderCustomerSerializer()
    shipping_address = PendingOrderShippingAddressSerializer()
    items = PendingOrderItemSerializer(many=True)
    sold_amount_usd = serializers.DecimalField(max_digits=18, decimal_places=2)
    sold_pairs = serializers.IntegerField()
    promo_pairs = serializers.IntegerField()
    total_pairs = serializers.IntegerField()


class DashboardSummarySerializer(serializers.Serializer):
    metrics = DashboardMetricsSerializer()
    pending_orders = PendingOrderSerializer(many=True)
    generated_at = serializers.DateTimeField()
