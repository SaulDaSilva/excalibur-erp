from rest_framework import serializers

from apps.catalogo.models import Product, ProductVariant


class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "is_active"]


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "product", "product_name", "measure_mm", "base_price_usd", "is_active"]
