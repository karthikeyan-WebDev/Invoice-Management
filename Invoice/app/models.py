
# <<<--------- this models is random invoice number generator--------->>>


from django.db import models, transaction
from django.contrib.auth import get_user_model
from datetime import date
import random

User = get_user_model()

class Client(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.IntegerField(blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name


class UsedInvoiceNumber(models.Model):
    number = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.number


class Invoice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    client = models.ForeignKey('Client', on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    issue_date = models.DateField()
    due_date = models.DateField()
    notes = models.TextField(blank=True, null=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_items_data = models.JSONField(default=list, blank=True)

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
    ]
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid'
    )

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        super().save(*args, **kwargs)

    def generate_invoice_number(self):
        year = date.today().year
        while True:
            random_number = random.randint(100000, 999999)
            invoice_number = f"INV-{year}-{random_number}"
            if not UsedInvoiceNumber.objects.filter(number=invoice_number).exists():
                UsedInvoiceNumber.objects.create(number=invoice_number)
                return invoice_number

    @property
    def amount_paid(self):
        return sum(p.amount_paid for p in self.payments.all())

    @property
    def balance(self):
        return self.total - self.amount_paid

    def update_payment_status(self):
        if self.amount_paid >= self.total:
            self.payment_status = 'paid'
        elif self.amount_paid > 0:
            self.payment_status = 'partial'
        else:
            self.payment_status = 'unpaid'
        self.save()

    def __str__(self):
        return self.invoice_number




class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.amount = self.quantity * self.rate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} - {self.amount}"


class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount_paid} for {self.invoice.invoice_number}"

    def client(self):
        return self.invoice.client.name

    client.short_description = 'Client'


class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.IntegerField(default=0)
    email = models.EmailField(null=True, blank=True)
    website = models.URLField(blank=True, null=True)
    tax_id = models.CharField(max_length=50, blank=True, null=True)
    # currency = models.CharField(max_length=10, default='USD', blank=True, null=True)

    def __str__(self):
        return f"{self.business_name} ({self.user.username})"
