from rest_framework import serializers
from .models import Supplier, SupplierOffer


class SupplierOfferSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True
    )

    class Meta:
        model = SupplierOffer
        fields = [
            "id",
            "supplier",
            "category",
            "category_display",
            "item_name",
            "sku",
            "price",
            "currency",
            "link",
            "is_available",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class SupplierSerializer(serializers.ModelSerializer):
    offers = SupplierOfferSerializer(many=True, read_only=True)

    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "city",
            "website",
            "notes",
            "created_at",
            "offers",
        ]
        read_only_fields = ["id", "created_at", "offers"]
