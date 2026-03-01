from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('pending-military/', views.pending_military, name='pending-military'),
    path('verify-military/<int:pk>/', views.verify_military, name='verify-military'),
]
