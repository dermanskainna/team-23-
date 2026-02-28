from django.db import models

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SupplierOffer(models.Model):
    CATEGORY_CHOICES = (
        ('medicine', 'Медицина'),
        ('drones', 'Дрони та електроніка'),
        ('ammunition', 'Амуніція'),
        ('vehicles', 'Транспорт'),
        ('other', 'Інше'),
    )

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="offers")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    item_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=120, blank=True)  # артикул/модель
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="UAH")
    link = models.URLField(blank=True)
    is_available = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["item_name"]),
            models.Index(fields=["is_available"]),
        ]

    def __str__(self):
        return f"{self.supplier.name} — {self.item_name}"
