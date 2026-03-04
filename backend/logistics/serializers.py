from rest_framework import serializers
from .models import Request, WarehouseItem, Feedback
from .models import RequestHistory
from chat.models import Conversation

class RequestSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_organization = serializers.CharField(source='author.organization', read_only=True)
    attachment_url = serializers.SerializerMethodField()
    volunteer = serializers.StringRelatedField(read_only=True)
    volunteer_username = serializers.CharField(source='volunteer.username', read_only=True)
    conversation_id = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = [
            'id', 'title', 'description', 'location', 'status',
            'urgency', 'quantity', 'reject_reason', 'created_at',
            'author_name', 'author_organization',
            'feedback', 'attachment', 'attachment_url',
            'volunteer', 'volunteer_username', 'conversation_id'
        ]
        read_only_fields = ['id', 'status', 'reject_reason', 'created_at', 'feedback', 'volunteer']

    def get_attachment_url(self, obj):
        request = self.context.get('request')
        if obj.attachment and request:
            return request.build_absolute_uri(obj.attachment.url)
        return None

    def get_conversation_id(self, obj):
        conv = Conversation.objects.filter(request=obj).first()
        return conv.id if conv else None

class WarehouseItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = WarehouseItem
        fields = ['id', 'name', 'category', 'category_display', 'quantity', 'last_updated',]

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

class RequestHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True, default="Система")
    old_status_display = serializers.CharField(source='get_old_status_display', read_only=True)
    new_status_display = serializers.CharField(source='get_new_status_display', read_only=True)

    class Meta:
        model = RequestHistory
        fields = ['id', 'old_status', 'new_status', 'old_status_display', 'new_status_display', 'changed_by_name', 'created_at']
