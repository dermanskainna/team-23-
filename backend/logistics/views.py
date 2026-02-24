from django.utils import timezone
import io
import os
import urllib.request
import ssl
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Request, WarehouseItem
from .serializers import RequestSerializer, WarehouseItemSerializer, TrackingSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def request_list_create(request):
    if request.method == 'GET':
        if request.user.role == 'military':
            requests = Request.objects.filter(author=request.user).order_by('-created_at')
        else:
            requests = Request.objects.all().order_by('-created_at')
        serializer = RequestSerializer(requests, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if request.user.role != 'military':
            return Response({"error": "Тільки військові можуть створювати заявки."}, status=status.HTTP_403_FORBIDDEN)

        serializer = RequestSerializer(data=request.data)
        if serializer.is_valid():
            new_request = serializer.save(author=request.user)

            matched_item = None
            warehouse_items = WarehouseItem.objects.all()
            title_lower = new_request.title.lower()
            desc_lower = new_request.description.lower()

            for item in warehouse_items:
                item_name_lower = item.name.lower()
                if item_name_lower in title_lower or item_name_lower in desc_lower:
                    matched_item = item
                    break

            if matched_item and matched_item.quantity > 0:
                matched_item.quantity -= 1
                matched_item.save()
            else:
                new_request.status = 'awaiting_purchase'
                new_request.save()

            result_serializer = RequestSerializer(new_request)
            return Response(result_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_request_status(request, pk):
    if request.user.role != 'volunteer':
        return Response({"error": "Тільки волонтери можуть змінювати статус заявок."}, status=status.HTTP_403_FORBIDDEN)

    try:
        logistics_request = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Заявку не знайдено."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    reject_reason = request.data.get('reject_reason', '')

    valid_statuses = dict(Request.STATUS_CHOICES).keys()
    if new_status not in valid_statuses:
        return Response({"error": "Неправильний статус."}, status=status.HTTP_400_BAD_REQUEST)

    logistics_request.status = new_status
    if new_status == 'rejected':
        logistics_request.reject_reason = reject_reason
    else:
        logistics_request.reject_reason = ''

    logistics_request.save()
    serializer = RequestSerializer(logistics_request)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def warehouse_list_create(request):
    if request.user.role != 'volunteer':
        return Response({"error": "Тільки волонтери мають доступ до складу."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        items = WarehouseItem.objects.all().order_by('category', 'name')
        serializer = WarehouseItemSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = WarehouseItemSerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data['name'].strip()
            category = serializer.validated_data['category']
            qty = serializer.validated_data.get('quantity', 0)

            existing = WarehouseItem.objects.filter(name=name, category=category).first()

            if existing:
                existing.quantity = existing.quantity + qty
                existing.save(update_fields=['quantity'])

                return Response(
                    WarehouseItemSerializer(existing).data,
                    status=status.HTTP_200_OK
                )

            created = serializer.save()
            return Response(
                WarehouseItemSerializer(created).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def track_request_status(request, pk):
    try:
        logistics_request = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Заявку з таким номером не знайдено."}, status=status.HTTP_404_NOT_FOUND)

    serializer = TrackingSerializer(logistics_request)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_waybill_pdf(request, pk):
    try:
        logistics_request = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Заявку не знайдено."}, status=status.HTTP_404_NOT_FOUND)

    font_path = "arial.ttf"
    if not os.path.exists(font_path):
        ssl._create_default_https_context = ssl._create_unverified_context
        urllib.request.urlretrieve('https://github.com/matomo-org/travis-scripts/raw/master/fonts/Arial.ttf', font_path)

    pdfmetrics.registerFont(TTFont('Arial', font_path))

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont('Arial', 18)
    p.drawString(100, 800, f"АКТ ПЕРЕДАЧІ / НАКЛАДНА №{logistics_request.id}")

    p.setFont('Arial', 12)
    p.drawString(100, 760, f"Дата: {logistics_request.created_at.strftime('%d.%m.%Y')}")
    p.drawString(100, 740, f"Отримувач: {logistics_request.author.username}")
    p.drawString(100, 720, f"Підрозділ: {logistics_request.author.organization or 'Не вказано'}")
    p.drawString(100, 700, f"Напрямок (Локація): {logistics_request.location}")

    p.line(100, 680, 500, 680)

    p.setFont('Arial', 14)
    p.drawString(100, 650, f"Що передається: {logistics_request.title}")

    p.setFont('Arial', 12)
    p.drawString(100, 620, f"Деталі:")

    text = logistics_request.description
    max_len = 60
    y_pos = 600
    for i in range(0, len(text), max_len):
        p.drawString(100, y_pos, text[i:i+max_len])
        y_pos -= 20

    y_pos -= 40
    p.line(100, y_pos, 500, y_pos)

    y_pos -= 40
    p.drawString(100, y_pos, "Підпис волонтера: _____________")
    p.drawString(300, y_pos, "Підпис військового: _________________")

    p.showPage()
    p.save()
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="nakladna_{logistics_request.id}.pdf"'

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_monthly_report_pdf(request):
    if request.user.role != 'volunteer':
        return Response({"error": "Тільки волонтери можуть генерувати звіт."}, status=status.HTTP_403_FORBIDDEN)
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    completed_requests = Request.objects.filter(status='completed', created_at__gte=start_of_month)

    font_path = "arial.ttf"
    if not os.path.exists(font_path):
        import ssl
        ssl._create_default_https_context = ssl._create_unverified_context
        urllib.request.urlretrieve('https://github.com/matomo-org/travis-scripts/raw/master/fonts/Arial.ttf', font_path)

    pdfmetrics.registerFont(TTFont('Arial', font_path))

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont('Arial', 18)
    p.drawString(100, 800, f"ВОЛОНТЕРСЬКИЙ ЗВІТ ЗА {now.strftime('%m.%Y')}")

    p.setFont('Arial', 12)
    p.drawString(100, 770, f"Генерував(ла): {request.user.full_name or request.user.username}")
    p.drawString(100, 750, f"Дата генерації: {now.strftime('%d.%m.%Y %H:%M')}")

    p.line(100, 730, 500, 730)

    p.setFont('Arial', 14)
    p.drawString(100, 700, "Загальна статистика:")
    p.setFont('Arial', 12)
    p.drawString(100, 670, f"Виконано заявок цього місяця: {completed_requests.count()} шт.")

    p.setFont('Arial', 14)
    p.drawString(100, 630, "Деталі виконаних заявок:")
    p.setFont('Arial', 10)

    y_pos = 600
    if completed_requests.exists():
        for req in completed_requests:
            text = f"#{req.id} | {req.title[:30]}... | {req.location} | Від: {req.author.username}"
            p.drawString(100, y_pos, text)
            y_pos -= 20

            if y_pos < 100:
                p.showPage()
                p.setFont('Arial', 10)
                y_pos = 800
    else:
        p.drawString(100, y_pos, "Цього місяця ще немає виконаних заявок.")

    p.showPage()
    p.save()
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="zvit_{now.strftime("%m_%Y")}.pdf"'
    return response
