
from rest_framework import serializers
from .models import *

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['user']
        
class ClientDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name']        

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'
        read_only_fields = ['amount', 'invoice']

# class PaymentSerializer(serializers.ModelSerializer):
#     invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
#     client_name = serializers.CharField(source='invoice.client.name', read_only=True)
#     class Meta:
#         model = Payment
#         fields = ['id', 'invoice', 'invoice_number', 'client_name', 'amount_paid', 'created_at']
#         read_only_fields = ['user']



class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        # fields = '__all__'
        # read_only_fields = ['user']
        fields = ['id', 'user', 'invoice', 'amount_paid', 'payment_date', 'invoice_number', 'client_name']
        read_only_fields = ['user', 'invoice_number', 'client_name']

    def get_invoice_number(self, obj):
        return obj.invoice.invoice_number if obj.invoice else None

    def get_client_name(self, obj):
        return obj.invoice.client.name if obj.invoice and obj.invoice.client else None




class InvoiceSerializer(serializers.ModelSerializer):
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    line_items = InvoiceItemSerializer(many=True, required=False)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client')
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['user', 'invoice_number', 'amount_paid', 'balance', 'payment_status', 'created_at']

    def validate(self, data):
        issue_date = data.get('issue_date')
        due_date = data.get('due_date')

        if issue_date and due_date:
            if due_date <= issue_date:
                raise serializers.ValidationError({
                    "due_date": "Due date must be after issue date."
                })

        if 'line_items' in data and not data['line_items']:
            raise serializers.ValidationError({
                "line_items": "At least one line item is required."
            })

        if 'user' in self.initial_data:
            raise serializers.ValidationError({
                "user": "User field is read-only."
            })

        return data
    def create(self, validated_data):
        items_data = validated_data.pop('line_items', [])
        # Remove 'user' if it somehow exists to avoid duplicate argument error
        validated_data.pop('user', None)
        user = self.context['request'].user
        invoice = Invoice.objects.create(user=user, **validated_data)

        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)

        self.calculate_totals(invoice)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('line_items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)

        self.calculate_totals(instance)
        instance.save()
        return instance

    def calculate_totals(self, invoice):
        invoice.refresh_from_db()
        subtotal = sum(item.amount for item in invoice.items.all())
        invoice.subtotal = subtotal
        invoice.total = subtotal  
        invoice.update_payment_status()
        invoice.save()



class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = '__all__'
        read_only_fields = ['user']