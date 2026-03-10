from rest_framework import serializers

from apps.clientes.models import Address, Country, Customer


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["id", "name", "iso_code"]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "first_name",
            "last_name",
            "id_number",
            "email",
            "phone",
            "country",
            "is_active",
            "created_at",
            "updated_at",
            "deleted_at",
            "notes",
        ]
        read_only_fields = ["is_active", "created_at", "updated_at", "deleted_at"]

    def validate_id_number(self, value: str) -> str:
        if self.instance is not None and value != self.instance.id_number:
            raise serializers.ValidationError("id_number is immutable after creation.")
        return value


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "customer",
            "province",
            "city",
            "address_line",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
