from django.urls import path
from .views import ConversationMessagesView

urlpatterns = [
    path("conversation/<int:pk>/messages/", ConversationMessagesView.as_view()),
]
