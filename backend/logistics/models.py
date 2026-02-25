from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Request(models.Model):
    STATUS_CHOICES = (
        ('new', 'Новий'),
        ('in_progress', 'В роботі'),
        ('awaiting_purchase', 'Очікує закупівлі'),
        ('completed', 'Виконано'),
        ('rejected', 'Відхилено'),
    )

    URGENCY_CHOICES = (
        ('low', 'Низька'),
        ('medium', 'Середня'),
        ('high', 'Висока'),
        ('critical', 'Критична'),
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='requests'
    )

    title = models.CharField(max_length=200, verbose_name="Назва запиту")
    description = models.TextField(verbose_name="Опис (що саме потрібно)")
    location = models.CharField(max_length=150, verbose_name="Локація / Напрямок")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Статус")
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium', verbose_name="Терміновість")

    reject_reason = models.TextField(blank=True, null=True, verbose_name="Причина відхилення")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")

    def __str__(self):
        return f"#{self.id} {self.title} ({self.get_status_display()})"

class WarehouseItem(models.Model):
    CATEGORY_CHOICES = (
        ('medicine', 'Медицина'),
        ('drones', 'Дрони та електроніка'),
        ('ammunition', 'Амуніція'),
        ('vehicles', 'Транспорт'),
        ('other', 'Інше'),
    )

    name = models.CharField(max_length=200, verbose_name="Назва товару (напр. Mavic 3T)")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other', verbose_name="Категорія")
    quantity = models.IntegerField(default=0, verbose_name="Кількість на складі")

    last_updated = models.DateTimeField(auto_now=True, verbose_name="Останнє оновлення")

    def __str__(self):
        return f"{self.name} ({self.quantity} шт.) - {self.get_category_display()}"

class Feedback(models.Model):
    request = models.OneToOneField(
        Request,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks'
    )

    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Оцінка (1-5)"
    )
    comment = models.TextField(blank=True, verbose_name="Відгук")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Останнє оновлення")

    def __str__(self):
        return f"Відгук до заявки #{self.request_id} — {self.rating}/5"
