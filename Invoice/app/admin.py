
# from django.contrib import admin
# from .models import *

# @admin.register(Client)
# class ClientAdmin(admin.ModelAdmin):
#     list_display = ('name', 'email', 'phone_number', 'company_name', 'user')
#     search_fields = ('name', 'email', 'company_name')
#     list_filter = ('user',)

# @admin.register(Invoice)
# class InvoiceAdmin(admin.ModelAdmin):
#     list_display = ('invoice_number', 'client', 'user', 'issue_date', 'due_date', 'total', 'amount_paid', 'balance','payment_status')
#     search_fields = ('invoice_number', 'client__name')
#     list_filter = ('user', 'issue_date', 'due_date','payment_status')
#     readonly_fields = ('amount_paid', 'balance','payment_status','invoice_number')

#     def amount_paid(self, obj):
#         return obj.amount_paid
#     amount_paid.short_description = 'Amount Paid'

#     def balance(self, obj):
#         return obj.balance
#     balance.short_description = 'Balance'

# @admin.register(InvoiceItem)
# class InvoiceItemAdmin(admin.ModelAdmin):
#     list_display = ('invoice', 'description', 'quantity', 'rate', 'amount')
#     search_fields = ('description', 'invoice__invoice_number')

# @admin.register(Payment)
# class PaymentAdmin(admin.ModelAdmin):
#     list_display = ('invoice', 'client', 'amount_paid') 
#     search_fields = ('invoice__invoice_number',)

# @admin.register(BusinessProfile)
# class BusinessProfileAdmin(admin.ModelAdmin):
#     list_display = ('business_name', 'user', 'tax_id',  'email', 'phone', 'website', 'address')
#     search_fields = ('business_name', 'tax_id')




from django.contrib import admin
from .models import *

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone_number', 'company_name', 'user','address')
    search_fields = ('name', 'email', 'company_name')
    list_filter = ('user',)
    ordering = ('name',)

admin.site.register(UsedInvoiceNumber)
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'client', 'user', 'issue_date', 'due_date', 'total', 'get_amount_paid', 'get_balance', 'payment_status')
    search_fields = ('invoice_number', 'client__name')
    list_filter = ('user', 'issue_date', 'due_date', 'payment_status')
    readonly_fields = ('get_amount_paid', 'get_balance', 'payment_status', 'invoice_number')
    ordering = ('-issue_date',)

    def get_amount_paid(self, obj):
        return obj.amount_paid
    get_amount_paid.short_description = 'Amount Paid'
    get_amount_paid.admin_order_field = 'amount_paid'

    def get_balance(self, obj):
        return obj.balance
    get_balance.short_description = 'Balance'
    get_balance.admin_order_field = 'balance'


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'description', 'quantity', 'rate', 'amount')
    search_fields = ('description', 'invoice__invoice_number')
    ordering = ('invoice',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'get_client', 'amount_paid')
    search_fields = ('invoice__invoice_number', 'invoice__client__name')
    ordering = ('-invoice__issue_date',)

    def get_client(self, obj):
        return obj.invoice.client
    get_client.short_description = 'Client'
    get_client.admin_order_field = 'invoice__client'


@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'tax_id', 'email', 'phone', 'website', 'address')
    search_fields = ('business_name', 'tax_id')
    ordering = ('business_name',)
