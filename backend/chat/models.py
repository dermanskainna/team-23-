from django.db import models
from django.conf import settings

class Conversation(models.Model):
    request = models.ForeignKey('logistics.Request', on_delete=models.CASCADE)
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='volunteer_conversations')
    military = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='military_conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.volunteer} - {self.military} ({self.id})"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author}: {self.text[:30]}"
