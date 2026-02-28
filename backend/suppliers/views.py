from rest_framework import generics
from .models import Supplier, SupplierOffer
from .serializers import SupplierSerializer, SupplierOfferSerializer
from .permissions import IsVolunteerOrReadOnly


class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all().order_by("name")
    serializer_class = SupplierSerializer
    permission_classes = [IsVolunteerOrReadOnly]


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsVolunteerOrReadOnly]


class OfferListCreateView(generics.ListCreateAPIView):
    queryset = SupplierOffer.objects.all().order_by("-updated_at")
    serializer_class = SupplierOfferSerializer
    permission_classes = [IsVolunteerOrReadOnly]
