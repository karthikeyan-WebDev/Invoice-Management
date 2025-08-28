
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from decimal import Decimal
from .models import InvoiceItem, Payment

@receiver([post_save, post_delete], sender=InvoiceItem)
def update_invoice_totals(sender, instance, **kwargs):
    invoice = instance.invoice
    if not invoice:
        return

    subtotal = sum(item.amount for item in invoice.items.all())
    tax = subtotal * Decimal("0.18")  # Use Decimal instead of float
    invoice.subtotal = subtotal
    invoice.total = subtotal + tax
    invoice.save()

@receiver([post_save, post_delete], sender=Payment)
def update_invoice_payment_status(sender, instance, **kwargs):
    invoice = instance.invoice
    invoice.update_payment_status()
