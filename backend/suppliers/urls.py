from django.urls import path
from .views import (
    SupplierListCreateView,
    SupplierDetailView,
    OfferListCreateView
)

urlpatterns = [
    path("suppliers/", SupplierListCreateView.as_view(), name="suppliers-list"),
    path("suppliers/<int:pk>/", SupplierDetailView.as_view(), name="suppliers-detail"),
    path("offers/", OfferListCreateView.as_view(), name="offers-list"),
]
