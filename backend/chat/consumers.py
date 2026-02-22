# pylint: disable=no-member
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"
        self.user = self.scope["user"]

        # Забороняємо анонімним
        if self.user.is_anonymous:
            await self.close()
            return

        allowed = await self.is_user_allowed()
        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    @database_sync_to_async
    def is_user_allowed(self):
        conversation = Conversation.objects.filter(id=self.conversation_id).first()
        if not conversation:
            return False
        return self.user == conversation.volunteer or self.user == conversation.military

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data["message"]

        message = await self.save_message(message_text)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message.text,  # pylint: disable=unsubscriptable-object
                "sender": self.user.username,
                "timestamp": str(message.timestamp),
            }
        )

    @database_sync_to_async
    def save_message(self, text):
        conversation = Conversation.objects.get(id=self.conversation_id)
        return Message.objects.create(conversation=conversation, sender=self.user, text=text)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
