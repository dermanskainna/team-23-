from django.urls import path
from . import views

urlpatterns = [
    path('requests/', views.request_list_create, name='requests'),
    path('requests/<int:pk>/status/', views.update_request_status, name='update-status'),
    path('requests/<int:pk>/feedback/', views.request_feedback_view, name='request-feedback'),
    path('warehouse/', views.warehouse_list_create, name='warehouse'),
    path('tracking/<int:pk>/', views.track_request_status, name='tracking'),
    path('requests/<int:pk>/pdf/', views.generate_waybill_pdf, name='generate-pdf'),
    path('report/pdf/', views.generate_monthly_report_pdf, name='generate-report'),
    path('requests/<int:pk>/download/', views.download_attachment, name='download-attachment'),
]
