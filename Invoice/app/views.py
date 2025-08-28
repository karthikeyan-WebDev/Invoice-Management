
from rest_framework import viewsets
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import *
from .serializers import *
# from .utils import render_to_pdf 
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['name', 'address', 'email']
    search_fields = ['name', 'address']

    def get_queryset(self):
        return Client.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# class ClientDropdownView(generics.ListAPIView):
#     serializer_class = ClientDropdownSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [SearchFilter]
#     search_fields = ['name']

#     def get_queryset(self):
#         return Client.objects.filter(user=self.request.user).order_by('name')



class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'invoice_number': ['exact', 'icontains'],
        'issue_date': ['gte', 'lte', 'exact'],
        'payment_status': ['exact'],
        'client': ['exact'],
    }
    search_fields = ['invoice_number', 'client_name', 'notes']
    ordering_fields = ['issue_date', 'due_date', 'total']
    ordering = ['-issue_date']  


    def get_queryset(self):
        queryset = Invoice.objects.filter(user=self.request.user)
        queryset = queryset.select_related('client').prefetch_related('items')
        status_filter = self.request.query_params.get('status', None)
        if status_filter in ['paid', 'partial', 'unpaid']:
            queryset = queryset.filter(payment_status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.get_queryset()
        stats = {
            'total_invoices': queryset.count(),
            'total_amount': sum(invoice.total for invoice in queryset),
            'paid_amount': sum(invoice.amount_paid for invoice in queryset),
            'outstanding_amount': sum(invoice.balance for invoice in queryset),
        }
        return Response(stats)
    
    

class InvoiceItemViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'invoice': ['exact'],
        'description': ['icontains'],
        'rate': ['gte', 'lte'],
    }
    search_fields = ['description']
    ordering_fields = ['quantity', 'rate', 'amount']
    ordering = ['id']  # Default ordering

    def get_queryset(self):
        # Only show items for invoices owned by the user
        return InvoiceItem.objects.filter(
            invoice__user=self.request.user
        ).select_related('invoice')

    def perform_create(self, serializer):
        # Verify the invoice belongs to the user
        invoice = serializer.validated_data['invoice']
        if invoice.user != self.request.user:
            raise PermissionDenied("You don't have permission to add items to this invoice")
        serializer.save()

    def perform_update(self, serializer):
        # Verify ownership on updates too
        invoice = serializer.validated_data.get('invoice', serializer.instance.invoice)
        if invoice.user != self.request.user:
            raise PermissionDenied("You don't have permission to modify this invoice")
        serializer.save()



class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Payment.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['invoice']
   
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)  
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)    

class BusinessProfileViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        
        return BusinessProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
       
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
    
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='update-profile')
    def update_profile(self, request, pk=None):
        profile = self.get_object()
        serializer = BusinessProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)



