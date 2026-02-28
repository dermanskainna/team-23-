from rest_framework import serializers
from .models import Request, WarehouseItem, Feedback

class RequestSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_organization = serializers.CharField(source='author.organization', read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = [
            'id', 'title', 'description', 'location', 'status',
            'urgency', 'reject_reason', 'created_at',
            'author_name', 'author_organization',
            'feedback', 'attachment', 'attachment_url'
        ]
        read_only_fields = ['id', 'status', 'reject_reason', 'created_at', 'feedback']

    def get_attachment_url(self, obj):
        request = self.context.get('request')
        if obj.attachment and request:
            return request.build_absolute_uri(obj.attachment.url)
        return None

class WarehouseItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = WarehouseItem
        fields = ['id', 'name', 'category', 'category_display', 'quantity', 'last_updated', 'attachment_url']

class TrackingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Request
        fields = ['id', 'title', 'status', 'status_display', 'urgency', 'created_at']

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Оцінка має бути від 1 до 5.")
        return value
