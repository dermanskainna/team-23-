from django.urls import path
from . import views
from django.contrib import admin

urlpatterns = [
    path('requests/', views.request_list_create, name='requests'),
    path('requests/<int:pk>/status/', views.update_request_status, name='update-status'),
    path('tracking/<int:pk>/', views.track_request_status, name='tracking'),
    path('requests/<int:pk>/download/', views.download_attachment, name='download-attachment'),
]
