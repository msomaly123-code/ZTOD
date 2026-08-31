# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerViewSet, basename='customer')
router.register(r'services', views.ServicesViewSet, basename='service')
router.register(r'service-items', views.ServicesItemViewSet, basename='service-item')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'recepionists', views.RecepionistViewSet, basename='recepionist')
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    # Authentication endpoints
    path('api/register/', views.register_user, name='register'),
    path('api/login/', views.login_user, name='login'),
    path('api/me/', views.get_current_user, name='current_user'),
    
    # Password and profile endpoints
    path('api/update-password/', views.update_password, name='update_password'),
    path('api/receptionist/profile/', views.update_receptionist_profile, name='update_receptionist_profile'),
    
    # ============ ORDER ENDPOINT ============
    path('api/orders/create/', views.create_order, name='create_order'),  # ← ADD THIS
    
    # ClickPesa Payment endpoints
    path('api/payment-methods/', views.get_supported_payment_methods, name='payment_methods'),
    path('api/payments/initiate/', views.initiate_payment, name='initiate_payment'),
    path('api/payments/verify/<str:transaction_id>/', views.verify_payment, name='verify_payment'),
    path('api/payments/webhook/', views.payment_webhook, name='payment_webhook'),
    path('payment-confirm/', views.payment_confirm, name='payment_confirm'),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)