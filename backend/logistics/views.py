from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Request, WarehouseItem
from .serializers import RequestSerializer, WarehouseItemSerializer, TrackingSerializer
from django.http import HttpResponse, Http404
from .models import Request
import os
from django.http import HttpResponse, Http404
from .models import Request
import mimetypes

# ===========================
# Створення та перегляд запитів
# ===========================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def request_list_create(request):
    if request.method == 'GET':
        if request.user.role == 'military':
            requests_qs = Request.objects.filter(author=request.user).order_by('-created_at')
        else:
            requests_qs = Request.objects.all().order_by('-created_at')
        serializer = RequestSerializer(requests_qs, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        if request.user.role != 'military':
            return Response({"error": "Тільки військові можуть створювати заявки."}, status=status.HTTP_403_FORBIDDEN)

        serializer = RequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            new_request = serializer.save(author=request.user)

            # =============================
            # Зменшуємо кількість на складі
            # =============================
            matched_item = None
            warehouse_items = WarehouseItem.objects.all()
            title_lower = new_request.title.lower()
            desc_lower = new_request.description.lower()

            for item in warehouse_items:
                if item.name.lower() in title_lower or item.name.lower() in desc_lower:
                    matched_item = item
                    break

            if matched_item and matched_item.quantity > 0:
                matched_item.quantity -= 1
                matched_item.save()
            else:
                new_request.status = 'awaiting_purchase'
                new_request.save()

            return Response(RequestSerializer(new_request, context={'request': request}).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ===========================
# Зміна статусу
# ===========================
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_request_status(request, pk):
    if request.user.role != 'volunteer':
        return Response({"error": "Тільки волонтери можуть змінювати статус заявок."}, status=status.HTTP_403_FORBIDDEN)

    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Заявку не знайдено."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    reject_reason = request.data.get('reject_reason', '')

    valid_statuses = dict(Request.STATUS_CHOICES).keys()
    if new_status not in valid_statuses:
        return Response({"error": "Неправильний статус."}, status=status.HTTP_400_BAD_REQUEST)

    req.status = new_status
    req.reject_reason = reject_reason if new_status == 'rejected' else ''
    req.save()

    return Response(RequestSerializer(req, context={'request': request}).data)

# ===========================
# Трекінг запиту
# ===========================
@api_view(['GET'])
@permission_classes([AllowAny])
def track_request_status(request, pk):
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Заявку не знайдено."}, status=status.HTTP_404_NOT_FOUND)

    serializer = TrackingSerializer(req, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_attachment(request, pk):
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Запит не знайдено."}, status=404)

    if not req.attachment:
        return Response({"error": "Файл не прикріплено."}, status=404)

    if request.user.role not in ['volunteer', 'military'] or (request.user.role == 'military' and request.user != req.author):
        return Response({"error": "Доступ заборонено."}, status=403)

    file_path = req.attachment.path
    if not os.path.exists(file_path):
        return Response({"error": "Файл не знайдено на сервері."}, status=404)

    mime_type, _ = mimetypes.guess_type(file_path)
    with open(file_path, 'rb') as f:
        response = HttpResponse(f.read(), content_type=mime_type or 'application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response
