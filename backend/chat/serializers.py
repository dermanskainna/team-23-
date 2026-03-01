from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()

    class Meta:
        model = Message
        fields = "__all__"

class ConversationSerializer(serializers.ModelSerializer):
    can_chat = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = "__all__"

    def get_can_chat(self, obj):
        return obj.request.status == "accepted"
