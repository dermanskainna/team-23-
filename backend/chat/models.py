from django.conf import settings
from django.db import models
from logistics.models import Request

class Conversation(models.Model):
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="volunteer_chats"
    )
    military = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="military_chats"
    )
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="conversations")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.volunteer} - {self.military} ({self.request.id})"
# Повідомлення
class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.sender}: {self.text[:20]}"  # pylint: disable=unsubscriptable-object
