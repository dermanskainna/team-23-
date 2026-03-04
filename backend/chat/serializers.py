from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'author', 'author_name', 'text', 'created_at']
        read_only_fields = ['id', 'author', 'created_at', 'conversation']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    can_chat = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'request', 'volunteer', 'military', 'created_at', 'messages', 'can_chat']

    def get_can_chat(self, obj):
        return obj.request.status == "accepted"
