from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('<int:conversation_id>/messages/', views.conversation_messages_view, name='conversation-messages'),
]
