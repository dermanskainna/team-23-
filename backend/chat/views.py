from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def conversation_messages_view(request, conversation_id):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user != conversation.volunteer and request.user != conversation.military:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        messages = Message.objects.filter(conversation=conversation).order_by("created_at")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, conversation=conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        request_id = self.request.query_params.get("request_id")
        if not request_id:
            return Conversation.objects.none()
        return Conversation.objects.filter(request_id=request_id)
