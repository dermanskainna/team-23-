from rest_framework import serializers
from .models import Request, WarehouseItem

class RequestSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_organization = serializers.CharField(source='author.organization', read_only=True)

    class Meta:
        model = Request
        fields = [
            'id', 'title', 'description', 'location', 'status',
            'urgency', 'reject_reason', 'created_at',
            'author_name', 'author_organization'
        ]
        read_only_fields = ['id', 'status', 'reject_reason', 'created_at']

class WarehouseItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = WarehouseItem
        fields = ['id', 'name', 'category', 'category_display', 'quantity', 'last_updated']

class TrackingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Request
        fields = ['id', 'title', 'status', 'status_display', 'urgency', 'created_at']
