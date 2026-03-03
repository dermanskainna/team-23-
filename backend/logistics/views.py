from django.conf import settings
from django.utils import timezone
import io
import os
import urllib.request
import ssl
from django.http import HttpResponse, FileResponse
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Request, WarehouseItem, Feedback, StockTransaction, RequestHistory
from .serializers import RequestSerializer, WarehouseItemSerializer, TrackingSerializer, FeedbackSerializer, RequestHistorySerializer

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
    warehouse_item_id = request.data.get('warehouse_item_id')

    valid_statuses = dict(Request.STATUS_CHOICES).keys()
    if new_status not in valid_statuses:
        return Response({"error": "Неправильний статус."}, status=status.HTTP_400_BAD_REQUEST)

    if new_status == 'in_progress' and logistics_request.status in ['new', 'awaiting_purchase']:
        logistics_request.volunteer = request.user

        if not warehouse_item_id:
            return Response({"error": "Оберіть товар зі складу для списання."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = WarehouseItem.objects.get(id=warehouse_item_id)
        except WarehouseItem.DoesNotExist:
            return Response({"error": "Обраний товар не знайдено на складі."}, status=status.HTTP_404_NOT_FOUND)

        if item.quantity >= logistics_request.quantity:
            item.quantity -= logistics_request.quantity
            item.save(update_fields=['quantity'])

            StockTransaction.objects.create(
                item=item,
                logistics_request=logistics_request,
                quantity_change=-logistics_request.quantity,
                description=f"Ручне списання для заявки #{logistics_request.id}"
            )
        else:
            return Response(
                {"error": f"На складі лише {item.quantity} шт. '{item.name}', а потрібно {logistics_request.quantity}."},
                status=status.HTTP_400_BAD_REQUEST
            )

    if new_status in ['rejected', 'new'] and logistics_request.status == 'in_progress':
        transaction = StockTransaction.objects.filter(logistics_request=logistics_request, quantity_change__lt=0).first()
        if transaction:
            item = transaction.item
            item.quantity += abs(transaction.quantity_change)
            item.save(update_fields=['quantity'])

            StockTransaction.objects.create(
                item=item,
                logistics_request=logistics_request,
                quantity_change=abs(transaction.quantity_change),
                description=f"Повернення на склад (Заявка #{logistics_request.id} відхилена/скасована)"
            )
        logistics_request.volunteer = None

    if logistics_request.status != new_status:
        RequestHistory.objects.create(
            logistics_request=logistics_request,
            changed_by=request.user,
            old_status=logistics_request.status,
            new_status=new_status
        )

    logistics_request.status = new_status
    logistics_request.reject_reason = reject_reason if new_status == 'rejected' else ''

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

                StockTransaction.objects.create(
                    item=existing,
                    quantity_change=qty,
                    description="Поповнення існуючого товару волонтером"
                )

                return Response(
                    WarehouseItemSerializer(existing).data,
                    status=status.HTTP_200_OK
                )

            created = serializer.save()
            StockTransaction.objects.create(
                item=created,
                quantity_change=created.quantity,
                description="Оприбуткування нового товару"
            )

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
    p.drawString(100, 650, f"Що передається: {logistics_request.title} ({logistics_request.quantity} шт.)")

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
            text = f"#{req.id} | {req.title[:30]} ({req.quantity} шт.) | {req.location} | Від: {req.author.username}"
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

@api_view(["GET", "POST", "PATCH"])
@permission_classes([IsAuthenticated])
def request_feedback_view(request, pk: int):
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        if not (getattr(request.user, "role", None) == "volunteer" or req.author_id == request.user.id):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        if not hasattr(req, "feedback"):
            return Response(None, status=status.HTTP_204_NO_CONTENT)

        return Response(FeedbackSerializer(req.feedback).data)

    if getattr(request.user, "role", None) != "military" or req.author_id != request.user.id:
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    if req.status != "completed":
        return Response(
            {"detail": "Відгук можна залишити лише коли заявка в статусі completed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    feedback = getattr(req, "feedback", None)

    if request.method == "POST":
        if feedback is not None:
            return Response({"detail": "Feedback already exists."}, status=status.HTTP_400_BAD_REQUEST)

        ser = FeedbackSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        fb = Feedback.objects.create(
            request=req,
            author=request.user,
            rating=ser.validated_data["rating"],
            comment=ser.validated_data.get("comment", "")
        )
        return Response(FeedbackSerializer(fb).data, status=status.HTTP_201_CREATED)

    if feedback is None:
        return Response({"detail": "No feedback yet."}, status=status.HTTP_404_NOT_FOUND)

    ser = FeedbackSerializer(feedback, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(FeedbackSerializer(feedback).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_attachment(request, pk):
    try:
        req = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Запит не знайдено."}, status=404)

    if not req.attachment:
        return Response({"error": "Файл не прикріплено."}, status=404)

    if request.user.role not in ['volunteer', 'military'] or \
       (request.user.role == 'military' and request.user != req.author):
        return Response({"error": "Доступ заборонено."}, status=403)

    file_path = req.attachment.path
    if not os.path.exists(file_path):
        return Response({"error": "Файл не знайдено на сервері."}, status=404)

    try:
        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=os.path.basename(file_path)
        )
    except Exception as e:
        print("FileResponse error:", e)
        return Response({"error": "Сталася помилка при відкритті файлу."}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def request_history_view(request, pk):
    try:
        logistics_request = Request.objects.get(pk=pk)
    except Request.DoesNotExist:
        return Response({"error": "Заявку не знайдено."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != 'volunteer' and logistics_request.author != request.user:
        return Response({"error": "Доступ заборонено."}, status=status.HTTP_403_FORBIDDEN)

    history = RequestHistory.objects.filter(logistics_request=logistics_request).order_by('-created_at')
    serializer = RequestHistorySerializer(history, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
