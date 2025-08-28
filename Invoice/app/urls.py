
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'invoices', InvoiceViewSet, basename='invoices')
router.register(r'payments', PaymentViewSet,basename='payments')
router.register(r'business-profiles', BusinessProfileViewSet, basename='business-profiles')

urlpatterns = [

    path('', include(router.urls)),
    # path('client-dropdown/', ClientDropdownView.as_view(), name='client-dropdown'),
    
]



