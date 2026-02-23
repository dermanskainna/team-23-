# pylint: disable=no-member
from rest_framework import generics, permissions
from .models import Conversation, Message
from .serializers import MessageSerializer

class ConversationMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs["pk"]
        user = self.request.user

        conversation = Conversation.objects.filter(id=conversation_id).first()
        if not conversation:
            return Message.objects.none()

        # Перевірка, що user учасник чату
        if user != conversation.volunteer and user != conversation.military:
            return Message.objects.none()

        return Message.objects.filter(conversation=conversation)
