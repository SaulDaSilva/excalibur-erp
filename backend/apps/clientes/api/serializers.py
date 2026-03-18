from rest_framework import serializers

from apps.clientes.models import Address, Country, Customer


class CountrySerializer(serializers.ModelSerializer):
    def validate_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("El nombre es obligatorio.")

        queryset = Country.objects.filter(name__iexact=normalized)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un pais con ese nombre.")
        return normalized

    def validate_iso_code(self, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized:
            raise serializers.ValidationError("El codigo ISO es obligatorio.")

        queryset = Country.objects.filter(iso_code__iexact=normalized)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un pais con ese codigo ISO.")
        return normalized

    class Meta:
        model = Country
        fields = ["id", "name", "iso_code"]


class CustomerSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source="country.name", read_only=True)

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
            "country_name",
            "is_active",
            "created_at",
            "updated_at",
            "deleted_at",
            "notes",
        ]
        read_only_fields = ["is_active", "created_at", "updated_at", "deleted_at"]

    def validate_id_number(self, value: str) -> str:
        normalized = value.strip()
        if self.instance is not None and normalized != self.instance.id_number:
            raise serializers.ValidationError("id_number is immutable after creation.")
        return normalized

    def validate(self, attrs):
        instance = Customer(
            **{
                **(
                    {
                        "first_name": self.instance.first_name,
                        "last_name": self.instance.last_name,
                        "id_number": self.instance.id_number,
                        "email": self.instance.email,
                        "phone": self.instance.phone,
                        "country": self.instance.country,
                        "notes": self.instance.notes,
                        "is_active": self.instance.is_active,
                        "deleted_at": self.instance.deleted_at,
                    }
                    if self.instance is not None
                    else {}
                ),
                **attrs,
            }
        )
        instance.full_clean()
        return attrs


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
